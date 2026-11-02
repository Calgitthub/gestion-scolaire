import React, { useState, useMemo } from 'react';
import { BookOpen, Plus, Trash2, Edit2, AlertCircle, X } from 'lucide-react';
import { Subject, ClassRoom, User } from '../types';

interface SubjectsViewProps {
  subjects: Subject[];
  classes: ClassRoom[];
  currentUser: User;
  onAddSubject: (subject: Omit<Subject, 'id'>) => void;
  onUpdateSubject: (id: number, subject: Partial<Subject>) => void;
  onDeleteSubject: (id: number) => void;
}

export const SubjectsView: React.FC<SubjectsViewProps> = ({
  subjects,
  classes,
  currentUser,
  onAddSubject,
  onUpdateSubject,
  onDeleteSubject
}) => {
  const [selectedClassId, setSelectedClassId] = useState<number | 'all'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  const [formCode, setFormCode] = useState('');
  const [formName, setFormName] = useState('');
  const [formCoefficient, setFormCoefficient] = useState('2.0');
  const [formEctsCredits, setFormEctsCredits] = useState('5');
  const [formClassId, setFormClassId] = useState<number>(classes[0]?.id || 1);
  const [error, setError] = useState('');

  const targetClass = classes.find(c => c.id === formClassId);
  const isSuperieurClass = targetClass?.cycle === 'superieur';

  const filteredSubjects = useMemo(() => {
    return selectedClassId === 'all'
      ? subjects
      : subjects.filter(s => s.classId === selectedClassId);
  }, [subjects, selectedClassId]);

  const openAddModal = () => {
    setEditingSubject(null);
    setFormCode('');
    setFormName('');
    setFormCoefficient('2.0');
    setFormEctsCredits('5');
    setFormClassId(selectedClassId !== 'all' ? selectedClassId : (classes[0]?.id || 1));
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (s: Subject) => {
    setEditingSubject(s);
    setFormCode(s.code);
    setFormName(s.name);
    setFormCoefficient(s.coefficient.toString());
    setFormEctsCredits(s.ectsCredits ? s.ectsCredits.toString() : '5');
    setFormClassId(s.classId);
    setError('');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const coefNum = parseFloat(formCoefficient.replace(',', '.'));
    if (!formCode.trim() || !formName.trim()) {
      setError('Le code et le nom de la matière sont obligatoires.');
      return;
    }
    if (isNaN(coefNum) || coefNum <= 0) {
      setError('Le coefficient doit être un nombre strictement supérieur à 0.');
      return;
    }

    const ectsNum = isSuperieurClass ? parseInt(formEctsCredits, 10) || 5 : undefined;

    if (editingSubject) {
      onUpdateSubject(editingSubject.id, {
        code: formCode.trim().toUpperCase(),
        name: formName.trim(),
        coefficient: coefNum,
        ectsCredits: ectsNum,
        classId: formClassId
      });
    } else {
      onAddSubject({
        code: formCode.trim().toUpperCase(),
        name: formName.trim(),
        coefficient: coefNum,
        ectsCredits: ectsNum,
        classId: formClassId
      });
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Gestion des Matières & Coefficients</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Paramétrage des programmes d'enseignement, pondérations et coefficients académiques.
          </p>
        </div>
        {currentUser.role === 'admin' && (
          <button
            onClick={openAddModal}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter une Matière</span>
          </button>
        )}
      </div>

      {/* Filter */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-xs font-bold text-slate-700">Filtrer par promotion :</label>
          <select
            value={selectedClassId}
            onChange={e => setSelectedClassId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="all">Toutes les classes</option>
            {classes.map(c => (
              <option key={c.id} value={c.id}>
                {c.cycle === 'primaire' ? '🏫' : c.cycle === 'superieur' ? '🏛️' : '🎓'} {c.name} ({c.code})
              </option>
            ))}
          </select>
        </div>
        <div className="text-xs text-slate-500">
          <span className="font-bold text-slate-800">{filteredSubjects.length}</span> matière(s) répertoriée(s)
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-900 text-white font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4">Code</th>
              <th className="py-3 px-4">Intitulé de la Matière / UE</th>
              <th className="py-3 px-4 text-center">Coefficient</th>
              <th className="py-3 px-4 text-center">Crédits ECTS</th>
              <th className="py-3 px-4">Classe & Cycle</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredSubjects.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400 italic">
                  Aucune matière enregistrée pour cette sélection.
                </td>
              </tr>
            ) : (
              filteredSubjects.map(s => {
                const c = classes.find(cl => cl.id === s.classId);
                const isSup = c?.cycle === 'superieur';
                return (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-700">
                      <span className="bg-blue-50 px-2 py-0.5 rounded border border-blue-200/60">
                        {s.code}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-800 text-sm">
                      {s.name}
                      {isSup && <span className="ml-2 text-[10px] font-semibold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">Unité d'Enseignement</span>}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-black bg-teal-50 text-teal-700 border border-teal-200">
                        x{s.coefficient}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {s.ectsCredits ? (
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
                          {s.ectsCredits} ECTS
                        </span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-600">
                      {c ? (
                        <div className="flex items-center space-x-1.5">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                            c.cycle === 'primaire' ? 'bg-amber-100 text-amber-800' :
                            c.cycle === 'superieur' ? 'bg-purple-100 text-purple-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {c.cycle === 'primaire' ? 'Primaire' : c.cycle === 'superieur' ? 'Supérieur' : 'Secondaire'}
                          </span>
                          <span>{c.name} ({c.code})</span>
                        </div>
                      ) : '-'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => openEditModal(s)}
                          className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 hover:text-blue-700 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {currentUser.role === 'admin' && (
                          <button
                            onClick={() => {
                              if (confirm(`Supprimer la matière "${s.name}" ?`)) {
                                onDeleteSubject(s.id);
                              }
                            }}
                            className="p-1.5 rounded-md hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">
                {editingSubject ? 'Modifier la Matière / UE' : 'Ajouter une Nouvelle Matière / UE'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Classe Destinataire *</label>
                <select
                  value={formClassId}
                  onChange={e => setFormClassId(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.cycle === 'primaire' ? '🏫 Primaire' : c.cycle === 'superieur' ? '🏛️ Supérieur' : '🎓 Secondaire'} - {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Code Matière / UE *</label>
                <input
                  type="text"
                  required
                  placeholder="ex: MATH-01, FRAN-CM2, INFO-101"
                  value={formCode}
                  onChange={e => setFormCode(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-xs font-mono font-bold uppercase focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Intitulé du Cours / UE *</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Algorithmique & Programmation C"
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Coefficient *</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="20"
                    required
                    value={formCoefficient}
                    onChange={e => setFormCoefficient(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                {isSuperieurClass && (
                  <div>
                    <label className="block text-xs font-bold text-purple-700 mb-1">Crédits ECTS (LMD) *</label>
                    <input
                      type="number"
                      step="1"
                      min="1"
                      max="30"
                      required
                      value={formEctsCredits}
                      onChange={e => setFormEctsCredits(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-purple-50 border border-purple-300 text-xs font-bold text-purple-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                    />
                  </div>
                )}
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
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
