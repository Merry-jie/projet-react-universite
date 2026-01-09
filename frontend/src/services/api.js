import axios from 'axios';

// Configuration de base d'Axios
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs globalement
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          console.error('Non autorisé - Redirection vers login');
          localStorage.removeItem('token');
          window.location.href = '/login';
          break;
        case 403:
          console.error('Accès refusé');
          break;
        case 404:
          console.error('Ressource non trouvée');
          break;
        case 500:
          console.error('Erreur serveur');
          break;
        default:
          console.error('Erreur API:', error.response.status);
      }
    } else if (error.request) {
      console.error('Pas de réponse du serveur');
    } else {
      console.error('Erreur de configuration:', error.message);
    }
    return Promise.reject(error);
  }
);

// Services pour les étudiants
export const studentService = {
  // Récupérer tous les étudiants
  getAll: () => api.get('/students'),
  
  // Récupérer un étudiant par ID
  getById: (id) => api.get(`/students/${id}`),
  
  // Créer un nouvel étudiant
  create: (studentData) => api.post('/students', studentData),
  
  // Mettre à jour un étudiant
  update: (id, studentData) => api.put(`/students/${id}`, studentData),
  
  // Supprimer un étudiant
  delete: (id) => api.delete(`/students/${id}`),
  
  // Rechercher des étudiants
  search: (query) => api.get('/students/search', { params: { q: query } }),
};

// Services pour les notes
export const gradeService = {
  // Récupérer toutes les notes
  getAll: () => api.get('/grades'),
  
  // Récupérer les notes d'un étudiant
  getByStudent: (studentId) => api.get(`/grades/student/${studentId}`),
  
  // Créer une nouvelle note
  create: (gradeData) => api.post('/grades', gradeData),
  
  // Mettre à jour une note
  update: (id, gradeData) => api.put(`/grades/${id}`, gradeData),
  
  // Supprimer une note
  delete: (id) => api.delete(`/grades/${id}`),
  
  // Statistiques des notes
  getStatistics: () => api.get('/grades/statistics'),
};

// Services d'authentification
export const authService = {
  // Connexion
  login: (credentials) => api.post('/auth/login', credentials),
  
  // Inscription
  register: (userData) => api.post('/auth/register', userData),
  
  // Rafraîchir le token
  refreshToken: () => api.post('/auth/refresh'),
  
  // Déconnexion
  logout: () => api.post('/auth/logout'),
  
  // Profil utilisateur
  getProfile: () => api.get('/auth/profile'),
};

// Services pour les PDF
export const pdfService = {
  // Générer un PDF pour un étudiant
  generateForStudent: (studentId) => api.get(`/pdf/student/${studentId}`, {
    responseType: 'blob',
  }),
  
  // Générer un PDF pour plusieurs étudiants
  generateForMultiple: (studentIds) => api.post('/pdf/multiple', { studentIds }, {
    responseType: 'blob',
  }),
  
  // Générer un rapport complet
  generateReport: (filters) => api.post('/pdf/report', filters, {
    responseType: 'blob',
  }),
};

// Services de statistiques
export const statsService = {
  // Statistiques générales
  getDashboardStats: () => api.get('/stats/dashboard'),
  
  // Statistiques par filière
  getByFiliere: () => api.get('/stats/filiere'),
  
  // Statistiques par année
  getByYear: (year) => api.get(`/stats/year/${year}`),
  
  // Évolution des notes
  getGradeEvolution: () => api.get('/stats/evolution'),
};

// Export par défaut
export default api;
