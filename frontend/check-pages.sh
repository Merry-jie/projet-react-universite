#!/bin/bash

echo "🔍 Diagnostic des pages React..."

cd src/pages

echo ""
echo "📄 Pages dans src/pages/:"
ls -la *.jsx

echo ""
echo "🧪 Test d'import de chaque page:"

for page in *.jsx; do
  echo ""
  echo "=== $page ==="
  
  # Test d'import simple
  node -e "
  try {
    const module = require('./${page}');
    console.log('✅ Import réussi');
    console.log('   Exports:', Object.keys(module));
  } catch (error) {
    console.log('❌ Erreur import:', error.message);
    
    // Vérifier le contenu du fichier
    const fs = require('fs');
    const content = fs.readFileSync('${page}', 'utf8');
    const lines = content.split('\n').slice(0, 10);
    console.log('   Premières lignes:');
    lines.forEach((line, i) => console.log(\`   \${i+1}: \${line}\`));
  }
  " 2>&1 | grep -v "Warning"
done

echo ""
echo "📦 Vérification des dépendances dans pages:"
for page in *.jsx; do
  echo ""
  echo "=== $page dépendances ==="
  grep -n "import.*from" "$page" | head -10
done
