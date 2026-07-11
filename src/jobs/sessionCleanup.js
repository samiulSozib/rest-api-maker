const { Session } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

const CLEANUP_INTERVAL_MS = 60 * 60 * 1000; // run every hour

async function cleanStaleSessions() {
  try {
    const deleted = await Session.destroy({
      where: {
        [Op.or]: [
          { expires_at: { [Op.lt]: new Date() } },
          {
            replaced_at: { [Op.ne]: null },
            expires_at: { [Op.lt]: new Date(Date.now() - 24 * 60 * 60 * 1000) },
          },
        ],
      },
    });
    if (deleted > 0) {
      logger.info(`Cleaned ${deleted} stale session(s)`);
    }
  } catch (err) {
    logger.error('Session cleanup failed', err);
  }
}

function startSessionCleanup() {
  cleanStaleSessions();
  setInterval(cleanStaleSessions, CLEANUP_INTERVAL_MS);
  logger.info(`Session cleanup scheduled every ${CLEANUP_INTERVAL_MS / 60000} minutes`);
}

module.exports = { startSessionCleanup };
