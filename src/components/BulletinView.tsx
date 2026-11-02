import React, { useState, useMemo } from 'react';
import {
  FileText,
  Download,
  Printer,
  ChevronDown,
  Award,
  CheckCircle2,
  Calendar,
  School,
  User as UserIcon,
  Sparkles,
  AlertTriangle,
  GraduationCap,
  BookOpen
} from 'lucide-react';
import { Student, ClassRoom, Subject, Evaluation, Grade, SchoolConfig } from '../types';
import { calculateStudentPerformance, calculateClassRankings, getClassStatistics } from '../services/calculations';
import { generateBulletinPDF } from '../services/pdfExporter';

interface BulletinViewProps {
  students: Student[];
  classes: ClassRoom[];
  subjects: Subject[];
  evaluations: Evaluation[];
  grades: Grade[];
  schoolConfig: SchoolConfig;
  preselectedStudentId?: number;
}

export const BulletinView: React.FC<BulletinViewProps> = ({
  students,
  classes,
  subjects,
  evaluations,
  grades,
  schoolConfig,
  preselectedStudentId
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState<number>(
    preselectedStudentId || students[0]?.id || 1
  );
  const [selectedPeriod, setSelectedPeriod] = useState<string>('1er Trimestre');

  const currentStudent = useMemo(() => {
    return students.find(s => s.id === selectedStudentId) || students[0];
  }, [students, selectedStudentId]);

  const currentClass = useMemo(() => {
    if (!currentStudent) return classes[0];
    return classes.find(c => c.id === currentStudent.classId) || classes[0];
  }, [classes, currentStudent]);

  // Étudiants de la même classe pour les boutons de comparaison Bon vs Médiocre
  const classmates = useMemo(() => {
    if (!currentClass) return [];
    return students.filter(s => s.classId === currentClass.id);
  }, [students, currentClass]);

  const goodStudentInClass = useMemo(() => {
    return classmates.find(s => s.isGoodStudent === true);
  }, [classmates]);

  const mediocreStudentInClass = useMemo(() => {
    return classmates.find(s => s.isGoodStudent === false);
  }, [classmates]);

  // Calcul du bulletin de l'élève
  const studentCalc = useMemo(() => {
    if (!currentStudent || !currentClass) return null;
    return calculateStudentPerformance(currentStudent, currentClass, subjects, evaluations, grades);
  }, [currentStudent, currentClass, subjects, evaluations, grades]);

  // Rang de l'élève dans sa classe
  const classRankings = useMemo(() => {
    if (!currentClass) return [];
    return calculateClassRankings(currentClass.id, students, classes, subjects, evaluations, grades);
  }, [currentClass, students, classes, subjects, evaluations, grades]);

  const currentRankInfo = useMemo(() => {
    if (!studentCalc) return { rankStr: '-', classAvg: 0 };
    const found = classRankings.find(r => r.student.id === currentStudent?.id);
    const stats = getClassStatistics(classRankings);
    return {
      rankStr: found?.rankStr || '-',
      classAvg: stats.classAverage
    };
  }, [classRankings, studentCalc, currentStudent]);

  const handleDownloadPDF = () => {
    if (!studentCalc) return;
    generateBulletinPDF(
      { ...studentCalc, rankStr: currentRankInfo.rankStr },
      { classAverage: currentRankInfo.classAvg, totalStudents: classRankings.length },
      schoolConfig,
      selectedPeriod
    );
  };

  const handlePrint = () => {
    window.print();
  };

  if (!currentStudent || !studentCalc) {
    return (
      <div className="bg-white p-12 rounded-xl text-center text-slate-400">
        Veuillez d'abord enregistrer un étudiant pour afficher son bulletin.
      </div>
    );
  }

  const cycle = currentClass.cycle;

  return (
    <div className="space-y-6">
      {/* Top Action Bar (hidden on print) */}
      <div className="print:hidden flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Générateur de Bulletins & Livrets Scolaires</span>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                cycle === 'primaire'
                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                  : cycle === 'superieur'
                  ? 'bg-purple-100 text-purple-800 border border-purple-200'
                  : 'bg-blue-100 text-blue-800 border border-blue-200'
              }`}
            >
              Niveau : {currentClass.cycleLabel}
            </span>
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Édition officielle adaptée au cycle ({cycle === 'primaire' ? 'Primaire' : cycle === 'superieur' ? 'Supérieur (LMD/ECTS)' : 'Secondaire Collège/Lycée'}).
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={handlePrint}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-300 transition-colors shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimer</span>
          </button>
          <button
            onClick={handleDownloadPDF}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Télécharger le Bulletin (PDF)</span>
          </button>
        </div>
      </div>

      {/* Selectors Bar (hidden on print) */}
      <div className="print:hidden bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Sélectionner l'élève :
            </label>
            <select
              value={selectedStudentId}
              onChange={e => setSelectedStudentId(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-bold text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              {students.map(s => {
                const c = classes.find(cl => cl.id === s.classId);
                const roleTag = s.isGoodStudent === true ? '⭐ Bon' : s.isGoodStudent === false ? '⚠️ Médiocre' : 'Élève';
                return (
                  <option key={s.id} value={s.id}>
                    [{c?.code}] {s.lastName.toUpperCase()} {s.firstName} ({roleTag}) - {c?.name}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="w-full sm:w-56">
            <label className="block text-xs font-bold text-slate-700 mb-1">Période académique :</label>
            <select
              value={selectedPeriod}
              onChange={e => setSelectedPeriod(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="1er Trimestre">1er Trimestre</option>
              <option value="2ème Trimestre">2ème Trimestre</option>
              <option value="3ème Trimestre">3ème Trimestre</option>
              <option value="1er Semestre">1er Semestre</option>
              <option value="2ème Semestre">2ème Semestre</option>
            </select>
          </div>
        </div>

        {/* Raccourcis de comparaison immédiate : Élève Bon vs Élève Médiocre dans cette classe */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="font-semibold text-slate-500">
            Comparaison des profils dans la classe <span className="font-bold text-slate-800">{currentClass.name}</span> :
          </span>

          <div className="flex items-center space-x-2">
            {goodStudentInClass && (
              <button
                onClick={() => setSelectedStudentId(goodStudentInClass.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-bold border transition-all ${
                  selectedStudentId === goodStudentInClass.id
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                }`}
              >
                <span>🌟 Élève Bon : {goodStudentInClass.firstName}</span>
              </button>
            )}

            {mediocreStudentInClass && (
              <button
                onClick={() => setSelectedStudentId(mediocreStudentInClass.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-bold border transition-all ${
                  selectedStudentId === mediocreStudentInClass.id
                    ? 'bg-red-600 text-white border-red-600 shadow-xs'
                    : 'bg-red-50 text-red-800 border-red-200 hover:bg-red-100'
                }`}
              >
                <span>⚠️ Élève Médiocre : {mediocreStudentInClass.firstName}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* RENDERED OFFICIAL REPORT CARD (Printed layout) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-md p-8 md:p-12 max-w-4xl mx-auto print:border-none print:shadow-none print:p-0 print:max-w-none">
        {/* Official Header */}
        <div className="border-b-2 border-slate-900 pb-5 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-blue-900 font-black text-lg tracking-wide uppercase">
              <School className="w-5 h-5 text-blue-700 shrink-0" />
              <span>{schoolConfig.name}</span>
            </div>
            <div className="text-xs text-slate-500 mt-1 space-y-0.5">
              <div>{schoolConfig.address}</div>
              <div>Tél : {schoolConfig.phone} • Email : {schoolConfig.email}</div>
            </div>
          </div>

          <div className="sm:text-right bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div className="text-sm font-black text-blue-950 uppercase tracking-wider">
              {cycle === 'primaire'
                ? 'LIVRET SCOLAIRE PÉRIODIQUE'
                : cycle === 'superieur'
                ? 'RELEVÉ DE NOTES & CRÉDITS ECTS'
                : 'BULLETIN OFFICIEL DE NOTES'}
            </div>
            <div className="text-xs font-bold text-blue-700 mt-0.5">
              {selectedPeriod} • Année {schoolConfig.academicYear}
            </div>
            <div className="text-[11px] text-slate-500 font-semibold mt-0.5">
              Filière : {currentClass.cycleLabel}
            </div>
          </div>
        </div>

        {/* Student Metadata Card with Profile Badge */}
        <div className="my-6 p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <span className="text-slate-400 font-medium block">Nom & Prénom</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="font-bold text-sm text-slate-900">
                {currentStudent.lastName.toUpperCase()} {currentStudent.firstName}
              </span>
              {currentStudent.isGoodStudent === true ? (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Élève Bon
                </span>
              ) : currentStudent.isGoodStudent === false ? (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-red-100 text-red-800 border border-red-300">
                  Élève Médiocre
                </span>
              ) : null}
            </div>
            <span className="text-slate-500 block text-[11px] mt-0.5">
              Sexe : {currentStudent.gender === 'M' ? 'Masculin' : 'Féminin'}
            </span>
          </div>

          <div>
            <span className="text-slate-400 font-medium block">Matricule & Inscription</span>
            <span className="font-mono font-bold text-blue-700 bg-blue-100/60 px-2 py-0.5 rounded text-xs inline-block">
              {currentStudent.matricule}
            </span>
            <span className="text-slate-500 block text-[11px] mt-0.5">
              Né(e) le : {currentStudent.birthDate}
            </span>
          </div>

          <div>
            <span className="text-slate-400 font-medium block">Classe & Cycle</span>
            <span className="font-bold text-slate-800 text-sm">{currentClass.name}</span>
            <span className="text-slate-500 block text-[11px] mt-0.5">
              Niveau : {currentClass.level} • {classRankings.length} élèves
            </span>
          </div>
        </div>

        {/* Table of Subjects & Grades (Cycle-Adaptive) */}
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-2.5 px-3">
                  {cycle === 'superieur'
                    ? 'Unités d\'Enseignement (UE)'
                    : cycle === 'primaire'
                    ? 'Domaines d\'Apprentissage'
                    : 'Matières Enseignées'}
                </th>
                <th className="py-2.5 px-2 text-center">
                  {cycle === 'superieur' ? 'ECTS' : 'Coef'}
                </th>
                <th className="py-2.5 px-3">Notes Obtenues</th>
                <th className="py-2.5 px-3 text-center">Moy. /20</th>
                {cycle === 'superieur' ? (
                  <th className="py-2.5 px-3 text-center">Validation UE</th>
                ) : (
                  <th className="py-2.5 px-3 text-center">Points</th>
                )}
                <th className="py-2.5 px-3">
                  {cycle === 'primaire'
                    ? 'Acquisition des Compétences & Appréciation'
                    : cycle === 'superieur'
                    ? 'Avis du Jury Universitaire'
                    : 'Appréciation du Corps Enseignant'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {studentCalc.subjects.map((item, idx) => (
                <tr key={item.subject.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                  <td className="py-2.5 px-3">
                    <span className="font-bold text-slate-900">{item.subject.name}</span>
                    <span className="text-[10px] text-slate-400 ml-1.5 font-mono">({item.subject.code})</span>
                  </td>
                  <td className="py-2.5 px-2 text-center font-bold text-slate-600">
                    {cycle === 'superieur' ? (
                      <span className="text-purple-700 font-extrabold">{item.subject.ectsCredits || 0}</span>
                    ) : (
                      item.subject.coefficient
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-slate-700 font-mono text-[11px]">
                    {item.hasGrades ? item.grades.map(n => n.toFixed(1)).join(', ') : '-'}
                  </td>
                  <td className="py-2.5 px-3 text-center font-extrabold text-blue-700 text-sm">
                    {item.average !== null ? item.average.toFixed(2) : '-'}
                  </td>

                  {cycle === 'superieur' ? (
                    <td className="py-2.5 px-3 text-center">
                      {item.ectsValidated ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          Validée
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800">
                          Rattrapage
                        </span>
                      )}
                    </td>
                  ) : (
                    <td className="py-2.5 px-3 text-center font-semibold text-slate-700">
                      {item.weightedPoints !== null ? item.weightedPoints.toFixed(2) : '-'}
                    </td>
                  )}

                  <td className="py-2.5 px-3 text-slate-600 text-[11px] italic">
                    {item.appreciation}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Global Performance Summary Card */}
        <div className="mt-6 p-5 rounded-xl bg-blue-50/70 border border-blue-200 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase">
              {cycle === 'superieur' ? 'Crédits ECTS' : 'Total Coefs'}
            </div>
            <div className="text-lg font-black text-slate-800 mt-0.5">
              {cycle === 'superieur'
                ? `${studentCalc.totalEctsEarned || 0} / ${studentCalc.totalEctsPossible || 30}`
                : studentCalc.totalCoefficients}
            </div>
          </div>

          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase">
              {cycle === 'superieur' ? 'Moyenne Semestrielle' : 'Moyenne Générale'}
            </div>
            <div className="text-xl font-black text-blue-700 mt-0.5">
              {studentCalc.overallAverage !== null ? `${studentCalc.overallAverage.toFixed(2)} / 20` : '-'}
            </div>
          </div>

          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase">Rang & Mention</div>
            <div className="text-lg font-black text-teal-700 mt-0.5">{currentRankInfo.rankStr}</div>
            <div className="text-[11px] font-bold text-blue-700">{studentCalc.mention}</div>
          </div>

          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase">Statut d'Admission</div>
            <div className="mt-1">
              {studentCalc.status === 'Admis' ? (
                <span className="inline-block px-3 py-1 rounded-md text-xs font-black bg-emerald-600 text-white shadow-xs">
                  ADMIS(E)
                </span>
              ) : (
                <span className="inline-block px-3 py-1 rounded-md text-xs font-black bg-red-600 text-white shadow-xs">
                  AJOURNÉ(E)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Décision du Conseil / Instituteur / Jury Universitaire */}
        <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
          <div className="font-bold text-slate-800 mb-1 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-blue-700" />
            <span>
              {cycle === 'primaire'
                ? 'Avis Pédagogique & Décision de Passage :'
                : cycle === 'superieur'
                ? 'Décision Officielle du Jury d\'Examen :'
                : 'Avis du Conseil de Classe :'}
            </span>
          </div>
          <div className="font-semibold text-blue-900 pl-5">
            {studentCalc.councilDecision}
          </div>
          <div className="text-slate-500 italic pl-5 mt-1">
            <b>Assiduité & Comportement :</b> {studentCalc.conductAppreciation}
          </div>
        </div>

        {/* Official Signatures Box adapted to cycle */}
        <div className="mt-8 pt-6 border-t border-slate-200 grid grid-cols-2 gap-8 text-center text-xs text-slate-600">
          <div>
            <div className="font-bold text-slate-800">
              {cycle === 'primaire'
                ? 'L\'Instituteur / Enseignant référent'
                : cycle === 'superieur'
                ? 'Le Responsable Pédagogique de Mention'
                : 'Le Professeur Principal'}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Visa & Observations</div>
            <div className="h-16 border-b border-dashed border-slate-300 mt-2 flex items-center justify-center text-slate-300 italic text-[11px]">
              Signature de l'équipe enseignante
            </div>
          </div>

          <div>
            <div className="font-bold text-slate-800">
              {cycle === 'primaire'
                ? 'La Direction de l\'École'
                : cycle === 'superieur'
                ? 'Le Doyen / Président du Jury'
                : 'Le Chef d\'Établissement (Proviseur)'}
            </div>
            <div className="text-[11px] text-slate-500 font-medium mt-0.5">{schoolConfig.directorName}</div>
            <div className="h-16 border-b border-dashed border-slate-300 mt-2 flex items-center justify-center text-slate-300 italic text-[11px]">
              Cachet officiel & Signature
            </div>
          </div>
        </div>

        {/* Legal Disclaimer Footer */}
        <div className="mt-6 text-center text-[10px] text-slate-400">
          Ce document officiel est certifié conforme par la direction des études. Cycle d'enseignement : {currentClass.cycleLabel}.
        </div>
      </div>
    </div>
  );
};
