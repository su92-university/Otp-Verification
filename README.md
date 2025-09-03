# OTP Authentication System

![Project Banner](./images/project-banner.png)
<!-- Replace with your actual image path -->

## 📋 Description

A secure One-Time Password (OTP) authentication system that provides an additional layer of security for user login and verification processes. This implementation supports SMS and email-based OTP delivery with customizable expiration times and retry mechanisms.

## ✨ Features

- 🔐 **Secure OTP Generation**: Random 6-digit OTP codes
- 📱 **SMS Integration**: Send OTP via SMS using popular providers
- 📧 **Email Integration**: Email-based OTP delivery
- ⏱️ **Configurable Expiration**: Set custom OTP validity periods
- 🔄 **Retry Logic**: Resend OTP with rate limiting
- 🛡️ **Brute Force Protection**: Prevent multiple invalid attempts
- 📊 **Rate Limiting**: Control OTP request frequency
- 🎯 **Easy Integration**: Simple API endpoints

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- Database (MySQL/PostgreSQL/MongoDB)
- SMS Provider API Key (Twilio/AWS SNS)
- Email Service (SendGrid/Nodemailer)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/su92-university/Otp-Verification
   cd Otp-Verification
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   
   Update your `.env` file:
   ```env
   # Database
    # MongoDB Connection
    MONGODB_URI=
    
    # JWT Secret (use a strong random string in production)
    JWT_SECRET=your-super-secret-jwt-key-change-this-in-productionvsd
    
    # Email Configuration (Gmail example)
    EMAIL_USER=
    EMAIL_PASS=
    
    # Frontend URL
    FRONTEND_URL=http://localhost:5173
    APP_NAME=abcd
    # Server Port
    PORT=5000
    
    # Node Environment
    NODE_ENV=development
   ```

4. **Start the application**
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:5173`



## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

- Give us star



⭐ **Star this repository if you find it helpful!**

![Demo Screenshot](./images/demo-screenshot.png)
<!-- Add a screenshot of your application in action -->
