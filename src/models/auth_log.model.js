module.exports = (sequelize, DataTypes) => {
  const AuthLog = sequelize.define('AuthLog', {
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
    user_id: { type: DataTypes.UUID, allowNull: true },
    event: {
      type: DataTypes.ENUM(
        'register', 'login_success', 'login_failed', 'logout',
        'refresh', 'refresh_reuse_detected', 'password_change',
        'password_reset', 'email_verified', 'verification_sent'
      ),
      allowNull: false,
    },
    ip_address: { type: DataTypes.STRING(45), allowNull: true },
    user_agent: { type: DataTypes.STRING(500), allowNull: true },
    details: { type: DataTypes.TEXT, allowNull: true },
  }, {
    tableName: 'auth_logs',
    indexes: [
      { fields: ['user_id'] },
      { fields: ['event'] },
      { fields: ['created_at'] },
    ]
  });

  return AuthLog;
};
