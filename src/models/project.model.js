module.exports = (sequelize, DataTypes) => {
  const Project = sequelize.define('Project', {
    id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    name: { type: DataTypes.STRING(100), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    db_name: { type: DataTypes.STRING(100), allowNull: false },
    db_user: { type: DataTypes.STRING(100), allowNull: true },
    db_password: { type: DataTypes.STRING(255), allowNull: true },
    api_base_url: { type: DataTypes.STRING(255), allowNull: true },
    status: { type: DataTypes.ENUM('active','suspended'), defaultValue: 'active' }
  }, {
    tableName: 'projects',
    indexes: [{ fields: ['user_id'] }, { fields: ['db_name'] }]
  });

  return Project;
};
