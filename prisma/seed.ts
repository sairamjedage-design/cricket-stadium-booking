import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  // Clear existing data
  await prisma.bookingSeat.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.seat.deleteMany();
  await prisma.section.deleteMany();
  await prisma.match.deleteMany();
  await prisma.stadium.deleteMany();
  await prisma.user.deleteMany();

  console.log('Cleared existing data');

  // Create a sample stadium
  const stadium = await prisma.stadium.create({
    data: {
      name: 'Eden Gardens Cricket Stadium',
      location: 'Kolkata, India',
      capacity: 68000,
    }
  });

  console.log(`Created stadium: ${stadium.name}`);

  // Create sections
  const sectionsData = [
    {
      name: 'North Stand',
      tier: 'Upper',
      category: 'General',
      price: 500,
      rows: 20,
      seatsPerRow: 25
    },
    {
      name: 'South Stand',
      tier: 'Upper',
      category: 'General',
      price: 500,
      rows: 20,
      seatsPerRow: 25
    },
    {
      name: 'East Stand',
      tier: 'Lower',
      category: 'Premium',
      price: 1000,
      rows: 15,
      seatsPerRow: 30
    },
    {
      name: 'West Stand',
      tier: 'Lower',
      category: 'Premium',
      price: 1000,
      rows: 15,
      seatsPerRow: 30
    },
    {
      name: 'VIP Stand',
      tier: 'Upper',
      category: 'VIP',
      price: 2500,
      rows: 10,
      seatsPerRow: 20
    },
    {
      name: 'Corporate Boxes',
      tier: 'Upper',
      category: 'Corporate',
      price: 5000,
      rows: 5,
      seatsPerRow: 10
    }
  ];

  const sections = await Promise.all(
    sectionsData.map(sectionData =>
      prisma.section.create({
        data: {
          stadiumId: stadium.id,
          ...sectionData
        }
      })
    )
  );

  console.log(`Created ${sections.length} sections`);

  // Create seats for each section
  const seats = [];
  for (const section of sections) {
    for (let row = 1; row <= section.rows; row++) {
      for (let seatNum = 1; seatNum <= section.seatsPerRow; seatNum++) {
        const seatLabel = `${String.fromCharCode(64 + row)}${seatNum}`; // A1, A2, etc.

        seats.push(prisma.seat.create({
          data: {
            sectionId: section.id,
            seatLabel,
            rowNumber: row,
            seatNumber: seatNum,
            status: 'AVAILABLE',
            // Simple positioning for 3D rendering
            positionX: (seatNum - section.seatsPerRow / 2) * 0.5,
            positionY: 0,
            positionZ: (row - section.rows / 2) * 0.5
          }
        }));
      }
    }
  }

  await Promise.all(seats);
  console.log(`Created ${seats.length} seats`);

  // Create sample matches
  const matchesData = [
    {
      teamA: 'India',
      teamB: 'Australia',
      matchDate: new Date('2026-10-25T14:30:00Z'),
      matchTime: '14:30'
    },
    {
      teamA: 'India',
      teamB: 'England',
      matchDate: new Date('2026-11-02T10:00:00Z'),
      matchTime: '10:00'
    },
    {
      teamA: 'India',
      teamB: 'South Africa',
      matchDate: new Date('2026-11-15T15:00:00Z'),
      matchTime: '15:00'
    }
  ];

  const matches = await Promise.all(
    matchesData.map(matchData =>
      prisma.match.create({
        data: {
          stadiumId: stadium.id,
          ...matchData
        }
      })
    )
  );

  console.log(`Created ${matches.length} matches`);

  // Create a sample user
  const hashedPassword = await hash('password123', 10);
  const user = await prisma.user.create({
    data: {
      name: 'John Doe',
      email: 'john.doe@example.com',
      passwordHash: hashedPassword,
      phone: '9876543210'
    }
  });

  console.log(`Created sample user: ${user.email}`);

  console.log('Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });