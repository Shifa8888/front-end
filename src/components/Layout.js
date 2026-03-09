import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import MobileBottomNav from './MobileBottomNav';
import './Layout.css';

const Layout = ({ children, title }) => {
  return (
    <div className="container-fluid">
      <div className="row">
        <Sidebar />
        <div className="col-lg-10 col-md-9 p-0 main-content">
          <Header title={title} />
          <div className="p-4 p-md-4 p-sm-2">
            {children}
          </div>
        </div>
      </div>
      <MobileBottomNav />
    </div>
  );
};

export default Layout;
