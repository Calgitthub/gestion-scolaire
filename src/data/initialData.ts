import { User, ClassRoom, Subject, Student, Evaluation, Grade, SchoolConfig } from '../types';

export const INITIAL_SCHOOL_CONFIG: SchoolConfig = {
  name: "Groupe Scolaire & Universitaire d'Excellence (EduGest Académie)",
  academicYear: "2026-2027",
  address: "Campus Universitaire & Scolaire, 45 Avenue de l'Éducation, 75005 Paris",
  phone: "+33 (0)1 45 67 89 00",
  email: "contact@edugest-academie.edu",
  directorName: "Prof. Henri de Montmirail"
};

export const INITIAL_USERS: User[] = [
  {
    id: 1,
    username: "admin",
    fullName: "M. Alexandre Martin (Direction Générale)",
    role: "admin",
    isActive: true,
    createdAt: "2026-09-01",
    email: "direction@edugest.edu"
  },
  {
    id: 2,
    username: "prof.bernard",
    fullName: "Mme Sophie Bernard (Professeur des Écoles CM2)",
    role: "prof",
    isActive: true,
    createdAt: "2026-09-01",
    assignedClassIds: [1], // CM2-A
    assignedSubjectIds: [1, 2, 3, 4, 5, 6],
    email: "s.bernard@edugest.edu"
  },
  {
    id: 3,
    username: "prof.martin",
    fullName: "M. Laurent Martin (Professeur Mathématiques & Sciences)",
    role: "prof",
    isActive: true,
    createdAt: "2026-09-01",
    assignedClassIds: [2, 3], // 3EME-B, TS1
    assignedSubjectIds: [7, 8, 13, 14],
    email: "l.martin@edugest.edu"
  },
  {
    id: 4,
    username: "prof.benali",
    fullName: "Dr. Karim Benali (Enseignant Informatique Universitaire)",
    role: "prof",
    isActive: true,
    createdAt: "2026-09-01",
    assignedClassIds: [4], // L1-INFO
    assignedSubjectIds: [18, 19, 20, 21, 22, 23],
    email: "k.benali@edugest.edu"
  },
  {
    id: 5,
    username: "enseignant",
    fullName: "Mme Julie Moreau (Professeur Démo)",
    role: "prof",
    isActive: true,
    createdAt: "2026-09-01",
    email: "prof@edugest.edu"
  }
];

export const INITIAL_CLASSES: ClassRoom[] = [
  // 1. COURS PRIMAIRE
  {
    id: 1,
    code: "CM2-A",
    name: "CM2 - Cours Moyen 2ème Année",
    level: "Primaire - Cycle 3",
    cycle: "primaire",
    cycleLabel: "École Primaire (Élémentaire)",
    description: "Dernière année de l'école primaire préparant à l'entrée en 6ème. Acquisition des fondamentaux en lecture, grammaire et calcul."
  },
  // 2. COURS SECONDAIRE - COLLÈGE
  {
    id: 2,
    code: "3EME-B",
    name: "Troisième Générale B",
    level: "Secondaire - Collège (Fin de cycle 4)",
    cycle: "secondaire",
    cycleLabel: "Collège (Secondaire 1er Cycle)",
    description: "Classe de fin de collège préparant au Diplôme National du Brevet (DNB) et à l'orientation vers le lycée général ou professionnel."
  },
  // 3. COURS SECONDAIRE - LYCÉE
  {
    id: 3,
    code: "TS1",
    name: "Terminale Générale Scientifique A",
    level: "Secondaire - Lycée (Terminale)",
    cycle: "secondaire",
    cycleLabel: "Lycée (Secondaire 2nd Cycle)",
    description: "Classe préparatoire au Baccalauréat général avec spécialités Mathématiques et Physique-Chimie."
  },
  // 4. COURS SUPÉRIEUR - UNIVERSITÉ
  {
    id: 4,
    code: "L1-INFO",
    name: "Licence 1 Informatique & Mathématiques",
    level: "Enseignement Supérieur - Bac+1 (LMD)",
    cycle: "superieur",
    cycleLabel: "Enseignement Supérieur (Universitaire)",
    description: "Premier semestre du parcours universitaire de Licence Informatique régi par les normes européennes LMD et crédits ECTS."
  }
];

