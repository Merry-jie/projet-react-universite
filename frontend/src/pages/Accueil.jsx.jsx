import React, { useState, useEffect } from 'react';
import './Accueil.css';
import { getStatistics } from '../backend/db';

const Accueil = () => {
  const [statistics, setStatistics] = useState({
    students: 0,
    grades: 0,
    average: 0
  });

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      const stats = await getStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    }
  };

  const handleNavigate = (page) => {
    // Cette fonction sera implémentée dans le composant parent
    console.log('Navigation vers:', page);
  };

  return (
    <div id="accueil" className="content-page active-page">
      <div className="page-title">
        <i className="fas fa-home"></i>
        Tableau de Bord
      </div>
      
      <div style={{ textAlign: 'center', padding: '50px 20px' }}>
        <h2 style={{ color: '#2c3e50', marginBottom: '20px' }}>Bienvenue dans le Gestionnaire d'Étudiants</h2>
        <p style={{ color: '#7f8c8d', fontSize: '18px', marginBottom: '40px' }}>
          Utilisez les icônes de la barre latérale droite pour naviguer entre les différentes sections.
        </p>
        
        <div className="card-container">
          <div className="card">
            <h3><i className="fas fa-users"></i> Gérer les Étudiants</h3>
            <p>Consultez la liste complète des étudiants inscrits.</p>
            <div className="stat-number">{statistics.students}</div>
            <p>Étudiants enregistrés</p>
            <button 
              className="btn" 
              onClick={() => handleNavigate('etudiants')}
              style={{ marginTop: '15px', width: '100%' }}
            >
              <i className="fas fa-list"></i> Voir la liste
            </button>
          </div>
          
          <div className="card">
            <h3><i className="fas fa-graduation-cap"></i> Notes enregistrées</h3>
            <p>Total des notes dans la base de données.</p>
            <div className="stat-number">{statistics.grades}</div>
            <p>Notes totales</p>
            <button 
              className="btn" 
              onClick={() => handleNavigate('notes')}
              style={{ marginTop: '15px', width: '100%' }}
            >
              <i className="fas fa-edit"></i> Gérer les notes
            </button>
          </div>
          
          <div className="card">
            <h3><i className="fas fa-chart-line"></i> Statistiques</h3>
            <p>Moyenne générale des notes.</p>
            <div className="stat-number">{statistics.average.toFixed(2)}</div>
            <p>Moyenne générale</p>
            <button 
              className="btn" 
              onClick={() => handleNavigate('pdf')}
              style={{ marginTop: '15px', width: '100%' }}
            >
              <i className="fas fa-chart-bar"></i> Voir les statistiques
            </button>
          </div>
          
          <div className="card">
            <h3><i className="fas fa-file-pdf"></i> Générer des Relevés</h3>
            <p>Créez et téléchargez les relevés de notes en PDF.</p>
            <div className="stat-number">
              <i className="fas fa-download" style={{ fontSize: '36px' }}></i>
            </div>
            <p>Exporter en PDF</p>
            <button 
              className="btn" 
              onClick={() => handleNavigate('pdf')}
              style={{ marginTop: '15px', width: '100%' }}
            >
              <i className="fas fa-download"></i> Générer PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Accueil;
