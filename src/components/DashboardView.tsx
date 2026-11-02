import React, { useState, useMemo } from 'react';
import {
  Users,
  BookOpen,
  ClipboardCheck,
  Award,
  CheckCircle2,
  XCircle,
  TrendingUp,
  BarChart3,
  PieChart as PieChartIcon,
  ChevronRight,
  GraduationCap,
  Sparkles,
  AlertTriangle
} from 'lucide-react';
import { Student, ClassRoom, Subject, Evaluation, Grade, AcademicCycle } from '../types';
import { calculateClassRankings, getClassStatistics } from '../services/calculations';

interface DashboardViewProps {
  students: Student[];
  classes: ClassRoom[];
  subjects: Subject[];
  evaluations: Evaluation[];
  grades: Grade[];
  onNavigate: (tab: any) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  students,
  classes,
  subjects,
  evaluations,
  grades,
  onNavigate
}) => {
  const [selectedCycle, setSelectedCycle] = useState<AcademicCycle | 'all'>('all');

  // Filtrer les classes selon le cycle sélectionné
  const filteredClasses = useMemo(() => {
    if (selectedCycle === 'all') return classes;
    return classes.filter(c => c.cycle === selectedCycle);
  }, [classes, selectedCycle]);

  // Calcul des statistiques globales sur l'ensemble des classes filtrées
  const stats = useMemo(() => {
    let allCalculations: any[] = [];
    filteredClasses.forEach(c => {
      const classRankings = calculateClassRankings(c.id, students, classes, subjects, evaluations, grades);
      allCalculations.push(...classRankings);
    });

    const evaluated = allCalculations.filter(r => r.overallAverage !== null);
    const averages = evaluated.map(r => r.overallAverage as number);

    const activeStudents = students.filter(s =>
      filteredClasses.some(c => c.id === s.classId)
    );
    const activeSubjects = subjects.filter(s =>
      filteredClasses.some(c => c.id === s.classId)
    );
    const activeGrades = grades.filter(g =>
      activeStudents.some(s => s.id === g.studentId)
    );

    const totalStudents = activeStudents.length;
    const evaluatedStudents = evaluated.length;
    const sumAvg = averages.reduce((a, b) => a + b, 0);
    const overallAvg = averages.length > 0 ? Math.round((sumAvg / averages.length) * 100) / 100 : 0;
    const passedCount = averages.filter(a => a >= 10.0).length;
    const failedCount = evaluatedStudents - passedCount;
    const successRate = evaluatedStudents > 0 ? Math.round((passedCount / evaluatedStudents) * 1000) / 10 : 0;

    // Distribution des mentions
    const mentionsCount = {
      tresBien: averages.filter(a => a >= 16.0).length,
      bien: averages.filter(a => a >= 14.0 && a < 16.0).length,
      assezBien: averages.filter(a => a >= 12.0 && a < 14.0).length,
      passable: averages.filter(a => a >= 10.0 && a < 12.0).length,
      insuffisant: averages.filter(a => a < 10.0).length,
    };

    // Top 5 étudiants généraux
    const topStudents = [...evaluated]
      .sort((a, b) => b.overallAverage - a.overallAverage)
      .slice(0, 5);

    return {
      totalStudents,
      totalSubjects: activeSubjects.length,
      totalGrades: activeGrades.length,
      evaluatedStudents,
      overallAvg,
      passedCount,
      failedCount,
      successRate,
      mentionsCount,
      topStudents,
      allCalculations
    };
  }, [students, classes, subjects, evaluations, grades, filteredClasses]);

  return (
    <div className="space-y-6">
      {/* Page Title & Cycle Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Tableau de Bord Multi-Niveaux</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Suivi académique unifié : Cours Primaires, Secondaires et Supérieurs avec profils types.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onNavigate('averages')}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-sm font-semibold shadow-xs transition-colors"
          >
            <TrendingUp className="w-4 h-4" />
            <span>Consulter les Résultats</span>
          </button>
        </div>
      </div>

      {/* Cycle Selector Filter Tabs */}
      <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-xs flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold text-slate-500 px-3 uppercase tracking-wider">Filtrer par Cycle :</span>
        {[
          { id: 'all' as const, label: 'Tous les Cycles', icon: GraduationCap },
          { id: 'primaire' as const, label: '🏫 Cours Primaire (CM2)', icon: BookOpen },
          { id: 'secondaire' as const, label: '🎓 Secondaire (Collège & Lycée)', icon: Award },
          { id: 'superieur' as const, label: '🏛️ Enseignement Supérieur (L1 LMD)', icon: Users },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setSelectedCycle(tab.id)}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              selectedCycle === tab.id
                ? 'bg-blue-700 text-white shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* 6 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Total Étudiants */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:border-blue-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Effectif Inscrits</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-slate-900">{stats.totalStudents}</div>
          <div className="text-[11px] text-slate-400 mt-1 font-medium">Élèves & Étudiants</div>
        </div>

        {/* Matières */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:border-blue-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Matières / UE</span>
            <BookOpen className="w-4 h-4 text-sky-600" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-slate-900">{stats.totalSubjects}</div>
          <div className="text-[11px] text-slate-400 mt-1 font-medium">Cours au programme</div>
        </div>

        {/* Notes enregistrées */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:border-blue-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Notes Saisies</span>
            <ClipboardCheck className="w-4 h-4 text-teal-600" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-slate-900">{stats.totalGrades}</div>
          <div className="text-[11px] text-slate-400 mt-1 font-medium">Évaluations notées</div>
        </div>

        {/* Moyenne Générale */}
        <div className="bg-white p-4 rounded-xl border border-blue-200/80 shadow-xs bg-gradient-to-br from-white to-blue-50/40 hover:border-blue-400 transition-all">
          <div className="flex items-center justify-between text-blue-900 text-xs font-semibold">
            <span>Moyenne Générale</span>
            <Award className="w-4 h-4 text-blue-700" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-blue-700">
            {stats.overallAvg.toFixed(2)} <span className="text-sm font-medium text-blue-500">/20</span>
          </div>
          <div className="text-[11px] text-blue-600 mt-1 font-medium">Moyenne du cycle</div>
        </div>

        {/* Admis */}
        <div className="bg-white p-4 rounded-xl border border-emerald-200/80 shadow-xs bg-gradient-to-br from-white to-emerald-50/30 hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between text-emerald-800 text-xs font-semibold">
            <span>Apprenants Admis</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-emerald-600">{stats.passedCount}</div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-1">
            {stats.successRate}% de réussite
          </div>
        </div>

        {/* Ajournés */}
        <div className="bg-white p-4 rounded-xl border border-red-200/80 shadow-xs bg-gradient-to-br from-white to-red-50/30 hover:border-red-300 transition-all">
          <div className="flex items-center justify-between text-red-800 text-xs font-semibold">
            <span>Ajournés (&lt; 10)</span>
            <XCircle className="w-4 h-4 text-red-600" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-red-600">{stats.failedCount}</div>
          <div className="text-[11px] text-red-500 font-medium mt-1">Soutien / Rattrapage</div>
        </div>
      </div>

      {/* Profils Types : Synthèse Élève Bon vs Élève Médiocre par Classe */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-blue-700" />
            <h3 className="font-bold text-slate-800 text-sm">
              Analyse Comparative : Profils d'Élèves Bons vs Médiocres par Niveau
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-medium">Données de démonstration calibrées</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredClasses.map(c => {
            const classRankings = calculateClassRankings(c.id, students, classes, subjects, evaluations, grades);
            const good = classRankings.find(r => r.student.isGoodStudent === true);
            const mediocre = classRankings.find(r => r.student.isGoodStudent === false);

            return (
              <div key={c.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-extrabold text-blue-800 bg-blue-100/60 px-2 py-0.5 rounded">
                    {c.code}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">{c.cycle}</span>
                </div>
                <div className="font-bold text-xs text-slate-800 truncate">{c.name}</div>

                {/* Élève Bon */}
                {good && (
                  <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200/80 text-xs space-y-1">
                    <div className="flex items-center justify-between font-bold text-emerald-900">
                      <span className="truncate">🌟 {good.student.firstName} (Bon)</span>
                      <span className="text-emerald-700">{good.overallAverage?.toFixed(2)}/20</span>
                    </div>
                    <div className="text-[11px] text-emerald-700 font-medium">{good.mention} • {good.rankStr}</div>
                  </div>
                )}

                {/* Élève Médiocre */}
                {mediocre && (
                  <div className="p-2.5 rounded-lg bg-red-50 border border-red-200/80 text-xs space-y-1">
                    <div className="flex items-center justify-between font-bold text-red-900">
                      <span className="truncate">⚠️ {mediocre.student.firstName} (Médiocre)</span>
                      <span className="text-red-700">{mediocre.overallAverage?.toFixed(2)}/20</span>
                    </div>
                    <div className="text-[11px] text-red-700 font-medium">{mediocre.mention} • {mediocre.rankStr}</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Section Graphiques Statistiques & Top Majors */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Graphique: Répartition par mention (Bar Chart) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-blue-600" />
              <h3 className="font-bold text-slate-800 text-sm">Distribution des Résultats par Mention Académique</h3>
            </div>
            <span className="text-xs text-slate-400 font-medium">{stats.evaluatedStudents} apprenants évalués</span>
          </div>

          <div className="mt-6 space-y-4">
            {[
              { label: 'Très bien (16 à 20)', count: stats.mentionsCount.tresBien, color: 'bg-emerald-500' },
              { label: 'Bien (14 à 15,99)', count: stats.mentionsCount.bien, color: 'bg-blue-600' },
              { label: 'Assez bien (12 à 13,99)', count: stats.mentionsCount.assezBien, color: 'bg-teal-500' },
              { label: 'Passable (10 à 11,99)', count: stats.mentionsCount.passable, color: 'bg-amber-500' },
              { label: 'Insuffisant (< 10,00)', count: stats.mentionsCount.insuffisant, color: 'bg-red-500' },
            ].map(item => {
              const pct = stats.evaluatedStudents > 0 ? (item.count / stats.evaluatedStudents) * 100 : 0;
              return (
                <div key={item.label} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-700">{item.label}</span>
                    <span className="font-bold text-slate-900">
                      {item.count} élève{item.count > 1 ? 's' : ''} ({pct.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="h-3.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
                    <div
                      className={`h-full ${item.color} rounded-full transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Pondération par coefficients ou crédits ECTS selon le cycle</span>
            <button
              onClick={() => onNavigate('grades')}
              className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
            >
              <span>Saisir une note</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Taux d'Admission (Donut Chart SVG) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 pb-4 border-b border-slate-100">
              <PieChartIcon className="w-4 h-4 text-emerald-600" />
              <h3 className="font-bold text-slate-800 text-sm">Taux Global d'Admission</h3>
            </div>

            <div className="mt-6 flex flex-col items-center justify-center">
              <div className="relative w-44 h-44 flex items-center justify-center">
                <svg viewBox="0 0 36 36" className="w-44 h-44 transform -rotate-90">
                  <path
                    className="text-slate-100"
                    strokeWidth="4"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-emerald-500 transition-all duration-700"
                    strokeDasharray={`${stats.successRate}, 100`}
                    strokeWidth="4.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>

                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-3xl font-black text-slate-800">{stats.successRate}%</span>
                  <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider">
                    Taux Admis
                  </span>
                </div>
              </div>

              <div className="w-full mt-6 grid grid-cols-2 gap-3 text-center">
                <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-100">
                  <div className="text-xs font-semibold text-emerald-800">Admis (≥ 10)</div>
                  <div className="text-lg font-bold text-emerald-700">{stats.passedCount}</div>
                </div>
                <div className="p-2.5 rounded-lg bg-red-50 border border-red-100">
                  <div className="text-xs font-semibold text-red-800">Ajournés (&lt; 10)</div>
                  <div className="text-lg font-bold text-red-700">{stats.failedCount}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-center">
            <span className="text-xs text-slate-400">Total : {stats.evaluatedStudents} apprenants évalués</span>
          </div>
        </div>
      </div>
    </div>
  );
};
