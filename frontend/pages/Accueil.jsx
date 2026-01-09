import "./Accueil.css";

export default function Accueil() {
  return (
    <div className="accueil">
      <div className="hero">
        <div className="circle-img"></div>

        <div className="cards">
          <div className="card">Étudiants</div>
          <div className="card">Notes</div>
          <div className="card">PDF</div>
        </div>
      </div>

      <div className="welcome">
        <h1>Bienvenue</h1>
        <p>Système de gestion académique</p>
      </div>
    </div>
  );
}