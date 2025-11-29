const { User, Package, TokenLog } = require('../models');
const { hashPassword, comparePassword } = require('../services/password.service');
const { genApiToken, hashToken, genJwt } = require('../services/token.service');
const { Op } = require('sequelize');
const asyncHandler = require('../middlewares/asyncHandler');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

// REGISTER
exports.register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({
      status: false,
      message: 'Missing required fields (name, email, password)',
      data: null,
    });
  }

  const exists = await User.findOne({ where: { email } });
  if (exists) {
    return res.status(409).json({
      status: false,
      message: 'Email already registered',
      data: null,
    });
  }

  const hashed = await hashPassword(password);
  const user = await User.create({ name, email, password: hashed });

  const token = genJwt({ id: user.id, email: user.email, role: user.role });

  return res.status(201).json({
    status: true,
    message: 'User registered successfully',
    data: {
      user: { id: user.id, name: user.name, email: user.email,role:user.role },
      token,
    },
  });
});

// LOGIN
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      status: false,
      message: 'Missing required fields (email, password)',
      data: null,
    });
  }

  const user = await User.findOne({ where: { email } });
  if (!user) {
    return res.status(401).json({
      status: false,
      message: 'Invalid credentials',
      data: null,
    });
  }

  const ok = await comparePassword(password, user.password);
  if (!ok) {
    return res.status(401).json({
      status: false,
      message: 'Invalid credentials',
      data: null,
    });
  }

  const token = genJwt({ id: user.id, email: user.email, role: user.role });

  return res.status(200).json({
    status: true,
    message: 'Login successful',
    data: {
      user: { id: user.id, name: user.name, email: user.email,role:user.role },
      token,
    },
  });
});

// GENERATE API TOKEN
exports.generateApiToken = asyncHandler(async (req, res) => {
  const userId = req.user.id; // requires JWT middleware
  const rawToken = genApiToken();
  const tokenHash = hashToken(rawToken);

  const expiresDays = Number(process.env.API_TOKEN_EXPIRES_DAYS) || 30;
  const expiry = new Date(Date.now() + expiresDays * 24 * 3600 * 1000);

  await User.update({ api_token_hash: tokenHash, token_expiry: expiry }, { where: { id: userId } });
  await TokenLog.create({ user_id: userId, api_token_hash: tokenHash, action: 'created' });

  return res.status(200).json({
    status: true,
    message: 'API token generated successfully',
    data: {
      api_token: rawToken,
      token_expiry: expiry,
    },
  });
});

// REVOKE API TOKEN
exports.revokeApiToken = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const user = await User.findByPk(userId);

  if (!user || !user.api_token_hash) {
    return res.status(400).json({
      status: false,
      message: 'No active token found to revoke',
      data: null,
    });
  }

  await TokenLog.create({ user_id: userId, api_token_hash: user.api_token_hash, action: 'revoked' });
  await User.update({ api_token_hash: null, token_expiry: null }, { where: { id: userId } });

  return res.status(200).json({
    status: true,
    message: 'API token revoked successfully',
    data: null,
  });
});




// get custoemr profile
exports.getCustomerProfile = asyncHandler(async (req, res) => {

 const userId=req.user.id

  const user = await User.findOne({ where: { id:userId } });
  if (!user) {
    return res.status(401).json({
      status: false,
      message: 'User Not found',
      data: null,
    });
  }




  return res.status(200).json({
    status: true,
    message: 'User Profile Get Success',
    data: user,
  });
});



// updare customer profile

exports.updateCustomerProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const user = await User.findByPk(userId);
  if (!user) {
    return res.status(404).json({
      status: false,
      message: "User not found",
      data: null,
    });
  }

  const {
    name,
    phone_number,
    address,
    city,
    state,
    country,
  } = req.body;

  let profileImageUrl = user.profile_image;

  // -----------------------------
  // 🔥 If a new image is uploaded
  // -----------------------------
  if (req.file) {
    const fileName = `profile_${userId}_${Date.now()}.jpg`;
    const uploadDir = path.join(__dirname, "../uploads/profile/");
    const uploadPath = path.join(uploadDir, fileName);

    // Create folder if not exists
    fs.mkdirSync(uploadDir, { recursive: true });

    // -----------------------------
    // ❌ Delete old image if exists
    // -----------------------------
    if (user.profile_image) {
      const oldImagePath = path.join(
        __dirname,
        "..",
        user.profile_image
      );

      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    // -----------------------------------------------
    // ✨ Resize image to avatar (300x300) using sharp
    // -----------------------------------------------
    await sharp(req.file.buffer)
      .resize(300, 300)     // square avatar
      .jpeg({ quality: 85 }) // good quality / reduced size
      .toFile(uploadPath);

    profileImageUrl = `/uploads/profile/${fileName}`;
  }

  // -----------------------------
  // Update only provided fields
  // -----------------------------
  await user.update({
    name: name ?? user.name,
    phone_number: phone_number ?? user.phone_number,
    address: address ?? user.address,
    city: city ?? user.city,
    state: state ?? user.state,
    country: country ?? user.country,
    profile_image: profileImageUrl,
  });

  return res.status(200).json({
    status: true,
    message: 'Profile updated successfully',
    data: user,
  });
});

