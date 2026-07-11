// tests/setup.js
require('dotenv').config({ path: '.env.test' });

const { sequelize } = require('../src/models');

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

global.testUser = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'TestPass123!',
};
