import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/database';
import { z } from 'zod';

// Validation schemas
const bookingIdSchema = z.object({
  bookingId: z.string().uuid('Invalid booking ID'),
});

const createBookingSchema = z.object({
  matchId: z.string().uuid('Invalid match ID'),
  seats: z.array(z.string().uuid('Invalid seat ID')).min(1, 'At least one seat must be selected'),
  customer: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(10, 'Phone number must be at least 10 characters'),
  }),
});

export const createBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = createBookingSchema.parse(req.body);

    // Start a transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Verify match exists and is upcoming
      const match = await tx.match.findUnique({
        where: { id: validatedData.matchId },
        include: {
          stadium: true
        }
      });

      if (!match) {
        throw new Error('Match not found');
      }

      // Verify all seats exist and are available
      const seats = await tx.seat.findMany({
        where: {
          id: { in: validatedData.seats },
          status: 'AVAILABLE'
        },
        include: {
          section: true
        }
      });

      if (seats.length !== validatedData.seats.length) {
        throw new Error('One or more seats are not available for booking');
      }

      // Calculate total amount
      let totalAmount = 0;
      seats.forEach(seat => {
        totalAmount += seat.section.price;
      });

      // Create booking reference
      const bookingReference = `CRK-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

      // Create the booking
      const booking = await tx.booking.create({
        data: {
          matchId: validatedData.matchId,
          bookingReference,
          totalAmount,
          status: 'CONFIRMED',
        }
      });

      // Create booking seat records and update seat status to BOOKED
      const bookingSeats = await Promise.all(
        seats.map(async seat => {
          const bookingSeat = await tx.bookingSeat.create({
            data: {
              bookingId: booking.id,
              seatId: seat.id,
              priceAtTimeOfBooking: seat.section.price,
            }
          });

          // Update seat status to BOOKED
          await tx.seat.update({
            where: { id: seat.id },
            data: { status: 'BOOKED' }
          });

          return bookingSeat;
        })
      );

      // Return the created booking with related data
      return {
        booking: {
          id: booking.id,
          bookingReference: booking.bookingReference,
          totalAmount: booking.totalAmount,
          status: booking.status,
          createdAt: booking.createdAt,
          match: {
            id: match.id,
            teamA: match.teamA,
            teamB: match.teamB,
            matchDate: match.matchDate,
            matchTime: match.matchTime,
            stadium: {
              id: match.stadium.id,
              name: match.stadium.name,
            }
          },
          customer: validatedData.customer,
          seats: seats.map(seat => ({
            id: seat.id,
            seatLabel: seat.seatLabel,
            section: {
              name: seat.section.name,
              price: seat.section.price,
            }
          }))
        }
      };
    });

    res.status(201).json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }

    if (error.message === 'Match not found') {
      return res.status(404).json({ message: 'Match not found' });
    }

    if (error.message === 'One or more seats are not available for booking') {
      return res.status(400).json({ message: 'One or more seats are not available for booking' });
    }

    next(error);
  }
};

export const getBookingById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { bookingId } = bookingIdSchema.parse(req.params);

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        match: {
          include: {
            stadium: {
              select: {
                id: true,
                name: true,
              }
            }
          }
        },
        customer: {
          select: {
            name: true,
            email: true,
            phone: true,
          }
        },
        seats: {
          include: {
            seat: {
              select: {
                seatLabel: true,
                section: {
                  select: {
                    name: true,
                    price: true,
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.status(200).json(booking);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    next(error);
  }
};

export const getUserBookings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const bookings = await prisma.booking.findMany({
      where: { userId: userId },
      include: {
        match: {
          include: {
            stadium: {
              select: {
                id: true,
                name: true,
              }
            }
          }
        },
        seats: {
          include: {
            seat: {
              select: {
                seatLabel: true,
                section: {
                  select: {
                    name: true,
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      }
    });

    res.status(200).json(bookings);
  } catch (error) {
    next(error);
  }
};