export const INITIAL_SUBJECTS: Subject[] = [
  // MATIÈRES PRIMAIRE (CM2-A)
  { id: 1, code: "FR-CM2", name: "Français (Grammaire, Orthographe & Lecture)", coefficient: 4.0, classId: 1, domain: "Fondamental" },
  { id: 2, code: "MATH-CM2", name: "Mathématiques (Calcul & Résolution de Problèmes)", coefficient: 4.0, classId: 1, domain: "Fondamental" },
  { id: 3, code: "SCI-CM2", name: "Sciences Expérimentales & Technologie", coefficient: 2.0, classId: 1, domain: "Éveil & Découverte" },
  { id: 4, code: "HIST-CM2", name: "Histoire-Géographie & Éducation Morale", coefficient: 2.0, classId: 1, domain: "Sciences Humaines" },
  { id: 5, code: "ANG-CM2", name: "Initiation à l'Anglais", coefficient: 1.5, classId: 1, domain: "Langues" },
  { id: 6, code: "EPS-CM2", name: "Éducation Physique et Sportive (EPS)", coefficient: 1.0, classId: 1, domain: "Sport & Santé" },

  // MATIÈRES SECONDAIRE - COLLÈGE (3EME-B)
  { id: 7, code: "FR-3EME", name: "Français & Littérature", coefficient: 4.0, classId: 2, domain: "Lettres" },
  { id: 8, code: "MATH-3EME", name: "Mathématiques Générales", coefficient: 4.0, classId: 2, domain: "Sciences" },
  { id: 9, code: "HG-3EME", name: "Histoire-Géographie & EMC", coefficient: 3.0, classId: 2, domain: "Sciences Humaines" },
  { id: 10, code: "PC-3EME", name: "Physique-Chimie", coefficient: 3.0, classId: 2, domain: "Sciences" },
  { id: 11, code: "SVT-3EME", name: "Sciences de la Vie et de la Terre (SVT)", coefficient: 3.0, classId: 2, domain: "Sciences" },
  { id: 12, code: "LV1-3EME", name: "Anglais LV1", coefficient: 2.0, classId: 2, domain: "Langues" },

  // MATIÈRES SECONDAIRE - LYCÉE (TS1)
  { id: 13, code: "MATH-TS", name: "Mathématiques Spécialité", coefficient: 5.0, classId: 3, domain: "Sciences" },
  { id: 14, code: "PHYS-TS", name: "Physique-Chimie Spécialité", coefficient: 4.0, classId: 3, domain: "Sciences" },
  { id: 15, code: "SVT-TS", name: "Sciences de la Vie et de la Terre", coefficient: 3.0, classId: 3, domain: "Sciences" },
  { id: 16, code: "PHIL-TS", name: "Philosophie", coefficient: 3.0, classId: 3, domain: "Humanités" },
  { id: 17, code: "ANG-TS", name: "Anglais LV1", coefficient: 2.0, classId: 3, domain: "Langues" },

  // MATIÈRES SUPÉRIEUR - UNIVERSITÉ (L1-INFO - 30 ECTS)
  { id: 18, code: "UE-101", name: "Algorithmique & Programmation Python", coefficient: 4.0, classId: 4, ectsCredits: 6, domain: "Informatique Fondamentale" },
  { id: 19, code: "UE-102", name: "Mathématiques Discrètes & Algèbre Linéaire", coefficient: 4.0, classId: 4, ectsCredits: 6, domain: "Mathématiques Appliquées" },
  { id: 20, code: "UE-103", name: "Architecture des Ordinateurs & Systèmes Unix", coefficient: 3.0, classId: 4, ectsCredits: 5, domain: "Systèmes & Réseaux" },
  { id: 21, code: "UE-104", name: "Bases de Données Relationnelles & SQL", coefficient: 3.0, classId: 4, ectsCredits: 5, domain: "Données & BDD" },
  { id: 22, code: "UE-105", name: "Développement Web Frontend & Backend", coefficient: 3.0, classId: 4, ectsCredits: 4, domain: "Technologies Web" },
  { id: 23, code: "UE-106", name: "Anglais Scientifique & Communication Professionnelle", coefficient: 2.0, classId: 4, ectsCredits: 4, domain: "Transversal" }
];

