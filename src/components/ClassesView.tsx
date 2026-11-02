import React, { useState, useMemo } from 'react';
import { GraduationCap, Plus, Users, BookOpen, AlertCircle, X, Award, CheckCircle2 } from 'lucide-react';
import { ClassRoom, Student, Subject, User, AcademicCycle } from '../types';

interface ClassesViewProps {
  classes: ClassRoom[];
  students: Student[];
  subjects: Subject[];
  currentUser: User;
  onAddClass: (newClass: Omit<ClassRoom, 'id'>) => void;
}

export const ClassesView: React.FC<ClassesViewProps> = ({
  classes,
  students,
  subjects,
  currentUser,
  onAddClass
}) => {
  const [selectedCycle, setSelectedCycle] = useState<'all' | AcademicCycle>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [cycle, setCycle] = useState<AcademicCycle>('secondaire');
  const [level, setLevel] = useState('Lycée - Terminale');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const filteredClasses = useMemo(() => {
    if (selectedCycle === 'all') return classes;
    return classes.filter(c => c.cycle === selectedCycle);
  }, [classes, selectedCycle]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!code.trim() || !name.trim()) {
      setError('Le code et le nom de la classe sont obligatoires.');
      return;
    }

    if (classes.some(c => c.code.toLowerCase() === code.trim().toLowerCase())) {
      setError(`Le code de classe "${code.toUpperCase()}" existe déjà.`);
      return;
    }

    const cycleLabel =
      cycle === 'primaire'
        ? 'Enseignement Primaire'
        : cycle === 'superieur'
        ? 'Enseignement Supérieur (LMD)'
        : 'Enseignement Secondaire';

    onAddClass({
      code: code.trim().toUpperCase(),
      name: name.trim(),
      cycle: cycle,
      cycleLabel: cycleLabel,
      level: level.trim(),
      description: description.trim()
    });

    setIsModalOpen(false);
    setCode('');
    setName('');
    setDescription('');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Classes & Filières Multi-Niveaux</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Structure pédagogique couvrant l'Enseignement Primaire, Secondaire et Supérieur ({classes.length} classes).
          </p>
        </div>
        {currentUser.role === 'admin' && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter une Classe</span>
          </button>
        )}
      </div>

      {/* Cycle Filter Bar */}
      <div className="flex flex-wrap items-center gap-2 bg-white p-3 rounded-xl border border-slate-200/80 shadow-xs">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider px-2">Cycle d'enseignement :</span>
        <button
          onClick={() => setSelectedCycle('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            selectedCycle === 'all'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Tous les cycles ({classes.length})
        </button>
        <button
          onClick={() => setSelectedCycle('primaire')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 ${
            selectedCycle === 'primaire'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
          }`}
        >
          <span>🏫 Primaire</span>
          <span className="text-[10px] opacity-80">({classes.filter(c => c.cycle === 'primaire').length})</span>
        </button>
        <button
          onClick={() => setSelectedCycle('secondaire')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 ${
            selectedCycle === 'secondaire'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100'
          }`}
        >
          <span>🎓 Secondaire</span>
          <span className="text-[10px] opacity-80">({classes.filter(c => c.cycle === 'secondaire').length})</span>
        </button>
        <button
          onClick={() => setSelectedCycle('superieur')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 ${
            selectedCycle === 'superieur'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'bg-purple-50 text-purple-800 border border-purple-200 hover:bg-purple-100'
          }`}
        >
          <span>🏛️ Supérieur (LMD)</span>
          <span className="text-[10px] opacity-80">({classes.filter(c => c.cycle === 'superieur').length})</span>
        </button>
      </div>

      {/* Classes Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredClasses.map(c => {
          const classStudents = students.filter(s => s.classId === c.id);
          const classSubjects = subjects.filter(s => s.classId === c.id);
          const goodStudent = classStudents.find(s => s.isGoodStudent === true);
          const mediStudent = classStudents.find(s => s.isGoodStudent === false);

          const cycleBadge =
            c.cycle === 'primaire' ? (
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                🏫 Primaire
              </span>
            ) : c.cycle === 'superieur' ? (
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                🏛️ Supérieur (LMD)
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                🎓 Secondaire
              </span>
            );

          return (
            <div
              key={c.id}
              className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-md text-xs font-extrabold bg-blue-50 text-blue-700 border border-blue-200/60 font-mono">
                    {c.code}
                  </span>
                  {cycleBadge}
                </div>

                <h3 className="text-base font-bold text-slate-900 mt-3">{c.name}</h3>
                <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded inline-block mt-1">
                  {c.level}
                </span>
                <p className="text-xs text-slate-500 mt-2 line-clamp-2">
                  {c.description || "Filière d'études académiques."}
                </p>

                {/* Profils Élèves Enregistrés (Bon / Médiocre) */}
                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Profils enregistrés :
                  </div>
                  <div className="flex items-center justify-between text-xs bg-emerald-50/70 text-emerald-800 px-2.5 py-1 rounded border border-emerald-200/60">
                    <span className="font-semibold flex items-center space-x-1">
                      <span>🌟 Bon élève :</span>
                    </span>
                    <span className="font-bold">
                      {goodStudent ? `${goodStudent.firstName} ${goodStudent.lastName}` : 'Non assigné'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs bg-amber-50/70 text-amber-800 px-2.5 py-1 rounded border border-amber-200/60">
                    <span className="font-semibold flex items-center space-x-1">
                      <span>⚠️ En difficulté :</span>
                    </span>
                    <span className="font-bold">
                      {mediStudent ? `${mediStudent.firstName} ${mediStudent.lastName}` : 'Non assigné'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 grid grid-cols-2 gap-3 text-center">
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="flex items-center justify-center space-x-1 text-slate-400 text-xs mb-0.5">
                    <Users className="w-3.5 h-3.5" />
                    <span>Inscrits</span>
                  </div>
                  <div className="text-lg font-bold text-slate-800">{classStudents.length}</div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="flex items-center justify-center space-x-1 text-slate-400 text-xs mb-0.5">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Matières / UE</span>
                  </div>
                  <div className="text-lg font-bold text-slate-800">{classSubjects.length}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Ajout Classe */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">Créer une Nouvelle Classe ou Filière</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Cycle Pédagogique */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Cycle d'enseignement *</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCycle('primaire');
                      setLevel('École Élémentaire (CM2)');
                    }}
                    className={`py-2 px-2 rounded-lg text-xs font-bold border text-center transition-all ${
                      cycle === 'primaire'
                        ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    🏫 Primaire
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCycle('secondaire');
                      setLevel('Lycée - Terminale');
                    }}
                    className={`py-2 px-2 rounded-lg text-xs font-bold border text-center transition-all ${
                      cycle === 'secondaire'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    🎓 Secondaire
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCycle('superieur');
                      setLevel('Licence 1 (L1)');
                    }}
                    className={`py-2 px-2 rounded-lg text-xs font-bold border text-center transition-all ${
                      cycle === 'superieur'
                        ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    🏛️ Supérieur
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Code de la classe *</label>
                <input
                  type="text"
                  required
                  placeholder="ex: CM2-B, 3EME-C, L2-ECO..."
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-xs font-mono font-bold uppercase focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Intitulé complet *</label>
                <input
                  type="text"
                  required
                  placeholder="ex: CM2 Bilingue, Terminale S, Licence Informatique..."
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Niveau d'études *</label>
                <input
                  type="text"
                  required
                  value={level}
                  onChange={e => setLevel(e.target.value)}
                  placeholder="ex: Collège (3ème), Lycée (Terminale), Université (L1)"
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description pédagogique</label>
                <textarea
                  rows={2}
                  placeholder="Objectifs, spécialités et cursus..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold shadow-xs"
                >
                  Créer la classe
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
