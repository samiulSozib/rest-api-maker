# REST API Maker

A comprehensive Node.js REST API backend with authentication, package management, and dynamic project/table generation.

## 🚀 Features

- ✅ JWT Authentication with refresh tokens and token versioning
- ✅ Role-based access control (Admin & User)
- ✅ Package subscription system
- ✅ Dynamic project and database table management
- ✅ Email verification and password reset
- ✅ Rate limiting and security best practices
- ✅ Swagger API documentation
- ✅ Session management with automatic cleanup
- ✅ File upload support
- ✅ Comprehensive logging with Winston

## 📋 Prerequisites

- Node.js >= 14.x
- MySQL >= 5.7 or 8.x
- npm or yarn

## 🔧 Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd rest-api-maker
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
NODE_ENV=development
PORT=5000
DB_HOST=localhost
DB_NAME=your_database
DB_USER=your_user
DB_PASS=your_password
JWT_SECRET=your_super_secret_jwt_key
# ... see .env.example for all variables
```

### 4. Database setup

```bash
# The application will auto-sync tables in development
# For production, use migrations (see migrations section)
```

### 5. Run the application

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

## 📚 API Documentation

Once the server is running, visit:

- **Swagger UI**: `http://localhost:5000/api-docs-file`
- **Health Check**: `http://localhost:5000/health`

## 🏗️ Project Structure

```
rest-api-maker/
├── src/
│   ├── app.js              # Express app configuration
│   ├── server.js           # Server entry point
│   ├── config/             # Configuration files
│   │   ├── db.js           # Database connection
│   │   └── swagger.js      # Swagger configuration
│   ├── controllers/        # Request handlers
│   ├── middlewares/        # Custom middlewares
│   │   ├── asyncHandler.js # Async error wrapper
│   │   ├── dashboardJwt.js # JWT authentication
│   │   ├── errorHandler.js # Global error handler
│   │   ├── isAdmin.js      # Admin authorization
│   │   ├── isCustomer.js   # Customer authorization
│   │   └── verifyApiToken.js # API token verification
│   ├── models/             # Sequelize models
│   ├── routes/             # API routes
│   ├── services/           # Business logic services
│   │   ├── email.service.js
│   │   ├── password.service.js
│   │   └── token.service.js
│   ├── utils/              # Utility functions
│   │   └── logger.js       # Winston logger
│   ├── validator/          # Request validators
│   └── jobs/               # Background jobs
│       └── sessionCleanup.js
├── tests/                  # Test files
├── package.json
└── .env.example
```

## 🔐 Authentication Flow

### 1. Registration

```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

### 2. Login

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

Response includes:

- `access_token` - Short-lived JWT (15 minutes)
- `refresh_token` - Long-lived token (7 days)

### 3. Using the API

Include the access token in requests:

```bash
GET /api/customer/projects
Authorization: Bearer <access_token>
```

### 4. Token Refresh

```bash
POST /api/auth/refresh
Cookie: refresh_token=<refresh_token>
```

## 🛡️ Security Features

- **Helmet.js** - Security headers
- **Rate Limiting** - Prevents brute force attacks
- **XSS Protection** - Sanitizes user input
- **CORS** - Configurable cross-origin requests
- **Password Hashing** - Bcrypt with salt rounds
- **JWT Token Versioning** - Invalidate all tokens on demand
- **Session Management** - Track and revoke sessions
- **SQL Injection Protection** - Sequelize ORM with parameterized queries

## 📊 Database Models

- **User** - User accounts with authentication
- **Package** - Subscription packages
- **PackagePlan** - Pricing tiers for packages
- **Purchase** - User package subscriptions
- **Project** - User projects with dedicated databases
- **ProjectTable** - Dynamic tables within projects
- **Session** - Refresh token sessions
- **TokenLog** - API token usage tracking
- **AuthLog** - Authentication event logging
- **Payment** - Payment transactions

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 📈 Logging

Logs are output to console with different levels:

- **Production**: `info` level and above
- **Development**: `debug` level and above

Log format: JSON with timestamps and stack traces for errors.

## 🔄 Background Jobs

### Session Cleanup

Automatically removes expired sessions every hour.

## 🚀 Deployment

### Environment Setup

1. Set `NODE_ENV=production`
2. Use strong `JWT_SECRET`
3. Configure production database
4. Set up email service credentials
5. Disable Sequelize auto-sync

### Production Checklist

- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] HTTPS enabled
- [ ] Rate limits tuned for production traffic
- [ ] Logging configured (consider external service)
- [ ] Database backups automated
- [ ] Health checks monitored
- [ ] CI/CD pipeline configured

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

ISC

## 👥 Authors

See contributors list.

## 📞 Support

For support, email support@example.com or open an issue.

## 🔜 Roadmap

- [ ] Implement API versioning
- [ ] Add comprehensive test coverage
- [ ] Database migrations with Sequelize CLI
- [ ] Docker containerization
- [ ] Redis for session management
- [ ] Rate limiting per user
- [ ] API usage analytics
- [ ] WebSocket support
- [ ] Microservices architecture preparation