export const INITIAL_STUDENTS: Student[] = [
  // ==========================================
  // CLASSE PRIMAIRE : CM2-A
  // ==========================================
  // Élève Bon / Brillant
  {
    id: 1,
    matricule: "PRI-2026-001",
    firstName: "Léo",
    lastName: "Bernard",
    gender: "M",
    birthDate: "2015-04-12",
    address: "24 Rue des Écoles, 75005 Paris",
    phone: "01 42 33 44 55",
    email: "parents.bernard@email.fr",
    classId: 1,
    enrollmentDate: "2026-09-01",
    isGoodStudent: true
  },
  // Élève Médiocre / En difficulté
  {
    id: 2,
    matricule: "PRI-2026-002",
    firstName: "Arthur",
    lastName: "Giraud",
    gender: "M",
    birthDate: "2015-09-05",
    address: "8 Avenue du Parc, 75005 Paris",
    phone: "01 45 66 77 88",
    email: "parents.giraud@email.fr",
    classId: 1,
    enrollmentDate: "2026-09-01",
    isGoodStudent: false
  },
  // Élève Moyen
  {
    id: 3,
    matricule: "PRI-2026-003",
    firstName: "Manon",
    lastName: "Leroy",
    gender: "F",
    birthDate: "2015-02-18",
    address: "15 Boulevard Saint-Marcel, 75005 Paris",
    phone: "01 48 99 00 11",
    email: "famille.leroy@email.fr",
    classId: 1,
    enrollmentDate: "2026-09-01"
  },

  // ==========================================
  // CLASSE SECONDAIRE - COLLÈGE : 3EME-B
  // ==========================================
  // Élève Bon / Brillant
  {
    id: 4,
    matricule: "COL-2026-010",
    firstName: "Sarah",
    lastName: "Benali",
    gender: "F",
    birthDate: "2011-06-14",
    address: "12 Rue de la Sorbonne, 75005 Paris",
    phone: "06 11 22 33 44",
    email: "sarah.benali@ecole.fr",
    classId: 2,
    enrollmentDate: "2026-09-01",
    isGoodStudent: true
  },
  // Élève Médiocre / En difficulté
  {
    id: 5,
    matricule: "COL-2026-011",
    firstName: "Kévin",
    lastName: "Mercier",
    gender: "M",
    birthDate: "2011-10-22",
    address: "41 Rue Monge, 75005 Paris",
    phone: "06 22 33 44 55",
    email: "kevin.mercier@ecole.fr",
    classId: 2,
    enrollmentDate: "2026-09-01",
    isGoodStudent: false
  },
  // Élève Moyen
  {
    id: 6,
    matricule: "COL-2026-012",
    firstName: "Gabriel",
    lastName: "Colin",
    gender: "M",
    birthDate: "2011-03-30",
    address: "3 Square Adanson, 75005 Paris",
    phone: "06 33 44 55 66",
    email: "gabriel.colin@ecole.fr",
    classId: 2,
    enrollmentDate: "2026-09-01"
  },

  // ==========================================
  // CLASSE SECONDAIRE - LYCÉE : TS1
  // ==========================================
  // Élève Bon / Major
  {
    id: 7,
    matricule: "LYC-2026-020",
    firstName: "Chloé",
    lastName: "Mercier",
    gender: "F",
    birthDate: "2008-04-27",
    address: "90 Cours Gambetta, Paris",
    phone: "06 89 01 23 45",
    email: "chloe.mercier@lycee.fr",
    classId: 3,
    enrollmentDate: "2026-09-01",
    isGoodStudent: true
  },
  // Élève Médiocre / En difficulté
  {
    id: 8,
    matricule: "LYC-2026-021",
    firstName: "Maxime",
    lastName: "Roux",
    gender: "M",
    birthDate: "2007-12-05",
    address: "78 Rue Nationale, Paris",
    phone: "06 56 78 90 12",
    email: "maxime.roux@lycee.fr",
    classId: 3,
    enrollmentDate: "2026-09-01",
    isGoodStudent: false
  },
  // Élèves Complémentaires
  {
    id: 9,
    matricule: "LYC-2026-022",
    firstName: "Lucas",
    lastName: "Dupont",
    gender: "M",
    birthDate: "2008-03-14",
    address: "14 Rue Victor Hugo, Paris",
    phone: "06 12 34 56 78",
    email: "lucas.dupont@lycee.fr",
    classId: 3,
    enrollmentDate: "2026-09-01"
  },
  {
    id: 10,
    matricule: "LYC-2026-023",
    firstName: "Camille",
    lastName: "Laurent",
    gender: "F",
    birthDate: "2008-07-22",
    address: "8 Boulevard Saint-Michel, Paris",
    phone: "06 23 45 67 89",
    email: "camille.laurent@lycee.fr",
    classId: 3,
    enrollmentDate: "2026-09-01"
  },

  // ==========================================
  // CLASSE SUPÉRIEUR - UNIVERSITÉ : L1-INFO
  // ==========================================
  // Élève Bon / Major
  {
    id: 11,
    matricule: "SUP-2026-050",
    firstName: "Yassine",
    lastName: "Benali",
    gender: "M",
    birthDate: "2006-06-15",
    address: "18 Rue Voltaire, Paris",
    phone: "07 11 22 33 44",
    email: "yassine.b@univ-paris.edu",
    classId: 4,
    enrollmentDate: "2026-09-01",
    isGoodStudent: true
  },
  // Élève Médiocre / Ajourné
  {
    id: 12,
    matricule: "SUP-2026-051",
    firstName: "Hugo",
    lastName: "Lemaire",
    gender: "M",
    birthDate: "2006-01-20",
    address: "29 Rue Cuvier, Paris",
    phone: "07 99 88 77 66",
    email: "hugo.lemaire@univ-paris.edu",
    classId: 4,
    enrollmentDate: "2026-09-01",
    isGoodStudent: false
  },
  // Élève Moyen
  {
    id: 13,
    matricule: "SUP-2026-052",
    firstName: "Inès",
    lastName: "Diallo",
    gender: "F",
    birthDate: "2006-02-08",
    address: "5 Rue de l'Avenir, Paris",
    phone: "07 22 33 44 55",
    email: "ines.d@univ-paris.edu",
    classId: 4,
    enrollmentDate: "2026-09-01"
  }
];

