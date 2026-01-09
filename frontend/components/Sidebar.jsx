import "./Sidebar.css";

export default function Sidebar({ onSelect }) {
  return (
    <aside className="sidebar">
      <h3>Université</h3>

      <ul>
        <li onClick={() => onSelect("accueil")}>Accueil</li>
        <li onClick={() => onSelect("etudiants")}>Étudiants</li>
        <li onClick={() => onSelect("notes")}>Notes</li>
        <li onClick={() => onSelect("pdf")}>PDF</li>
      </ul>

      <div className="sidebar-footer">
        <div className="logo-circle"></div>
        <p>Adresse complète<br />Université de ...</p>
      </div>
    </aside>
  );
}