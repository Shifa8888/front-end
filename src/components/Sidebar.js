import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  const location = useLocation();
  const [expandedGroups, setExpandedGroups] = useState({
    finance: true,
    activity: true,
    account: true
  });

  const toggleGroup = (groupName) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  };

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    window.location.href = '/';
  };

  return (
    <div className="sidebar">
      <div className="p-4">
        <Link to="/dashboard" className="d-flex align-items-center text-decoration-none">
          <i className="fas fa-donate text-primary-custom fs-2 me-2"></i>
          <h4 className="text-white mb-0 fw-bold">Investa</h4>
        </Link>
      </div>

      <nav className="nav flex-column">
        <Link 
          to="/dashboard" 
          className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
        >
          <i className="fas fa-th-large"></i> Dashboard
        </Link>

        {/* Finance Dropdown */}
        <div className="nav-group">
          <div 
            className="px-4 mt-3 mb-2 text-gray small text-uppercase nav-group-title" 
            onClick={() => toggleGroup('finance')}
          >
            Finance <i className={`fas fa-chevron-${expandedGroups.finance ? 'up' : 'down'} float-end`}></i>
          </div>
          <div className={`nav-group-content ${!expandedGroups.finance ? 'active' : ''}`} id="finance-content">
            <Link 
              to="/wallet" 
              className={`nav-link ${isActive('/wallet') ? 'active' : ''}`}
            >
              <i className="fas fa-wallet"></i> My Wallet
            </Link>
            <Link 
              to="/add-funds" 
              className={`nav-link ${isActive('/add-funds') ? 'active' : ''}`}
            >
              <i className="fas fa-plus-circle"></i> Add Funds
            </Link>
            <Link 
              to="/withdraw-funds" 
              className={`nav-link ${isActive('/withdraw-funds') ? 'active' : ''}`}
            >
              <i className="fas fa-arrow-down"></i> Withdraw Funds
            </Link>
            <Link 
              to="/investment-plans" 
              className={`nav-link ${isActive('/investment-plans') ? 'active' : ''}`}
            >
              <i className="fas fa-chart-pie"></i> Investment Plans
            </Link>
          </div>
        </div>

        {/* Activity Dropdown */}
        <div className="nav-group">
          <div 
            className="px-4 mt-3 mb-2 text-gray small text-uppercase nav-group-title" 
            onClick={() => toggleGroup('activity')}
          >
            Activity <i className={`fas fa-chevron-${expandedGroups.activity ? 'up' : 'down'} float-end`}></i>
          </div>
          <div className={`nav-group-content ${!expandedGroups.activity ? 'active' : ''}`} id="activity-content">
            <Link 
              to="/goals" 
              className={`nav-link ${isActive('/goals') ? 'active' : ''}`}
            >
              <i className="fas fa-trophy"></i> Ranks
            </Link>
            <Link 
              to="/referrals" 
              className={`nav-link ${isActive('/referrals') ? 'active' : ''}`}
            >
              <i className="fas fa-users"></i> My Referrals
            </Link>
            <Link 
              to="/transactions" 
              className={`nav-link ${isActive('/transactions') ? 'active' : ''}`}
            >
              <i className="fas fa-exchange-alt"></i> Transactions
            </Link>
          </div>
        </div>

        {/* Account Dropdown */}
        <div className="nav-group">
          <div 
            className="px-4 mt-4 mb-2 text-gray small text-uppercase nav-group-title" 
            onClick={() => toggleGroup('account')}
          >
            Account <i className={`fas fa-chevron-${expandedGroups.account ? 'up' : 'down'} float-end`}></i>
          </div>
          <div className={`nav-group-content ${!expandedGroups.account ? 'active' : ''}`} id="account-content">
            <Link 
              to="/profile" 
              className={`nav-link ${isActive('/profile') ? 'active' : ''}`}
            >
              <i className="fas fa-user-circle"></i> My Profile
            </Link>
            <Link 
              to="/support" 
              className={`nav-link ${isActive('/support') ? 'active' : ''}`}
            >
              <i className="fas fa-headset"></i> Help & Support
            </Link>
            <Link 
              to="/security" 
              className={`nav-link ${isActive('/security') ? 'active' : ''}`}
            >
              <i className="fas fa-shield-alt"></i> Security Settings
            </Link>
            <div className="text-center mt-4">
              <button 
                className="btn btn-lg w-75 logout-btn"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
