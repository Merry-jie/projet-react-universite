import React, { useState, useEffect } from 'react';
import './Etudiants.css';
import { getAllStudents, deleteStudent } from '../backend/db';

const Etudiants = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [studentsPerPage] = useState(10);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    console.log('Page Étudiants montée, chargement données...');
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      setLoading(true);
      console.log('Chargement étudiants depuis API...');
      
      const data = await getAllStudents();
      setStudents(data);
      console.log(`${data.length} étudiants chargés`);
    } catch (error) {
      console.error('Erreur chargement étudiants:', error);
      showAlert('Erreur lors du chargement des étudiants', 'error');
      
      // Données de démo pour le test
      setStudents([
        { id: '1', firstname: 'Jean', lastname: 'Dupont', filter: 'Informatique', niveau: 'L3', phone: '0123456789' },
        { id: '2', firstname: 'Marie', lastname: 'Martin', filter: 'Mathématiques', niveau: 'M1', phone: '0987654321' },
        { id: '3', firstname: 'Pierre', lastname: 'Durand', filter: 'Physique', niveau: 'L2', phone: '' },
        { id: '4', firstname: 'Sophie', lastname: 'Leroy', filter: 'Chimie', niveau: 'M2', phone: '0654321987' },
        { id: '5', firstname: 'Thomas', lastname: 'Moreau', filter: 'Biologie', niveau: 'L1', phone: '0678912345' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Écran de chargement
  if (loading) {
    return (
      <div id="etudiants" className="content-page active-page">
        <div className="page-title">
          <i className="fas fa-users"></i>
          Liste des Étudiants
        </div>
        <div className="loading-message">
          <div className="spinner"></div>
          <p>Chargement des étudiants...</p>
        </div>
      </div>
    );
  }

  const showAlert = (message, type = 'info') => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 5000);
  };

  const handleDeleteStudent = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet étudiant ?')) {
      try {
        await deleteStudent(id);
        showAlert('Étudiant supprimé avec succès', 'success');
        loadStudents();
      } catch (error) {
        console.error('Erreur suppression étudiant:', error);
        showAlert('Erreur lors de la suppression', 'error');
      }
    }
  };

  const handleEditStudent = (student) => {
    showAlert(`Modification de ${student.firstname} ${student.lastname} - À implémenter`, 'info');
  };

  // Pagination
  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = students.slice(indexOfFirstStudent, indexOfLastStudent);
  const totalPages = Math.ceil(students.length / studentsPerPage);

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToPage = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  return (
    <div id="etudiants" className="content-page active-page">
      <div className="page-title">
        <i className="fas fa-users"></i>
        Liste des Étudiants
      </div>
      
      {/* Alertes */}
      {alert && (
        <div className={`alert alert-${alert.type}`}>
          <i className={`fas fa-${alert.type === 'success' ? 'check-circle' : alert.type === 'error' ? 'exclamation-circle' : 'info-circle'}`}></i>
          {alert.message}
        </div>
      )}
      
      <div className="students-section">
        <div className="section-header">
          <div className="section-title">
            <i className="fas fa-list"></i> Tous les étudiants ({students.length})
          </div>
        </div>
        
        <div className="table-responsive">
          <table className="student-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nom</th>
                <th>Prénom</th>
                <th>Filière</th>
                <th>Niveau</th>
                <th>Téléphone</th>
                <th style={{ width: '180px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentStudents.length > 0 ? (
                currentStudents.map((student, index) => (
                  <tr key={student.id}>
                    <td>{indexOfFirstStudent + index + 1}</td>
                    <td><strong>{student.lastname}</strong></td>
                    <td>{student.firstname}</td>
                    <td>
                      <span className="filiere-badge">{student.filter}</span>
                    </td>
                    <td>
                      <span className="niveau-badge">{student.niveau}</span>
                    </td>
                    <td>
                      {student.phone ? (
                        <a href={`tel:${student.phone}`} className="phone-link">
                          <i className="fas fa-phone"></i> {student.phone}
                        </a>
                      ) : (
                        <span className="no-phone">Non renseigné</span>
                      )}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn-action btn-edit"
                          onClick={() => handleEditStudent(student)}
                          title="Modifier"
                        >
                          <i className="fas fa-edit"></i> Modifier
                        </button>
                        <button 
                          className="btn-action btn-delete"
                          onClick={() => handleDeleteStudent(student.id)}
                          title="Supprimer"
                        >
                          <i className="fas fa-trash"></i> Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="no-data-cell">
                    <div className="no-data-message">
                      <i className="fas fa-users"></i>
                      <p>Aucun étudiant enregistré</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {students.length > 0 && (
          <div className="pagination-container">
            <div className="pagination-info">
              Affichage {indexOfFirstStudent + 1}-{Math.min(indexOfLastStudent, students.length)} sur {students.length} étudiants
            </div>
            
            <div className="pagination-controls">
              <button 
                className="btn-pagination btn-prev" 
                onClick={prevPage}
                disabled={currentPage === 1}
              >
                <i className="fas fa-chevron-left"></i> Précédent
              </button>
              
              <div className="page-numbers">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      className={`page-number-btn ${currentPage === pageNum ? 'active' : ''}`}
                      onClick={() => goToPage(pageNum)}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <>
                    <span className="page-dots">...</span>
                    <button
                      className="page-number-btn"
                      onClick={() => goToPage(totalPages)}
                    >
                      {totalPages}
                    </button>
                  </>
                )}
              </div>
              
              <button 
                className="btn-pagination btn-next" 
                onClick={nextPage}
                disabled={currentPage === totalPages}
              >
                Suivant <i className="fas fa-chevron-right"></i>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Etudiants;
