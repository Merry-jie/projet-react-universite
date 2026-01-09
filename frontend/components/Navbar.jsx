import "./Navbar.css";

export default function Navbar({ onAccueil, onContact }) {
  return (
    <nav className="navbar">
      <span onClick={onAccueil}>Accueil</span>
      <span onClick={onContact}>Contact</span>
    </nav>
  );
}