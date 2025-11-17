module.exports = (sequelize, DataTypes) => {
  const PackagePlan = sequelize.define('PackagePlan', {
    id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
    package_id: { 
      type: DataTypes.INTEGER.UNSIGNED, 
      allowNull: false,
      references: {
        model: 'packages',
        key: 'id'
      }
    },
    plan_type: { 
      type: DataTypes.ENUM('monthly', '6_months', 'yearly'), 
      allowNull: false 
    },
    duration_days: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    price: { type: DataTypes.DECIMAL(10,2), allowNull: false },
    discount_type: { 
      type: DataTypes.ENUM('fixed', 'percentage'), 
      allowNull: true 
    },
    discount_value: { type: DataTypes.DECIMAL(10,2), allowNull: true },
    final_price: { type: DataTypes.DECIMAL(10,2), allowNull: false },
    status: { 
      type: DataTypes.ENUM('active', 'inactive'), 
      defaultValue: 'active' 
    }
  },{ tableName: 'package_plans' });

  
  return PackagePlan;
};