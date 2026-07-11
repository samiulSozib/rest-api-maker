// tests/auth.test.js
const request = require('supertest');
const app = require('../src/app');
const { User } = require('../src/models');

describe('Auth API', () => {
  beforeEach(async () => {
    await User.destroy({ where: {}, force: true });
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app).post('/api/auth/register').send({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'SecurePass123!',
      });

      expect(res.status).toBe(201);
      expect(res.body.status).toBe(true);
      expect(res.body.data.user).toHaveProperty('email', 'john@example.com');
    });

    it('should reject weak passwords', async () => {
      const res = await request(app).post('/api/auth/register').send({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'weak',
      });

      expect(res.status).toBe(400);
    });

    it('should reject duplicate emails', async () => {
      await User.create({
        name: 'Existing User',
        email: 'existing@example.com',
        password: 'hashedpassword',
      });

      const res = await request(app).post('/api/auth/register').send({
        name: 'New User',
        email: 'existing@example.com',
        password: 'SecurePass123!',
      });

      expect(res.status).toBe(409);
      expect(res.body.message).toContain('already registered');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a test user
      await request(app).post('/api/auth/register').send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'TestPass123!',
      });
    });

    it('should login successfully with valid credentials', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'test@example.com',
        password: 'TestPass123!',
      });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe(true);
      expect(res.body.data).toHaveProperty('access_token');
      expect(res.body.data).toHaveProperty('refresh_token');
    });

    it('should reject invalid credentials', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'test@example.com',
        password: 'WrongPassword123!',
      });

      expect(res.status).toBe(401);
    });
  });
});
