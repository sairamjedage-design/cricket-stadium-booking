import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/database';
import { z } from 'zod';

// Validation schemas
const stadiumIdSchema = z.object({
  stadiumId: z.string().uuid('Invalid stadium ID'),
});

const createStadiumSchema = z.object({
  name: z.string().min(2, 'Stadium name must be at least 2 characters'),
  location: z.string().min(2, 'Location must be at least 2 characters'),
  capacity: z.number().int().positive('Capacity must be a positive integer'),
});

export const getStadiums = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stadiums = await prisma.stadium.findMany({
      select: {
        id: true,
        name: true,
        location: true,
        capacity: true,
        _count: {
          select: {
            sections: true,
            matches: true,
          }
        }
      },
      orderBy: {
        name: 'asc',
      }
    });

    res.status(200).json(stadiums);
  } catch (error) {
    next(error);
  }
};

export const getStadiumById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { stadiumId } = stadiumIdSchema.parse(req.params);

    const stadium = await prisma.stadium.findUnique({
      where: { id: stadiumId },
      include: {
        sections: {
          select: {
            id: true,
            name: true,
            tier: true,
            category: true,
            price: true,
            rows: true,
            seatsPerRow: true,
            _count: {
              select: {
                seats: true,
              }
            }
          }
        },
        _count: {
          select: {
            matches: true,
          }
        }
      }
    });

    if (!stadium) {
      return res.status(404).json({ message: 'Stadium not found' });
    }

    res.status(200).json(stadium);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    next(error);
  }
};

// Admin only routes
export const createStadium = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = createStadiumSchema.parse(req.body);

    const stadium = await prisma.stadium.create({
      data: {
        name: validatedData.name,
        location: validatedData.location,
        capacity: validatedData.capacity,
      }
    });

    res.status(201).json(stadium);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    next(error);
  }
};

export const updateStadium = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { stadiumId } = stadiumIdSchema.parse(req.params);
    const validatedData = createStadiumSchema.partial().parse(req.body);

    const stadium = await prisma.stadium.update({
      where: { id: stadiumId },
      data: validatedData,
    });

    res.status(200).json(stadium);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    next(error);
  }
};