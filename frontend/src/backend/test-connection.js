import { testConnection, initializeDatabase } from './db.js';

async function main() {
  console.log('🧪 Test de connexion PostgreSQL...\n');
  
  const result = await testConnection();
  
  console.log('📊 Résultat :');
  console.log('Success:', result.success);
  console.log('Message:', result.message);
  
  if (result.success) {
    console.log('\n✅ Connexion réussie !');
    console.log('📅 Heure serveur:', result.details?.databaseTime);
    console.log('⚡ Temps réponse:', result.details?.responseTime);
    console.log('🗂️  Tables disponibles:', result.details?.tables);
  } else {
    console.log('\n❌ Échec de connexion');
    console.log('Erreur:', result.error);
  }
}

main().catch(console.error);
