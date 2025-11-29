module.exports = (sequelize, DataTypes) => {
  const Project = sequelize.define('Project', {
    id: { type: DataTypes.UUID, primaryKey: true,   defaultValue: DataTypes.UUIDV4 },
    user_id: { type: DataTypes.UUID, allowNull: false },
    name: { type: DataTypes.STRING(100), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    db_name: { type: DataTypes.STRING(100), allowNull: false },
    db_user: { type: DataTypes.STRING(100), allowNull: true },
    db_password: { type: DataTypes.STRING(255), allowNull: true },
    api_base_url: { type: DataTypes.STRING(255), allowNull: true },
    status: { type: DataTypes.ENUM('active','suspended','inactive'), defaultValue: 'active' },
    package_plan_id: { 
      type: DataTypes.UUID, 
      allowNull: false,
      references: {
        model: 'package_plans',
        key: 'id'
      }
    },
    total_table_limit:{type:DataTypes.INTEGER},
    total_created_table:{type:DataTypes.INTEGER}
  }, {
    tableName: 'projects',
    indexes: [{ fields: ['user_id'] }, { fields: ['db_name'] }]
  });

  return Project;
};
