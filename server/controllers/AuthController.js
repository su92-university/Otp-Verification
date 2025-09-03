import User from "../models/User.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { sendOtpEmail, sendWelcomeEmail } from "../utilities/email.js";
dotenv.config();

const register = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    if (!name || !email || !password) {
      return res
        .status(400)
        .send({ success: false, msg: "All field are Required" });
    }

    const checkuser = await User.findOne({ email });
    console.log("User:: ", checkuser);
    if (checkuser) {
      return res
        .status(400)
        .send({ success: false, msg: "User Already Exist" });
    }

    const hashpassword = await bcrypt.hash(password, 12);
    console.log("hashpassword:: ", hashpassword);

    const otp = Math.floor(Math.random() * 900000 + 100000);

    const newuser = new User({
      name,
      email,
      password: hashpassword,
      isVerified: false,
      otp,
      otpExpiry: Date.now() + 60 * 60 * 1000,
    });
    sendOtpEmail(email, name, otp);
    console.log("New newuser:: ", newuser);
    await newuser.save();
    return res
      .status(200)
      .send({ success: true, msg: "User Created Successfully", newuser });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during registration",
    });
  }
};

const verifyotp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required for verification",
      });
    }
    console.log("Email and OTP:: ", email, otp);
    const checkuser = await User.findOne({ email });
    if (!checkuser) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }
    console.log("User:: ", checkuser);
    if (checkuser.otp !== otp || checkuser.otpExpiry < Date.now()) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired OTP" });
    }
    checkuser.isVerified = true;
    checkuser.otp = null;
    checkuser.otpExpiry = null;
    await checkuser.save();
    sendWelcomeEmail(checkuser.email, checkuser.name);
    const generatetoken = jwt.sign(
      { id: checkuser._id },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );
    return res
      .status(200)
      .json({
        success: true,
        message: "OTP verified successfully",
        checkuser,
        generatetoken,
      });
  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during verification",
    });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(400)
      .send({ success: false, msg: "All field are Required" });
  }

  const user = await User.findOne({ email });
  console.log("User:: ", user);
  if (!user) {
    return res.status(400).send({
      success: false,
      msg: "User Does not Exist Please Registered First",
    });
  }

  const comparepassword = await bcrypt.compare(password, user.password);
  if (!comparepassword) {
    return res
      .status(400)
      .send({ success: false, msg: "Wrong Password and Email" });
  }
  if (!user.isVerified) {
    return res
      .status(400)
      .send({ success: false, msg: "Your Email is not Verified" });
  }
  const generatetoken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
  return res
    .status(200)
    .send({
      success: true,
      msg: "Login Successful",
      generatetoken,
      newuser: user,
    });
};

const loaduser = async (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      isVerified: req.user.isVerified,
      createdAt: req.user.createdAt,
    },
  });
};

export { register, verifyotp, loaduser, login };
