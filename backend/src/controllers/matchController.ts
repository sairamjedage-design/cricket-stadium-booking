import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/database';
import { z } from 'zod';

// Validation schemas
const matchIdSchema = z.object({
  matchId: z.string().uuid('Invalid match ID'),
});

const createMatchSchema = z.object({
  stadiumId: z.string().uuid('Invalid stadium ID'),
  teamA: z.string().min(2, 'Team A name must be at least 2 characters'),
  teamB: z.string().min(2, 'Team B name must be at least 2 characters'),
  matchDate: z.string().datetime('Invalid match date'),
  matchTime: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid match time format (HH:MM)'),
});

export const getMatches = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const matches = await prisma.match.findMany({
      include: {
        stadium: {
          select: {
            id: true,
            name: true,
            location: true,
          }
        }
      },
      orderBy: {
        matchDate: 'asc',
      }
    });

    // Add mock data for available seats and price range
    const matchesWithMeta = matches.map(match => ({
      ...match,
      availableSeats: Math.floor(Math.random() * 1000) + 500, // Mock data
      priceRange: {
        min: 500,
        max: 5000
      }
    }));

    res.status(200).json(matchesWithMeta);
  } catch (error) {
    next(error);
  }
};

export const getMatchById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { matchId } = matchIdSchema.parse(req.params);

    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        stadium: {
          select: {
            id: true,
            name: true,
            location: true,
            sections: {
              include: {
                seats: {
                  select: {
                    id: true,
                    seatLabel: true,
                    status: true,
                    section: {
                      select: {
                        id: true,
                        name: true,
                        price: true,
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    res.status(200).json(match);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    next(error);
  }
};

export const getMatchSeats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { matchId } = matchIdSchema.parse(req.params);

    // Verify match exists
    const match = await prisma.match.findUnique({
      where: { id: matchId },
    });

    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    // Get all seats for this match through stadium sections
    const seats = await prisma.seat.findMany({
      where: {
        section: {
          stadiumId: match.stadiumId,
        }
      },
      include: {
        section: {
          select: {
            id: true,
            name: true,
            price: true,
          }
        }
      }
    });

    res.status(200).json(seats);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    next(error);
  }
};

// Admin only routes
export const createMatch = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = createMatchSchema.parse(req.body);

    // Verify stadium exists
    const stadium = await prisma.stadium.findUnique({
      where: { id: validatedData.stadiumId },
    });

    if (!stadium) {
      return res.status(404).json({ message: 'Stadium not found' });
    }

    const match = await prisma.match.create({
      data: {
        stadiumId: validatedData.stadiumId,
        teamA: validatedData.teamA,
        teamB: validatedData.teamB,
        matchDate: new Date(validatedData.matchDate),
        matchTime: validatedData.matchTime,
      },
      include: {
        stadium: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    });

    res.status(201).json(match);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    next(error);
  }
};