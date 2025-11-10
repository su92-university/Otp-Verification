import crypto from 'crypto';
import bcrypt from 'bcryptjs';

/**
 * Generate a cryptographically secure OTP
 * @param {number} length - Length of OTP (default: 6)
 * @returns {string} - Secure random OTP
 */
export const generateSecureOTP = (length = 6) => {
  const digits = '0123456789';
  let otp = '';
  
  // Use crypto.randomInt for cryptographically secure random numbers
  for (let i = 0; i < length; i++) {
    otp += digits[crypto.randomInt(0, digits.length)];
  }
  
  return otp;
};

/**
 * Hash OTP before storing in database
 * @param {string} otp - Plain text OTP
 * @returns {Promise<string>} - Hashed OTP
 */
export const hashOTP = async (otp) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(otp, salt);
};

/**
 * Verify OTP against hashed version
 * @param {string} plainOTP - Plain text OTP from user
 * @param {string} hashedOTP - Hashed OTP from database
 * @returns {Promise<boolean>} - True if OTP matches
 */
export const verifyOTP = async (plainOTP, hashedOTP) => {
  return await bcrypt.compare(plainOTP, hashedOTP);
};

/**
 * Sanitize user object to remove sensitive data
 * @param {Object} user - User object from database
 * @returns {Object} - Sanitized user object
 */
export const sanitizeUser = (user) => {
  const userObj = user.toObject ? user.toObject() : user;
  
  // Remove sensitive fields
  delete userObj.password;
  delete userObj.otp;
  delete userObj.otpExpiry;
  delete userObj.otpAttempts;
  delete userObj.otpLockedUntil;
  delete userObj.__v;
  
  return userObj;
};
