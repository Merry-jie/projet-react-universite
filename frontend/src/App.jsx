import React, { useState, useEffect } from 'react';
import './App.css';

// Composants
import SidebarLeft from './components/SidebarLeft';
import SidebarRight from './components/SidebarRight';
import MobileMenu from './components/MobileMenu';

// Pages
import Accueil from './pages/Accueil';
import Etudiants from './pages/Etudiants';
import Ajout from './pages/Ajout';
import Notes from './pages/Notes';
import PDF from './pages/PDF';

// Services
import { testConnection } from './backend/db';
import socketService from './services/socket'; // NOUVEAU
import { showNotification } from './utils/notifications'; // Créez ce fichier

function App() {
  const [activePage, setActivePage] = useState('accueil');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [dbStatus, setDbStatus] = useState(null);
  const [pagesLoaded, setPagesLoaded] = useState(false);
  const [notifications, setNotifications] = useState([]); // NOUVEAU

  useEffect(() => {
    console.log('App montée, initialisation...');
    
    // Tester la connexion API
    const checkDatabaseConnection = async () => {
      try {
        const status = await testConnection();
        console.log('Statut connexion:', status);
        setDbStatus(status);
        
        // Si connexion API OK, connecter Socket.io
        if (status.success) {
          initializeSocket();
        }
      } catch (error) {
        console.error('Erreur testConnection:', error);
        setDbStatus({
          success: false,
          message: 'Erreur connexion API'
        });
      }
    };
    
    checkDatabaseConnection();
    setPagesLoaded(true);
    
    // Nettoyage à la destruction du composant
    return () => {
      socketService.disconnect();
    };
  }, []);

  // Initialiser Socket.io
  const initializeSocket = () => {
    socketService.connect();
    
    // S'abonner aux mises à jour des étudiants
    socketService.subscribeToStudents((action, data) => {
      let message = '';
      switch(action) {
        case 'created':
          message = `Nouvel étudiant: ${data.firstname} ${data.lastname}`;
          break;
        case 'updated':
          message = `Étudiant modifié: ${data.firstname} ${data.lastname}`;
          break;
        case 'deleted':
          message = `Étudiant supprimé: ${data}`;
          break;
      }
      showNotification(message, 'info');
    });
    
    // S'abonner aux mises à jour des notes
    socketService.subscribeToGrades((action, data) => {
      let message = '';
      switch(action) {
        case 'created':
          message = `Nouvelle note ajoutée: ${data.course} - ${data.grade}/20`;
          break;
        case 'updated':
          message = `Note modifiée: ${data.course} - ${data.grade}/20`;
          break;
        case 'deleted':
          message = `Note supprimée`;
          break;
      }
      showNotification(message, 'info');
    });
    
    // S'abonner aux notifications générales
    socketService.subscribeToNotifications((notification) => {
      showNotification(notification.message, notification.type || 'info');
      setNotifications(prev => [...prev, notification]);
    });
  };

  const handleShowPage = (pageId) => {
    console.log('Navigation vers:', pageId);
    setActivePage(pageId);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Fonction pour envoyer une notification de test
  const sendTestNotification = () => {
    if (socketService.isConnected) {
      socketService.sendNotification(
        'admin',
        'Ceci est une notification de test',
        'success'
      );
    }
  };

  // Afficher la page active
  const renderActivePage = () => {
    console.log('Rendu page active:', activePage);
    
    switch(activePage) {
      case 'accueil':
        return <Accueil onNavigate={handleShowPage} />;
      case 'etudiants':
        return <Etudiants socket={socketService} />; // Passer socket aux pages
      case 'ajout':
        return <Ajout socket={socketService} />;
      case 'notes':
        return <Notes socket={socketService} />;
      case 'pdf':
        return <PDF socket={socketService} />;
      default:
        return <div className="page-not-found">Page "{activePage}" non trouvée</div>;
    }
  };

  return (
    <div className="app">
      {/* Container pour les deux sidebars ORIGINAUX */}
      <div className="sidebar-container">
        <SidebarLeft />
        <SidebarRight activePage={activePage} onMenuClick={handleShowPage} />
      </div>

      {/* Menu Mobile */}
      <MobileMenu 
        activePage={activePage}
        onMenuClick={handleShowPage}
        isOpen={isMobileMenuOpen}
        onClose={closeMobileMenu}
      />

      {/* Contenu principal */}
      <div className="main-content" id="mainContent">
        {/* Navbar */}
        <div className="navbar">
          <button className="menu-toggle" onClick={toggleMobileMenu}>
            <i className="fas fa-bars"></i>
          </button>
          <div className="university-badge">Université</div>
          
          {/* Bouton test notification (optionnel) */}
          <button 
            className="btn-notification-test"
            onClick={sendTestNotification}
            title="Tester les notifications"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#9b59b6',
              fontSize: '18px',
              cursor: 'pointer',
              marginRight: '10px'
            }}
          >
            <i className="fas fa-bell"></i>
          </button>
          
          {/* Conteneur pour les éléments de droite */}
          <div className="navbar-right">
            {/* Statut Socket.io */}
            <div className={`socket-status ${socketService.isConnected ? 'connected' : 'disconnected'}`}>
              <i className={`fas fa-${socketService.isConnected ? 'plug' : 'plug-circle-xmark'}`}></i>
              {socketService.isConnected ? 'En ligne' : 'Hors ligne'}
            </div>
            
            {/* Statut de la connexion API */}
            {dbStatus && (
              <div className={`db-status ${dbStatus.success ? 'success' : 'error'}`}>
                <i className={`fas ${dbStatus.success ? 'fa-database' : 'fa-exclamation-triangle'}`}></i>
                {dbStatus.message}
              </div>
            )}
          </div>
        </div>

        {/* Afficher la page active */}
        <div className="content-container">
          {!pagesLoaded ? (
            <div className="loading">
              <div className="spinner"></div>
              <p>Chargement de l'application...</p>
            </div>
          ) : (
            renderActivePage()
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
