import React from 'react';
import './SidebarLeft.css';

const SidebarLeft = () => {
  return (
    <div className="sidebar-left">
      <h2>UNIVERSITÉ</h2>
      <div className="separator"></div>
      
      <div className="menu-item" onClick={() => alert('Menu Directeur')}>
        <i className="fas fa-user-tie"></i> Directeur
      </div>
      <div className="menu-item" onClick={() => alert('Menu Coordinateur')}>
        <i className="fas fa-user-cog"></i> Coordinateur
      </div>
      <div className="menu-item" onClick={() => alert('Menu Administration')}>
        <i className="fas fa-users-cog"></i> Administration
      </div>
      
      <div className="profile-card">
        <div className="profile-icon">U</div>
        <div className="profile-text">
          <div className="university-name">Université</div>
          <div className="role">Administrateur</div>
        </div>
      </div>
    </div>
  );
};

export default SidebarLeft;
