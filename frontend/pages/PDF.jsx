import { useState } from "react";
import "./PDF.css";

export default function Pdf() {
  const [search, setSearch] = useState("");

  const students = [
    { id: 1, nom: "Rakoto", prenom: "Jean", moyenne: 14 },
    { id: 2, nom: "Rabe", prenom: "Marie", moyenne: 9 }
  ];

  const filtered = students.filter(s =>
    s.prenom.toLowerCase().includes(search.toLowerCase())
  );

  const observation = m =>
    m < 10 ? "Passable" :
    m < 13 ? "Assez bien" :
    m < 16 ? "Bien" : "Très bien";

  return (
    <div className="pdf">
      <h2>Relevés PDF</h2>

      <input
        placeholder="Rechercher étudiant"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      {filtered.map(s => (
        <div className="pdf-card" key={s.id}>
          <span>{s.nom} {s.prenom}</span>
          <span>Moyenne : {s.moyenne}</span>
          <span>{observation(s.moyenne)}</span>

          <button>Modifier</button>
          <button onClick={() => window.print()}>Imprimer</button>
        </div>
      ))}
    </div>
  );
}