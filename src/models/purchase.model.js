module.exports = (sequelize, DataTypes) => {
  const Purchase = sequelize.define('Purchase', {
    id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    package_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    start_date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    end_date: { type: DataTypes.DATE, allowNull: false },
    status: { type: DataTypes.ENUM('active', 'expired'), defaultValue: 'active' }
  }, { tableName: 'purchases' });

  

  return Purchase;
};
