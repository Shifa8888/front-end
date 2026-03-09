import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    confirmPassword: '',
    referralCode: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // Login
        await login(formData.email, formData.password);
        navigate('/dashboard');
      } else {
        // Register
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }

        const registerData = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          referralCode: formData.referralCode || undefined
        };

        await register(registerData);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || err || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="text-center mb-4">
          <div className="login-icon">
            <i className="fas fa-donate"></i>
          </div>
          <h3 className="login-title  opacity-95" style={{ fontWeight: 'normal' }}>Investa</h3>
          <p className="login-subtitle">Secure Login to Dashboard</p>
        </div>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {/* Login Form */}
        {isLogin ? (
          <form id="loginForm" onSubmit={handleSubmit}>
            <h5 className="text-white mb-4  opacity-95" style={{ fontWeight: 'normal' }}>Login</h5>
            <div className="mb-3">
              <label htmlFor="loginEmail" className="form-label">Email Address</label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="fas fa-envelope"></i>
                </span>
                <input
                  type="email"
                  className="form-control"
                  id="loginEmail"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="mb-4">
              <label htmlFor="loginPassword" className="form-label">Password</label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="fas fa-lock"></i>
                </span>
                <input
                  type="password"
                  className="form-control"
                  id="loginPassword"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              className="login-btn"
              disabled={loading}
            >
              {loading ? (
                <><i className="fas fa-spinner fa-spin me-2"></i>Loading...</>
              ) : (
                <><i className="fas fa-arrow-right me-2"></i>Login</>
              )}
            </button>
            <p className="text-center mt-3 mb-0">
              <span className="text-white-50">New user?</span>
              <span
                className="register-link"
                onClick={() => setIsLogin(false)}
              >
                Register
              </span>
            </p>
          </form>
        ) : (
          <form id="registerForm" onSubmit={handleSubmit}>
            <h5 className="text-white mb-4">Register</h5>
            <div className="mb-3">
              <label htmlFor="registerName" className="form-label">Full Name</label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="fas fa-user"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  id="registerName"
                  name="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="mb-3">
              <label htmlFor="registerEmail" className="form-label">Email Address</label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="fas fa-envelope"></i>
                </span>
                <input
                  type="email"
                  className="form-control"
                  id="registerEmail"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="mb-3">
              <label htmlFor="registerPhone" className="form-label">Phone Number</label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="fas fa-phone"></i>
                </span>
                <input
                  type="tel"
                  className="form-control"
                  id="registerPhone"
                  name="phone"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="mb-3">
              <label htmlFor="registerReferralCode" className="form-label">Referral Code (Optional)</label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="fas fa-gift"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  id="registerReferralCode"
                  name="referralCode"
                  placeholder="Enter referral code (optional)"
                  value={formData.referralCode}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="mb-3">
              <label htmlFor="registerPassword" className="form-label">Password</label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="fas fa-lock"></i>
                </span>
                <input
                  type="password"
                  className="form-control"
                  id="registerPassword"
                  name="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                />
              </div>
            </div>
            <div className="mb-4">
              <label htmlFor="registerConfirmPassword" className="form-label">Confirm Password</label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="fas fa-lock"></i>
                </span>
                <input
                  type="password"
                  className="form-control"
                  id="registerConfirmPassword"
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              className="register-btn"
              disabled={loading}
            >
              {loading ? (
                <><i className="fas fa-spinner fa-spin me-2"></i>Creating Account...</>
              ) : (
                <><i className="fas fa-user-plus me-2"></i>Create Account</>
              )}
            </button>
            <p className="text-center mt-3 mb-0">
              <span className="text-white-50">Already have an account?</span>
              <span
                className="register-link"
                onClick={() => setIsLogin(true)}
              >
                Login
              </span>
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;
