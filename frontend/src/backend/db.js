import { 
  studentService, 
  gradeService, 
  pdfService, 
  statsService,
  authService 
} from '../services/api';

// Test de connexion
export const testConnection = async () => {
  try {
    const response = await statsService.getDashboardStats();
    return {
      success: true,
      message: 'Connexion à l\'API établie',
      data: response.data
    };
  } catch (error) {
    console.error('Erreur de connexion API:', error);
    return {
      success: false,
      message: 'Erreur de connexion API',
      error: error.message
    };
  }
};

// Étudiants
export const getAllStudents = async () => {
  try {
    const response = await studentService.getAll();
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des étudiants:', error);
    throw error;
  }
};

export const addStudent = async (studentData) => {
  try {
    const response = await studentService.create(studentData);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de l\'ajout de l\'étudiant:', error);
    throw error;
  }
};

export const updateStudent = async (id, studentData) => {
  try {
    const response = await studentService.update(id, studentData);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la modification de l\'étudiant:', error);
    throw error;
  }
};

export const deleteStudent = async (id) => {
  try {
    const response = await studentService.delete(id);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'étudiant:', error);
    throw error;
  }
};

// Notes
export const getAllGrades = async () => {
  try {
    const response = await gradeService.getAll();
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des notes:', error);
    throw error;
  }
};

export const addGrade = async (gradeData) => {
  try {
    const response = await gradeService.create(gradeData);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de l\'ajout de la note:', error);
    throw error;
  }
};

export const updateGrade = async (id, gradeData) => {
  try {
    const response = await gradeService.update(id, gradeData);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la modification de la note:', error);
    throw error;
  }
};

export const deleteGrade = async (id) => {
  try {
    const response = await gradeService.delete(id);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la suppression de la note:', error);
    throw error;
  }
};

// Statistiques
export const getStatistics = async () => {
  try {
    const response = await statsService.getDashboardStats();
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    // Retourner des données par défaut
    return {
      students: 0,
      grades: 0,
      average: 0,
      filieres: []
    };
  }
};

// PDF
export const generatePDF = async (studentIds) => {
  try {
    const response = await pdfService.generateForMultiple(studentIds);
    
    // Créer un blob et télécharger le PDF
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `releve_notes_${new Date().toISOString().split('T')[0]}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    return { success: true, message: 'PDF généré avec succès' };
  } catch (error) {
    console.error('Erreur lors de la génération du PDF:', error);
    throw error;
  }
};
