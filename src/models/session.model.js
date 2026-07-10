module.exports = (sequelize, DataTypes) => {
  const Session = sequelize.define('Session', {
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
    user_id: { type: DataTypes.UUID, allowNull: false },
    refresh_token_hash: { type: DataTypes.STRING(128), allowNull: false },
    expires_at: { type: DataTypes.DATE, allowNull: false },
    replaced_at: { type: DataTypes.DATE, allowNull: true, comment: 'Set when token is rotated; used for reuse detection' },
    user_agent: { type: DataTypes.STRING(500), allowNull: true },
    ip_address: { type: DataTypes.STRING(45), allowNull: true },
  }, {
    tableName: 'sessions',
    indexes: [
      { fields: ['user_id'] },
      { fields: ['refresh_token_hash'] },
    ]
  });

  return Session;
};
