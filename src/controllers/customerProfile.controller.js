const { User, sequelize } = require("../models");
const asyncHandler = require("../middlewares/asyncHandler");
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

// ========================================
//  FETCH USER PROFILE
// ========================================
exports.getUserProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const user = await User.findOne({ 
    where: { id: userId },
    attributes: { exclude: ['password', 'api_token_hash'] }
  });

  if (!user) {
    return res.status(404).json({
      status: false,
      message: 'User not found',
      data: null,
    });
  }

  return res.status(200).json({
    status: true,
    message: 'User profile retrieved successfully',
    data: user,
  });
});

// ========================================
//  UPDATE USER PROFILE
// ========================================
exports.updateUserProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const user = await User.findByPk(userId);
  if (!user) {
    return res.status(404).json({
      status: false,
      message: 'User not found',
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

  // ========================================
  //  Handle Profile Image Upload
  // ========================================
  if (req.file) {
    const fileName = `profile_${userId}_${Date.now()}.jpg`;
    const uploadDir = path.join(__dirname, "../uploads/profile/");
    const uploadPath = path.join(uploadDir, fileName);

    // Create folder if not exists
    fs.mkdirSync(uploadDir, { recursive: true });

    // Delete old image if exists
    if (user.profile_image) {
      const oldImagePath = path.join(__dirname, "..", user.profile_image);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    // Resize image to avatar (300x300) using sharp
    await sharp(req.file.buffer)
      .resize(300, 300)     // square avatar
      .jpeg({ quality: 85 }) // good quality / reduced size
      .toFile(uploadPath);

    profileImageUrl = `/uploads/profile/${fileName}`;
  }

  // Update only provided fields
  await user.update({
    name: name ?? user.name,
    phone_number: phone_number ?? user.phone_number,
    address: address ?? user.address,
    city: city ?? user.city,
    state: state ?? user.state,
    country: country ?? user.country,
    profile_image: profileImageUrl,
  });

  // Return updated user without sensitive fields
  const updatedUser = await User.findByPk(userId, {
    attributes: { exclude: ['password', 'api_token_hash'] }
  });

  return res.status(200).json({
    status: true,
    message: 'Profile updated successfully',
    data: updatedUser,
  });
});