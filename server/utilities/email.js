// services/emailService.js
import nodemailer from 'nodemailer'

import dotenv from 'dotenv'
dotenv.config();
// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com', // or your preferred email service
    port: 587,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS // Use app password for Gmail
    }
  });
};

const sendOtpEmail = async (email, name, otp) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"${process.env.APP_NAME}" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Your OTP Code',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Your OTP Code</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4; }
          .container { max-width: 500px; margin: 0 auto; background-color: #fff; padding: 32px; border-radius: 12px; box-shadow: 0 0 12px rgba(0,0,0,0.08); }
          .header { text-align: center; margin-bottom: 24px; }
          .otp-box { font-size: 32px; letter-spacing: 12px; font-weight: bold; color: #6366f1; background: #f0f4ff; padding: 18px 0; border-radius: 8px; text-align: center; margin: 24px 0; }
          .footer { margin-top: 32px; text-align: center; color: #888; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Your OTP Code</h1>
          </div>
          <p>Hi ${name},</p>
          <p>Use the following One-Time Password (OTP) to verify your email address. This code is valid for 10 minutes:</p>
          <div class="otp-box">${otp}</div>
          <p>If you did not request this, please ignore this email.</p>
          <div class="footer">
            <p>&copy; 2024 ${process.env.APP_NAME}. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('OTP email sent successfully');
    return { success: true };
  } catch (error) {
    console.error('Error sending OTP email:', error);
    return { success: false, error: error.message };
  }
};
// Send welcome email after verification
const sendWelcomeEmail = async (email, name) => {
  const transporter = createTransporter();
  
  const mailOptions = {
    from: `"${process.env.APP_NAME}" <${process.env.EMAIL_USER}>`,
    // from:process.env.EMAIL_USER,
    to: email,
    subject: 'Welcome! Your Email Has Been Verified',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Welcome!</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
          .header { text-align: center; margin-bottom: 30px; color: #28a745; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Email Verified Successfully!</h1>
          </div>
          <p>Hi ${name},</p>
          <p>Congratulations! Your email has been successfully verified. You now have full access to your ${process.env.APP_NAME} account.</p>
          <p>You can now:</p>
          <ul>
            <li>Access your dashboard</li>
            <li>Update your profile</li>
            <li>Explore all features</li>
          </ul>
          <p>Thank you for joining us!</p>
          <p>Best regards,<br>The ${process.env.APP_NAME} Team</p>
        </div>
      </body>
      </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Welcome email sent successfully');
    return { success: true };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return { success: false, error: error.message };
  }
};

export  {
  sendOtpEmail,
  sendWelcomeEmail
}
