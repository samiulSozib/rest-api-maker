module.exports = (sequelize, DataTypes) => {
  const Package = sequelize.define('Package', {
    id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(100), allowNull: false },
    price: { type: DataTypes.DECIMAL(10,2), allowNull: false },
    duration_days: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    max_projects: { type: DataTypes.INTEGER.UNSIGNED, defaultValue: 1 },
    max_tables_per_project: { type: DataTypes.INTEGER.UNSIGNED, defaultValue: 10 },
    features: { type: DataTypes.JSON, allowNull: true }
  }, { tableName: 'packages' });

  return Package;
};
