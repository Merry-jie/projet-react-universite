#!/bin/bash

echo "=== CONFIGURATION FRONTEND POUR RÉSEAU ==="

# Obtenir l'IP automatiquement
IP=$(hostname -I | awk '{print $1}')
echo "Votre IP: $IP"

# 1. Configurer api.js
echo "1. Configuration de api.js..."
cat > src/services/api.js << 'API_EOF'
import axios from 'axios';

// Configuration de base d'Axios
const getBackendURL = () => {
  // Pour le réseau, utilisez l'IP
  return 'http://'"$IP"':5000/api';
};

const api = axios.create({
  baseURL: getBackendURL(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteurs (garder le reste du code existant)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          console.error('Non autorisé');
          localStorage.removeItem('token');
          window.location.href = '/login';
          break;
        default:
          console.error('Erreur API:', error.response.status);
      }
    } else if (error.request) {
      console.error('Pas de réponse du serveur. Vérifiez:');
      console.error('  1. Le backend est-il démarré?');
      console.error('  2. Êtes-vous sur le même réseau?');
      console.error('  3. IP backend: '"$IP"':5000');
    }
    return Promise.reject(error);
  }
);

// Services (garder le reste)
export const studentService = {
  getAll: () => api.get('/students'),
  getById: (id) => api.get(`/students/${id}`),
  create: (studentData) => api.post('/students', studentData),
  update: (id, studentData) => api.put(`/students/${id}`, studentData),
  delete: (id) => api.delete(`/students/${id}`),
};

export const gradeService = {
  getAll: () => api.get('/grades'),
  getByStudent: (studentId) => api.get(`/grades/student/${studentId}`),
  create: (gradeData) => api.post('/grades', gradeData),
  update: (id, gradeData) => api.put(`/grades/${id}`, gradeData),
  delete: (id) => api.delete(`/grades/${id}`),
};

export const statsService = {
  getDashboardStats: () => api.get('/stats/dashboard'),
};

export default api;
API_EOF

# 2. Configurer socket.js
echo "2. Configuration de socket.js..."
cat > src/services/socket.js << 'SOCKET_EOF'
import io from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.listeners = new Map();
    
    // URL Socket.io - utiliser l'IP réseau
    this.SOCKET_URL = 'http://'"$IP"':5000';
    
    console.log('SocketService initialisé pour:', this.SOCKET_URL);
  }

  connect() {
    if (this.socket && this.isConnected) {
      return;
    }

    this.socket = io(this.SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('🔗 Socket.io connecté au réseau');
      this.isConnected = true;
      
      // Réinscrire les écouteurs
      this.listeners.forEach((callback, event) => {
        this.socket.on(event, callback);
      });
      
      // Émettre un événement global
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('socket:connected'));
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.log('🔗 Socket.io déconnecté:', reason);
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Erreur connexion Socket.io:', error.message);
      console.log('Vérifiez que:');
      console.log('  1. Le backend tourne sur '"$IP"':5000');
      console.log('  2. Vous êtes sur le même réseau');
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`🔗 Reconnecté (tentative ${attemptNumber})`);
    });

    // Événements serveur
    this.socket.on('init', (data) => {
      console.log('Données initiales reçues:', data);
    });

    this.socket.on('user:connected', (data) => {
      console.log('Nouvel utilisateur connecté:', data.id);
    });

    this.socket.on('user:disconnected', (data) => {
      console.log('Utilisateur déconnecté:', data.id);
    });
  }

  // ... (garder le reste des méthodes existantes) ...
  
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.listeners.clear();
    }
  }

  emit(event, data) {
    if (this.socket && this.isConnected) {
      this.socket.emit(event, data);
    } else {
      console.warn(`Impossible d'émettre ${event}: socket non connecté`);
    }
  }

  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
      this.listeners.set(event, callback);
    }
  }

  off(event) {
    if (this.socket) {
      this.socket.off(event);
      this.listeners.delete(event);
    }
  }

  subscribeToStudents(callback) {
    this.on('student:new', (student) => {
      console.log('Nouvel étudiant (temps réel):', student);
      callback('created', student);
    });
    this.on('student:updated', (student) => {
      console.log('Étudiant mis à jour (temps réel):', student);
      callback('updated', student);
    });
    this.on('student:deleted', (studentId) => {
      console.log('Étudiant supprimé (temps réel):', studentId);
      callback('deleted', studentId);
    });
  }

  subscribeToGrades(callback) {
    this.on('grade:new', (grade) => {
      console.log('Nouvelle note (temps réel):', grade);
      callback('created', grade);
    });
    this.on('grade:updated', (grade) => {
      console.log('Note mise à jour (temps réel):', grade);
      callback('updated', grade);
    });
    this.on('grade:deleted', (gradeId) => {
      console.log('Note supprimée (temps réel):', gradeId);
      callback('deleted', gradeId);
    });
  }
}

// Instance singleton
const socketService = new SocketService();

// Connexion automatique
if (typeof window !== 'undefined') {
  // Attendre que l'app soit chargée
  setTimeout(() => {
    socketService.connect();
  }, 1000);
}

export default socketService;
SOCKET_EOF

# 3. Modifier vite.config.js pour accepter les connexions réseau
echo "3. Configuration Vite pour le réseau..."
if [ -f "vite.config.js" ]; then
  cat > vite.config.js << 'VITE_EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Accepter les connexions réseau
    port: 5174,
    strictPort: true,
  }
})
VITE_EOF
fi

echo "=== CONFIGURATION TERMINÉE ==="
echo ""
echo "Votre application est maintenant configurée pour:"
echo ""
echo "📱 SUR VOTRE MACHINE:"
echo "   Frontend: http://localhost:5174"
echo "   Backend:  http://localhost:5000"
echo ""
echo "📱 SUR LES AUTRES APPAREILS (même réseau WiFi):"
echo "   Frontend: http://$IP:5174"
echo "   Backend:  http://$IP:5000"
echo ""
echo "Pour démarrer:"
echo "  1. Backend:  cd /var/www/projet_react/backend && npm start"
echo "  2. Frontend: cd /var/www/projet_react/frontend && npm run dev"
echo ""
echo "Les autres pourront:"
echo "  ✅ Voir l'application en temps réel"
echo "  ✅ Voir les mêmes données"
echo "  ✅ Voir les modifications instantanément"
