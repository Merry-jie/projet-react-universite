const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

// Import des modèles et base de données
const { sequelize, testConnection } = require('./config/database');
const Student = require('./models/Student');
const Grade = require('./models/Grade');
const User = require('./models/User');

const app = express();
const server = http.createServer(app);

// Configuration Socket.io
const io = socketIo(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes de base
app.get('/api/health', async (req, res) => {
  const dbConnected = await testConnection();
  res.json({
    status: 'OK',
    timestamp: new Date(),
    database: dbConnected ? 'connected' : 'disconnected',
    socket: io.engine.clientsCount,
    environment: process.env.NODE_ENV
  });
});

// Routes API (à développer)
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/students', require('./routes/student.routes'));
app.use('/api/grades', require('./routes/grade.routes'));

// Gestion des connexions Socket.io
const connectedUsers = new Map();

io.on('connection', (socket) => {
  console.log(`🔗 Nouveau client connecté: ${socket.id}`);
  
  // Authentification via token JWT
  socket.on('authenticate', async (token) => {
    try {
      // Ici, vérifiez le token JWT
      // Pour l'instant, simulation
      socket.userId = `user_${socket.id}`;
      socket.role = 'professor';
      
      connectedUsers.set(socket.id, {
        id: socket.id,
        userId: socket.userId,
        role: socket.role,
        connectedAt: new Date(),
        rooms: new Set()
      });
      
      socket.emit('authenticated', { 
        success: true, 
        user: { id: socket.userId, role: socket.role } 
      });
      
      // Diffuser le nombre d'utilisateurs connectés
      io.emit('users:count', connectedUsers.size);
    } catch (error) {
      socket.emit('authentication_error', { message: 'Token invalide' });
    }
  });
  
  // Événements pour les étudiants
  socket.on('student:create', async (studentData) => {
    try {
      console.log('Création étudiant via Socket.io:', studentData);
      
      // Enregistrer dans PostgreSQL
      const student = await Student.create(studentData);
      
      // Diffuser à tous les clients
      io.emit('student:created', student.toJSON());
      
      // Notifier
      socket.broadcast.emit('notification', {
        type: 'success',
        title: 'Nouvel étudiant',
        message: `${student.firstname} ${student.lastname} a été ajouté`,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Erreur création étudiant:', error);
      socket.emit('error', { message: 'Erreur création étudiant', error: error.message });
    }
  });
  
  socket.on('student:update', async (data) => {
    try {
      const student = await Student.findByPk(data.id);
      if (student) {
        await student.update(data);
        io.emit('student:updated', student.toJSON());
      }
    } catch (error) {
      console.error('Erreur mise à jour étudiant:', error);
    }
  });
  
  socket.on('student:delete', async (studentId) => {
    try {
      await Student.destroy({ where: { id: studentId } });
      io.emit('student:deleted', studentId);
    } catch (error) {
      console.error('Erreur suppression étudiant:', error);
    }
  });
  
  // Événements pour les notes
  socket.on('grade:create', async (gradeData) => {
    try {
      const grade = await Grade.create(gradeData);
      io.emit('grade:created', grade.toJSON());
      
      // Calculer la nouvelle moyenne de l'étudiant
      const studentGrades = await Grade.findAll({
        where: { student_id: gradeData.student_id }
      });
      
      const average = studentGrades.reduce((sum, g) => sum + parseFloat(g.grade), 0) / studentGrades.length;
      
      // Envoyer la nouvelle moyenne
      io.emit('student:average:updated', {
        student_id: gradeData.student_id,
        average: average.toFixed(2)
      });
    } catch (error) {
      console.error('Erreur création note:', error);
    }
  });
  
  // Système de salles (par filière, par cours, etc.)
  socket.on('join:room', (room) => {
    socket.join(room);
    const user = connectedUsers.get(socket.id);
    if (user) {
      user.rooms.add(room);
    }
    console.log(`${socket.id} a rejoint la salle: ${room}`);
  });
  
  socket.on('leave:room', (room) => {
    socket.leave(room);
    const user = connectedUsers.get(socket.id);
    if (user) {
      user.rooms.delete(room);
    }
  });
  
  // Déconnexion
  socket.on('disconnect', () => {
    console.log(`❌ Client déconnecté: ${socket.id}`);
    connectedUsers.delete(socket.id);
    io.emit('users:count', connectedUsers.size);
  });
});

// Synchronisation des modèles avec la base de données
const syncDatabase = async () => {
  try {
    // Relations entre modèles
    Student.hasMany(Grade, { foreignKey: 'student_id', as: 'grades' });
    Grade.belongsTo(Student, { foreignKey: 'student_id', as: 'student' });
    
    // Synchroniser (force: true seulement en développement)
    await sequelize.sync({ force: process.env.NODE_ENV === 'development' });
    console.log('✅ Modèles synchronisés avec PostgreSQL');
    
    // Créer un utilisateur admin par défaut si nécessaire
    if (process.env.NODE_ENV === 'development') {
      const adminExists = await User.findOne({ where: { email: 'admin@universite.fr' } });
      if (!adminExists) {
        await User.create({
          username: 'admin',
          email: 'admin@universite.fr',
          password: 'admin123',
          role: 'admin',
          firstname: 'Admin',
          lastname: 'System'
        });
        console.log('👑 Utilisateur admin créé');
      }
    }
  } catch (error) {
    console.error('❌ Erreur synchronisation base de données:', error);
  }
};

// Démarrer le serveur
const startServer = async () => {
  try {
    // Tester la connexion PostgreSQL
    await testConnection();
    
    // Synchroniser la base de données
    await syncDatabase();
    
    const PORT = process.env.PORT || 3001;
    server.listen(PORT, () => {
      console.log(`
🚀 Serveur backend démarré sur le port ${PORT}
📡 WebSocket: ws://localhost:${PORT}
🌐 API HTTP: http://localhost:${PORT}/api
🗄️  Base de données: PostgreSQL
`);
    });
  } catch (error) {
    console.error('❌ Erreur démarrage serveur:', error);
    process.exit(1);
  }
};

startServer();

module.exports = { app, server, io };
