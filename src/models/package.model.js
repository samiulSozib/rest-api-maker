module.exports = (sequelize, DataTypes) => {
  const Package = sequelize.define('Package', {
    id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(100), allowNull: false },
    status: { 
      type: DataTypes.ENUM('active', 'inactive', 'archived'), 
      defaultValue: 'active' 
    },
    sell_count: { type: DataTypes.INTEGER.UNSIGNED, defaultValue: 0 },
    max_projects: { type: DataTypes.INTEGER.UNSIGNED, defaultValue: 1 },
    max_tables_per_project: { type: DataTypes.INTEGER.UNSIGNED, defaultValue: 10 },
    features: { type: DataTypes.JSON, allowNull: true }
  }, { tableName: 'packages' });

  return Package;
};