import React from 'react';
import ReactDOM from 'react-dom/client';

// Importez toutes les pages
import Accueil from './pages/Accueil';
import Etudiants from './pages/Etudiants';
import Notes from './pages/Notes';
import PDF from './pages/PDF';

function TestAllPages() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Test de toutes les pages</h1>
      
      <div style={{ margin: '20px 0', padding: '20px', border: '1px solid #ccc' }}>
        <h2>Page Accueil</h2>
        <Accueil onNavigate={() => console.log('navigate')} />
      </div>
      
      <div style={{ margin: '20px 0', padding: '20px', border: '1px solid #ccc' }}>
        <h2>Page Étudiants</h2>
        <Etudiants />
      </div>
      
      <div style={{ margin: '20px 0', padding: '20px', border: '1px solid #ccc' }}>
        <h2>Page Notes</h2>
        <Notes />
      </div>
      
      <div style={{ margin: '20px 0', padding: '20px', border: '1px solid #ccc' }}>
        <h2>Page PDF</h2>
        <PDF />
      </div>
    </div>
  );
}

// Montez le test
const root = document.getElementById('root');
if (root) {
  ReactDOM.createRoot(root).render(<TestAllPages />);
}
