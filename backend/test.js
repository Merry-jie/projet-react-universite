const {Client} = require('pg');
const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postegres',
    password: 'aaaa',
    database: 'bdd'
});
async function testConnection() {
    try{
        await client.connect();
        console.log('Connexion reussi');
        const res = await client.query('SELECT NOW()');
        console.log('resultat test sql:',res.rows);
    }catch (err) {
        console.error('Erreur:',err);
    }finally{
        await client.end();
    }
}
testConnection();