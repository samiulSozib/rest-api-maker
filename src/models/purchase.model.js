// In your Purchase model
module.exports = (sequelize, DataTypes) => {
  const Purchase = sequelize.define('Purchase', {
    id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    package_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    package_plan_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    start_date: { type: DataTypes.DATE, allowNull: false },
    end_date: { type: DataTypes.DATE, allowNull: false },
    amount_paid: { type: DataTypes.DECIMAL(10,2), allowNull: false },
    status: { 
      type: DataTypes.ENUM('active', 'expired', 'cancelled'), 
      defaultValue: 'active' 
    }
  }, { tableName: 'purchases' });

  

  return Purchase;
};