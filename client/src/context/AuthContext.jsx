// src/contexts/AuthContext.js
import axios from "axios";
import React, { createContext, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate()
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem("token"));

  // Load user on app start
  useEffect(() => {
    if (token) {
      console.log(token)
      loadUser();
    } else {
      setLoading(false);
    }
  }, [token]);


  
  // Verify Email
  const verifyotp = async (cradiential) => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/verifyotp',{email:user.email,otp:cradiential});
      if (response.data.success) {
        const { generatetoken,checkuser } = response.data;
        localStorage.setItem("token", generatetoken);
        setToken(generatetoken);
        setUser(checkuser);
        setTimeout(()=>{
          navigate('/')
        },3000)
        return { success: true, message: response.data.message };
      } else {
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      throw new Error(error.response?.data?.message || "Verification failed");
    }
  };

  // Login user
  const register = async (credentials) => {
    try {
      const response = await axios.post("http://localhost:5000/api/auth/register", credentials);
      console.log("REsponse data:: ",response.data)
      if (response.data.success) {
        const { newuser } = response.data;
        setUser(newuser);
        return { success: true, message: response.data.msg };
      }
    } catch (error) {
      throw new Error(error.response?.data?.message || "Login failed");
    }
  };



  const login = async (credentials) => {
    try {
      const response = await axios.post("http://localhost:5000/api/auth/login", credentials);
      if (response.data.success) {
        const { generatetoken, newuser } = response.data;
        localStorage.setItem("token", generatetoken);
        setToken(generatetoken);
        setUser(newuser);
        return { success: true, message: response.data.msg };
      }
    } catch (error) {
      throw new Error(error.response?.data?.msg || "Login failed");
    }
  };

    // Load user profile
  const loadUser = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/auth/profile", {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(res.data)
      if (res.data.success) {
        setUser(res.data.user);
      }
    } catch (error) {
      console.error("Failed to load user:", error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  // Resend verification email
  const resendVerificationEmail = async (email) => {
    try {
      const response = await api.post("/auth/resend-verification", { email });
      if (response.data.success) {
        return { success: true, message: response.data.message };
      }
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to resend verification email"
      );
    }
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!token && !!user;
  };

  // Check if user email is verified
  const isEmailVerified = () => {
    return user?.isVerified || false;
  };

  const value = {
    user,
    loading,
    logout,
    register,
    verifyotp,
    login,
    resendVerificationEmail,
    isAuthenticated,
    isEmailVerified,
    loadUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