export const INITIAL_EVALUATIONS: Evaluation[] = [
  // Évaluations CM2-A (Primaire)
  { id: 1, title: "Dictée & Analyse Grammaticale", evalType: "Devoir", date: "2026-10-08", period: "1er Trimestre", subjectId: 1, classId: 1, maxScore: 20 },
  { id: 2, title: "Contrôle Calcul & Résolution Problèmes", evalType: "Devoir", date: "2026-10-15", period: "1er Trimestre", subjectId: 2, classId: 1, maxScore: 20 },
  { id: 3, title: "Évaluation Sciences de la Terre & Nature", evalType: "Interrogation", date: "2026-10-22", period: "1er Trimestre", subjectId: 3, classId: 1, maxScore: 20 },
  { id: 4, title: "Bilan Histoire de France & République", evalType: "Devoir", date: "2026-11-05", period: "1er Trimestre", subjectId: 4, classId: 1, maxScore: 20 },
  { id: 5, title: "Expression Orale en Anglais", evalType: "Interrogation", date: "2026-11-12", period: "1er Trimestre", subjectId: 5, classId: 1, maxScore: 20 },
  { id: 6, title: "Course d'endurance & Relais (EPS)", evalType: "Devoir", date: "2026-11-19", period: "1er Trimestre", subjectId: 6, classId: 1, maxScore: 20 },

  // Évaluations 3EME-B (Secondaire - Collège)
  { id: 7, title: "Devoir Brevet Français (Texte & Rédaction)", evalType: "Devoir", date: "2026-10-14", period: "1er Trimestre", subjectId: 7, classId: 2, maxScore: 20 },
  { id: 8, title: "Brevet Blanc Mathématiques (Thalès & Fonctions)", evalType: "Examen", date: "2026-10-28", period: "1er Trimestre", subjectId: 8, classId: 2, maxScore: 20 },
  { id: 9, title: "Contrôle Histoire : La Première Guerre Mondiale", evalType: "Devoir", date: "2026-11-04", period: "1er Trimestre", subjectId: 9, classId: 2, maxScore: 20 },
  { id: 10, title: "TP Physique : Circuits Électriques & Tension", evalType: "Interrogation", date: "2026-11-10", period: "1er Trimestre", subjectId: 10, classId: 2, maxScore: 20 },
  { id: 11, title: "Contrôle SVT : Génétique & Chromosomes", evalType: "Devoir", date: "2026-11-17", period: "1er Trimestre", subjectId: 11, classId: 2, maxScore: 20 },
  { id: 12, title: "Compréhension Orale & Vocabulaire Anglais", evalType: "Interrogation", date: "2026-11-24", period: "1er Trimestre", subjectId: 12, classId: 2, maxScore: 20 },

  // Évaluations TS1 (Secondaire - Lycée)
  { id: 13, title: "Devoir Surveillé N°1 (Suites & Récurrence)", evalType: "Devoir", date: "2026-10-10", period: "1er Trimestre", subjectId: 13, classId: 3, maxScore: 20 },
  { id: 14, title: "DS Physique (Cinématique & Mécanique de Newton)", evalType: "Devoir", date: "2026-10-18", period: "1er Trimestre", subjectId: 14, classId: 3, maxScore: 20 },
  { id: 15, title: "Évaluation SVT (Génétique & Évolution)", evalType: "Devoir", date: "2026-10-30", period: "1er Trimestre", subjectId: 15, classId: 3, maxScore: 20 },
  { id: 16, title: "Dissertation Philosophie (Le Bonheur et le Devoir)", evalType: "Devoir", date: "2026-11-15", period: "1er Trimestre", subjectId: 16, classId: 3, maxScore: 20 },
  { id: 17, title: "Examen Blanc Anglais LV1", evalType: "Examen", date: "2026-11-20", period: "1er Trimestre", subjectId: 17, classId: 3, maxScore: 20 },

  // Évaluations L1-INFO (Supérieur - Université)
  { id: 18, title: "Partiel UE-101 : Algorithmes de Tri & Récursivité", evalType: "Examen", date: "2026-10-25", period: "1er Semestre", subjectId: 18, classId: 4, maxScore: 20 },
  { id: 19, title: "Partiel UE-102 : Ensembles, Relations & Matrices", evalType: "Examen", date: "2026-11-02", period: "1er Semestre", subjectId: 19, classId: 4, maxScore: 20 },
  { id: 20, title: "Projet UE-103 : Scripting Shell & Gestion Mémoire", evalType: "Projet", date: "2026-11-14", period: "1er Semestre", subjectId: 20, classId: 4, maxScore: 20 },
  { id: 21, title: "Partiel UE-104 : Schémas E/A & Requêtes SQL Avancées", evalType: "Examen", date: "2026-11-22", period: "1er Semestre", subjectId: 21, classId: 4, maxScore: 20 },
  { id: 22, title: "Projet Web UE-105 : Application Fullstack REST", evalType: "Projet", date: "2026-11-28", period: "1er Semestre", subjectId: 22, classId: 4, maxScore: 20 },
  { id: 23, title: "Contrôle UE-106 : Rédaction Technique & Vocabulaire IT", evalType: "Interrogation", date: "2026-12-05", period: "1er Semestre", subjectId: 23, classId: 4, maxScore: 20 }
];

