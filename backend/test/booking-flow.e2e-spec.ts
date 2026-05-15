import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcryptjs';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { BookingStatus, Role } from '@prisma/client';

function futureISODate(daysFromNow: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().split('T')[0];
}

describe('Booking Flow (E2E)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  let adminToken: string;
  let managerToken: string;
  let userToken: string;
  let managerId: string;
  let userId: string;
  let hotelId: string;
  let roomId: string;
  let bookingId: string;

  const password = 'password123';
  const runId = Date.now();

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);

    const hashed = await bcrypt.hash(password, 10);

    const admin = await prisma.user.create({
      data: {
        email: `e2e-admin-${runId}@test.com`,
        name: 'E2E Admin',
        password: hashed,
        role: Role.ADMIN,
      },
    });

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: admin.email, password })
      .expect(201);

    adminToken = loginRes.body.accessToken;
  });

  afterAll(async () => {
    await prisma.booking.deleteMany();
    await prisma.room.deleteMany();
    await prisma.hotel.deleteMany();
    await prisma.user.deleteMany();
    await app.close();
  });

  describe('SCENARIO 1 — Full Booking Flow (Happy Path)', () => {
    it('Step 1: Register a regular user', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: 'Regular User',
          email: `e2e-user-${runId}@test.com`,
          password,
        })
        .expect(201);

      expect(res.body.accessToken).toBeDefined();
      expect(res.body.user.role).toBe(Role.USER);
      userToken = res.body.accessToken;
      userId = res.body.user.id;
    });

    it('Step 2: Admin creates a hotel manager', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/admin/create-user')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Hotel Manager',
          email: `e2e-manager-${runId}@test.com`,
          password,
          role: Role.HOTEL_MANAGER,
        })
        .expect(201);

      expect(res.body.user.role).toBe(Role.HOTEL_MANAGER);
      managerId = res.body.user.id;
    });

    it('Step 3: Login as admin', async () => {
      const admin = await prisma.user.findFirst({ where: { role: Role.ADMIN } });
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: admin!.email, password })
        .expect(201);

      expect(res.body.accessToken).toBeDefined();
      adminToken = res.body.accessToken;
    });

    it('Step 4: Admin creates a hotel', async () => {
      const res = await request(app.getHttpServer())
        .post('/hotels')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'E2E Test Hotel',
          city: 'Cairo',
          address: '123 Test Street',
          stars: 4,
          managerId,
          status: 'ACTIVE',
        })
        .expect(201);

      expect(res.body.id).toBeDefined();
      hotelId = res.body.id;
    });

    it('Step 5: Login as hotel manager', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: `e2e-manager-${runId}@test.com`, password })
        .expect(201);

      expect(res.body.accessToken).toBeDefined();
      managerToken = res.body.accessToken;
    });

    it('Step 6: Manager adds a room to the hotel', async () => {
      const res = await request(app.getHttpServer())
        .post('/rooms')
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          type: 'Standard',
          capacity: 2,
          pricePerNight: 100,
          availableCount: 2,
          hotelId,
        })
        .expect(201);

      expect(res.body.id).toBeDefined();
      roomId = res.body.id;
    });

    it('Step 7: Login as regular user', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: `e2e-user-${runId}@test.com`, password })
        .expect(201);

      userToken = res.body.accessToken;
    });

    it('Step 8: User creates a booking', async () => {
      const res = await request(app.getHttpServer())
        .post('/bookings')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          hotelId,
          roomId,
          checkIn: futureISODate(10),
          checkOut: futureISODate(14),
          guestCount: 2,
        })
        .expect(201);

      expect(res.body.status).toBe(BookingStatus.PENDING);
      expect(Number(res.body.totalPrice)).toBe(400);
      bookingId = res.body.id;
    });

    it('Step 9: User sees their booking', async () => {
      const res = await request(app.getHttpServer())
        .get('/bookings')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].id).toBe(bookingId);
    });

    it('Step 10: Verify availableCount decreased by 1', async () => {
      const res = await request(app.getHttpServer())
        .get(`/rooms/${roomId}`)
        .expect(200);

      expect(res.body.availableCount).toBe(1);
    });

    it('Step 11: Admin confirms booking', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/bookings/${bookingId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: BookingStatus.CONFIRMED })
        .expect(200);

      expect(res.body.status).toBe(BookingStatus.CONFIRMED);
    });

    it('Step 12: Dashboard stats reflect confirmed revenue', async () => {
      const res = await request(app.getHttpServer())
        .get('/dashboard/stats')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.confirmedBookings).toBeGreaterThanOrEqual(1);
      expect(res.body.totalRevenue).toBeGreaterThan(0);
    });
  });

  describe('SCENARIO 2 — Booking Validation Failures', () => {
    it('should return 401 when creating booking without token', async () => {
      await request(app.getHttpServer())
        .post('/bookings')
        .send({
          hotelId,
          roomId,
          checkIn: futureISODate(20),
          checkOut: futureISODate(25),
          guestCount: 1,
        })
        .expect(401);
    });

    it('should return 400 when checkOut is before checkIn', async () => {
      await request(app.getHttpServer())
        .post('/bookings')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          hotelId,
          roomId,
          checkIn: futureISODate(30),
          checkOut: futureISODate(25),
          guestCount: 1,
        })
        .expect(400);
    });

    it('should return 400 when room is fully booked', async () => {
      await request(app.getHttpServer())
        .post('/bookings')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          hotelId,
          roomId,
          checkIn: futureISODate(40),
          checkOut: futureISODate(45),
          guestCount: 1,
        })
        .expect(201);

      await request(app.getHttpServer())
        .post('/bookings')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          hotelId,
          roomId,
          checkIn: futureISODate(50),
          checkOut: futureISODate(55),
          guestCount: 1,
        })
        .expect(400);
    });

    it('should return 400 for past checkIn date', async () => {
      const past = new Date();
      past.setDate(past.getDate() - 5);

      await request(app.getHttpServer())
        .post('/bookings')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          hotelId,
          roomId,
          checkIn: past.toISOString().split('T')[0],
          checkOut: futureISODate(50),
          guestCount: 1,
        })
        .expect(400);
    });
  });

  describe('SCENARIO 3 — Role-Based Access Control', () => {
    it('should return 403 when regular user creates a hotel', async () => {
      await request(app.getHttpServer())
        .post('/hotels')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Forbidden Hotel',
          city: 'Cairo',
          address: '1 Forbidden St',
          stars: 3,
          managerId,
        })
        .expect(403);
    });

    it('should return 403 when regular user creates a room', async () => {
      await request(app.getHttpServer())
        .post('/rooms')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          type: 'Suite',
          capacity: 2,
          pricePerNight: 300,
          availableCount: 1,
          hotelId,
        })
        .expect(403);
    });

    it('should return 403 when hotel manager deletes a hotel', async () => {
      await request(app.getHttpServer())
        .delete(`/hotels/${hotelId}`)
        .set('Authorization', `Bearer ${managerToken}`)
        .expect(403);
    });

    it('should return 403 when regular user accesses dashboard stats', async () => {
      await request(app.getHttpServer())
        .get('/dashboard/stats')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });
  });

  describe('SCENARIO 4 — Cancel Booking Restores Availability', () => {
    let cancelRoomId: string;
    let cancelBookingId: string;

    it('Step 1: Create a room with availableCount = 1', async () => {
      const res = await request(app.getHttpServer())
        .post('/rooms')
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          type: 'Single',
          capacity: 1,
          pricePerNight: 80,
          availableCount: 1,
          hotelId,
        })
        .expect(201);

      cancelRoomId = res.body.id;
    });

    it('Step 2: User books the room — availableCount becomes 0', async () => {
      const res = await request(app.getHttpServer())
        .post('/bookings')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          hotelId,
          roomId: cancelRoomId,
          checkIn: futureISODate(60),
          checkOut: futureISODate(62),
          guestCount: 1,
        })
        .expect(201);

      cancelBookingId = res.body.id;

      const roomRes = await request(app.getHttpServer())
        .get(`/rooms/${cancelRoomId}`)
        .expect(200);

      expect(roomRes.body.availableCount).toBe(0);
    });

    it('Step 3: Admin cancels the booking — availableCount restored', async () => {
      await request(app.getHttpServer())
        .patch(`/bookings/${cancelBookingId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: BookingStatus.CANCELLED })
        .expect(200);

      const roomRes = await request(app.getHttpServer())
        .get(`/rooms/${cancelRoomId}`)
        .expect(200);

      expect(roomRes.body.availableCount).toBe(1);
    });
  });
});
