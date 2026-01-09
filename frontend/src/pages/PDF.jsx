import React, { useState, useEffect } from 'react';
import './PDF.css';
import { getAllStudents, getAllGrades } from '../backend/db';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const PDF = () => {
  const [students, setStudents] = useState([]);
  const [grades, setGrades] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectedFiliere, setSelectedFiliere] = useState('all');
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(true); // AJOUTÉ: État de chargement

  useEffect(() => {
    console.log('Page PDF montée, chargement données...'); // AJOUTÉ: log
    loadData();
  }, []);

  useEffect(() => {
    if (selectedStudents.length > 0) {
      generateReport();
    } else {
      setReportData(null);
    }
  }, [selectedStudents, grades]);

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
        { id: '1', firstname: 'Jean', lastname: 'Dupont', filter: 'Informatique', niveau: 'L3' },
        { id: '2', firstname: 'Marie', lastname: 'Martin', filter: 'Mathématiques', niveau: 'M1' }
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
      <div id="pdf" className="content-page active-page">
        <div className="page-title">
          <i className="fas fa-file-pdf"></i>
          Génération de Relevés de Notes
        </div>
        <div className="loading-message">
          <div className="spinner"></div>
          <p>Chargement des données...</p>
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

  const handleFiliereChange = (filiere) => {
    setSelectedFiliere(filiere);
    if (filiere === 'all') {
      // Pour "Toutes", on ne sélectionne personne automatiquement
      return;
    }
    
    // Sélectionner tous les étudiants de la filière
    const filiereStudents = students
      .filter(student => student.filter === filiere)
      .map(student => student.id);
    
    setSelectedStudents(filiereStudents);
  };

  const handleSelectAllFiliere = () => {
    const filiereStudents = students
      .filter(student => selectedFiliere === 'all' || student.filter === selectedFiliere)
      .map(student => student.id);
    
    if (selectedStudents.length === filiereStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(filiereStudents);
    }
  };

  const generateReport = () => {
    const report = selectedStudents.map(studentId => {
      const student = students.find(s => s.id === studentId);
      if (!student) return null;

      const studentGrades = grades.filter(grade => grade.studentid === studentId);
      const total = studentGrades.reduce((sum, grade) => sum + parseFloat(grade.grade), 0);
      const average = studentGrades.length > 0 ? total / studentGrades.length : 0;

      return {
        student,
        grades: studentGrades,
        average,
        totalGrades: studentGrades.length
      };
    }).filter(Boolean);

    setReportData(report);
  };

  const getAppreciation = (average) => {
    if (average >= 16) return { text: 'Très Bien', color: '#2ecc71' };
    if (average >= 14) return { text: 'Bien', color: '#3498db' };
    if (average >= 12) return { text: 'Assez Bien', color: '#f1c40f' };
    if (average >= 10) return { text: 'Passable', color: '#e67e22' };
    return { text: 'Insuffisant', color: '#e74c3c' };
  };

  const generatePDF = async () => {
    if (selectedStudents.length === 0) {
      showAlert('Veuillez sélectionner au moins un étudiant', 'error');
      return;
    }

    setIsGenerating(true);
    
    try {
      const doc = new jsPDF('p', 'mm', 'a4');
      const primaryColor = [155, 89, 182]; // #9b59b6
      const secondaryColor = [52, 152, 219]; // #3498db
      const lightGray = [245, 245, 245];
      
      let currentPage = 1;
      const margin = 15;
      const maxWidth = 180;
      let yPos = margin;

      // Fonction pour ajouter une nouvelle page
      const addNewPage = () => {
        doc.addPage('a4', 'p');
        currentPage++;
        yPos = margin;
        addHeader();
      };

      // Vérifier si on dépasse la page
      const checkPageBreak = (neededHeight) => {
        if (yPos + neededHeight > 280) {
          addNewPage();
        }
      };

      // En-tête
      const addHeader = () => {
        doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.rect(0, 0, 210, 20, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text('UNIVERSITÉ', 105, 12, { align: 'center' });
        
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'normal');
        doc.text('Relevé de Notes - Année Universitaire 2023/2024', 105, 25, { align: 'center' });
        
        yPos = 35;
      };

      // Date de génération
      const today = new Date();
      const dateStr = today.toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      // Ajouter l'en-tête sur la première page
      addHeader();

      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Généré le: ${dateStr}`, margin, yPos);
      doc.text(`Page: ${currentPage}`, 210 - margin, yPos, { align: 'right' });
      yPos += 10;

      // Générer le contenu pour chaque étudiant
      reportData.forEach((report, index) => {
        const { student, grades, average } = report;
        
        checkPageBreak(40 + (grades.length * 10) + 20);

        // Titre de l'étudiant
        doc.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
        doc.rect(margin, yPos, maxWidth, 8, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(`ÉTUDIANT: ${student.firstname} ${student.lastname}`, margin + 5, yPos + 5);
        yPos += 12;

        // Informations de l'étudiant
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        
        doc.text(`Filière: ${student.filter}`, margin, yPos);
        doc.text(`Niveau: ${student.niveau}`, 105, yPos);
        
        if (student.phone) {
          doc.text(`Téléphone: ${student.phone}`, 150, yPos);
        }
        yPos += 8;

        if (student.address) {
          doc.text(`Adresse: ${student.address}`, margin, yPos);
          yPos += 6;
        }

        yPos += 5;

        // Tableau des notes
        if (grades.length > 0) {
          const tableColumn = ["Matière", "Note", "Coef.", "Observations"];
          const tableRows = grades.map(grade => [
            grade.course,
            `${grade.grade}/20`,
            "1.0",
            grade.comment || '-'
          ]);

          doc.autoTable({
            startY: yPos,
            head: [tableColumn],
            body: tableRows,
            margin: { left: margin, right: margin },
            headStyles: {
              fillColor: [primaryColor[0], primaryColor[1], primaryColor[2]],
              textColor: 255,
              fontSize: 10,
              fontStyle: 'bold'
            },
            bodyStyles: {
              fontSize: 9,
              textColor: [0, 0, 0]
            },
            alternateRowStyles: {
              fillColor: lightGray
            },
            columnStyles: {
              0: { cellWidth: 70 },
              1: { cellWidth: 30 },
              2: { cellWidth: 25 },
              3: { cellWidth: 55 }
            }
          });

          yPos = doc.lastAutoTable.finalY + 10;

          // Moyenne et appréciation
          const appreciation = getAppreciation(average);
          
          doc.setDrawColor(200, 200, 200);
          doc.setLineWidth(0.5);
          doc.rect(margin, yPos, maxWidth, 15);
          
          doc.setTextColor(0, 0, 0);
          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          doc.text('MOYENNE GÉNÉRALE:', margin + 5, yPos + 7);
          
          doc.setFontSize(12);
          doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
          doc.text(`${average.toFixed(2)}/20`, margin + 60, yPos + 7);
          
          doc.setFontSize(11);
          doc.setTextColor(appreciation.color);
          doc.text(`APPRÉCIATION: ${appreciation.text}`, margin + 100, yPos + 7);
          
          yPos += 20;
        } else {
          // Aucune note
          doc.setFontSize(11);
          doc.setTextColor(150, 150, 150);
          doc.text('Aucune note enregistrée pour cet étudiant', margin + 10, yPos);
          yPos += 15;
        }

        // Séparateur entre les étudiants (sauf pour le dernier)
        if (index < reportData.length - 1) {
          checkPageBreak(15);
          doc.setDrawColor(200, 200, 200);
          doc.setLineWidth(0.3);
          doc.line(margin, yPos, margin + maxWidth, yPos);
          yPos += 10;
        }
      });

      // Pied de page sur toutes les pages
      const totalPages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(
          'Signature du Responsable de Formation: _________________________',
          margin,
          285,
          { align: 'left' }
        );
        doc.text(
          'Cachet de l\'Université',
          210 - margin,
          285,
          { align: 'right' }
        );
      }

      // Sauvegarder le PDF
      const date = new Date();
      const filename = `releve_notes_${date.getFullYear()}_${date.getMonth()+1}_${date.getDate()}.pdf`;
      doc.save(filename);
      
      showAlert('PDF généré avec succès !', 'success');
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      showAlert('Erreur lors de la génération du PDF', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  // Obtenir les filières uniques
  const filieres = [...new Set(students.map(student => student.filter).filter(Boolean))];

  // Filtrer les étudiants par filière
  const filteredStudents = selectedFiliere === 'all' 
    ? students 
    : students.filter(student => student.filter === selectedFiliere);

  return (
    <div id="pdf" className="content-page active-page"> {/* AJOUTÉ: active-page */}
      <div className="page-title">
        <i className="fas fa-file-pdf"></i>
        Génération de Relevés de Notes
      </div>
      
      {/* Alertes */}
      {alert && (
        <div className={`alert alert-${alert.type}`}>
          <i className={`fas fa-${alert.type === 'success' ? 'check-circle' : alert.type === 'error' ? 'exclamation-circle' : 'info-circle'}`}></i>
          {alert.message}
        </div>
      )}
      
      <div className="page-container">
        {/* Section liste des étudiants par filière (gauche) */}
        <div className="students-section">
          <div className="section-title">
            <i className="fas fa-users"></i> Sélectionner des étudiants
          </div>
          
          {/* Filtre par filière */}
          <div className="filiere-filter">
            <label>Filtrer par filière:</label>
            <select 
              value={selectedFiliere}
              onChange={(e) => handleFiliereChange(e.target.value)}
              className="filiere-select"
            >
              <option value="all">Toutes les filières</option>
              {filieres.map(filiere => (
                <option key={filiere} value={filiere}>{filiere}</option>
              ))}
            </select>
          </div>
          
          {/* Sélection globale */}
          <div className="select-all-filiere">
            <button 
              className="btn btn-small btn-secondary"
              onClick={handleSelectAllFiliere}
            >
              {selectedStudents.length === filteredStudents.length && filteredStudents.length > 0
                ? 'Tout désélectionner'
                : 'Tout sélectionner'
              }
            </button>
          </div>
          
          {/* Liste des étudiants */}
          <div className="students-list-pdf">
            {filteredStudents.length > 0 ? (
              filteredStudents.map(student => (
                <div key={student.id} className="student-item-pdf">
                  <label className="student-checkbox-pdf">
                    <input
                      type="checkbox"
                      checked={selectedStudents.includes(student.id)}
                      onChange={() => handleStudentSelection(student.id)}
                    />
                    <div className="student-info-pdf">
                      <div className="student-name-pdf">
                        {student.firstname} {student.lastname}
                      </div>
                      <div className="student-details-pdf">
                        <span className="student-filiere-pdf">{student.filter}</span>
                        <span className="student-niveau-pdf">{student.niveau}</span>
                      </div>
                    </div>
                  </label>
                </div>
              ))
            ) : (
              <div className="no-data-pdf">
                <i className="fas fa-user-graduate"></i>
                <p>Aucun étudiant dans cette filière</p>
              </div>
            )}
          </div>
          
          {/* Résumé de sélection */}
          <div className="selection-summary">
            <div className="summary-item">
              <span className="summary-label">Étudiants sélectionnés:</span>
              <span className="summary-value">{selectedStudents.length}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Filière:</span>
              <span className="summary-value">
                {selectedFiliere === 'all' ? 'Toutes' : selectedFiliere}
              </span>
            </div>
          </div>
        </div>
        
        {/* Section principale relevés de notes (droite) */}
        <div className="main-section">
          <div className="section-title">
            <i className="fas fa-graduation-cap"></i> Aperçu du relevé de notes
          </div>
          
          {reportData && reportData.length > 0 ? (
            <div className="report-preview-container">
              {reportData.map((report, index) => {
                const { student, grades, average } = report;
                const appreciation = getAppreciation(average);
                
                return (
                  <div key={student.id} className="grade-report-preview">
                    <div className="report-header-preview">
                      <h3>UNIVERSITÉ </h3>
                      <p>Relevé de notes - Année Universitaire 2023/2024</p>
                      <h4>{student.firstname} {student.lastname}</h4>
                      <p>{student.filter} - {student.niveau}</p>
                    </div>
                    
                    {grades.length > 0 ? (
                      <>
                        <table className="report-table-preview">
                          <thead>
                            <tr>
                              <th>Matière</th>
                              <th>Note</th>
                              <th>Commentaire</th>
                            </tr>
                          </thead>
                          <tbody>
                            {grades.map(grade => (
                              <tr key={grade.id}>
                                <td>{grade.course}</td>
                                <td><strong>{grade.grade}/20</strong></td>
                                <td>{grade.comment || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot>
                            <tr>
                              <td colSpan="3" className="report-footer-preview">
                                <div className="average-container">
                                  <span className="average-label">Moyenne générale:</span>
                                  <span className="average-value">{average.toFixed(2)}/20</span>
                                </div>
                                <div 
                                  className="appreciation"
                                  style={{ color: appreciation.color }}
                                >
                                  {appreciation.text}
                                </div>
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </>
                    ) : (
                      <div className="no-grades-message">
                        <i className="fas fa-clipboard-list"></i>
                        <p>Aucune note enregistrée pour cet étudiant</p>
                      </div>
                    )}
                  </div>
                );
              })}
              
              {/* Actions */}
              <div className="report-actions">
                <button
                  className="btn btn-success"
                  onClick={generatePDF}
                  disabled={isGenerating || selectedStudents.length === 0}
                >
                  {isGenerating ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Génération en cours...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-download"></i>
                      Télécharger le PDF ({selectedStudents.length} étudiant(s))
                    </>
                  )}
                </button>
                
                <button
                  className="btn btn-warning"
                  onClick={() => {
                    showAlert('Redirection vers la gestion des notes', 'info');
                  }}
                >
                  <i className="fas fa-edit"></i> Modifier les notes
                </button>
                
                <button
                  className="btn btn-secondary"
                  onClick={() => setSelectedStudents([])}
                  disabled={selectedStudents.length === 0}
                >
                  <i className="fas fa-times"></i> Tout effacer
                </button>
              </div>
            </div>
          ) : (
            <div className="empty-report">
              <div className="empty-report-icon">
                <i className="fas fa-file-alt"></i>
              </div>
              <h3>Aucun étudiant sélectionné</h3>
              <p>Sélectionnez un ou plusieurs étudiants dans la liste à gauche pour afficher leur relevé de notes.</p>
              <div className="empty-report-stats">
                <div className="stat-card">
                  <i className="fas fa-users"></i>
                  <span className="stat-number">{students.length}</span>
                  <span className="stat-label">Étudiants total</span>
                </div>
                <div className="stat-card">
                  <i className="fas fa-clipboard-list"></i>
                  <span className="stat-number">{grades.length}</span>
                  <span className="stat-label">Notes total</span>
                </div>
                <div className="stat-card">
                  <i className="fas fa-graduation-cap"></i>
                  <span className="stat-number">{filieres.length}</span>
                  <span className="stat-label">Filières</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Overlay de chargement PDF */}
      {isGenerating && (
        <div className="pdf-generating-overlay">
          <div className="pdf-generating-content">
            <div className="spinner"></div>
            <h3>Génération du PDF en cours</h3>
            <p>Veuillez patienter pendant la création du document...</p>
            <div className="generating-progress">
              <div className="progress-bar">
                <div className="progress-fill"></div>
              </div>
              <span>Préparation des relevés...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PDF;
