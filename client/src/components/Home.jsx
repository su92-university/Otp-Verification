import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from "../context/AuthContext"; 
import '../style/Homepage.css';
import {Link} from "react-router-dom"
const HomePage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const {user,logout} = useAuth()
  const [gradientAngle, setGradientAngle] = useState(135);
  const statsRef = useRef(null);
  const [statsAnimated, setStatsAnimated] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Toggle mobile menu
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handlelogout =async ()=>{
    await logout()
    // localStorage.removeItem("token");
    // window.location.reload();
  }

  // Close mobile menu when clicking on a link
  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  // Smooth scroll function
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    closeMenu();
  };

  // Counter animation function
  const animateCounter = (element, target) => {
    if (!element) return;
    
    let current = 0;
    const increment = target / 100;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      
      if (target === 99) {
        element.textContent = current.toFixed(1) + '%';
      } else if (target >= 1000000) {
        element.textContent = (current / 1000000).toFixed(1) + 'M+';
      } else if (target >= 1000) {
        element.textContent = (current / 1000).toFixed(0) + 'K+';
      } else {
        element.textContent = Math.floor(current) + '/7';
      }
    }, 20);
  };

  // Intersection Observer for stats animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !statsAnimated) {
            const statNumbers = entry.target.querySelectorAll('.stat-number');
            statNumbers.forEach((stat) => {
              const target = parseInt(stat.getAttribute('data-target'));
              animateCounter(stat, target);
            });
            setStatsAnimated(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => observer.disconnect();
  }, [statsAnimated]);

  // Gradient animation
  useEffect(() => {
    const interval = setInterval(() => {
      setGradientAngle((prev) => (prev + 1) % 360);
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // Navbar scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const navbar = document.querySelector('.navbar');
      if (navbar) {
        if (window.scrollY > 50) {
          navbar.style.background = 'rgba(255, 255, 255, 0.98)';
          navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        } else {
          navbar.style.background = 'rgba(255, 255, 255, 0.95)';
          navbar.style.boxShadow = 'none';
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: '🔐',
      title: 'Bank-Level Security',
      description: 'Advanced encryption algorithms protect your data with the same security standards used by major financial institutions.'
    },
    {
      icon: '⚡',
      title: 'Lightning Fast',
      description: 'Instant OTP generation and verification. No waiting, no delays - just seamless authentication in milliseconds.'
    },
    {
      icon: '📱',
      title: 'Multi-Platform',
      description: 'Works flawlessly across all devices. Desktop, mobile, tablet - your security travels with you everywhere.'
    },
    {
      icon: '🌍',
      title: 'Global Reach',
      description: 'Reliable OTP delivery worldwide with 99.9% success rate. Connect from anywhere on the planet.'
    },
    {
      icon: '🛡️',
      title: 'Zero Trust Model',
      description: 'Every access request is verified. No assumptions, no shortcuts - just bulletproof security protocols.'
    },
    {
      icon: '📊',
      title: 'Real-time Analytics',
      description: 'Monitor your security events in real-time. Track login attempts, successful authentications, and more.'
    }
  ];

  const stats = [
    { number: 1000000, label: 'Secure Authentications' },
    { number: 99, label: '% Uptime' },
    { number: 50000, label: 'Happy Users' },
    { number: 24, label: '7 Support' }
  ];

  return (
    <div className="app">


      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-logo">
            <h2>SecureAuth</h2>
          </div>
          <ul className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
            <li className="nav-item">
              <span className="nav-link" onClick={() => scrollToSection('home')}>Home</span>
            </li>
            <li className="nav-item">
              <span className="nav-link" onClick={() => scrollToSection('features')}>Features</span>
            </li>
            <li className="nav-item">
              <span className="nav-link" onClick={() => scrollToSection('about')}>About</span>
            </li>
            <li className="nav-item">
              <span className="nav-link" onClick={() => scrollToSection('contact')}>Contact</span>
            </li>
            <li className="nav-item">
              {user ? (
                <div className="user-info" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                  <span className="user-name">{user.name.charAt(0).toUpperCase()}</span>
                  {/* dropdown for lot out */}
                  {isDropdownOpen &&
                  <div className="dropdown-content">
                    <div className='logoutdiv' to="" onClick={()=>handlelogout()}>Logout</div>
                  </div>  
                  }
                </div>
              ) : (
              <Link to="/login" className="nav-link login-btn">Login</Link>
                
              )
              
              }
            </li>
          </ul>
          <div className={`hamburger ${isMenuOpen ? 'active' : ''}`} onClick={toggleMenu}>
            <span className="bar"></span>
            <span className="bar"></span>
            <span className="bar"></span>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="hero">
        <div className="hero-container">
          <div className="hero-content">
            <h1 className="hero-title">
              Secure Your Digital Identity with 
              <span className="gradient-text"> OTP Authentication</span>
            </h1>
            <p className="hero-description">
              Experience next-level security with our advanced One-Time Password system. 
              Protect your accounts with military-grade encryption and seamless user experience.
            </p>
            <div className="hero-buttons">
              <span className="btn btn-primary">Get Started</span>
              <span className="btn btn-secondary" onClick={() => scrollToSection('features')}>Learn More</span>
            </div>
          </div>
          <div className="hero-image">
            <div className="security-icon">
              <div className="shield">
                <div className="shield-inner">
                  <div className="checkmark">✓</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="hero-bg-animation">
          <div className="floating-element"></div>
          <div className="floating-element"></div>
          <div className="floating-element"></div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features">
        <div className="container">
          <h2 className="section-title">Why Choose SecureAuth?</h2>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats" ref={statsRef}>
        <div className="container">
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className="stat-item">
                <h3 className="stat-number" data-target={stat.number}>0</h3>
                <p className="stat-label">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MERN Section */}
      <section id="about" className="mern">
        <div className="container">
          <div className="mern-content">
            <h2>Using</h2>
            <div className="mern-visual">
              <h1>M</h1>
              <p>MongoDB Database</p>
            </div>
            <div  className="mern-visual">
              <h1>E</h1>
              <p>Express.js Framework</p>
            </div>
            <div className="mern-visual">
              <h1>R</h1>
              <p>React.js Library</p>
            </div>
            <div className="mern-visual">
              <h1>N</h1>
              <p>Node.js Runtime</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="about">
        <div className="container">
          <div className="about-content">
            <div className="about-text">
              <h2>Built for the Future of Security</h2>
              <p>In an increasingly connected world, traditional passwords are no longer enough. SecureAuth represents the next evolution in digital security, combining cutting-edge technology with user-friendly design.</p>
              <p>Our OTP authentication system doesn't just protect your accounts - it provides peace of mind. Whether you're a developer building secure applications or a business protecting sensitive data, SecureAuth scales with your needs.</p>
              <div className="about-stats">
                <div className="about-stat">
                  <span className="stat-value">256-bit</span>
                  <span className="stat-desc">Encryption</span>
                </div>
                <div className="about-stat">
                  <span className="stat-value">&lt;2s</span>
                  <span className="stat-desc">Verification Time</span>
                </div>
                <div className="about-stat">
                  <span className="stat-value">100%</span>
                  <span className="stat-desc">Open Source</span>
                </div>
              </div>
            </div>
            <div className="about-visual">
              <div className="security-layers">
                <div className="layer layer-1"></div>
                <div className="layer layer-2"></div>
                <div className="layer layer-3"></div>
                <div className="center-lock">🔒</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Secure Your Future?</h2>
            <p>Join thousands of developers and businesses who trust SecureAuth for their authentication needs.</p>
            <div className="cta-buttons">
              <span className="btn btn-primary btn-large">Start Free Trial</span>
              <span className="btn btn-outline btn-large">View Demo</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h3>SecureAuth</h3>
              <p>The future of authentication is here. Secure, fast, and reliable OTP solutions for everyone.</p>
              <div className="social-links">
                <a href="#" className="social-link">📧</a>
                <a href="#" className="social-link">🐦</a>
                <a href="#" className="social-link">💼</a>
                <a href="#" className="social-link">📚</a>
              </div>
            </div>
            <div className="footer-section">
              <h4>Product</h4>
              <ul>
                <li><a href="#">Features</a></li>
                <li><a href="#">Pricing</a></li>
                <li><a href="#">API Docs</a></li>
                <li><a href="#">Status</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Company</h4>
              <ul>
                <li><a href="#">About Us</a></li>
                <li><a href="#">Careers</a></li>
                <li><a href="#">Blog</a></li>
                <li><a href="#">Press</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Support</h4>
              <ul>
                <li><a href="#">Help Center</a></li>
                <li><a href="#">Contact</a></li>
                <li><a href="#">Security</a></li>
                <li><a href="#">Privacy</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2025 SecureAuth. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;