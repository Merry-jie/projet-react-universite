import React, { useState, useEffect } from 'react';
import './Ajout.css';
import { getAllStudents, addStudent, updateStudent, deleteStudent } from '../backend/db';

const Ajout = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    id: '',
    lastname: '',
    firstname: '',
    phone: '',
    filiere: '',
    niveau: '',
    address: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    console.log('Page Ajout montée, chargement étudiants...');
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const data = await getAllStudents();
      setStudents(data);
      console.log(`${data.length} étudiants chargés`);
    } catch (error) {
      console.error('Erreur chargement étudiants:', error);
      showAlert('Erreur lors du chargement des étudiants', 'error');
      
      // Données de démo
      setStudents([
        { id: '1', lastname: 'Dupont', firstname: 'Jean', phone: '0123456789', filiere: 'Informatique', niveau: 'L3', address: 'Paris' },
        { id: '2', lastname: 'Martin', firstname: 'Marie', phone: '0987654321', filiere: 'Mathématiques', niveau: 'M1', address: 'Lyon' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (message, type = 'info') => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 5000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.lastname.trim()) {
      showAlert('Veuillez saisir le nom', 'error');
      return false;
    }
    if (!formData.firstname.trim()) {
      showAlert('Veuillez saisir le prénom', 'error');
      return false;
    }
    if (!formData.filiere.trim()) {
      showAlert('Veuillez saisir la filière', 'error');
      return false;
    }
    if (!formData.niveau.trim()) {
      showAlert('Veuillez saisir le niveau', 'error');
      return false;
    }
    return true;
  };

  const handleSaveStudent = async () => {
    if (!validateForm()) return;

    try {
      if (isEditing) {
        // Modification
        await updateStudent(formData.id, formData);
        showAlert('Étudiant modifié avec succès', 'success');
      } else {
        // Ajout
        const newStudent = {
          ...formData,
          id: `student_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        };
        await addStudent(newStudent);
        showAlert('Étudiant ajouté avec succès', 'success');
      }

      // Réinitialiser et recharger
      resetForm();
      loadStudents();
    } catch (error) {
      console.error('Erreur sauvegarde étudiant:', error);
      showAlert('Erreur lors de la sauvegarde', 'error');
    }
  };

  const handleEditStudent = (student) => {
    setFormData({
      id: student.id,
      lastname: student.lastname || '',
      firstname: student.firstname || '',
      phone: student.phone || '',
      filiere: student.filiere || student.filter || '',
      niveau: student.niveau || '',
      address: student.address || ''
    });
    setIsEditing(true);
    showAlert(`Modification de ${student.firstname} ${student.lastname}`, 'info');
  };

  const handleDeleteStudent = async (studentId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet étudiant ?')) {
      try {
        await deleteStudent(studentId);
        showAlert('Étudiant supprimé avec succès', 'success');
        loadStudents();
      } catch (error) {
        console.error('Erreur suppression étudiant:', error);
        showAlert('Erreur lors de la suppression', 'error');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      id: '',
      lastname: '',
      firstname: '',
      phone: '',
      filiere: '',
      niveau: '',
      address: ''
    });
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div id="ajout" className="content-page active-page">
        <div className="page-title">
          <i className="fas fa-user-plus"></i>
          Ajout/Modification d'Étudiant
        </div>
        <div className="loading-message">
          <div className="spinner"></div>
          <p>Chargement des étudiants...</p>
        </div>
      </div>
    );
  }

  return (
    <div id="ajout" className="content-page active-page">
      <div className="page-title">
        <i className="fas fa-user-plus"></i>
        Ajout/Modification d'Étudiant
      </div>
      
      {/* Alertes */}
      {alert && (
        <div className={`alert alert-${alert.type}`}>
          <i className={`fas fa-${alert.type === 'success' ? 'check-circle' : alert.type === 'error' ? 'exclamation-circle' : 'info-circle'}`}></i>
          {alert.message}
        </div>
      )}
      
      <div className="page-container-ajout">
        {/* Section liste des étudiants (gauche) */}
        <div className="students-list-section">
          <div className="section-title">
            <i className="fas fa-users"></i> Étudiants existants ({students.length})
          </div>
          
          <div className="table-container">
            <table className="students-table">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Prénom</th>
                  <th>Filière</th>
                  <th style={{ width: '140px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.length > 0 ? (
                  students.map((student) => (
                    <tr key={student.id}>
                      <td><strong>{student.lastname}</strong></td>
                      <td>{student.firstname}</td>
                      <td>
                        <span className="filiere-badge">{student.filiere || student.filter}</span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="btn-action btn-edit"
                            onClick={() => handleEditStudent(student)}
                            title="Modifier"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button 
                            className="btn-action btn-delete"
                            onClick={() => handleDeleteStudent(student.id)}
                            title="Supprimer"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="no-data-cell">
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
        </div>
        
        {/* Section formulaire (droite) */}
        <div className="form-section">
          <div className="section-title">
            <i className="fas fa-edit"></i> {isEditing ? 'Modifier un étudiant' : 'Ajouter un étudiant'}
          </div>
          
          <div className="student-form">
            <input type="hidden" name="id" value={formData.id} />
            
            <div className="form-group">
              <label htmlFor="lastname">Nom *</label>
              <input
                type="text"
                id="lastname"
                name="lastname"
                value={formData.lastname}
                onChange={handleInputChange}
                placeholder="Entrez le nom de famille"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="firstname">Prénom *</label>
              <input
                type="text"
                id="firstname"
                name="firstname"
                value={formData.firstname}
                onChange={handleInputChange}
                placeholder="Entrez le prénom"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="phone">Téléphone</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="01 23 45 67 89"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="filiere">Filière *</label>
              <input
                type="text"
                id="filiere"
                name="filiere"
                value={formData.filiere}
                onChange={handleInputChange}
                placeholder="Ex: Informatique, Mathématiques..."
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="niveau">Niveau d'étude *</label>
              <input
                type="text"
                id="niveau"
                name="niveau"
                value={formData.niveau}
                onChange={handleInputChange}
                placeholder="Ex: Licence 1, Master 2..."
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="address">Adresse</label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                rows="2"
                placeholder="Adresse de l'étudiant"
              />
            </div>
            
            <div className="form-actions">
              <button
                className={`btn ${isEditing ? 'btn-warning' : 'btn-success'}`}
                onClick={handleSaveStudent}
              >
                <i className="fas fa-save"></i>
                {isEditing ? 'Modifier l\'étudiant' : 'Ajouter l\'étudiant'}
              </button>
              
              <button
                className="btn btn-secondary"
                onClick={resetForm}
              >
                <i className="fas fa-redo"></i> Réinitialiser
              </button>
              
              {isEditing && (
                <button
                  className="btn btn-danger"
                  onClick={resetForm}
                >
                  <i className="fas fa-times"></i> Annuler
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Ajout;
