import React, { useState, useEffect } from 'react';
import './Accueil.css';
import { getStatistics } from '../backend/db';

const Accueil = ({ onNavigate }) => {
  const [statistics, setStatistics] = useState({
    students: 0,
    grades: 0,
    average: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('Page Accueil montée, chargement statistiques...');
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      const stats = await getStatistics();
      setStatistics(stats);
      console.log('Statistiques chargées:', stats);
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
      // Données de démo
      setStatistics({
        students: 45,
        grades: 230,
        average: 14.5
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = (page) => {
    console.log('Navigation vers:', page);
    if (onNavigate && typeof onNavigate === 'function') {
      onNavigate(page);
    } else {
      console.error('Fonction onNavigate non disponible');
    }
  };

  if (loading) {
    return (
      <div id="accueil" className="content-page active-page">
        <div className="page-title">
          <i className="fas fa-home"></i>
          Tableau de Bord
        </div>
        <div className="loading-message">
          <div className="spinner"></div>
          <p>Chargement des statistiques...</p>
        </div>
      </div>
    );
  }

  return (
    <div id="accueil" className="content-page active-page">
      <div className="page-title">
        <i className="fas fa-home"></i>
        Tableau de Bord
      </div>
      
      <div className="welcome-section">
        <h2>Bienvenue dans le Gestionnaire d'Étudiants</h2>
        <p>Utilisez les cartes ci-dessous ou les icônes de la barre latérale pour naviguer.</p>
      </div>
      
      <div className="dashboard-grid">
        <div 
          className="dashboard-card" 
          onClick={() => handleCardClick('etudiants')}
        >
          <div className="card-header">
            <div className="card-icon">
              <i className="fas fa-users"></i>
            </div>
            <h3>Gérer les Étudiants</h3>
          </div>
          <p className="card-description">Consultez la liste complète des étudiants inscrits</p>
          <div className="card-stat">
            <div className="stat-value">{statistics.students}</div>
            <div className="stat-label">Étudiants</div>
          </div>
          <div className="card-action">
            <span>Accéder</span>
            <i className="fas fa-arrow-right"></i>
          </div>
        </div>
        
        <div 
          className="dashboard-card" 
          onClick={() => handleCardClick('notes')}
        >
          <div className="card-header">
            <div className="card-icon">
              <i className="fas fa-graduation-cap"></i>
            </div>
            <h3>Notes enregistrées</h3>
          </div>
          <p className="card-description">Gérez les notes des étudiants par matière</p>
          <div className="card-stat">
            <div className="stat-value">{statistics.grades}</div>
            <div className="stat-label">Notes totales</div>
          </div>
          <div className="card-action">
            <span>Accéder</span>
            <i className="fas fa-arrow-right"></i>
          </div>
        </div>
        
        <div 
          className="dashboard-card" 
          onClick={() => handleCardClick('pdf')}
        >
          <div className="card-header">
            <div className="card-icon">
              <i className="fas fa-file-pdf"></i>
            </div>
            <h3>Générer des Relevés</h3>
          </div>
          <p className="card-description">Créez et téléchargez les relevés de notes en PDF</p>
          <div className="card-stat">
            <div className="stat-icon">
              <i className="fas fa-download"></i>
            </div>
            <div className="stat-label">Exporter PDF</div>
          </div>
          <div className="card-action">
            <span>Accéder</span>
            <i className="fas fa-arrow-right"></i>
          </div>
        </div>
        
        <div className="dashboard-card stats-card">
          <div className="card-header">
            <div className="card-icon">
              <i className="fas fa-chart-line"></i>
            </div>
            <h3>Statistiques</h3>
          </div>
          <p className="card-description">Moyenne générale des notes</p>
          <div className="card-stat">
            <div className="stat-value">{statistics.average.toFixed(2)}</div>
            <div className="stat-label">Moyenne générale</div>
          </div>
          <div className="progress-container">
            <div 
              className="progress-bar" 
              style={{ width: `${(statistics.average / 20) * 100}%` }}
            >
              <span>{statistics.average.toFixed(2)}/20</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Accueil;
