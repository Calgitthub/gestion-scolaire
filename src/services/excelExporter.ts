import * as XLSX from 'xlsx';
import { Student, ClassRoom, StudentCalculation } from '../types';

export function exportStudentsToExcel(students: Student[], classes: ClassRoom[], classFilterId?: number): void {
  const classMap = new Map<number, ClassRoom>();
  classes.forEach(c => classMap.set(c.id, c));

  const filtered = classFilterId ? students.filter(s => s.classId === classFilterId) : students;

  const data = filtered.map((s, idx) => ({
    'N°': idx + 1,
    'Matricule': s.matricule,
    'Nom': s.lastName.toUpperCase(),
    'Prénom': s.firstName,
    'Sexe': s.gender === 'M' ? 'Masculin' : 'Féminin',
    'Date de Naissance': s.birthDate,
    'Classe / Filière': classMap.get(s.classId)?.name || '-',
    'Téléphone': s.phone || '-',
    'Adresse E-mail': s.email || '-',
    'Adresse Postale': s.address || '-',
    'Date d\'Inscription': s.enrollmentDate
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Étudiants');

  // Ajuster la largeur des colonnes
  worksheet['!cols'] = [
    { wch: 6 },
    { wch: 16 },
    { wch: 18 },
    { wch: 18 },
    { wch: 12 },
    { wch: 16 },
    { wch: 28 },
    { wch: 16 },
    { wch: 28 },
    { wch: 30 },
    { wch: 16 }
  ];

  XLSX.writeFile(workbook, `EduGest_Liste_Etudiants_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

export function exportRankingsToExcel(rankings: StudentCalculation[], className: string): void {
  const data = rankings.map(r => ({
    'Rang': r.rankStr || '-',
    'Matricule': r.student.matricule,
    'Nom & Prénom': `${r.student.lastName.toUpperCase()} ${r.student.firstName}`,
    'Classe': className,
    'Total Coefficients': r.totalCoefficients,
    'Moyenne Générale /20': r.overallAverage !== null ? r.overallAverage.toFixed(2) : 'N/A',
    'Mention Obtenue': r.mention,
    'Décision': r.status
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Classement');

  worksheet['!cols'] = [
    { wch: 10 },
    { wch: 16 },
    { wch: 28 },
    { wch: 24 },
    { wch: 18 },
    { wch: 20 },
    { wch: 16 },
    { wch: 14 }
  ];

  XLSX.writeFile(workbook, `EduGest_Resultats_${className.replace(/\s+/g, '_')}.xlsx`);
}
