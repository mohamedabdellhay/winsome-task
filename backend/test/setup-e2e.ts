if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL =
    'postgresql://postgres:password@localhost:5432/hotel_booking_test';
}

if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'e2e-test-jwt-secret';
}

if (!process.env.JWT_EXPIRES_IN) {
  process.env.JWT_EXPIRES_IN = '7d';
}
