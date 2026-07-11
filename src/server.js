require('dotenv').config();
const app = require('./app');
const { sequelize } = require('./models');
const logger = require('./utils/logger');
const { startSessionCleanup } = require('./jobs/sessionCleanup');

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await sequelize.authenticate();
    logger.info('DB connected');
    if (process.env.NODE_ENV !== 'production') {
      await sequelize.sync({ alter: true });
    }
    startSessionCleanup();
    app.listen(PORT, () => logger.info(`Server running on port ${PORT}`));
  } catch (err) {
    logger.error('Failed to start', err);
    process.exit(1);
  }
})();
