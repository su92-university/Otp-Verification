import User from "../models/User.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import validator from "validator";
import { sendOtpEmail, sendWelcomeEmail } from "../utilities/email.js";
import { generateSecureOTP, hashOTP, verifyOTP, sanitizeUser } from "../utilities/security.js";
dotenv.config();

const register = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    // Input validation
    if (!name || !email || !password) {
      return res
        .status(400)
        .send({ success: false, msg: "All fields are required" });
    }

    // Validate and sanitize email
    if (!validator.isEmail(email)) {
      return res
        .status(400)
        .send({ success: false, msg: "Invalid email format" });
    }
    const sanitizedEmail = validator.normalizeEmail(email);

    // Validate name
    const sanitizedName = validator.trim(name);
    if (sanitizedName.length < 2 || sanitizedName.length > 50) {
      return res
        .status(400)
        .send({ success: false, msg: "Name must be between 2 and 50 characters" });
    }

    // Validate password strength
    if (password.length < 8) {
      return res
        .status(400)
        .send({ success: false, msg: "Password must be at least 8 characters long" });
    }

    const checkuser = await User.findOne({ email: sanitizedEmail });
    if (checkuser) {
      return res
        .status(400)
        .send({ success: false, msg: "User already exists" });
    }

    const hashpassword = await bcrypt.hash(password, 12);

    // Generate cryptographically secure OTP
    const otp = generateSecureOTP(6);
    const hashedOTP = await hashOTP(otp);

    const newuser = new User({
      name: sanitizedName,
      email: sanitizedEmail,
      password: hashpassword,
      isVerified: false,
      otp: hashedOTP,
      otpExpiry: Date.now() + 10 * 60 * 1000, // 10 minutes
      otpAttempts: 0,
    });
    
    await newuser.save();
    
    // Send OTP email after saving user
    await sendOtpEmail(sanitizedEmail, sanitizedName, otp);
    
    return res
      .status(200)
      .send({ 
        success: true, 
        msg: "User created successfully. Please check your email for OTP.",
        user: sanitizeUser(newuser)
      });
  } catch (error) {
    console.error("Registration error");
    res.status(500).json({
      success: false,
      message: "Server error during registration",
    });
  }
};

const verifyotp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    // Input validation
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required for verification",
      });
    }

    // Validate email format
    if (!validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    const sanitizedEmail = validator.normalizeEmail(email);
    const sanitizedOTP = validator.trim(otp.toString());

    // Validate OTP format (6 digits)
    if (!/^\d{6}$/.test(sanitizedOTP)) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP format",
      });
    }

    const user = await User.findOne({ email: sanitizedEmail });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    // Check if OTP is locked due to too many attempts
    if (user.otpLockedUntil && user.otpLockedUntil > Date.now()) {
      const remainingTime = Math.ceil((user.otpLockedUntil - Date.now()) / 60000);
      return res.status(429).json({
        success: false,
        message: `Too many failed attempts. Please try again in ${remainingTime} minutes.`,
      });
    }

    // Check if OTP exists and is not expired
    if (!user.otp || !user.otpExpiry) {
      return res.status(400).json({
        success: false,
        message: "No OTP found. Please request a new one.",
      });
    }

    if (user.otpExpiry < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new one.",
      });
    }

    // Verify OTP using secure comparison
    const isValidOTP = await verifyOTP(sanitizedOTP, user.otp);
    
    if (!isValidOTP) {
      // Increment attempt counter
      user.otpAttempts = (user.otpAttempts || 0) + 1;
      
      // Lock account after 5 failed attempts
      if (user.otpAttempts >= 5) {
        user.otpLockedUntil = Date.now() + 30 * 60 * 1000; // Lock for 30 minutes
        await user.save();
        return res.status(429).json({
          success: false,
          message: "Too many failed attempts. Account locked for 30 minutes.",
        });
      }
      
      await user.save();
      const attemptsLeft = 5 - user.otpAttempts;
      return res.status(400).json({
        success: false,
        message: `Invalid OTP. ${attemptsLeft} attempts remaining.`,
      });
    }

    // OTP is valid - clear OTP data and verify user
    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;
    user.otpAttempts = 0;
    user.otpLockedUntil = null;
    await user.save();
    
    await sendWelcomeEmail(user.email, user.name);
    
    const generatetoken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );
    
    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      user: sanitizeUser(user),
      token: generatetoken,
    });
  } catch (error) {
    console.error("OTP verification error");
    res.status(500).json({
      success: false,
      message: "Server error during verification",
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Input validation
    if (!email || !password) {
      return res
        .status(400)
        .send({ success: false, msg: "All fields are required" });
    }

    // Validate email format
    if (!validator.isEmail(email)) {
      return res
        .status(400)
        .send({ success: false, msg: "Invalid email format" });
    }

    const sanitizedEmail = validator.normalizeEmail(email);

    const user = await User.findOne({ email: sanitizedEmail });
    if (!user) {
      return res.status(400).send({
        success: false,
        msg: "Invalid credentials",
      });
    }

    const comparepassword = await bcrypt.compare(password, user.password);
    if (!comparepassword) {
      return res
        .status(400)
        .send({ success: false, msg: "Invalid credentials" });
    }
    
    if (!user.isVerified) {
      return res
        .status(400)
        .send({ success: false, msg: "Please verify your email first" });
    }
    
    const generatetoken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    
    return res.status(200).send({
      success: true,
      msg: "Login successful",
      token: generatetoken,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error("Login error");
    res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
};

const loaduser = async (req, res) => {
  res.json({
    success: true,
    user: sanitizeUser(req.user),
  });
};

const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    // Input validation
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Validate email format
    if (!validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    const sanitizedEmail = validator.normalizeEmail(email);

    const user = await User.findOne({ email: sanitizedEmail });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "User is already verified",
      });
    }

    // Generate new secure OTP
    const otp = generateSecureOTP(6);
    const hashedOTP = await hashOTP(otp);

    // Update user with new OTP
    user.otp = hashedOTP;
    user.otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes
    user.otpAttempts = 0;
    user.otpLockedUntil = null;
    await user.save();

    // Send new OTP email
    await sendOtpEmail(sanitizedEmail, user.name, otp);

    return res.status(200).json({
      success: true,
      message: "New OTP sent successfully. Please check your email.",
    });
  } catch (error) {
    console.error("Resend OTP error");
    res.status(500).json({
      success: false,
      message: "Server error while resending OTP",
    });
  }
};

export { register, verifyotp, loaduser, login, resendOTP };
