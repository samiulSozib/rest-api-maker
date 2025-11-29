const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { sequelize } = require('./models');
const logger = require('./utils/logger');
const authRoutes = require('./routes/auth.routes');
const adminPackageRoutes=require('./routes/adminPackage.routes')
const customerPackageRoutes=require('./routes/customerPackage.routes')
const adminPurchaseRoutes=require('./routes/adminPurchage.route')
const customerProjectRoutes=require('./routes/customerProject.route')
const adminProjectRoutes=require('./routes/adminProject.route')
const customerDashboardRoute=require('./routes/customerDashboard.route')
const customerProjectTableRoute=require('./routes/customerProjectTable.route')
const adminDashboardRoute=require('./routes/adminDashboardRoute.route')
const adminUserRoute=require('./routes/adminUserRoute.route')
const errorHandler = require('./middlewares/errorHandler');
const setupSwagger = require("./config/swagger");
const xss = require("xss-clean");
const path = require("path");




const app = express();

app.use(helmet());
app.use(cors({
  origin: '*', // or specify your frontend domain like 'https://your-frontend.com'
  methods: ['GET', 'POST', 'PUT', 'DELETE','PATCH'],
  credentials: true,
}));


app.use(express.json({ limit: '1mb' }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


app.use(xss());

// global rate limiter (tune in production)
app.use(rateLimit({
  windowMs: 60 * 1000,
  max: 200
}));



setupSwagger(app);


app.get('/', (req, res) => {
  res.status(200).json({
    message: '🚀 Core System API is running successfully!',
    docs: '/api-docs-file',
    health: '/health',
    version: '1.0.0'
  });
});


// 
app.use('/api/admin/package', adminPackageRoutes);
app.use('/api/admin/purchases',adminPurchaseRoutes)
app.use('/api/admin/projects',adminProjectRoutes)
app.use('/api/customer/package', customerPackageRoutes);
app.use('/api/customer/projects',customerProjectRoutes)
app.use('/api/customer/project-table',customerProjectTableRoute)
app.use("/api/customer/dashboard",customerDashboardRoute)
app.use("/api/admin/dashboard",adminDashboardRoute)
app.use("/api/admin/users",adminUserRoute)

app.use('/api/auth', authRoutes);



// health
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// error handler
app.use(errorHandler);

module.exports = app;
