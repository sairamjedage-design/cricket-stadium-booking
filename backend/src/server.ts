import 'dotenv/config'
import bcrypt from 'bcryptjs'
import cors from 'cors'
import { randomUUID } from 'crypto'
import express, { NextFunction, Request, Response } from 'express'
import helmet from 'helmet'
import jwt from 'jsonwebtoken'
import morgan from 'morgan'
import { Prisma } from '@prisma/client'
import { prisma, connectDB } from './utils/database'

declare global {
  namespace Express {
    interface Request {
      userId?: string
    }
  }
}

const app = express()
const port = Number(process.env.PORT ?? 5000)
const configuredJwtSecret = process.env.JWT_SECRET

if (
  !configuredJwtSecret ||
  configuredJwtSecret.length < 32 ||
  configuredJwtSecret === 'your_jwt_secret_key_here'
) {
  throw new Error('Set JWT_SECRET to a random value of at least 32 characters in backend/.env')
}
const jwtSecret: string = configuredJwtSecret

app.use(helmet())
app.use(cors({
  origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
}))
app.use(morgan('dev'))
app.use(express.json({ limit: '3mb' }))

function asyncRoute(
  handler: (req: Request, res: Response) => Promise<unknown>,
) {
  return (req: Request, res: Response, next: NextFunction) => {
    handler(req, res).catch(next)
  }
}

function authenticate(req: Request, res: Response, next: NextFunction) {
  const authorization = req.headers.authorization
  const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : null
  if (!token) {
    res.status(401).json({ message: 'Sign in to continue.' })
    return
  }

  try {
    const payload = jwt.verify(token, jwtSecret)
    if (typeof payload === 'string' || typeof payload.sub !== 'string') {
      res.status(401).json({ message: 'Invalid or expired session.' })
      return
    }
    req.userId = payload.sub
    next()
  } catch {
    res.status(401).json({ message: 'Invalid or expired session.' })
  }
}

function toPublicUser(user: {
  id: string
  name: string
  email: string
  phone: string
  role: string
  photoDataUrl: string | null
  createdAt: Date
}) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    photoDataUrl: user.photoDataUrl ?? undefined,
    createdAt: user.createdAt,
  }
}

const seatConfiguration = [
  { id: 'north', name: 'North Stand', block: 'N' },
  { id: 'north-east', name: 'North-East Stand', block: 'NE' },
  { id: 'east', name: 'East Stand', block: 'E' },
  { id: 'south-east', name: 'South-East Stand', block: 'SE' },
  { id: 'south', name: 'South Stand', block: 'S' },
  { id: 'south-west', name: 'South-West Stand', block: 'SW' },
  { id: 'west', name: 'West Stand', block: 'W' },
  { id: 'north-west', name: 'North-West Stand', block: 'NW' },
]
const tierConfiguration = [
  { id: 'lower', name: 'Lower Tier', rows: 8, price: 900 },
  { id: 'middle', name: 'Middle Tier', rows: 7, price: 1500 },
  { id: 'upper', name: 'Upper Tier', rows: 6, price: 2200 },
]

function validateSelectedSeat(
  match: { minTicketPrice: number; maxTicketPrice: number },
  value: unknown,
) {
  if (!value || typeof value !== 'object') return null
  const seat = value as Record<string, unknown>
  if (
    typeof seat.id !== 'string' ||
    typeof seat.sectionId !== 'string' ||
    typeof seat.sectionName !== 'string' ||
    typeof seat.seatLabel !== 'string' ||
    typeof seat.price !== 'number' ||
    !Number.isSafeInteger(seat.price)
  ) return null

  const parsed = seat.id.match(/^(N|NE|E|SE|S|SW|W|NW)-(lower|middle|upper)-R(\d+)-S(\d+)$/)
  if (!parsed) return null
  const [, block, tierId, rowString, seatString] = parsed
  const stand = seatConfiguration.find((item) => item.block === block)
  const tier = tierConfiguration.find((item) => item.id === tierId)
  const row = Number(rowString)
  const seatNumber = Number(seatString)
  if (!stand || !tier || row < 1 || row > tier.rows || seatNumber < 1 || seatNumber > 32) return null

  const sectionId = `${stand.id}-${tier.id}`
  const sectionName = `${stand.name} · ${tier.name}`
  const categoryBasePrice = tier.id === 'upper' && ['E', 'W'].includes(block) ? 4200 : tier.price
  const basePrice = match.minTicketPrice +
    ((categoryBasePrice - 900) / (4200 - 900)) * (match.maxTicketPrice - match.minTicketPrice)
  const expectedPrice = Math.round(basePrice / 50) * 50
  const seatLabel = `${String.fromCharCode(64 + row)}${seatNumber}`

  if (
    seat.sectionId !== sectionId ||
    seat.sectionName !== sectionName ||
    seat.seatLabel !== seatLabel ||
    seat.price !== expectedPrice
  ) return null

  return {
    seatId: seat.id,
    seatLabel,
    sectionId,
    sectionName,
    price: expectedPrice,
  }
}

