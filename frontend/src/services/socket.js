import io from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
  }

  // URL déterminée automatiquement - CORRIGÉ POUR RENDER
  getSocketURL() {
    // EN PRODUCTION (Render) - URL fixe
    if (window.location.hostname.includes('onrender.com')) {
      return 'https://projet-react-api.onrender.com';
    }
    
    // EN DÉVELOPPEMENT LOCAL
    if (window.location.hostname === 'localhost' || 
        window.location.hostname === '127.0.0.1') {
      return 'http://localhost:5000';
    }
    
    // FALLBACK : utiliser l'URL de l'API
    return 'https://projet-react-api.onrender.com';
  }

  // Connexion au serveur
  connect() {
    if (this.socket && this.isConnected) {
      console.log('Socket déjà connecté');
      return;
    }

    const socketURL = this.getSocketURL();
    console.log('Connexion Socket.io à:', socketURL);

    this.socket = io(socketURL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000
    });

    // Événements de connexion
    this.socket.on('connect', () => {
      console.log('✅ Socket.io connecté');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      
      // Réactiver tous les listeners
      this.listeners.forEach((callback, event) => {
        this.socket.on(event, callback);
      });
      
      // Émettre un événement global
      window.dispatchEvent(new CustomEvent('socket:connected'));
    });

    this.socket.on('disconnect', (reason) => {
      console.log('🔌 Socket.io déconnecté:', reason);
      this.isConnected = false;
      window.dispatchEvent(new CustomEvent('socket:disconnected'));
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Erreur de connexion Socket.io:', error);
      this.reconnectAttempts++;
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.warn('Nombre maximum de tentatives atteint');
      }
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`🔗 Reconnecté (tentative ${attemptNumber})`);
    });

    this.socket.on('reconnect_error', (error) => {
      console.error('❌ Erreur de reconnexion:', error);
    });

    this.socket.on('reconnect_failed', () => {
      console.error('❌ Échec de reconnexion après toutes les tentatives');
    });

    // Événements applicatifs
    this.socket.on('welcome', (data) => {
      console.log('👋 Message de bienvenue:', data);
    });

    this.socket.on('data:init', (data) => {
      console.log('📦 Données initiales reçues:', data);
      window.dispatchEvent(new CustomEvent('socket:data:init', { detail: data }));
    });

    this.socket.on('user:joined', (data) => {
      console.log('👤 Nouvel utilisateur connecté:', data);
      window.dispatchEvent(new CustomEvent('socket:user:joined', { detail: data }));
    });

    this.socket.on('user:left', (data) => {
      console.log('👤 Utilisateur déconnecté:', data);
      window.dispatchEvent(new CustomEvent('socket:user:left', { detail: data }));
    });

    // Connexion automatique
    setTimeout(() => {
      if (!this.isConnected) {
        console.log('Tentative de connexion Socket.io...');
      }
    }, 1000);
  }

  // Déconnexion
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.listeners.clear();
      console.log('Socket.io déconnecté manuellement');
    }
  }

  // Émettre un événement
  emit(event, data) {
    if (this.socket && this.isConnected) {
      this.socket.emit(event, data);
      console.log(`📤 Émis: ${event}`, data);
    } else {
      console.warn(`⚠ Impossible d'émettre ${event}: socket non connecté`);
      // Stocker pour émission ultérieure
      setTimeout(() => {
        if (this.isConnected) {
          this.socket.emit(event, data);
        }
      }, 1000);
    }
  }

  // S'abonner à un événement
  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
      this.listeners.set(event, callback);
    }
  }

  // Se désabonner
  off(event) {
    if (this.socket) {
      this.socket.off(event);
      this.listeners.delete(event);
    }
  }

  // Événements spécifiques
  subscribeToStudents(callback) {
    this.on('student:created', (student) => {
      console.log('🎓 Nouvel étudiant (temps réel):', student);
      callback('created', student);
    });

    this.on('student:updated', (student) => {
      console.log('🎓 Étudiant mis à jour (temps réel):', student);
      callback('updated', student);
    });

    this.on('student:deleted', (studentId) => {
      console.log('🎓 Étudiant supprimé (temps réel):', studentId);
      callback('deleted', studentId);
    });
  }

  subscribeToGrades(callback) {
    this.on('grade:created', (grade) => {
      console.log('📝 Nouvelle note (temps réel):', grade);
      callback('created', grade);
    });

    this.on('grade:updated', (grade) => {
      console.log('📝 Note mise à jour (temps réel):', grade);
      callback('updated', grade);
    });

    this.on('grade:deleted', (gradeId) => {
      console.log('📝 Note supprimée (temps réel):', gradeId);
      callback('deleted', gradeId);
    });
  }

  subscribeToNotifications(callback) {
    this.on('notification', (notification) => {
      console.log('🔔 Notification (temps réel):', notification);
      callback(notification);
    });
  }

  // Ping
  ping() {
    this.emit('ping');
    this.on('pong', (data) => {
      console.log('🏓 Pong reçu:', data);
    });
  }

  // Statut
  getStatus() {
    return {
      connected: this.isConnected,
      socketId: this.socket?.id,
      reconnectAttempts: this.reconnectAttempts
    };
  }
}

// Instance singleton
const socketService = new SocketService();

// Connexion automatique au chargement
if (typeof window !== 'undefined') {
  // Attendre que React soit chargé
  window.addEventListener('load', () => {
    setTimeout(() => {
      socketService.connect();
    }, 500);
  });
}

export default socketService;
