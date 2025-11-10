import express from "express"
import { register, verifyotp, loaduser, login, resendOTP } from "../controllers/AuthController.js"
import { protect } from "../middleware/middleware.js"
import { 
  otpGenerationLimiter, 
  otpVerificationLimiter, 
  loginLimiter 
} from "../middleware/rateLimiter.js"

const router = express.Router()

router.post("/register", otpGenerationLimiter, register)
router.post("/login", loginLimiter, login) 
router.post("/verifyotp", otpVerificationLimiter, verifyotp)
router.post("/resend-otp", otpGenerationLimiter, resendOTP)
router.get("/profile", protect, loaduser)

export default router