import { useState } from "react";
import "./Notes.css";

export default function Notes() {
  const [openId, setOpenId] = useState(null);
  const [notes, setNotes] = useState({});

  const students = [
    { id: 1, nom: "Rakoto", prenom: "Jean" },
    { id: 2, nom: "Rabe", prenom: "Marie" }
  ];

  const addNote = (id, matiere, note) => {
    setNotes({
      ...notes,
      [id]: [...(notes[id] || []), { matiere, note }]
    });
  };

  return (
    <div className="notes">
      <h2>Notes</h2>

      {students.map(s => {
        const hasNotes = notes[s.id]?.length;
        return (
          <div
            key={s.id}
            className={`note-card ${hasNotes ? "filled" : ""}`}
          >
            <div className="header">
              <span>{s.nom} {s.prenom}</span>
              <button onClick={() => setOpenId(openId === s.id ? null : s.id)}>
                Ajouter
              </button>
            </div>

            {openId === s.id && (
              <div className="expand">
                <button onClick={() => addNote(s.id, "Math", 15)}>
                  Ajouter Math 15
                </button>

                {(notes[s.id] || []).map((n, i) => (
                  <p key={i}>{n.matiere} : {n.note}</p>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}