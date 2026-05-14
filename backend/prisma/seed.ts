import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'abdellhay@example.com';
  const managerEmail = 'manager@example.com';
  const hashedPassword = await bcrypt.hash('password', 10);

  // 1. Create/Find Admin
  let admin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!admin) {
    admin = await prisma.user.create({
      data: {
        name: 'Mohamed Admin',
        email: adminEmail,
        password: hashedPassword,
        role: Role.ADMIN,
      },
    });
    console.log('Admin user created');
  }

  // 2. Create/Find Hotel Manager
  let manager = await prisma.user.findUnique({ where: { email: managerEmail } });
  if (!manager) {
    manager = await prisma.user.create({
      data: {
        name: 'Hotel Manager',
        email: managerEmail,
        password: hashedPassword,
        role: Role.HOTEL_MANAGER,
      },
    });
    console.log('Hotel Manager created');
  }

  // 3. Create Sample Hotel
  const existingHotel = await prisma.hotel.findFirst({
    where: { name: 'Winsome Grand Hotel' },
  });

  if (!existingHotel) {
    const hotel = await prisma.hotel.create({
      data: {
        name: 'Winsome Grand Hotel',
        city: 'Dubai',
        address: 'Downtown Dubai',
        stars: 5,
        managerId: manager.id,
      },
    });
    console.log('Sample hotel created');

    // Add rooms to the hotel
    await prisma.room.createMany({
      data: [
        {
          type: 'Deluxe Suite',
          capacity: 2,
          pricePerNight: 250.0,
          availableCount: 10,
          hotelId: hotel.id,
        },
        {
          type: 'Family Room',
          capacity: 4,
          pricePerNight: 450.0,
          availableCount: 5,
          hotelId: hotel.id,
        },
      ],
    });
    console.log('Sample rooms created');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
