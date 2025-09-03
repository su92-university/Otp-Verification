import express from "express"
import { register, verifyotp, loaduser, login } from "../controllers/AuthController.js"
import { protect } from "../middleware/middleware.js"

const router = express.Router()

router.post("/register",register)
router.post("/login",login) 
router.post("/verifyotp",verifyotp)
router.get("/profile",protect,loaduser)

export default router