function presentBooking(booking: Prisma.BookingGetPayload<{
  include: { match: true; seats: true }
}>) {
  return {
    id: booking.id,
    bookingReference: booking.bookingReference,
    userId: booking.userId,
    matchId: booking.matchId,
    match: {
      teamA: booking.match.teamA,
      teamB: booking.match.teamB,
      matchDate: booking.match.matchDate.toISOString(),
      localTime: booking.match.localTime,
      timeZone: booking.match.timeZone,
      venue: booking.match.venue,
      city: booking.match.city,
      country: booking.match.country,
      format: booking.match.format,
    },
    seats: booking.seats.map((seat) => ({
      seatId: seat.seatId,
      seatLabel: seat.seatLabel,
      sectionId: seat.sectionId,
      sectionName: seat.sectionName,
      price: seat.price,
    })),
    totalAmount: booking.totalAmount,
    status: booking.status,
    createdAt: booking.createdAt.toISOString(),
    cancelledAt: booking.cancelledAt?.toISOString(),
  }
}

const bookingInclude = { match: true, seats: true } as const

app.get('/api/health', asyncRoute(async (_req, res) => {
  await prisma.$queryRaw`SELECT 1`
  res.json({ status: 'OK', database: 'connected' })
}))

app.post('/api/auth/register', asyncRoute(async (req, res) => {
  const { name, email, password, phone, photoDataUrl } = req.body ?? {}
  if (
    typeof name !== 'string' || name.trim().length < 2 ||
    typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    typeof password !== 'string' || password.length === 0 ||
    (phone !== undefined && typeof phone !== 'string') ||
    (photoDataUrl !== undefined && (
      typeof photoDataUrl !== 'string' ||
      !/^data:image\/(?:jpeg|png|webp|gif);base64,/.test(photoDataUrl) ||
      photoDataUrl.length > 2_800_000
    ))
  ) {
    res.status(400).json({ message: 'Please provide a valid name, email, password, phone, and optional image.' })
    return
  }

  const normalizedEmail = email.trim().toLowerCase()
  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } })
  if (existing) {
    res.status(409).json({ message: 'An account with this email already exists.' })
    return
  }

  const user = await prisma.user.create({
    data: {
      name: name.trim(),
      email: normalizedEmail,
      phone: phone?.trim() ?? '',
      passwordHash: await bcrypt.hash(password, 12),
      photoDataUrl: photoDataUrl ?? null,
    },
  })
  const token = jwt.sign({}, jwtSecret, { subject: user.id, expiresIn: '7d' })
  res.status(201).json({ user: toPublicUser(user), token })
}))

app.post('/api/auth/login', asyncRoute(async (req, res) => {
  const { email, password } = req.body ?? {}
  if (typeof email !== 'string' || typeof password !== 'string' || password.length === 0) {
    res.status(400).json({ message: 'Email and password are required.' })
    return
  }

  const user = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
  })
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    res.status(401).json({ message: 'Invalid email or password.' })
    return
  }
  const token = jwt.sign({}, jwtSecret, { subject: user.id, expiresIn: '7d' })
  res.json({ user: toPublicUser(user), token })
}))

app.get('/api/auth/profile', authenticate, asyncRoute(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId } })
  if (!user) {
    res.status(404).json({ message: 'Account not found.' })
    return
  }
  res.json({ user: toPublicUser(user) })
}))

app.put('/api/auth/password', authenticate, asyncRoute(async (req, res) => {
  const { currentPassword, newPassword } = req.body ?? {}
  if (
    typeof currentPassword !== 'string' ||
    typeof newPassword !== 'string' ||
    newPassword.length < 8
  ) {
    res.status(400).json({ message: 'Provide your current password and a new password with at least 8 characters.' })
    return
  }

  const user = await prisma.user.findUnique({ where: { id: req.userId } })
  if (!user) {
    res.status(404).json({ message: 'Account not found.' })
    return
  }
  if (!(await bcrypt.compare(currentPassword, user.passwordHash))) {
    res.status(401).json({ message: 'Your current password is incorrect.' })
    return
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await bcrypt.hash(newPassword, 12) },
  })
  res.json({ message: 'Password updated.' })
}))

app.get('/api/matches', asyncRoute(async (_req, res) => {
  const matches = await prisma.match.findMany({ orderBy: { matchDate: 'asc' } })
  res.json(matches)
}))

