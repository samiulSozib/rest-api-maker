module.exports = (sequelize, DataTypes) => {
  const ProjectTable = sequelize.define('ProjectTable', {
    id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
    project_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    table_name: { type: DataTypes.STRING(100), allowNull: false },
    schema_json: { type: DataTypes.JSON, allowNull: false },
    api_endpoints: { type: DataTypes.JSON, allowNull: true }
  }, {
    tableName: 'project_tables',
    indexes: [{ fields: ['project_id'] }, { fields: ['table_name'] }]
  });

  return ProjectTable;
};
