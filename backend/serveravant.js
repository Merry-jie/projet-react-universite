// /var/www/projet_react/backend/server.js
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';

// Configuration POUR GLITCH
const isProduction = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT || 5000;
// MODIFICATION POUR GLITCH :
const CLIENT_URL = process.env.PROJECT_DOMAIN 
  ? `https://${process.env.PROJECT_DOMAIN}.glitch.me`
  : 'http://localhost:5174';

const app = express();

// Création du serveur HTTP pour Socket.io
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        // MODIFICATION POUR GLITCH :
        origin: "*",  // Glitch gère le CORS
        methods: ["GET", "POST"],
        credentials: true
    },
    transports: ['websocket', 'polling']
});

// Middleware
app.use(cors({
    // MODIFICATION POUR GLITCH :
    origin: "*",  // Glitch gère le CORS
    credentials: true
}));
app.use(express.json());

// Données initiales
let students = [
    {
        id: 'ET001',
        lastname: 'Bernary',
        firstname: 'Nary',
        phone: '01 23 45 67 89',
        filiere: 'Informatique',
        niveau: 'Licence 1',
        address: 'Akatso, TANA',
        dateadded: new Date().toISOString()
    }
];

let grades = [
    { id: 1, studentId: 'ET001', subject: 'Mathématiques', grade: 15, coefficient: 3 },
    { id: 2, studentId: 'ET001', subject: 'Physique', grade: 12, coefficient: 2 },
    { id: 3, studentId: 'ET001', subject: 'Informatique', grade: 18, coefficient: 4 }
];

// ================================
// CONFIGURATION SOCKET.IO
// ================================

io.on('connection', (socket) => {
    console.log('🔌 Nouveau client connecté:', socket.id);

    // Envoyer un message de bienvenue
    socket.emit('welcome', {
        message: 'Bienvenue sur le serveur en temps réel',
        id: socket.id,
        timestamp: new Date().toISOString(),
        clients: io.engine.clientsCount
    });

    // Envoyer les données initiales
    socket.emit('data:init', { students, grades });

    // Informer les autres de la nouvelle connexion
    socket.broadcast.emit('user:joined', {
        id: socket.id,
        timestamp: new Date().toISOString()
    });

    // ========== ÉVÉNEMENTS ÉTUDIANTS ==========
    socket.on('student:create', (studentData) => {
        const newStudent = {
            id: `ET${String(students.length + 1).padStart(3, '0')}`,
            ...studentData,
            dateadded: new Date().toISOString()
        };
        students.push(newStudent);

        // Diffuser à tous les clients
        io.emit('student:created', newStudent);
        console.log('📝 Nouvel étudiant créé:', newStudent.id);
    });

    socket.on('student:update', (updatedStudent) => {
        const index = students.findIndex(s => s.id === updatedStudent.id);
        if (index !== -1) {
            students[index] = { ...students[index], ...updatedStudent };
            io.emit('student:updated', students[index]);
            console.log('📝 Étudiant mis à jour:', updatedStudent.id);
        }
    });

    socket.on('student:delete', (studentId) => {
        students = students.filter(s => s.id !== studentId);
        io.emit('student:deleted', studentId);
        console.log('📝 Étudiant supprimé:', studentId);
    });

    // ========== ÉVÉNEMENTS NOTES ==========
    socket.on('grade:create', (gradeData) => {
        const newGrade = {
            id: grades.length + 1,
            ...gradeData
        };
        grades.push(newGrade);
        io.emit('grade:created', newGrade);
        console.log('📊 Nouvelle note créée:', newGrade.id);
    });

    socket.on('grade:update', (updatedGrade) => {
        const index = grades.findIndex(g => g.id === updatedGrade.id);
        if (index !== -1) {
            grades[index] = { ...grades[index], ...updatedGrade };
            io.emit('grade:updated', grades[index]);
            console.log('📊 Note mise à jour:', updatedGrade.id);
        }
    });

    socket.on('grade:delete', (gradeId) => {
        grades = grades.filter(g => g.id !== gradeId);
        io.emit('grade:deleted', gradeId);
        console.log('📊 Note supprimée:', gradeId);
    });

    // ========== ÉVÉNEMENTS SYSTÈME ==========
    socket.on('ping', () => {
        socket.emit('pong', { timestamp: new Date().toISOString() });
    });

    socket.on('disconnect', (reason) => {
        console.log('🔌 Client déconnecté:', socket.id, '- Raison:', reason);
        io.emit('user:left', { id: socket.id, reason });
    });

    socket.on('error', (error) => {
        console.error('❌ Erreur Socket.io:', error);
    });
});