app.get('/api/bookings', authenticate, asyncRoute(async (req, res) => {
  const bookings = await prisma.booking.findMany({
    where: { userId: req.userId },
    include: bookingInclude,
    orderBy: { createdAt: 'desc' },
  })
  res.json(bookings.map(presentBooking))
}))

app.post('/api/bookings', authenticate, asyncRoute(async (req, res) => {
  const { matchId, seats } = req.body ?? {}
  if (
    typeof matchId !== 'string' ||
    !Array.isArray(seats) ||
    seats.length < 1 ||
    seats.length > 8 ||
    new Set(seats.map((seat: { id?: unknown }) => seat?.id)).size !== seats.length
  ) {
    res.status(400).json({ message: 'Choose between one and eight unique seats for a valid match.' })
    return
  }

  const match = await prisma.match.findUnique({ where: { id: matchId } })
  if (!match || match.status !== 'UPCOMING') {
    res.status(404).json({ message: 'This fixture is not available for booking.' })
    return
  }

  const validatedSeats = seats.map((seat: unknown) => validateSelectedSeat(match, seat))
  if (validatedSeats.some((seat) => seat === null)) {
    res.status(400).json({ message: 'One or more selected seats are invalid. Please refresh the stadium and try again.' })
    return
  }
  const checkedSeats = validatedSeats.filter(
    (seat): seat is NonNullable<typeof seat> => seat !== null,
  )
  const totalAmount = checkedSeats.reduce((total, seat) => total + seat.price, 0)
  const bookingReference = `CRICKET-${randomUUID().slice(0, 8).toUpperCase()}`

  try {
    const booking = await prisma.$transaction(async (tx) => {
      const created = await tx.booking.create({
        data: {
          userId: req.userId!,
          matchId,
          bookingReference,
          totalAmount,
          status: 'CONFIRMED',
          seats: { create: checkedSeats },
        },
      })
      for (const seat of checkedSeats) {
        const claimed = await tx.$executeRaw`
          INSERT INTO "TicketClaim" ("matchId", "seatId", "bookingId")
          VALUES (${matchId}, ${seat.seatId}, ${created.id})
          ON CONFLICT ("matchId", "seatId") DO UPDATE
          SET "bookingId" = EXCLUDED."bookingId"
          WHERE "TicketClaim"."bookingId" IS NULL
        `
        if (claimed !== 1) throw new Error('SEAT_UNAVAILABLE')
      }
      return tx.booking.findUniqueOrThrow({
        where: { id: created.id },
        include: bookingInclude,
      })
    })
    res.status(201).json(presentBooking(booking))
  } catch (error) {
    if (error instanceof Error && error.message === 'SEAT_UNAVAILABLE') {
      res.status(409).json({ message: 'One or more selected seats have already been booked.' })
      return
    }
    throw error
  }
}))

app.get('/api/bookings/:bookingId', authenticate, asyncRoute(async (req, res) => {
  const booking = await prisma.booking.findFirst({
    where: { id: req.params.bookingId, userId: req.userId },
    include: bookingInclude,
  })
  if (!booking) {
    res.status(404).json({ message: 'Booking not found.' })
    return
  }
  res.json(presentBooking(booking))
}))

app.post('/api/bookings/:bookingId/cancel', authenticate, asyncRoute(async (req, res) => {
  const result = await prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findFirst({
      where: { id: req.params.bookingId, userId: req.userId },
    })
    if (!booking) return { kind: 'NOT_FOUND' as const }
    if (booking.status !== 'CONFIRMED') return { kind: 'NOT_CONFIRMED' as const }

    await tx.booking.update({
      where: { id: booking.id },
      data: { status: 'CANCELLED', cancelledAt: new Date() },
    })
    await tx.ticketClaim.updateMany({
      where: { bookingId: booking.id },
      data: { bookingId: null },
    })
    const updated = await tx.booking.findUniqueOrThrow({
      where: { id: booking.id },
      include: bookingInclude,
    })
    return { kind: 'OK' as const, booking: updated }
  })

  if (result.kind === 'NOT_FOUND') {
    res.status(404).json({ message: 'Booking not found.' })
    return
  }
  if (result.kind === 'NOT_CONFIRMED') {
    res.status(409).json({ message: 'This booking is already cancelled.' })
    return
  }
  res.json(presentBooking(result.booking))
}))

app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error('API request failed:', error)
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
    res.status(409).json({ message: 'That record already exists.' })
    return
  }
  res.status(500).json({ message: 'An unexpected server error occurred.' })
})

async function start() {
  await connectDB()
  app.listen(port, () => console.log(`CricketVerse API listening on port ${port}`))
}

start().catch((error: unknown) => {
  console.error('Unable to start CricketVerse API:', error)
  process.exitCode = 1
})
