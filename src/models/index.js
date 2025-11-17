const sequelize = require('../config/db');
const { DataTypes } = require('sequelize');

// Import models
const User = require('./user.model')(sequelize, DataTypes);
const Package = require('./package.model')(sequelize, DataTypes);
const Payment = require('./payment.model')(sequelize, DataTypes);
const Project = require('./project.model')(sequelize, DataTypes);
const ProjectTable = require('./project_table.model')(sequelize, DataTypes);
const TokenLog = require('./token_log.model')(sequelize, DataTypes);
const Purchase = require('./purchase.model')(sequelize, DataTypes);
const PackagePlan = require('./package_plan.model')(sequelize,DataTypes)

// Associations



// --- User & Payment
User.hasMany(Payment, { foreignKey: 'user_id' });
Payment.belongsTo(User, { foreignKey: 'user_id' });

// --- User & Project
User.hasMany(Project, { foreignKey: 'user_id' });
Project.belongsTo(User, { foreignKey: 'user_id' });

// --- Project & ProjectTable
Project.hasMany(ProjectTable, { foreignKey: 'project_id' });
ProjectTable.belongsTo(Project, { foreignKey: 'project_id' });

// --- User & TokenLog
User.hasMany(TokenLog, { foreignKey: 'user_id' });
TokenLog.belongsTo(User, { foreignKey: 'user_id' });

// --- Purchase relationships
Purchase.belongsTo(User, { foreignKey: 'user_id' });
Purchase.belongsTo(Package, { foreignKey: 'package_id' });

User.hasMany(Purchase, { foreignKey: 'user_id' });
Package.hasMany(Purchase, { foreignKey: 'package_id' });

Package.hasMany(PackagePlan,{foreignKey:'package_id'})
PackagePlan.belongsTo(Package,{foreignKey:'package_id'})

Purchase.belongsTo(PackagePlan, { foreignKey: 'package_plan_id' });
PackagePlan.hasMany(Purchase, { foreignKey: 'package_plan_id' }); // optional


// Export all models
module.exports = {
  sequelize,
  User,
  Package,
  Payment,
  Project,
  ProjectTable,
  TokenLog,
  Purchase,
  PackagePlan
};