export const INITIAL_GRADES: Grade[] = [
  // ==========================================
  // NOTES CM2-A (PRIMAIRE)
  // ==========================================
  // Élève Bon : Léo Bernard (Moyenne ~17.5/20)
  { id: 1, studentId: 1, evaluationId: 1, value: 18.0, dateRecorded: "2026-10-09", comments: "Excellente orthographe et zéro faute à la dictée !" },
  { id: 2, studentId: 1, evaluationId: 2, value: 18.5, dateRecorded: "2026-10-16", comments: "Raisonnement parfait et calculs impeccables." },
  { id: 3, studentId: 1, evaluationId: 3, value: 16.5, dateRecorded: "2026-10-23", comments: "Très curieux et précis dans ses explications." },
  { id: 4, studentId: 1, evaluationId: 4, value: 17.0, dateRecorded: "2026-11-06", comments: "Très bonne maîtrise des repères historiques." },
  { id: 5, studentId: 1, evaluationId: 5, value: 16.0, dateRecorded: "2026-11-13", comments: "Bonne prise de parole en anglais." },
  { id: 6, studentId: 1, evaluationId: 6, value: 17.0, dateRecorded: "2026-11-20", comments: "Esprit d'équipe et excellente endurance." },

  // Élève Médiocre : Arthur Giraud (Moyenne ~8.0/20)
  { id: 7, studentId: 2, evaluationId: 1, value: 7.5, dateRecorded: "2026-10-09", comments: "Nombreuses confusions grammaticales et accords non respectés." },
  { id: 8, studentId: 2, evaluationId: 2, value: 8.0, dateRecorded: "2026-10-16", comments: "Les tables de multiplication ne sont pas sues." },
  { id: 9, studentId: 2, evaluationId: 3, value: 9.0, dateRecorded: "2026-10-23", comments: "Leçon peu apprise, des confusions sur les termes scientifiques." },
  { id: 10, studentId: 2, evaluationId: 4, value: 8.0, dateRecorded: "2026-11-06", comments: "Manque de repères chronologiques essentiels." },
  { id: 11, studentId: 2, evaluationId: 5, value: 8.5, dateRecorded: "2026-11-13", comments: "Participation timide, vocabulaire fragile." },
  { id: 12, studentId: 2, evaluationId: 6, value: 10.0, dateRecorded: "2026-11-20", comments: "Fait des efforts en sport." },

  // Élève Moyen : Manon Leroy (Moyenne ~13.5/20)
  { id: 13, studentId: 3, evaluationId: 1, value: 14.0, dateRecorded: "2026-10-09", comments: "Bon travail d'ensemble." },
  { id: 14, studentId: 3, evaluationId: 2, value: 13.0, dateRecorded: "2026-10-16", comments: "Convenable." },
  { id: 15, studentId: 3, evaluationId: 3, value: 13.5, dateRecorded: "2026-10-23", comments: "Satisfaisant." },
  { id: 16, studentId: 3, evaluationId: 4, value: 14.0, dateRecorded: "2026-11-06", comments: "Bien." },
  { id: 17, studentId: 3, evaluationId: 5, value: 12.0, dateRecorded: "2026-11-13", comments: "Assez bien." },
  { id: 18, studentId: 3, evaluationId: 6, value: 14.5, dateRecorded: "2026-11-20", comments: "Bonne participation." },

  // ==========================================
  // NOTES 3EME-B (SECONDAIRE - COLLÈGE)
  // ==========================================
  // Élève Bon : Sarah Benali (Moyenne ~17.0/20)
  { id: 19, studentId: 4, evaluationId: 7, value: 17.0, dateRecorded: "2026-10-15", comments: "Excellente analyse littéraire et syntaxe remarquable." },
  { id: 20, studentId: 4, evaluationId: 8, value: 18.0, dateRecorded: "2026-10-29", comments: "Brillante démonstration géométrique." },
  { id: 21, studentId: 4, evaluationId: 9, value: 16.5, dateRecorded: "2026-11-05", comments: "Parfaite maîtrise du sujet historique." },
  { id: 22, studentId: 4, evaluationId: 10, value: 16.0, dateRecorded: "2026-11-11", comments: "Très bonne manipulation expérimentale." },
  { id: 23, studentId: 4, evaluationId: 11, value: 17.5, dateRecorded: "2026-11-18", comments: "Schémas génétiques parfaits." },
  { id: 24, studentId: 4, evaluationId: 12, value: 18.0, dateRecorded: "2026-11-25", comments: "Bilingue, félicitations." },

  // Élève Médiocre : Kévin Mercier (Moyenne ~8.2/20)
  { id: 25, studentId: 5, evaluationId: 7, value: 7.5, dateRecorded: "2026-10-15", comments: "Nombreuses fautes de syntaxe, travail superficiel." },
  { id: 26, studentId: 5, evaluationId: 8, value: 8.0, dateRecorded: "2026-10-29", comments: "Théorème de Thalès mal appliqué." },
  { id: 27, studentId: 5, evaluationId: 9, value: 8.5, dateRecorded: "2026-11-05", comments: "Dates non sues, devoir trop court." },
  { id: 28, studentId: 5, evaluationId: 10, value: 9.0, dateRecorded: "2026-11-11", comments: "Attention au respect des consignes de sécurité." },
  { id: 29, studentId: 5, evaluationId: 11, value: 7.0, dateRecorded: "2026-11-18", comments: "Lacunes importantes sur les divisions cellulaires." },
  { id: 30, studentId: 5, evaluationId: 12, value: 9.5, dateRecorded: "2026-11-25", comments: "Quelques bases mais trop d'hésitations." },

  // Élève Moyen : Gabriel Colin (Moyenne ~12.8/20)
  { id: 31, studentId: 6, evaluationId: 7, value: 13.0, dateRecorded: "2026-10-15", comments: "Assez bien." },
  { id: 32, studentId: 6, evaluationId: 8, value: 12.0, dateRecorded: "2026-10-29", comments: "Moyen, peut mieux faire." },
  { id: 33, studentId: 6, evaluationId: 9, value: 14.0, dateRecorded: "2026-11-05", comments: "Bon travail." },
  { id: 34, studentId: 6, evaluationId: 10, value: 12.5, dateRecorded: "2026-11-11", comments: "Convenable." },
  { id: 35, studentId: 6, evaluationId: 11, value: 13.0, dateRecorded: "2026-11-18", comments: "Satisfaisant." },
  { id: 36, studentId: 6, evaluationId: 12, value: 12.0, dateRecorded: "2026-11-25", comments: "Passable." },

  // ==========================================
  // NOTES TS1 (SECONDAIRE - LYCÉE)
  // ==========================================
  // Élève Bon : Chloé Mercier (Moyenne ~18.5/20)
  { id: 37, studentId: 7, evaluationId: 13, value: 19.5, dateRecorded: "2026-10-11", comments: "Copie modèle. Démonstrations d'une rigueur absolue." },
  { id: 38, studentId: 7, evaluationId: 14, value: 18.5, dateRecorded: "2026-10-19", comments: "Calculs différentiels parfaits." },
  { id: 39, studentId: 7, evaluationId: 15, value: 17.5, dateRecorded: "2026-10-31", comments: "Excellent raisonnement scientifique." },
  { id: 40, studentId: 7, evaluationId: 16, value: 17.0, dateRecorded: "2026-11-16", comments: "Pensée philosophique mature et argumentée." },
  { id: 41, studentId: 7, evaluationId: 17, value: 19.5, dateRecorded: "2026-11-21", comments: "Excellente maîtrise lexicale et grammaticale." },

  // Élève Médiocre : Maxime Roux (Moyenne ~8.6/20)
  { id: 42, studentId: 8, evaluationId: 13, value: 8.5, dateRecorded: "2026-10-11", comments: "Le principe de récurrence est non maîtrisé." },
  { id: 43, studentId: 8, evaluationId: 14, value: 8.0, dateRecorded: "2026-10-19", comments: "Erreurs d'unités et formules méconnues." },
  { id: 44, studentId: 8, evaluationId: 15, value: 9.0, dateRecorded: "2026-10-31", comments: "Raisonnement confus, manque d'approfondissement." },
  { id: 45, studentId: 8, evaluationId: 16, value: 7.5, dateRecorded: "2026-11-16", comments: "Dissertation hors-sujet, pas d'auteurs cités." },
  { id: 46, studentId: 8, evaluationId: 17, value: 10.0, dateRecorded: "2026-11-21", comments: "Tout juste la moyenne." },

  // Élève Bon : Lucas Dupont
  { id: 47, studentId: 9, evaluationId: 13, value: 17.0, dateRecorded: "2026-10-11", comments: "Très bien." },
  { id: 48, studentId: 9, evaluationId: 14, value: 16.5, dateRecorded: "2026-10-19", comments: "Très bon travail." },
  { id: 49, studentId: 9, evaluationId: 15, value: 16.0, dateRecorded: "2026-10-31", comments: "Bien." },
  { id: 50, studentId: 9, evaluationId: 16, value: 15.0, dateRecorded: "2026-11-16", comments: "Bonne réflexion." },
  { id: 51, studentId: 9, evaluationId: 17, value: 17.5, dateRecorded: "2026-11-21", comments: "Très fluide." },

  // ==========================================
  // NOTES L1-INFO (SUPÉRIEUR - UNIVERSITÉ)
  // ==========================================
  // Élève Bon : Yassine Benali (Moyenne ~17.1/20, 30/30 ECTS Validés)
  { id: 52, studentId: 11, evaluationId: 18, value: 18.0, dateRecorded: "2026-10-26", comments: "Code Python élégant, complexité optimale en O(n log n)." },
  { id: 53, studentId: 11, evaluationId: 19, value: 16.5, dateRecorded: "2026-11-03", comments: "Excellente résolution des systèmes matriciels." },
  { id: 54, studentId: 11, evaluationId: 20, value: 17.0, dateRecorded: "2026-11-15", comments: "Scripts Bash robustes et bien documentés." },
  { id: 55, studentId: 11, evaluationId: 21, value: 17.5, dateRecorded: "2026-11-23", comments: "Modélisation relationnelle en 3FN impeccable." },
  { id: 56, studentId: 11, evaluationId: 22, value: 16.5, dateRecorded: "2026-11-29", comments: "Architecture API REST exemplaire." },
  { id: 57, studentId: 11, evaluationId: 23, value: 17.0, dateRecorded: "2026-12-06", comments: "Technical documentation in flawless English." },

  // Élève Médiocre : Hugo Lemaire (Moyenne ~7.7/20, 0 ECTS, Ajourné)
  { id: 58, studentId: 12, evaluationId: 18, value: 7.0, dateRecorded: "2026-10-26", comments: "Code ne compilant pas, boucles infinies et erreurs d'indentation." },
  { id: 59, studentId: 12, evaluationId: 19, value: 8.5, dateRecorded: "2026-11-03", comments: "Incompréhension des applications linéaires." },
  { id: 60, studentId: 12, evaluationId: 20, value: 6.5, dateRecorded: "2026-11-15", comments: "Projet non terminé, gestion des processus inexistante." },
  { id: 61, studentId: 12, evaluationId: 21, value: 9.0, dateRecorded: "2026-11-23", comments: "Jointures SQL erronées et contraintes d'intégrité oubliées." },
  { id: 62, studentId: 12, evaluationId: 22, value: 7.5, dateRecorded: "2026-11-29", comments: "Nombreux bugs et failles de sécurité dans le code." },
  { id: 63, studentId: 12, evaluationId: 23, value: 8.0, dateRecorded: "2026-12-06", comments: "Vocabulaire informatique trop approximatif." },

  // Élève Moyen : Inès Diallo (Moyenne ~14.8/20, 30/30 ECTS Validés)
  { id: 64, studentId: 13, evaluationId: 18, value: 15.0, dateRecorded: "2026-10-26", comments: "Bonne compréhension algorithmique." },
  { id: 65, studentId: 13, evaluationId: 19, value: 14.5, dateRecorded: "2026-11-03", comments: "Régulière." },
  { id: 66, studentId: 13, evaluationId: 20, value: 14.0, dateRecorded: "2026-11-15", comments: "Bon projet." },
  { id: 67, studentId: 13, evaluationId: 21, value: 15.5, dateRecorded: "2026-11-23", comments: "Très bien." },
  { id: 68, studentId: 13, evaluationId: 22, value: 15.0, dateRecorded: "2026-11-29", comments: "Interface réactive." },
  { id: 69, studentId: 13, evaluationId: 23, value: 14.5, dateRecorded: "2026-12-06", comments: "Bonne présentation." }
];
