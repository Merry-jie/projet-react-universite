import { testConnection, initializeDatabase } from './db.js';

async function test() {
  console.log('🔍 Test de connexion à PostgreSQL...');
  
  // Test de connexion
  const connectionResult = await testConnection();
  console.log('📊 Résultat du test de connexion:');
  console.log(JSON.stringify(connectionResult, null, 2));
  
  if (connectionResult.success) {
    console.log('✅ Connexion réussie!');
    
    // Optionnel: initialiser la base si nécessaire
    console.log('🔄 Initialisation de la base de données...');
    try {
      await initializeDatabase();
      console.log('✅ Base de données initialisée avec succès');
    } catch (error) {
      console.log('⚠️  Base de données déjà initialisée ou erreur:', error.message);
    }
  } else {
    console.error('❌ Échec de la connexion');
    process.exit(1);
  }
}

test().catch(console.error);
