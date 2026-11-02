export type Role = 'admin' | 'prof' | 'user';

export type AcademicCycle = 'primaire' | 'secondaire' | 'superieur';

export interface User {
  id: number;
  username: string;
  fullName: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
  assignedClassIds?: number[];   // Classes assignées au professeur
  assignedSubjectIds?: number[]; // Matières enseignées par le professeur
  email?: string;
  phone?: string;
}

export interface ClassRoom {
  id: number;
  code: string;
  name: string;
  level: string; // ex: 'CM2', '3ème', 'Terminale', 'Licence 1'
  cycle: AcademicCycle;
  cycleLabel?: string;
  description?: string;
}

export interface Subject {
  id: number;
  code: string;
  name: string;
  coefficient: number;
  classId: number;
  ectsCredits?: number; // Pour le supérieur (Système LMD)
  domain?: string; // ex: 'Fondamental', 'Sciences', 'Lettres', 'Technologie'
}

export type Gender = 'M' | 'F';

export interface Student {
  id: number;
  matricule: string;
  firstName: string;
  lastName: string;
  gender: Gender;
  birthDate: string; // YYYY-MM-DD
  address?: string;
  phone?: string;
  email?: string;
  classId: number;
  enrollmentDate: string;
  isGoodStudent?: boolean; // Indicateur pour repérer facilement les profils types
}

export type EvaluationType = 'Devoir' | 'Interrogation' | 'Examen' | 'Contrôle Continu' | 'Projet';

export interface Evaluation {
  id: number;
  title: string;
  evalType: EvaluationType;
  date: string; // YYYY-MM-DD
  period: string; // e.g., '1er Semestre' ou '1er Trimestre'
  subjectId: number;
  classId: number;
  maxScore: number; // default 20
}

export interface Grade {
  id: number;
  value: number; // 0.00 to 20.00
  studentId: number;
  evaluationId: number;
  dateRecorded: string;
  comments?: string;
}

export interface SubjectCalculation {
  subject: Subject;
  grades: number[];
  count: number;
  average: number | null;
  weightedPoints: number | null;
  hasGrades: boolean;
  appreciation: string;
  ectsValidated?: boolean; // Pour le supérieur (si moyenne >= 10 ou compensée)
}

export interface StudentCalculation {
  student: Student;
  classroom: ClassRoom;
  subjects: SubjectCalculation[];
  totalCoefficients: number;
  totalWeightedPoints: number;
  overallAverage: number | null;
  mention: string;
  mentionColor: string;
  status: 'Admis' | 'Ajourné' | 'En cours';
  rank?: number;
  rankStr?: string;
  totalEctsEarned?: number; // ECTS pour le supérieur (ex: 30 / 30)
  totalEctsPossible?: number;
  councilDecision?: string; // Décision adaptée au niveau
  conductAppreciation?: string; // Comportement / Assiduité
}

export interface ClassStatistics {
  totalStudents: number;
  evaluatedStudents: number;
  classAverage: number;
  minAverage: number;
  maxAverage: number;
  passedCount: number;
  failedCount: number;
  successRate: number;
}

export interface SchoolConfig {
  name: string;
  academicYear: string;
  address: string;
  phone: string;
  email: string;
  directorName: string;
}