// ================================
// ROUTES API REST
// ================================

// Santé du serveur
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        message: 'API et Socket.io opérationnels',
        sockets: io.engine.clientsCount,
        students: students.length,
        grades: grades.length
    });
});

// Étudiants
app.get('/api/students', (req, res) => {
    res.json(students);
});

app.post('/api/students', (req, res) => {
    const newStudent = {
        id: `ET${String(students.length + 1).padStart(3, '0')}`,
        ...req.body,
        dateadded: new Date().toISOString()
    };
    students.push(newStudent);

    // Notifier via Socket.io
    io.emit('student:created', newStudent);

    res.json(newStudent);
});

app.put('/api/students/:id', (req, res) => {
    const id = req.params.id;
    const index = students.findIndex(s => s.id === id);
    if (index !== -1) {
        students[index] = { ...students[index], ...req.body };
        io.emit('student:updated', students[index]);
        res.json(students[index]);
    } else {
        res.status(404).json({ error: 'Étudiant non trouvé' });
    }
});

app.delete('/api/students/:id', (req, res) => {
    const id = req.params.id;
    students = students.filter(s => s.id !== id);
    io.emit('student:deleted', id);
    res.json({ success: true, id });
});

// Notes
app.get('/api/grades', (req, res) => {
    res.json(grades);
});

app.post('/api/grades', (req, res) => {
    const newGrade = {
        id: grades.length + 1,
        ...req.body
    };
    grades.push(newGrade);
    io.emit('grade:created', newGrade);
    res.json(newGrade);
});

app.put('/api/grades/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = grades.findIndex(g => g.id === id);
    if (index !== -1) {
        grades[index] = { ...grades[index], ...req.body };
        io.emit('grade:updated', grades[index]);
        res.json(grades[index]);
    } else {
        res.status(404).json({ error: 'Note non trouvée' });
    }
});

app.delete('/api/grades/:id', (req, res) => {
    const id = parseInt(req.params.id);
    grades = grades.filter(g => g.id !== id);
    io.emit('grade:deleted', id);
    res.json({ success: true, id });
});

// Statistiques
app.get('/api/stats/dashboard', (req, res) => {
    const average = grades.length > 0
        ? (grades.reduce((sum, g) => sum + g.grade, 0) / grades.length).toFixed(2)
        : 0;

    res.json({
        students: students.length,
        grades: grades.length,
        average: parseFloat(average),
        filieres: [...new Set(students.map(s => s.filiere))],
        onlineUsers: io.engine.clientsCount,
        lastUpdate: new Date().toISOString()
    });
});

// Route pour les notifications (mock)
app.post('/api/notifications', (req, res) => {
    const notification = {
        id: Date.now(),
        ...req.body,
        timestamp: new Date().toISOString()
    };

    // Diffuser via Socket.io
    io.emit('notification', notification);

    res.json({ success: true, notification });
});

// ================================
// DÉMARRAGE DU SERVEUR
// ================================

// Pour Glitch, démarrez normalement
httpServer.listen(PORT, '0.0.0.0', () => {
    console.log('=========================================');
    console.log(`🚀  SERVEUR BACKEND DÉMARRÉ SUR GLITCH`);
    console.log('=========================================');
    console.log(`📡  API REST:    https://${process.env.PROJECT_DOMAIN || 'localhost'}.glitch.me`);
    console.log(`🔌  WebSocket:   wss://${process.env.PROJECT_DOMAIN || 'localhost'}.glitch.me`);
    console.log(`🌐  Mode: ${isProduction ? 'Production' : 'Développement'}`);
    console.log(`🔗  Client URL: ${CLIENT_URL}`);
    console.log('');
    console.log('📊  Données initiales:');
    console.log(`   - ${students.length} étudiants`);
    console.log(`   - ${grades.length} notes`);
    console.log('');
    console.log('=========================================');
});

// Gestion des erreurs globales
process.on('uncaughtException', (error) => {
    console.error('💥 Erreur non gérée:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('💥 Promise rejetée non gérée:', reason);
});
