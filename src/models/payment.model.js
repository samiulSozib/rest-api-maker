module.exports = (sequelize, DataTypes) => {
  const Payment = sequelize.define('Payment', {
    id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    package_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    amount: { type: DataTypes.DECIMAL(10,2), allowNull: false },
    transaction_id: { type: DataTypes.STRING(255), allowNull: true },
    status: { type: DataTypes.ENUM('pending','completed','failed'), allowNull: false, defaultValue: 'pending' },
    payment_method: { type: DataTypes.STRING(50), allowNull: true }
  }, {
    tableName: 'payments',
    indexes: [
      { fields: ['user_id'] },
      { fields: ['status'] },
      { fields: ['created_at'] }
    ]
  });

  return Payment;
};
