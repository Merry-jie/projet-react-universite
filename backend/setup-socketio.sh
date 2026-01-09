echo "=== CONFIGURATION SOCKET.IO POUR ACCÈS RÉSEAU ==="
# 1. Installer socket.io
echo "1. Installation de socket.io..."
npm install socket.io
# 2. Backup du server.js actuel
echo "2. Backup de server.js..."
cp server.js server.js.backup
# 3. Créer un nouveau server.js avec socket.io
echo "3. Création du nouveau server.js avec socket.io..."
cat > server.js << 'SERVER_EOF'
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
const app = express();
const PORT = 5000;
// Créer serveur HTTP pour Socket.io
const httpServer = createServer(app);
const io = new Server(httpServer, {
cors: {
origin: "*", // Autoriser toutes les origines pour le réseau
methods: ["GET", "POST"],
credentials: true
},
 transports: ['websocket', 'polling']
});
// Middleware
app.use(cors());
app.use(express.json());
// Données mock
let students = [
  { id: 'ET001', lastname: 'Bernary', firstname: 'Nary', phone: '01 23 45 67 89', filiere: 'Informatique', niveau: 'Licence 1', address: 'Akatso, TANA', dateadded: new Date().toISOString() }
];
let grades = [
{ id: 1, studentId: 'ET001', subject: 'Mathématiques', grade: 15, coefficient: 3 },
{ id: 2, studentId: 'ET001', subject: 'Anglais', grade: 12, coefficient: 2 },
 { id: 3, studentId: 'ET001', subject: 'Informatique', grade: 18, coefficient: 4 }
];
// ===== SOCKET.IO =====
io.on('connection', (socket) => {
console.log('🔌 Nouvelle connexion Socket.io:', socket.id);

  // Envoyer les données actuelles au nouveau client
socket.emit('init', { 
students,
grades,
timestamp: new Date().toISOString()
});
// Informer les autres clients
socket.broadcast.emit('user:connected', { 
id: socket.id, 
timestamp: new Date().toISOString()
});
 // Événements personnalisés
socket.on('student:created', (student) => {
console.log('Nouvel étudiant:', student);
students.push(student);
io.emit('student:new', student); // À tous les clients
 });
socket.on('student:updated', (updatedStudent) => {
const index = students.findIndex(s => s.id === updatedStudent.id);
  if (index !== -1) {
students[index] = updatedStudent;
io.emit('student:updated', updatedStudent);
 }
});
socket.on('student:deleted', (studentId) => {
students = students.filter(s => s.id !== studentId);
io.emit('student:deleted', studentId);
 });
socket.on('grade:created', (grade) => {
grades.push(grade);
io.emit('grade:new', grade);
 });
socket.on('grade:updated', (updatedGrade) => {
const index = grades.findIndex(g => g.id === updatedGrade.id);
if (index !== -1) {
grades[index] = updatedGrade;
io.emit('grade:updated', updatedGrade);
 }
});
socket.on('grade:deleted', (gradeId) => {
grades = grades.filter(g => g.id !== gradeId);
io.emit('grade:deleted', gradeId);
});
 // Pour les notifications
socket.on('notification:send', (data) => {
io.emit('notification', data);
 });
 // Salles (pour des groupes spécifiques)
