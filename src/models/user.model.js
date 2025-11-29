module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: { type: DataTypes.UUID, primaryKey: true,   defaultValue: DataTypes.UUIDV4 },
    name: { type: DataTypes.STRING(100), allowNull: false },
    email: { type: DataTypes.STRING(150), allowNull: false, unique: true },
    phone_number:{type:DataTypes.STRING(60),allowNull:false},
    password: { type: DataTypes.STRING(255), allowNull: false },
    address:{type:DataTypes.STRING(255),allowNull:true},
    city:{type:DataTypes.STRING(255),allowNull:true},
    state:{type:DataTypes.STRING(255),allowNull:true},
    country:{type:DataTypes.STRING(255),allowNull:true},
    profile_image:{type:DataTypes.STRING(255),allowNull:true},
    role: { type: DataTypes.ENUM('user', 'admin'), allowNull: false, defaultValue: 'user' },
    api_token_hash: { type: DataTypes.STRING(128), allowNull: true, comment: 'sha256 or defined algorithm' },
    token_expiry: { type: DataTypes.DATE, allowNull: true },
  }, {
    tableName: 'users',
    indexes: [
      { fields: ['email'], unique: true },
      { fields: ['api_token_hash'] },
    ]
  });

  return User;
};
