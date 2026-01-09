#!/bin/bash
echo "🚀 Démarrage de l'environnement de développement..."

# Variables
BACKEND_DIR="/var/www/projet_react/backend"
FRONTEND_DIR="/var/www/projet_react/frontend"

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}1. Vérification des dépendances...${NC}"

# Vérifier PostgreSQL
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL n'est pas installé"
    echo "Installez-le avec: sudo apt install postgresql postgresql-contrib"
    exit 1
fi

# Créer la base de données si elle n'existe pas
echo "📦 Création de la base de données..."
sudo -u postgres psql -c "CREATE DATABASE universite_db;" 2>/dev/null || true

echo -e "${BLUE}2. Démarrage du backend...${NC}"
cd $BACKEND_DIR
npm install
npm run dev &
BACKEND_PID=$!

echo -e "${GREEN}✅ Backend démarré (PID: $BACKEND_PID)${NC}"
sleep 3

echo -e "${BLUE}3. Démarrage du frontend...${NC}"
cd $FRONTEND_DIR
npm install
npm run dev &
FRONTEND_PID=$!

echo -e "${GREEN}✅ Frontend démarré (PID: $FRONTEND_PID)${NC}"

echo -e "\n${GREEN}✨ Environnement prêt !${NC}"
echo "   - Backend API:  http://localhost:3001"
echo "   - Frontend:     http://localhost:5173"
echo "   - PostgreSQL:   localhost:5432/universite_db"
echo ""
echo "📡 Testez la connexion:"
echo "   curl http://localhost:3001/api/health"
echo ""
echo "🛑 Pour arrêter: kill $BACKEND_PID $FRONTEND_PID"

# Fonction de nettoyage
cleanup() {
    echo -e "\n\n🛑 Arrêt..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

# Configurer le trap
trap cleanup INT TERM

# Attendre
wait
