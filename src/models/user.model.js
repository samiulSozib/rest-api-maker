module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: { type: DataTypes.UUID, primaryKey: true,   defaultValue: DataTypes.UUIDV4 },
    name: { type: DataTypes.STRING(100), allowNull: false },
    email: { type: DataTypes.STRING(150), allowNull: false, unique: true },
    phone_number:{type:DataTypes.STRING(60),allowNull:true},
    password: { type: DataTypes.STRING(255), allowNull: false },
    address:{type:DataTypes.STRING(255),allowNull:true},
    city:{type:DataTypes.STRING(255),allowNull:true},
    state:{type:DataTypes.STRING(255),allowNull:true},
    country:{type:DataTypes.STRING(255),allowNull:true},
    profile_image:{type:DataTypes.STRING(255),allowNull:true},
    role: { type: DataTypes.ENUM('user', 'admin'), allowNull: false, defaultValue: 'user' },
    token_version: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0, comment: 'Increment to invalidate all existing access tokens' },
    api_token_hash: { type: DataTypes.STRING(128), allowNull: true, comment: 'sha256 or defined algorithm' },
    token_expiry: { type: DataTypes.DATE, allowNull: true },
    password_reset_token: { type: DataTypes.STRING, allowNull: true },
    password_reset_expires: { type: DataTypes.DATE, allowNull: true },
    is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true, comment: 'User account status' },
    email_verified: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    email_verify_token: { type: DataTypes.STRING(128), allowNull: true },
    email_verify_expires: { type: DataTypes.DATE, allowNull: true },
    last_login: { type: DataTypes.DATE, allowNull: true, comment:'Last login timestamp' },
    failed_login_attempts: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0, comment: 'Count of consecutive failed login attempts' },
    locked_until: { type: DataTypes.DATE, allowNull: true, comment: 'Account lock expiration timestamp' },
  }, {
    tableName: 'users',
    indexes: [
      { fields: ['email'], unique: true },
      { fields: ['api_token_hash'] },
      { fields: ['password_reset_token'] },
      { fields: ['is_active'] },
    ]
  });

  return User;
};
