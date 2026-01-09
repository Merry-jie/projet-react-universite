import React from 'react';
import './MobileMenu.css';

const MobileMenu = ({ activePage, onMenuClick, isOpen, onClose }) => {
  const menuItems = [
    { id: 'accueil', icon: 'fa-home', label: 'Accueil' },
    { id: 'etudiants', icon: 'fa-users', label: 'Étudiants' },
    { id: 'ajout', icon: 'fa-user-plus', label: 'Ajout' },
    { id: 'notes', icon: 'fa-clipboard-list', label: 'Notes' },
    { id: 'pdf', icon: 'fa-file-pdf', label: 'PDF' },
  ];

  const handleMenuItemClick = (pageId) => {
    onMenuClick(pageId);
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && <div className="mobile-menu-overlay" onClick={onClose}></div>}
      
      {/* Menu mobile */}
      <div className={`mobile-menu ${isOpen ? 'open' : ''}`}>
        <div className="mobile-menu-header">
          <div className="mobile-menu-logo">
            <i className="fas fa-university"></i>
          </div>
          <h3>Menu de Navigation</h3>
          <button className="mobile-menu-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className="mobile-menu-items">
          {menuItems.map((item) => (
            <div
              key={item.id}
              className={`mobile-menu-item ${activePage === item.id ? 'active' : ''}`}
              onClick={() => handleMenuItemClick(item.id)}
            >
              <i className={`fas ${item.icon}`}></i>
              <span>{item.label}</span>
              <i className="fas fa-chevron-right"></i>
            </div>
          ))}
        </div>
        
        <div className="mobile-menu-footer">
          <div className="mobile-user-info">
            <div className="mobile-user-avatar">
              <i className="fas fa-user-circle"></i>
            </div>
            <div className="mobile-user-details">
              <div className="mobile-user-name">Administrateur</div>
              <div className="mobile-user-status">
                <i className="fas fa-circle"></i> En ligne
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileMenu;
