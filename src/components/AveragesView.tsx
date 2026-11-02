import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Download,
  Award,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ChevronRight,
  Filter
} from 'lucide-react';
import { Student, ClassRoom, Subject, Evaluation, Grade, StudentCalculation } from '../types';
import { calculateClassRankings, getClassStatistics } from '../services/calculations';
import { exportRankingsToExcel } from '../services/excelExporter';

interface AveragesViewProps {
  students: Student[];
  classes: ClassRoom[];
  subjects: Subject[];
  evaluations: Evaluation[];
  grades: Grade[];
  onSelectStudentForBulletin: (studentId: number) => void;
}

export const AveragesView: React.FC<AveragesViewProps> = ({
  students,
  classes,
  subjects,
  evaluations,
  grades,
  onSelectStudentForBulletin
}) => {
  const [selectedClassId, setSelectedClassId] = useState<number>(classes[0]?.id || 1);
  const [statusFilter, setStatusFilter] = useState<'all' | 'Admis' | 'Ajourné'>('all');

  const selectedClass = useMemo(() => classes.find(c => c.id === selectedClassId), [classes, selectedClassId]);

  const rankings = useMemo(() => {
    return calculateClassRankings(selectedClassId, students, classes, subjects, evaluations, grades);
  }, [selectedClassId, students, classes, subjects, evaluations, grades]);

  const classStats = useMemo(() => {
    return getClassStatistics(rankings);
  }, [rankings]);

  const filteredRankings = useMemo(() => {
    if (statusFilter === 'all') return rankings;
    return rankings.filter(r => r.status === statusFilter);
  }, [rankings, statusFilter]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Moyennes Pondérées & Classements</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Calcul automatique en temps réel selon les coefficients officiels et le barème académique.
          </p>
        </div>
        <button
          onClick={() => exportRankingsToExcel(rankings, selectedClass?.name || 'Classe')}
          className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Exporter Synthèse Excel</span>
        </button>
      </div>

      {/* Class Selector & Summary Cards */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <label className="text-xs font-bold text-slate-700">Sélectionner la promotion :</label>
          <select
            value={selectedClassId}
            onChange={e => setSelectedClassId(Number(e.target.value))}
            className="px-3.5 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-bold text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            {classes.map(c => (
              <option key={c.id} value={c.id}>
                {c.cycle === 'primaire' ? '🏫 Primaire' : c.cycle === 'superieur' ? '🏛️ Supérieur' : '🎓 Secondaire'} - {c.name} ({c.code})
              </option>
            ))}
          </select>

          {selectedClass && (
            <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${
              selectedClass.cycle === 'primaire'
                ? 'bg-amber-50 text-amber-800 border-amber-200'
                : selectedClass.cycle === 'superieur'
                ? 'bg-purple-50 text-purple-800 border-purple-200'
                : 'bg-blue-50 text-blue-800 border-blue-200'
            }`}>
              {selectedClass.cycle === 'primaire' && 'Régime Primaire (Compétences)'}
              {selectedClass.cycle === 'secondaire' && 'Régime Secondaire (Coefficients)'}
              {selectedClass.cycle === 'superieur' && 'Régime Universitaire (Crédits LMD ECTS)'}
            </span>
          )}
        </div>

        {/* Status Filter Toggle */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              statusFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tous ({rankings.length})
          </button>
          <button
            onClick={() => setStatusFilter('Admis')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              statusFilter === 'Admis'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            Admis ({classStats.passedCount})
          </button>
          <button
            onClick={() => setStatusFilter('Ajourné')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              statusFilter === 'Ajourné'
                ? 'bg-red-600 text-white'
                : 'bg-red-50 text-red-700 hover:bg-red-100'
            }`}
          >
            Ajournés ({classStats.failedCount})
          </button>
        </div>
      </div>

      {/* Class Statistics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Moyenne de Classe</div>
          <div className="text-xl font-black text-blue-700 mt-1">{classStats.classAverage.toFixed(2)} / 20</div>
        </div>
        <div className="p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Taux de Réussite</div>
          <div className="text-xl font-black text-emerald-600 mt-1">{classStats.successRate}%</div>
        </div>
        <div className="p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Meilleure Moyenne</div>
          <div className="text-xl font-black text-emerald-700 mt-1">{classStats.maxAverage.toFixed(2)} / 20</div>
        </div>
        <div className="p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Note Minimale</div>
          <div className="text-xl font-black text-red-600 mt-1">{classStats.minAverage.toFixed(2)} / 20</div>
        </div>
      </div>

      {/* Rankings Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-900 text-white font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4 text-center">Rang</th>
              <th className="py-3 px-4">Matricule</th>
              <th className="py-3 px-4">Nom de l'Étudiant & Profil</th>
              <th className="py-3 px-4 text-center">
                {selectedClass?.cycle === 'superieur' ? 'Crédits ECTS' : 'Coefs Valides'}
              </th>
              <th className="py-3 px-4 text-center">Moyenne Générale</th>
              <th className="py-3 px-4 text-center">Mention Obtenue</th>
              <th className="py-3 px-4 text-center">Décision / Avis</th>
              <th className="py-3 px-4 text-right">Bulletin</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredRankings.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400 italic">
                  Aucun étudiant dans cette sélection.
                </td>
              </tr>
            ) : (
              filteredRankings.map((calc, idx) => {
                const isFirst = calc.rank === 1;
                const isSup = selectedClass?.cycle === 'superieur';
                return (
                  <tr key={calc.student.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Rang */}
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center justify-center w-7 h-7 rounded-full font-extrabold text-xs ${
                          isFirst
                            ? 'bg-amber-100 text-amber-800 ring-2 ring-amber-400'
                            : calc.rank === 2
                            ? 'bg-slate-200 text-slate-700'
                            : calc.rank === 3
                            ? 'bg-amber-800/20 text-amber-900'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {calc.rankStr}
                      </span>
                    </td>

                    {/* Matricule */}
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-700">
                      {calc.student.matricule}
                    </td>

                    {/* Nom & Profil */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900 text-sm">
                          {calc.student.lastName.toUpperCase()} {calc.student.firstName}
                        </span>
                        {calc.student.isGoodStudent === true && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                            🌟 Bon
                          </span>
                        )}
                        {calc.student.isGoodStudent === false && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-300">
                            ⚠️ Médiocre
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {calc.subjects.filter(s => s.hasGrades).length} / {calc.subjects.length} matières notées
                      </div>
                    </td>

                    {/* Coefs ou ECTS */}
                    <td className="py-3.5 px-4 text-center">
                      {isSup ? (
                        <span className={`inline-block px-2 py-0.5 rounded font-black text-xs ${
                          calc.totalEctsEarned && calc.totalEctsEarned >= 30
                            ? 'bg-purple-100 text-purple-800 border border-purple-300'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {calc.totalEctsEarned ?? 0} / 30 ECTS
                        </span>
                      ) : (
                        <span className="font-bold text-slate-700">
                          {calc.totalCoefficients}
                        </span>
                      )}
                    </td>

                    {/* Moyenne */}
                    <td className="py-3.5 px-4 text-center">
                      {calc.overallAverage !== null ? (
                        <span className="text-base font-extrabold text-blue-700">
                          {calc.overallAverage.toFixed(2)}{' '}
                          <span className="text-xs font-normal text-slate-400">/20</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">En attente</span>
                      )}
                    </td>

                    {/* Mention */}
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold"
                        style={{
                          backgroundColor: `${calc.mentionColor}15`,
                          color: calc.mentionColor,
                          border: `1px solid ${calc.mentionColor}40`
                        }}
                      >
                        {calc.mention}
                      </span>
                    </td>

                    {/* Décision */}
                    <td className="py-3.5 px-4 text-center">
                      {calc.status === 'Admis' ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{calc.councilDecision || 'Admis'}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>{calc.councilDecision || 'Ajourné'}</span>
                        </span>
                      )}
                    </td>

                    {/* Bouton vers Bulletin */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => onSelectStudentForBulletin(calc.student.id)}
                        className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold border border-blue-200 transition-colors"
                      >
                        <span>Bulletin</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Rappel du barème officiel */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-600 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="font-semibold text-slate-700">Barème académique en vigueur :</div>
        <div className="flex flex-wrap gap-2">
          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">16 à 20 : Très bien</span>
          <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">14 à 15,99 : Bien</span>
          <span className="px-2 py-0.5 rounded bg-teal-100 text-teal-800 font-bold">12 à 13,99 : Assez bien</span>
          <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">10 à 11,99 : Passable</span>
          <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 font-bold">&lt; 10 : Insuffisant</span>
        </div>
      </div>
    </div>
  );
};
