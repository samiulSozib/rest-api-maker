module.exports = (sequelize, DataTypes) => {
  const TokenLog = sequelize.define('TokenLog', {
    id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    api_token_hash: { type: DataTypes.STRING(128), allowNull: true },
    action: { type: DataTypes.ENUM('created','revoked','renewed'), allowNull: false }
  }, { tableName: 'token_logs', indexes: [{ fields: ['user_id'] }, { fields: ['api_token_hash'] }] });

  return TokenLog;
};
