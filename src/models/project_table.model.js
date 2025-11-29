module.exports = (sequelize, DataTypes) => {
  const ProjectTable = sequelize.define('ProjectTable', {
    id: { type: DataTypes.UUID, primaryKey: true,   defaultValue: DataTypes.UUIDV4 },
    project_id: { type: DataTypes.UUID, allowNull: false },
    table_name: { type: DataTypes.STRING(100), allowNull: false },
    schema_json: { type: DataTypes.JSON, allowNull: true },
    api_endpoints: { type: DataTypes.JSON, allowNull: true }
  }, {
    tableName: 'project_tables',
    indexes: [{ fields: ['project_id'] }, { fields: ['table_name'] }]
  });

  return ProjectTable;
};
