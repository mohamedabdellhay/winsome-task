import * as pkg from '@prisma/client';
import type { User } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const { PrismaClient, Role, BookingStatus } = pkg;
const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'abdellhay@example.com';
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

  console.log('Starting seed process for 50 hotels and 100 rooms...');

  const cities = [
    'Dubai',
    'Cairo',
    'New York',
    'London',
    'Paris',
    'Tokyo',
    'Berlin',
    'Rome',
    'Sydney',
    'Toronto',
  ];
  const roomTypes = [
    'Deluxe Suite',
    'Family Room',
    'Single Room',
    'Double Room',
    'Presidential Suite',
  ];

  for (let i = 1; i <= 50; i++) {
    const managerEmail = `manager${i}@example.com`;
    let manager = await prisma.user.findUnique({
      where: { email: managerEmail },
    });
    if (!manager) {
      manager = await prisma.user.create({
        data: {
          name: `Hotel Manager ${i}`,
          email: managerEmail,
          password: hashedPassword,
          role: Role.HOTEL_MANAGER,
        },
      });
    }

    const hotelName = `Winsome Hotel ${i}`;
    let hotel = await prisma.hotel.findFirst({
      where: { name: hotelName },
    });

    if (!hotel) {
      hotel = await prisma.hotel.create({
        data: {
          name: hotelName,
          city: cities[i % cities.length],
          address: `${i * 10} Main Street, ${cities[i % cities.length]}`,
          stars: (i % 5) + 1,
          managerId: manager.id,
        },
      });
      console.log(`Created Hotel: ${hotelName}`);

      await prisma.room.createMany({
        data: [
          {
            type: roomTypes[(i * 2) % roomTypes.length],
            capacity: (i % 4) + 1,
            pricePerNight: 100 + i * 10,
            availableCount: 5 + (i % 5),
            hotelId: hotel.id,
          },
          {
            type: roomTypes[(i * 2 + 1) % roomTypes.length],
            capacity: ((i + 1) % 4) + 1,
            pricePerNight: 150 + i * 10,
            availableCount: 5 + ((i + 1) % 5),
            hotelId: hotel.id,
          },
        ],
      });
    }
  }

  console.log('Seeding sample users and bookings...');
  const users: User[] = [];
  for (let i = 1; i <= 10; i++) {
    const email = `user${i}@example.com`;
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          name: `Sample User ${i}`,
          email: email,
          password: hashedPassword,
          role: Role.USER,
        },
      });
    }
    users.push(user);
  }

  const allHotels = await prisma.hotel.findMany({
    take: 5,
    include: { rooms: true },
  });

  for (let i = 1; i <= 25; i++) {
    const hotel = allHotels[i % allHotels.length];
    const room = hotel.rooms[0];
    const user = users[i % users.length];

    if (!room || !user) continue;

    const checkIn = new Date();
    checkIn.setDate(checkIn.getDate() + i);
    const checkOut = new Date(checkIn);
    checkOut.setDate(checkOut.getDate() + 2);

    // Use string for Decimal to be safe with types
    const pricePerNight = room.pricePerNight.toString();

    await prisma.booking.create({
      data: {
        checkIn,
        checkOut,
        guestCount: 2,
        totalPrice: Number(pricePerNight) * 2,
        status: i % 3 === 0 ? BookingStatus.CONFIRMED : BookingStatus.PENDING,
        userId: user.id,
        hotelId: hotel.id,
        roomId: room.id,
      },
    });
  }

  console.log(
    'Successfully seeded 50 hotels, 100 rooms, 10 users, and 25 bookings.',
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
