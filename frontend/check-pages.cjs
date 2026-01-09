const fs = require('fs');
const path = require('path');

console.log('🔍 Vérification des pages React...\n');

const pagesDir = path.join(__dirname, 'src/pages');

// Vérifier les pages
const pages = ['Accueil', 'Etudiants', 'Notes', 'PDF'];
let allOk = true;

pages.forEach(pageName => {
  const filePath = path.join(pagesDir, `${pageName}.jsx`);
  
  if (!fs.existsSync(filePath)) {
    console.log(`❌ ${pageName}.jsx - FICHIER MANQUANT`);
    allOk = false;
    
    // Créer le fichier manquant
    const content = `import React from 'react';
import './${pageName}.css';

const ${pageName} = () => {
  return (
    <div id="${pageName.toLowerCase()}" className="content-page">
      <h1>Page ${pageName}</h1>
      <p>Page ${pageName} en cours de développement</p>
    </div>
  );
};

export default ${pageName};
`;
    
    fs.writeFileSync(filePath, content);
    console.log(`   ✅ Fichier créé: ${filePath}`);
    
  } else {
    console.log(`✅ ${pageName}.jsx - Existe`);
    
    // Vérifier le contenu
    const content = fs.readFileSync(filePath, 'utf8');
    const hasExport = content.includes('export default');
    const hasReact = content.includes('react');
    
    if (!hasExport) {
      console.log(`   ⚠️  Pas d'export default`);
      allOk = false;
    }
    if (!hasReact) {
      console.log(`   ⚠️  Pas d'import React`);
    }
  }
});

console.log('\n📁 Vérification des composants...');
const componentsDir = path.join(__dirname, 'src/components');
const components = ['SidebarLeft', 'SidebarRight'];

components.forEach(comp => {
  const filePath = path.join(componentsDir, `${comp}.jsx`);
  if (!fs.existsSync(filePath)) {
    console.log(`❌ ${comp}.jsx - FICHIER MANQUANT`);
    allOk = false;
  } else {
    console.log(`✅ ${comp}.jsx - Existe`);
  }
});

console.log('\n📦 Vérification des imports dans App.jsx...');
const appPath = path.join(__dirname, 'src/App.jsx');
if (fs.existsSync(appPath)) {
  const appContent = fs.readFileSync(appPath, 'utf8');
  
  pages.forEach(page => {
    if (appContent.includes(`import ${page} from './pages/${page}'`) || 
        appContent.includes(`import ${page} from './pages/${page}.jsx'`)) {
      console.log(`✅ App.jsx importe ${page}`);
    } else {
      console.log(`❌ App.jsx N'importe PAS ${page}`);
      allOk = false;
    }
  });
}

if (allOk) {
  console.log('\n🎉 Tous les fichiers sont présents !');
  console.log('💡 Prochaines étapes:');
  console.log('   1. npm run dev');
  console.log('   2. Ouvrez http://localhost:5173');
  console.log('   3. Appuyez sur F12 pour voir les erreurs console');
} else {
  console.log('\n⚠️  Des fichiers manquent ou sont incorrects');
  console.log('💡 Exécutez: npm run dev pour tester');
}
