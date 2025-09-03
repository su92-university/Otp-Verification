import React, { useState, useEffect, useRef } from 'react';
import '../style/verifyotp.css';
import { useAuth } from "../context/AuthContext";
import axios from 'axios';

const OTPVerify = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const { verifyotp,user } = useAuth();
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(120); // 2 minutes
  const [canResend, setCanResend] = useState(false);
  
  const inputRefs = useRef([]);

  // Timer countdown effect
  useEffect(() => {
    let interval = null;
    if (timer > 0 && !canResend) {
      interval = setInterval(() => {
        setTimer(timer => timer - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer, canResend]);

  // Handle OTP input change
  const handleChange = (element, index) => {
    if (isNaN(element.value)) return false;

    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);
    setError('');

    // Focus next input
    if (element.nextSibling && element.value !== '') {
      element.nextSibling.focus();
    }
  };

  // Handle backspace
  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (otp[index] === '' && index > 0) {
        inputRefs.current[index - 1].focus();
      }
      setOtp([...otp.map((d, idx) => (idx === index ? '' : d))]);
    }
  };

  // Handle paste
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const pastedArray = pastedData.slice(0, 6).split('');
    
    if (pastedArray.every(char => !isNaN(char))) {
      const newOtp = [...otp];
      pastedArray.forEach((char, index) => {
        if (index < 6) newOtp[index] = char;
      });
      setOtp(newOtp);
      
      // Focus the next empty input or the last one
      const nextEmptyIndex = newOtp.findIndex(val => val === '');
      if (nextEmptyIndex !== -1) {
        inputRefs.current[nextEmptyIndex].focus();
      } else {
        inputRefs.current[5].focus();
      }
    }
  };

  // Verify OTP
  const handleVerify = async () => {
    const otpString = otp.join('');
    
    if (otpString.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Simulate API call
      const response = await verifyotp( otpString );

      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log("Otp:: ",otp)
      console.log("Otp String:: ",otpString)

    if (response.success) {
      setIsVerified(true);
    } else {
      setError(response.message || 'Invalid OTP. Please try again.');
    }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResend = () => {
    setTimer(120);
    setCanResend(false);
    setOtp(['', '', '', '', '', '']);
    setError('');
    inputRefs.current[0].focus();
  };

  // Format timer display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isVerified) {
    return (
      <div className="otp-container">
        <div className="otp-card success-card">
          <div className="success-icon">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="#10B981" strokeWidth="2"/>
              <path d="m9 12 2 2 4-4" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2>Verification Successful!</h2>
          <p>Your phone number has been verified successfully.</p>
          <button className="continue-btn" onClick={() => setIsVerified(false)}>
            Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="otp-container">
      <div className="otp-card">
        <div className="otp-header">
          <div className="phone-icon">
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none">
              <rect x="5" y="2" width="14" height="20" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
              <path d="m12 18h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2>Verify Your Email</h2>
          <p>We've sent a 6-digit verification code to</p>
          <p className="phone-number">{user?.email}</p>
        </div>

        <div className="otp-input-container">
          {otp.map((data, index) => (
            <input
              key={index}
              ref={(el) => inputRefs.current[index] = el}
              className={`otp-input ${error ? 'error' : ''}`}
              type="text"
              maxLength="1"
              value={data}
              onChange={(e) => handleChange(e.target, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onPaste={handlePaste}
              onFocus={(e) => e.target.select()}
            />
          ))}
        </div>

        {error && <div className="error-message">{error}</div>}

        <button 
          className={`verify-btn ${isLoading ? 'loading' : ''}`}
          onClick={handleVerify}
          disabled={isLoading || otp.join('').length !== 6}
        >
          {isLoading ? (
            <>
              <div className="spinner"></div>
              Verifying...
            </>
          ) : (
            'Verify OTP'
          )}
        </button>

        <div className="resend-section">
          {!canResend ? (
            <p className="timer-text">
              Resend code in <span className="timer">{formatTime(timer)}</span>
            </p>
          ) : (
            <button className="resend-btn" onClick={handleResend}>
              Resend OTP
            </button>
          )}
        </div>

        <div className="help-text">
          <p>Didn't receive the code? Check your SMS or</p>
          <button className="link-btn">Try another method</button>
        </div>
      </div>
    </div>
  );
};

export default OTPVerify;