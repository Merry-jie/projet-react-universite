import React from 'react';
import './SidebarRight.css';

const SidebarRight = ({ activePage, onMenuClick }) => {
  const menuItems = [
    { id: 'accueil', icon: 'fa-home', label: 'Accueil' },
    { id: 'etudiants', icon: 'fa-users', label: 'Étudiants' },
    { id: 'ajout', icon: 'fa-user-plus', label: 'Ajout' }, // NOUVEAU - Ajouté ici
    { id: 'notes', icon: 'fa-clipboard-list', label: 'Notes' },
    { id: 'pdf', icon: 'fa-file-pdf', label: 'PDF' },
  ];

  return (
    <div className="sidebar-right">
      <div className="university-icon">
        <p>U</p>
      </div>
      <div className="separator-small"></div>
      
      {menuItems.map((item) => (
        <div
          key={item.id}
          className={`icon-menu ${activePage === item.id ? 'active-menu' : ''}`}
          onClick={() => onMenuClick(item.id)}
          title={item.label}
        >
          <i className={`fas ${item.icon}`}></i>
          <span>{item.label}</span>
        </div>
      ))}
      
      <div className="separator-small" style={{ marginTop: 'auto', marginBottom: '20px' }}></div>
      
      <div className="user-icon" onClick={() => console.log('Menu utilisateur')}>
        <i className="fas fa-user"></i>
      </div>
    </div>
  );
};

export default SidebarRight;
