const { User, sequelize } = require("../models");
const asyncHandler = require("../middlewares/asyncHandler");
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");
const crypto = require("crypto");
const {
  comparePassword,
  hashPassword,
} = require("../services/password.service");
const sendEmail = require("../services/email.service");

//  FETCH USER PROFILE
exports.getUserProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const user = await User.findOne({
    where: { id: userId },
    attributes: { exclude: ["password", "api_token_hash"] },
  });

  if (!user) {
    return res.status(404).json({
      status: false,
      message: "User not found",
      data: null,
    });
  }

  return res.status(200).json({
    status: true,
    message: "User profile retrieved successfully",
    data: user,
  });
});

//  UPDATE USER PROFILE
exports.updateUserProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const user = await User.findByPk(userId);
  if (!user) {
    return res.status(404).json({
      status: false,
      message: "User not found",
      data: null,
    });
  }

  const { name, phone_number, address, city, state, country } = req.body;

  let profileImageUrl = user.profile_image;

  //  Handle Profile Image Upload
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
      .resize(300, 300) // square avatar
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
    attributes: { exclude: ["password", "api_token_hash"] },
  });

  return res.status(200).json({
    status: true,
    message: "Profile updated successfully",
    data: updatedUser,
  });
});

// password change implementation
exports.changePassword = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { current_password, new_password } = req.body;

  console.log("Full req.body:", req.body);
  console.log("current_password:", current_password);
  console.log("new_password:", new_password);

  // ✅ Validate input
  if (!current_password || !new_password) {
    return res.status(400).json({
      status: false,
      message: "Current password and new password are required",
      data: null,
    });
  }

  // ✅ Prevent same password
  if (current_password === new_password) {
    return res.status(400).json({
      status: false,
      message: "New password must be different from current password",
      data: null,
    });
  }

  const user = await User.findByPk(userId);
  if (!user) {
    return res.status(404).json({
      status: false,
      message: "User not found",
      data: null,
    });
  }

  // ✅ Verify user has password
  if (!user.password) {
    return res.status(400).json({
      status: false,
      message: "User password not initialized",
      data: null,
    });
  }

  // Verify current password
  const isMatch = await comparePassword(current_password, user.password);
  if (!isMatch) {
    return res.status(400).json({
      status: false,
      message: "Current password is incorrect",
      data: null,
    });
  }

  // Update to new password
  const hashed = await hashPassword(new_password);
  user.password = hashed;
  await user.save();

  return res.status(200).json({
    status: true,
    message: "Password changed successfully",
    data: null,
  });
});


//Need to implement forget password
exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  //validate email
  if (!email) {
    return res.status(400).json({
      status: false,
      message: "Email is required",
      data: null,
    });
  }

  const user = await User.findOne({ where: { email } });
  if (!user) {
    return res.status(200).json({
      status: true,
      message: "If email exists, password reset link will be sent",
      data: null,
    });
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString("hex");

  //Hash token for DB storage
  const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

  //Token expiry time
  const expiresAt = new Date(Date.now() + 60*60*1000); // 1 hour from now

  //Save token to DB
  await user.update({
    password_reset_token: hashedToken,
    password_reset_expires: expiresAt,
  });

  //Generate reset link
  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;
  //Send email
  try{
    await sendEmail({
      to: user.email,
      subject: "Password Reset Request",
      template: "forgotPassword",
      data: {
        name: user.name,
        resetLink,
        expiryTime: "1 hour",
      },
    });
    return res.status(200).json({
      status: true,
      message: "Password reset link sent to your email successfully",
      data: null,
    });
  } catch (emailError){
    await user.update({
      password_reset_token: null,
      password_reset_expires: null,
    });
    console.error("Failed to send password reset email:", emailError);
    return res.status(500).json({
      status: false,
      message: "Failed to send password reset email",
      data: null,
    });
  }
});

//Reset Password - Verify token and set new password
exports.resetPassword = asyncHandler(async (req, res) => {
  const { email, token, new_password, confirm_password } = req.body;

  //Validate Inputs
  if (!email || !token || !new_password || !confirm_password) {
    return res.status(400).json({
      status: false,
      message: "Email, token, new password and confirm password are required",
      data: null,
    });
  }

  //Password match
  if (new_password !== confirm_password) {
    return res.status(400).json({
      status: false,
      message: "New password and confirm password do not match",
      data: null,
    });
  }

  //Password strength (min 8 chars, 1 uppercase, 1 number)
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
  if (!passwordRegex.test(new_password)) {
    return res.status(400).json({
      status: false,
      message: "Password must be at least 8 characters with 1 uppercase letter and 1 number",
      data: null,
    });
  }

  //Hash the token to compare with DB
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  //Find user by email and token
  const user = await User.findOne({
    where: {
      email,
      password_reset_token: hashedToken,
      password_reset_expires: { [sequelize.Sequelize.Op.gt]: new Date() }, // token not expired
    },
  });

  if (!user) {
    return res.status(400).json({
      status: false,
      message: "Invalid or expired password reset token",
      data: null,
    });
  }

  //Hash new password
  const hashedPassword = await hashPassword(new_password);

  //Update user password and clear reset token fields
  await user.update({
    password: hashedPassword,
    password_reset_token: null,
    password_reset_expires: null,
  });

  return res.status(200).json({
    status: true,
    message: "Password has been reset successfully",
    data: null,
  });

});

//Verify Reset Token
exports.verifyResetToken = asyncHandler(async (req, res) => {
  const { token, email } = req.body;

  if (!token || !email) {
    return res.status(400).json({
      status: false,
      message: "Token and email are required",
      data: null,
    });
  }

  const hashedToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await User.findOne({
    where: {
      email,
      password_reset_token: hashedToken,
      password_reset_expires: {
        [sequelize.Sequelize.Op.gt]: new Date(),
      },
    },
  });

  if (!user) {
    return res.status(400).json({
      status: false,
      message: "Invalid or expired reset token",
      data: null,
    });
  }
  return res.status(200).json({
    status: true,
    message: "Token is valid",
    data: {
      email: user.email,
      name: user.name,
    },
  });
});