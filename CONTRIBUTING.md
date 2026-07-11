# Contributing to REST API Maker

First off, thank you for considering contributing to REST API Maker! It's people like you that make this project better.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)

## 📜 Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

- Be respectful and inclusive
- Welcome newcomers
- Focus on what is best for the community
- Show empathy towards other community members

## 🚀 Getting Started

### Prerequisites

- Node.js >= 14.x
- MySQL >= 5.7
- Git
- npm or yarn

### Setup Development Environment

1. **Fork the repository**

   ```bash
   # Click "Fork" on GitHub, then:
   git clone https://github.com/YOUR_USERNAME/rest-api-maker.git
   cd rest-api-maker
   ```

2. **Add upstream remote**

   ```bash
   git remote add upstream https://github.com/samiulSozib/rest-api-maker.git
   ```

3. **Install dependencies**

   ```bash
   npm install
   ```

4. **Set up environment**

   ```bash
   cp .env.example .env
   # Edit .env with your local configuration
   ```

5. **Run database migrations**

   ```bash
   npm run db:migrate
   ```

6. **Start development server**
   ```bash
   npm run dev
   ```

## 🔄 Development Workflow

### 1. Create a Feature Branch

```bash
# Update your local master
git checkout master
git pull upstream master

# Create a new branch
git checkout -b feature/amazing-feature
# or
git checkout -b fix/bug-description
```

### Branch Naming Convention

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Adding tests
- `chore/` - Maintenance tasks

### 2. Make Your Changes

- Write clean, readable code
- Follow existing code style
- Add tests for new functionality
- Update documentation as needed
- Commit frequently with clear messages

### 3. Test Your Changes

```bash
# Run linter
npm run lint

# Run tests
npm test

# Check code formatting
npm run format:check
```

### 4. Push Your Branch

```bash
git push origin feature/amazing-feature
```

### 5. Open a Pull Request

- Go to your fork on GitHub
- Click "New Pull Request"
- Select your feature branch
- Fill out the PR template
- Wait for review

## 📝 Coding Standards

### JavaScript Style Guide

We follow the [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript) with some modifications.

**Key Points:**

```javascript
// ✅ Good
const getUserById = async (userId) => {
  const user = await User.findByPk(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  return user;
};

// ❌ Bad
const getUserById = async (userId) => {
  var user = await User.findByPk(userId);
  if (!user) {
    return null;
  }
  return user;
};
```

**Rules:**

- Use `const` and `let`, never `var`
- Use arrow functions for callbacks
- Use template literals instead of string concatenation
- Use async/await instead of callbacks
- Use destructuring when possible
- Add JSDoc comments for functions
- Use meaningful variable names
- Keep functions small and focused

### File Organization

```javascript
// src/controllers/example.controller.js

// 1. Imports
const { Model } = require('../models');
const asyncHandler = require('../middlewares/asyncHandler');
const ApiError = require('../utils/ApiError');
const httpStatus = require('../utils/httpStatus');

// 2. Helper functions (if any)
const formatResponse = (data) => {
  // ...
};

// 3. Exported functions
exports.getItems = asyncHandler(async (req, res) => {
  // Implementation
});

exports.createItem = asyncHandler(async (req, res) => {
  // Implementation
});
```

### Error Handling

```javascript
// ✅ Use asyncHandler wrapper
exports.getUser = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  ApiResponse.success(res, 'User retrieved', user);
});

// ❌ Don't use try-catch manually
exports.getUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    res.json({ status: true, data: user });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};
```

### Naming Conventions

| Type            | Convention       | Example                                 |
| --------------- | ---------------- | --------------------------------------- |
| Variables       | camelCase        | `userId`, `userEmail`                   |
| Constants       | UPPER_SNAKE_CASE | `MAX_LOGIN_ATTEMPTS`                    |
| Functions       | camelCase        | `getUserById`, `validateInput`          |
| Classes         | PascalCase       | `ApiError`, `UserService`               |
| Files           | kebab-case       | `user-controller.js`, `auth-service.js` |
| Database Tables | snake_case       | `user_profiles`, `auth_logs`            |

## 📝 Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/).

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, semicolons, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```bash
# Good commits
git commit -m "feat(auth): add password reset functionality"
git commit -m "fix(user): resolve duplicate email validation issue"
git commit -m "docs(readme): update installation instructions"
git commit -m "test(auth): add unit tests for login controller"

# Bad commits
git commit -m "fixed stuff"
git commit -m "WIP"
git commit -m "changes"
```

### Detailed Commit

```bash
git commit -m "feat(auth): implement refresh token rotation

- Add refresh token rotation on token refresh
- Invalidate old refresh token in database
- Add session tracking for security audit
- Update token service with rotation logic

Closes #123"
```

## 🔀 Pull Request Process

### Before Creating PR

1. [ ] Code follows project style guidelines
2. [ ] All tests pass (`npm test`)
3. [ ] Linter passes (`npm run lint`)
4. [ ] Code is formatted (`npm run format`)
5. [ ] Documentation is updated
6. [ ] Commit messages follow conventions
7. [ ] Branch is up to date with master

### PR Title Format

Follow the same format as commit messages:

```
feat(auth): add two-factor authentication
fix(api): resolve rate limiting issue
docs: update API documentation
```

### PR Description Template

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing

Describe the tests you ran to verify your changes

## Checklist

- [ ] My code follows the style guidelines of this project
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes

## Screenshots (if applicable)

## Related Issues

Closes #123
```

### Review Process

1. At least one maintainer must review
2. All CI checks must pass
3. No merge conflicts
4. All review comments addressed
5. Approved by maintainer

### After PR Merge

```bash
# Update your local master
git checkout master
git pull upstream master

# Delete feature branch
git branch -d feature/amazing-feature
git push origin --delete feature/amazing-feature
```

## 🧪 Testing Guidelines

### Writing Tests

```javascript
// tests/user.test.js
const request = require('supertest');
const app = require('../src/app');
const { User } = require('../src/models');

describe('User API', () => {
  beforeEach(async () => {
    await User.destroy({ where: {}, force: true });
  });

  describe('GET /api/v1/users/:id', () => {
    it('should return user by id', async () => {
      const user = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedpassword',
      });

      const res = await request(app)
        .get(`/api/v1/users/${user.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('email', 'test@example.com');
    });

    it('should return 404 for non-existent user', async () => {
      const res = await request(app)
        .get('/api/v1/users/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
    });
  });
});
```

### Test Coverage Requirements

- Minimum 80% overall coverage
- All critical paths must be tested
- All error cases must be tested

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- tests/auth.test.js

# Run with coverage
npm test -- --coverage

# Watch mode
npm run test:watch
```

## 📚 Documentation

### Code Documentation

```javascript
/**
 * Get user by ID
 * @param {string} userId - User UUID
 * @returns {Promise<User>} User object
 * @throws {ApiError} 404 if user not found
 */
const getUserById = async (userId) => {
  const user = await User.findByPk(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  return user;
};
```

### API Documentation

Update Swagger documentation when adding/modifying endpoints:

```javascript
/**
 * @swagger
 * /api/v1/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *       404:
 *         description: User not found
 */
```

## 🙏 Questions?

- Open an issue for bug reports
- Start a discussion for feature requests
- Join our Discord/Slack (if available)
- Email: support@example.com

## 📄 License

By contributing, you agree that your contributions will be licensed under the project's ISC License.

---

Thank you for contributing! 🎉
