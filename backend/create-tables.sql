-- Supprimer les tables si elles existent (attention aux données)
DROP TABLE IF EXISTS grades;
DROP TABLE IF EXISTS students;

-- Créer la table students EXACTEMENT comme sur l'image
CREATE TABLE students (
    id VARCHAR(50) PRIMARY KEY,
    lastname VARCHAR(100) NOT NULL,
    firstname VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    filter VARCHAR(100) NOT NULL,  -- Note: "filter" pas "filiere"
    niveau VARCHAR(50) NOT NULL,
    address TEXT NOT NULL,
    dateadded TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

-- Créer la table grades EXACTEMENT comme sur l'image
CREATE TABLE grades (
    id VARCHAR(50) PRIMARY KEY,
    studentid VARCHAR(50) NOT NULL,
    course VARCHAR(150) NOT NULL,
    grade NUMERIC(4,2) NOT NULL,
    comment TEXT NOT NULL,
    dateadded TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    datemodified TIMESTAMP WITHOUT TIME ZONE,
    
    -- Contraintes
    CONSTRAINT grades_grade_check CHECK (grade >= 0::numeric AND grade <= 20::numeric),
    CONSTRAINT grades_studentid_fkey FOREIGN KEY (studentid) 
        REFERENCES students(id) ON DELETE CASCADE
);

-- Créer des indexes pour la performance
CREATE INDEX idx_grades_studentid ON grades(studentid);
CREATE INDEX idx_grades_course ON grades(course);

-- Insérer des données d'exemple
INSERT INTO students (id, lastname, firstname, phone, filter, niveau, address) VALUES
('ET001', 'Rina', 'Nary', '01 23 45 67 89', 'Informatique', 'Licence 1', '123 Rue de Paris, 75001 Paris'),
('ET002', 'Njato', 'Liva', '02 34 56 78 90', 'Mathématiques', 'Master 2', '456 Avenue de Lyon, 69002 Lyon'),
('ET003', 'Bernard', 'koto', '03 45 67 89 01', 'Physique', 'Licence 3', '789 Boulevard de Marseille, 13001 Marseille'),
('ET004', 'Pascal', 'Nofy', '04 56 78 90 12', 'Chimie', 'Master 1', '101 Rue de Toulouse, 31000 Toulouse');

INSERT INTO grades (id, studentid, course, grade, comment) VALUES
('G001', 'ET001', 'Mathématiques', 15.50, 'Excellent travail'),
('G002', 'ET001', 'Langues', 14.00, 'Peut mieux faire'),
('G003', 'ET002', 'Algorithmique', 18.00, 'Très bon'),
('G004', 'ET002', 'Base de données', 16.50, 'Bon travail'),
('G005', 'ET003', 'Français', 12.50, 'Satisfaisant'),
('G006', 'ET004', 'Anglais', 17.00, 'Excellent');

-- Vérifier les données
SELECT 'students' as table, COUNT(*) as count FROM students
UNION ALL
SELECT 'grades', COUNT(*) FROM grades;
