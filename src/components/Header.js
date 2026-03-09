import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Header.css';
import { useAuth } from '../contexts/AuthContext';


const Header = ({ title = "Dashboard" }) => {
  const [showNotifications, setShowNotifications] = useState(false);
 const { user } = useAuth(); // Ensure user is authenticated

  return (
    <>
      <div className="top-header p-3 d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center">
          <h4 className="text-white mb-0">{title}</h4>
        </div>
        <div className="d-flex align-items-center">
          <button 
            className="btn btn-link text-white me-3" 
            id="notificationBtn"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <i className="fas fa-bell fs-5"></i>
          </button>
          <Link 
            to="/profile" 
            className="d-flex align-items-center text-decoration-none" 
            id="profileButton"
          >
            <i className="fas fa-user-circle fa-2x text-white me-3"></i>
            <div className="text-start profile-header-text">
              <h6 className="text-white mb-0">{user?.name}</h6>
              <small className="text-gray">{user?.email}</small>
            </div>
          </Link>
        </div>
      </div>

      {/* Notification Modal */}
      <div className={`notification-modal ${showNotifications ? 'active' : ''}`} id="notificationModal">
        <div className="notification-content">
          <div className="notification-header">
            <h5 className="text-white mb-0">Notifications</h5>
            <button 
              className="btn-close" 
              id="closeNotification"
              onClick={() => setShowNotifications(false)}
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
          <div className="notification-body">
            <div className="no-notification">
              <i className="fas fa-bell-slash text-gray fs-3 mb-3"></i>
              <p className="text-gray mb-0">No Notification found!</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;
