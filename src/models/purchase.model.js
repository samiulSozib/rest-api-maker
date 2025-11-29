// In your Purchase model
module.exports = (sequelize, DataTypes) => {
  const Purchase = sequelize.define('Purchase', {
    id: { type: DataTypes.UUID, primaryKey: true,   defaultValue: DataTypes.UUIDV4 },
    user_id: { type: DataTypes.UUID, allowNull: false },
    package_id: { type: DataTypes.UUID, allowNull: false },
    package_plan_id: { type: DataTypes.UUID, allowNull: false },
    start_date: { type: DataTypes.DATE, allowNull: false },
    end_date: { type: DataTypes.DATE, allowNull: false },
    amount_paid: { type: DataTypes.DECIMAL(10,2), allowNull: false },
    status: { 
      type: DataTypes.ENUM('active', 'expired', 'cancelled'), 
      defaultValue: 'active' 
    },
    total_project_limit:{type:DataTypes.INTEGER},
    total_created_project:{type:DataTypes.INTEGER}
  }, { tableName: 'purchases' });

  

  return Purchase;
};