const nodemailer = require("nodemailer");
const logger = require("../utils/logger");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.verify((error, success) => {
  if (error) {
    logger.error("Email service error:", error);
  } else {
    logger.info("✓ Email service ready");
  }
});


const emailTemplates = {
  forgotPassword: (data) => ({
    subject: "Password Reset Request - Do Not Share",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 20px; border-radius: 8px;">
        <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-bottom: 20px;">Password Reset Request</h2>
          
          <p style="color: #666; line-height: 1.6;">Hi <strong>${data.name}</strong>,</p>
          
          <p style="color: #666; line-height: 1.6;">
            You requested a password reset. Click the button below to reset your password:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.resetLink}" 
               style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              Reset Password
            </a>
          </div>

          <p style="color: #666; font-size: 14px; line-height: 1.6;">
            Or copy and paste this link in your browser:
          </p>
          <p style="background: #f5f5f5; padding: 10px; border-radius: 4px; word-break: break-all; font-size: 12px; color: #333;">
            ${data.resetLink}
          </p>
          
          <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="color: #856404; margin: 0; font-size: 14px;">
              <strong>⚠️ Important:</strong> This link will expire in <strong>${data.expiryTime}</strong>
            </p>
          </div>

          <p style="color: #999; font-size: 12px; line-height: 1.6;">
            If you didn't request this password reset, please ignore this email or contact support if you believe your account is compromised.
          </p>

          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          
          <p style="color: #999; font-size: 11px; text-align: center;">
            This is an automated message. Please do not reply to this email.
          </p>
        </div>
      </div>
    `,
  }),


  welcome: (data) => ({
    subject: "Welcome to Our Platform!",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 20px; border-radius: 8px;">
        <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-bottom: 20px;">Welcome, ${data.name}! 🎉</h2>
          
          <p style="color: #666; line-height: 1.6;">
            Thank you for signing up! Your account has been created successfully.
          </p>
          
          <div style="background: #e7f3ff; border-left: 4px solid #2196F3; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="color: #1565c0; margin: 0; font-size: 14px;">
              <strong>Email:</strong> ${data.email}
            </p>
          </div>

          <p style="color: #666; line-height: 1.6; margin-top: 20px;">
            You can now log in to your account and start using our services.
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.loginLink}" 
               style="background-color: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              Login to Your Account
            </a>
          </div>

          <p style="color: #999; font-size: 12px; line-height: 1.6;">
            If you need help, contact our support team.
          </p>
        </div>
      </div>
    `,
  }),

  verifyEmail: (data) => ({
    subject: "Verify Your Email Address",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 20px; border-radius: 8px;">
        <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-bottom: 20px;">Verify Your Email</h2>
          
          <p style="color: #666; line-height: 1.6;">Hi <strong>${data.name}</strong>,</p>
          
          <p style="color: #666; line-height: 1.6;">
            Thank you for registering! Please verify your email address by clicking the button below:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.verifyLink}" 
               style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              Verify Email
            </a>
          </div>

          <p style="color: #666; font-size: 14px; line-height: 1.6;">
            Or copy and paste this link in your browser:
          </p>
          <p style="background: #f5f5f5; padding: 10px; border-radius: 4px; word-break: break-all; font-size: 12px; color: #333;">
            ${data.verifyLink}
          </p>
          
          <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="color: #856404; margin: 0; font-size: 14px;">
              <strong>⚠️ Important:</strong> This link will expire in <strong>${data.expiryTime}</strong>
            </p>
          </div>

          <p style="color: #999; font-size: 12px; line-height: 1.6;">
            If you didn't create an account, please ignore this email.
          </p>

          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          
          <p style="color: #999; font-size: 11px; text-align: center;">
            This is an automated message. Please do not reply to this email.
          </p>
        </div>
      </div>
    `,
  }),

  // Password changed notification
  passwordChanged: (data) => ({
    subject: "Your Password Has Been Changed",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 20px; border-radius: 8px;">
        <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-bottom: 20px;">Password Changed Successfully ✓</h2>
          
          <p style="color: #666; line-height: 1.6;">Hi ${data.name},</p>
          
          <p style="color: #666; line-height: 1.6;">
            Your password has been successfully changed.
          </p>

          <div style="background: #f0f0f0; padding: 15px; margin: 20px 0; border-radius: 4px; border-left: 4px solid #28a745;">
            <p style="color: #333; margin: 0; font-size: 14px;">
              <strong>Changed on:</strong> ${data.timestamp}
            </p>
          </div>

          <p style="color: #999; font-size: 12px; line-height: 1.6;">
            If you didn't make this change, please reset your password immediately or contact support.
          </p>
        </div>
      </div>
    `,
  }),
};

const sendEmail = async ({ to, subject, template, data }) => {
  try {

    if (!to || !template) {
      throw new Error("Email recipient and template are required");
    }

    if (!emailTemplates[template]) {
      throw new Error(`Email template '${template}' not found`);
    }

    const emailContent = emailTemplates[template](data);

    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'Support'}" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to,
      subject: emailContent.subject,
      html: emailContent.html,
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`✓ Email sent to ${to} (Message ID: ${info.messageId})`);
    
    return info;
  } catch (error) {
    logger.error(`✗ Email send failed to ${to}:`, error.message);
    throw error;
  }
};

module.exports = sendEmail;