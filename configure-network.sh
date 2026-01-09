#!/bin/bash

echo "=== CONFIGURATION AUTOMATIQUE RÉSEAU ==="

# Trouver l'IP automatiquement
get_ip() {
  # Essayer plusieurs méthodes
  local ip1=$(hostname -I | awk '{print $1}' 2>/dev/null)
  local ip2=$(ip route get 1 2>/dev/null | awk '{print $7; exit}')
  local ip3=$(ip addr show 2>/dev/null | grep -oP 'inet \K[\d.]+' | grep -v '127.0.0.1' | head -1)
  
  # Prendre la première IP valide
  for ip in "$ip1" "$ip2" "$ip3"; do
    if [[ $ip =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
      echo "$ip"
      return 0
    fi
  done
  
  echo "127.0.0.1" # Fallback
}

MY_IP=$(get_ip)
echo "📡 IP détectée: $MY_IP"

# 1. Configurer le backend
echo "1. Configuration backend (server.js)..."
cd /var/www/projet_react/backend

# Créer une version avec IP dynamique
cat > server.js.dynamic << 'BACKEND_EOF'
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import os from 'os';

const app = express();
const PORT = 5000;

// Trouver l'IP réseau
const getNetworkIP = () => {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '0.0.0.0';
};

const NETWORK_IP = getNetworkIP();

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: [`http://${NETWORK_IP}:5174`, "http://localhost:5174"],
    methods: ["GET", "POST"]
  }
});

// ... (le reste de votre code server.js avec socket.io) ...

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`=========================================`);
  console.log(`🚀 SERVEUR DÉMARRÉ`);
  console.log(`=========================================`);
  console.log(`📡 API REST:    http://localhost:${PORT}`);
  console.log(`🔌 Socket.io:   ws://localhost:${PORT}`);
  console.log(`🌐 Accès réseau: http://${NETWORK_IP}:${PORT}`);
  console.log(`📱 Frontend:    http://${NETWORK_IP}:5174`);
  console.log(`=========================================`);
});
BACKEND_EOF

# 2. Configurer le frontend
echo "2. Configuration frontend..."
cd /var/www/projet_react/frontend

# api.js dynamique
cat > src/services/api.js.dynamic << 'API_EOF'
import axios from 'axios';

// Détection automatique de l'environnement
const getAPIBaseURL = () => {
  // Si on est en développement, utiliser l'IP du serveur
  const hostname = window.location.hostname;
  
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    // En local, on peut appeler le backend local
    return 'http://localhost:5000/api';
  } else {
    // Sur le réseau, utiliser la même IP que le frontend
    const protocol = window.location.protocol;
    const host = window.location.host.split(':')[0]; // Enlever le port
    return `${protocol}//${host}:5000/api`;
  }
};

const api = axios.create({
  baseURL: getAPIBaseURL(),
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
});

// ... (le reste de votre api.js) ...

export default api;
API_EOF

# socket.js dynamique
cat > src/services/socket.js.dynamic << 'SOCKET_EOF'
import io from 'socket.io-client';

// Détection automatique de l'URL
const getSocketURL = () => {
  const hostname = window.location.hostname;
  
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:5000';
  } else {
    // Même hôte que la page web
    const protocol = window.location.protocol;
    const host = window.location.host.split(':')[0];
    return `${protocol}//${host}:5000`;
  }
};

class SocketService {
  constructor() {
    this.SOCKET_URL = getSocketURL();
    this.socket = null;
    this.isConnected = false;
    
    console.log('SocketService configuré pour:', this.SOCKET_URL);
  }

  connect() {
    if (this.socket && this.isConnected) return;
    
    this.socket = io(this.SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10
    });
    
    // ... (le reste de votre socket.js) ...
  }
  
  // ... autres méthodes ...
}

const socketService = new SocketService();
export default socketService;
SOCKET_EOF

echo "3. Mettre à jour les fichiers..."
# Copier les fichiers dynamiques
cp src/services/api.js.dynamic src/services/api.js
cp src/services/socket.js.dynamic src/services/socket.js

echo ""
echo "✅ Configuration terminée !"
echo ""
echo "Votre IP réseau: $MY_IP"
echo ""
echo "Pour les autres appareils:"
echo "1. Connectez-vous au même WiFi"
echo "2. Ouvrez: http://$MY_IP:5174"
echo ""
echo "L'application détectera automatiquement:"
echo "- En local: utilise localhost"
echo "- Sur le réseau: utilise l'IP courante"
