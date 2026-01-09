import React, { useState, useEffect } from 'react';
import './Notes.css';
import { getAllStudents, getAllGrades, addGrade, updateGrade, deleteGrade } from '../backend/db';

const Notes = () => {
  const [students, setStudents] = useState([]);
  const [grades, setGrades] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [formData, setFormData] = useState({
    id: '',
    course: '',
    grade: '',
    comment: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(true); // AJOUTÉ: État de chargement

  useEffect(() => {
    console.log('Page Notes montée, chargement données...'); // AJOUTÉ: log
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true); // AJOUTÉ
      console.log('Chargement données depuis API...'); // AJOUTÉ
      
      const [studentsData, gradesData] = await Promise.all([
        getAllStudents(),
        getAllGrades()
      ]);
      setStudents(studentsData);
      setGrades(gradesData);
      console.log('Données chargées:', { 
        students: studentsData.length, 
        grades: gradesData.length 
      }); // AJOUTÉ
    } catch (error) {
      console.error('Erreur chargement données:', error); // AJOUTÉ
      showAlert('Erreur lors du chargement des données', 'error');
      
      // Données de démo pour le test
      setStudents([
        { id: '1', firstname: 'Jean', lastname: 'Dupont', filiere: 'Informatique' },
        { id: '2', firstname: 'Marie', lastname: 'Martin', filiere: 'Mathématiques' }
      ]);
      setGrades([
        { id: '1', studentid: '1', course: 'Mathématiques', grade: 15.5, comment: 'Bon travail' },
        { id: '2', studentid: '2', course: 'Physique', grade: 18, comment: 'Excellent' }
      ]);
    } finally {
      setLoading(false); // AJOUTÉ
    }
  };

  // AJOUTÉ: Écran de chargement
  if (loading) {
    return (
      <div id="notes" className="content-page active-page">
        <div className="page-title">
          <i className="fas fa-clipboard-list"></i>
          Gestion des Notes
        </div>
        <div className="loading-message">
          <div className="spinner"></div>
          <p>Chargement des notes...</p>
        </div>
      </div>
    );
  }

  const showAlert = (message, type = 'info') => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 5000);
  };

  const handleStudentSelection = (studentId) => {
    setSelectedStudents(prev => {
      if (prev.includes(studentId)) {
        return prev.filter(id => id !== studentId);
      } else {
        return [...prev, studentId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedStudents.length === students.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(students.map(student => student.id));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.course.trim()) {
      showAlert('Veuillez saisir le nom de la matière', 'error');
      return false;
    }
    if (!formData.grade || isNaN(formData.grade) || formData.grade < 0 || formData.grade > 20) {
      showAlert('Veuillez saisir une note valide entre 0 et 20', 'error');
      return false;
    }
    if (selectedStudents.length === 0 && !isEditing) {
      showAlert('Veuillez sélectionner au moins un étudiant', 'error');
      return false;
    }
    return true;
  };

  const handleSaveGrade = async () => {
    if (!validateForm()) return;

    try {
      if (isEditing) {
        // Modification d'une note existante
        await updateGrade(formData.id, {
          course: formData.course,
          grade: parseFloat(formData.grade),
          comment: formData.comment
        });
        showAlert('Note modifiée avec succès', 'success');
      } else {
        // Ajout de nouvelles notes pour les étudiants sélectionnés
        const gradePromises = selectedStudents.map(studentId =>
          addGrade({
            id: `grade_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            studentid: studentId,
            course: formData.course,
            grade: parseFloat(formData.grade),
            comment: formData.comment
          })
        );
        
        await Promise.all(gradePromises);
        showAlert(`${selectedStudents.length} note(s) ajoutée(s) avec succès`, 'success');
      }

      // Réinitialiser le formulaire
      resetForm();
      // Recharger les données
      loadData();
    } catch (error) {
      console.error('Erreur sauvegarde note:', error);
      showAlert('Erreur lors de la sauvegarde', 'error');
    }
  };

  const handleEditGrade = (grade) => {
    setFormData({
      id: grade.id,
      course: grade.course,
      grade: grade.grade,
      comment: grade.comment || ''
    });
    setIsEditing(true);
    
    // Sélectionner uniquement l'étudiant concerné
    setSelectedStudents([grade.studentid]);
    
    showAlert('Modification de la note', 'info');
  };

  const handleDeleteGrade = async (gradeId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette note ?')) {
      try {
        await deleteGrade(gradeId);
        showAlert('Note supprimée avec succès', 'success');
        loadData();
      } catch (error) {
        console.error('Erreur suppression note:', error);
        showAlert('Erreur lors de la suppression', 'error');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      id: '',
      course: '',
      grade: '',
      comment: ''
    });
    setSelectedStudents([]);
    setIsEditing(false);
  };

  const getStudentName = (studentId) => {
    const student = students.find(s => s.id === studentId);
    return student ? `${student.firstname} ${student.lastname}` : 'Inconnu';
  };

  // Grouper les notes par étudiant
  const gradesByStudent = grades.reduce((acc, grade) => {
    if (!acc[grade.studentid]) {
      acc[grade.studentid] = [];
    }
    acc[grade.studentid].push(grade);
    return acc;
  }, {});

  return (
    <div id="notes" className="content-page active-page"> {/* AJOUTÉ: active-page */}
      <div className="page-title">
        <i className="fas fa-clipboard-list"></i>
        Gestion des Notes
      </div>
      
      {/* Alertes */}
      {alert && (
        <div className={`alert alert-${alert.type}`}>
          <i className={`fas fa-${alert.type === 'success' ? 'check-circle' : alert.type === 'error' ? 'exclamation-circle' : 'info-circle'}`}></i>
          {alert.message}
        </div>
      )}
      
      <div className="page-container">
        {/* Section liste des étudiants avec checkboxes (gauche) */}
        <div className="students-section">
          <div className="section-title">
            <i className="fas fa-users"></i> Sélectionner des étudiants ({students.length})
          </div>
          
          <div className="select-all-container">
            <label>
              <input
                type="checkbox"
                checked={selectedStudents.length === students.length && students.length > 0}
                onChange={handleSelectAll}
              />
              <span>Tout sélectionner</span>
            </label>
          </div>
          
          <div className="students-list">
            {students.length > 0 ? (
              students.map(student => (
                <div key={student.id} className="student-checkbox-item">
                  <label>
                    <input
                      type="checkbox"
                      checked={selectedStudents.includes(student.id)}
                      onChange={() => handleStudentSelection(student.id)}
                    />
                    <span className="student-name">
                      {student.firstname} {student.lastname}
                    </span>
                    <span className="student-filiere">{student.filiere || student.filter}</span>
                  </label>
                </div>
              ))
            ) : (
              <div className="no-data">Aucun étudiant enregistré</div>
            )}
          </div>
          
          <div className="selected-count">
            {selectedStudents.length} étudiant(s) sélectionné(s)
          </div>
        </div>
        
        {/* Section principale notes (droite) */}
        <div className="main-section">
          <div className="section-title">
            <i className="fas fa-edit"></i> {isEditing ? 'Modifier une note' : 'Ajouter des notes'}
          </div>
          
          <div className="grade-form">
            <div className="form-group">
              <label htmlFor="course">Matière *</label>
              <input
                type="text"
                id="course"
                name="course"
                value={formData.course}
                onChange={handleInputChange}
                placeholder="Ex: Mathématiques, Physique..."
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="grade">Note (0-20) *</label>
              <input
                type="number"
                id="grade"
                name="grade"
                value={formData.grade}
                onChange={handleInputChange}
                min="0"
                max="20"
                step="0.25"
                placeholder="Ex: 15.5"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="comment">Commentaire</label>
              <textarea
                id="comment"
                name="comment"
                value={formData.comment}
                onChange={handleInputChange}
                rows="3"
                placeholder="Commentaire facultatif..."
              />
            </div>
            
            <div className="form-group">
              <label>Étudiants sélectionnés :</label>
              <div className="selected-students-list">
                {selectedStudents.length > 0 ? (
                  selectedStudents.map(studentId => (
                    <span key={studentId} className="selected-student-tag">
                      {getStudentName(studentId)}
                    </span>
                  ))
                ) : (
                  <span className="no-selection">Aucun étudiant sélectionné</span>
                )}
              </div>
            </div>
            
            <div className="form-actions">
              <button
                className={`btn ${isEditing ? 'btn-warning' : 'btn-success'}`}
                onClick={handleSaveGrade}
              >
                <i className="fas fa-save"></i>
                {isEditing ? 'Modifier la note' : 'Ajouter la note'}
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
          
          {/* Liste des notes existantes */}
          <div className="existing-grades-section">
            <div className="section-title">
              <i className="fas fa-history"></i> Notes existantes
            </div>
            
            {Object.keys(gradesByStudent).length > 0 ? (
              Object.entries(gradesByStudent).map(([studentId, studentGrades]) => (
                <div key={studentId} className="student-grades-group">
                  <div className="student-header">
                    <h4>{getStudentName(studentId)}</h4>
                    <span className="grade-count">{studentGrades.length} note(s)</span>
                  </div>
                  
                  <div className="grades-list">
                    {studentGrades.map(grade => {
                      const date = grade.datemodified || grade.dateadded;
                      const dateStr = date ? new Date(date).toLocaleDateString('fr-FR') : 'Date inconnue';
                      
                      return (
                        <div key={grade.id} className="grade-item">
                          <div className="grade-info">
                            <div className="grade-course">{grade.course}</div>
                            <div className="grade-value">{grade.grade}/20</div>
                            {grade.comment && (
                              <div className="grade-comment">{grade.comment}</div>
                            )}
                            <div className="grade-date">Ajouté le {dateStr}</div>
                          </div>
                          
                          <div className="grade-actions">
                            <button
                              className="btn btn-small btn-warning"
                              onClick={() => handleEditGrade(grade)}
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            <button
                              className="btn btn-small btn-danger"
                              onClick={() => handleDeleteGrade(grade.id)}
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            ) : (
              <div className="no-data-message">
                <i className="fas fa-clipboard-list"></i>
                <p>Aucune note enregistrée</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notes;
