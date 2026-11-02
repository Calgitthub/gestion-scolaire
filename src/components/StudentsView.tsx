import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Filter,
  Download,
  Trash2,
  Edit2,
  UserCheck,
  Mail,
  Phone,
  MapPin,
  Calendar,
  AlertTriangle,
  X,
  Check
} from 'lucide-react';
import { Student, ClassRoom, User } from '../types';
import { exportStudentsToExcel } from '../services/excelExporter';

interface StudentsViewProps {
  students: Student[];
  classes: ClassRoom[];
  currentUser: User;
  onAddStudent: (studentData: Omit<Student, 'id'>) => void;
  onUpdateStudent: (id: number, studentData: Partial<Student>) => void;
  onDeleteStudent: (id: number) => void;
}

export const StudentsView: React.FC<StudentsViewProps> = ({
  students,
  classes,
  currentUser,
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCycle, setSelectedCycle] = useState<string>('all');
  const [selectedClassId, setSelectedClassId] = useState<number | 'all'>('all');
  const [genderFilter, setGenderFilter] = useState<'all' | 'M' | 'F'>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  // Form Fields
  const [formMatricule, setFormMatricule] = useState('');
  const [formLastName, setFormLastName] = useState('');
  const [formFirstName, setFormFirstName] = useState('');
  const [formGender, setFormGender] = useState<'M' | 'F'>('M');
  const [formBirthDate, setFormBirthDate] = useState('2008-01-01');
  const [formClassId, setFormClassId] = useState<number>(classes[0]?.id || 1);
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formIsGood, setFormIsGood] = useState<boolean | undefined>(undefined);
  const [formError, setFormError] = useState('');

  // Filtrage
  const filteredStudents = useMemo(() => {
    return students.filter(st => {
      const cls = classes.find(c => c.id === st.classId);
      const matchCycle = selectedCycle === 'all' || (cls && cls.cycle === selectedCycle);

      const matchSearch =
        searchTerm === '' ||
        st.matricule.toLowerCase().includes(searchTerm.toLowerCase()) ||
        st.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        st.firstName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchClass = selectedClassId === 'all' || st.classId === selectedClassId;
      const matchGender = genderFilter === 'all' || st.gender === genderFilter;

      return matchCycle && matchSearch && matchClass && matchGender;
    });
  }, [students, classes, selectedCycle, searchTerm, selectedClassId, genderFilter]);

  const openAddModal = () => {
    setEditingStudent(null);
    const nextNum = students.length + 1;
    const padNum = nextNum < 10 ? `00${nextNum}` : nextNum < 100 ? `0${nextNum}` : `${nextNum}`;
    setFormMatricule(`MAT-2026-${padNum}`);
    setFormLastName('');
    setFormFirstName('');
    setFormGender('M');
    setFormBirthDate('2008-05-15');
    setFormClassId(classes[0]?.id || 1);
    setFormPhone('');
    setFormEmail('');
    setFormAddress('');
    setFormIsGood(undefined);
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (st: Student) => {
    setEditingStudent(st);
    setFormMatricule(st.matricule);
    setFormLastName(st.lastName);
    setFormFirstName(st.firstName);
    setFormGender(st.gender);
    setFormBirthDate(st.birthDate);
    setFormClassId(st.classId);
    setFormPhone(st.phone || '');
    setFormEmail(st.email || '');
    setFormAddress(st.address || '');
    setFormIsGood(st.isGoodStudent);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formMatricule.trim()) {
      setFormError('Le matricule est obligatoire.');
      return;
    }
    if (!formLastName.trim() || !formFirstName.trim()) {
      setFormError('Le nom et le prénom sont obligatoires.');
      return;
    }

    // Vérifier l'unicité du matricule
    const dup = students.find(
      s => s.matricule.toLowerCase() === formMatricule.trim().toLowerCase() &&
           (!editingStudent || s.id !== editingStudent.id)
    );
    if (dup) {
      setFormError(`Le matricule "${formMatricule}" est déjà attribué à un autre élève.`);
      return;
    }

    if (editingStudent) {
      onUpdateStudent(editingStudent.id, {
        matricule: formMatricule.trim().toUpperCase(),
        lastName: formLastName.trim(),
        firstName: formFirstName.trim(),
        gender: formGender,
        birthDate: formBirthDate,
        classId: formClassId,
        phone: formPhone.trim(),
        email: formEmail.trim(),
        address: formAddress.trim(),
        isGoodStudent: formIsGood
      });
    } else {
      onAddStudent({
        matricule: formMatricule.trim().toUpperCase(),
        lastName: formLastName.trim(),
        firstName: formFirstName.trim(),
        gender: formGender,
        birthDate: formBirthDate,
        classId: formClassId,
        phone: formPhone.trim(),
        email: formEmail.trim(),
        address: formAddress.trim(),
        enrollmentDate: new Date().toISOString().slice(0, 10),
        isGoodStudent: formIsGood
      });
    }

    setIsModalOpen(false);
  };

  const confirmDelete = () => {
    if (studentToDelete) {
      onDeleteStudent(studentToDelete.id);
      setStudentToDelete(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Répertoire des Étudiants</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Gestion complète des dossiers scolaires, coordonnées et inscriptions ({students.length} au total).
          </p>
        </div>
        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => exportStudentsToExcel(students, classes, selectedClassId === 'all' ? undefined : selectedClassId)}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs transition-colors"
            title="Exporter la liste en fichier Excel (.xlsx)"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Excel</span>
          </button>

          {currentUser.role === 'admin' && (
            <button
              onClick={openAddModal}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Inscrire un Étudiant</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex-1 flex flex-col sm:flex-row items-center gap-2.5">
          {/* Recherche */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher par nom, matricule..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Filtre Cycle */}
          <div className="w-full sm:w-44">
            <select
              value={selectedCycle}
              onChange={e => setSelectedCycle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-blue-50/70 border border-blue-200 text-xs font-bold text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="all">Tous les cycles</option>
              <option value="primaire">🏫 Primaire</option>
              <option value="secondaire">🎓 Secondaire</option>
              <option value="superieur">🏛️ Supérieur</option>
            </select>
          </div>

          {/* Filtre Classe */}
          <div className="w-full sm:w-52">
            <select
              value={selectedClassId}
              onChange={e => setSelectedClassId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="all">Toutes les classes ({students.length})</option>
              {classes.map(c => {
                const count = students.filter(s => s.classId === c.id).length;
                return (
                  <option key={c.id} value={c.id}>
                    [{c.code}] {c.name} ({count})
                  </option>
                );
              })}
            </select>
          </div>

          {/* Filtre Genre */}
          <div className="w-full sm:w-32">
            <select
              value={genderFilter}
              onChange={e => setGenderFilter(e.target.value as any)}
              className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="all">Tous genres</option>
              <option value="M">Masculin</option>
              <option value="F">Féminin</option>
            </select>
          </div>
        </div>

        <div className="text-xs text-slate-500 font-medium shrink-0">
          Affichage de <span className="font-bold text-slate-800">{filteredStudents.length}</span> élève(s)
        </div>
      </div>

      {/* Students Data Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Matricule</th>
                <th className="py-3 px-4">Nom & Prénom</th>
                <th className="py-3 px-3 text-center">Profil</th>
                <th className="py-3 px-3 text-center">Sexe</th>
                <th className="py-3 px-4">Date Naiss.</th>
                <th className="py-3 px-4">Cycle & Classe</th>
                <th className="py-3 px-4">Téléphone</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 italic">
                    Aucun étudiant ne correspond aux critères de recherche.
                  </td>
                </tr>
              ) : (
                filteredStudents.map(st => {
                  const classroom = classes.find(c => c.id === st.classId);
                  return (
                    <tr key={st.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200/60 text-[11px]">
                          {st.matricule}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-800">
                          {st.lastName.toUpperCase()} {st.firstName}
                        </div>
                        <div className="text-[11px] text-slate-400">Inscrit le {st.enrollmentDate}</div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        {st.isGoodStudent === true ? (
                          <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            🌟 Bon élève
                          </span>
                        ) : st.isGoodStudent === false ? (
                          <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 border border-red-300">
                            ⚠️ Médiocre
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">-</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            st.gender === 'M'
                              ? 'bg-sky-50 text-sky-700 border border-sky-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {st.gender === 'M' ? 'M' : 'F'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{st.birthDate}</td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">{classroom?.name || '-'}</div>
                        <div className="text-[10px] text-slate-400 uppercase tracking-wide font-bold">
                          {classroom?.cycleLabel || '-'}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">{st.phone || '-'}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => openEditModal(st)}
                            className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 hover:text-blue-700 transition-colors"
                            title="Modifier l'étudiant"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          {currentUser.role === 'admin' && (
                            <button
                              onClick={() => setStudentToDelete(st)}
                              className="p-1.5 rounded-md hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                              title="Supprimer l'étudiant"
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
      </div>

      {/* Modal Inscription / Modification */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">
                {editingStudent ? "Modifier la Fiche de l'Étudiant" : 'Inscrire un Nouvel Étudiant'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Matricule *</label>
                  <input
                    type="text"
                    required
                    value={formMatricule}
                    onChange={e => setFormMatricule(e.target.value)}
                    placeholder="ex: MAT-2026-099"
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Classe / Filière *</label>
                  <select
                    value={formClassId}
                    onChange={e => setFormClassId(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nom de Famille *</label>
                  <input
                    type="text"
                    required
                    value={formLastName}
                    onChange={e => setFormLastName(e.target.value)}
                    placeholder="ex: DUPONT"
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Prénom(s) *</label>
                  <input
                    type="text"
                    required
                    value={formFirstName}
                    onChange={e => setFormFirstName(e.target.value)}
                    placeholder="ex: Lucas"
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Sexe *</label>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => setFormGender('M')}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold border ${
                        formGender === 'M'
                          ? 'bg-blue-700 text-white border-blue-700'
                          : 'bg-slate-50 text-slate-600 border-slate-200'
                      }`}
                    >
                      Masculin (M)
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormGender('F')}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold border ${
                        formGender === 'F'
                          ? 'bg-rose-600 text-white border-rose-600'
                          : 'bg-slate-50 text-slate-600 border-slate-200'
                      }`}
                    >
                      Féminin (F)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Date de Naissance *</label>
                  <input
                    type="date"
                    required
                    value={formBirthDate}
                    onChange={e => setFormBirthDate(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Téléphone</label>
                  <input
                    type="tel"
                    value={formPhone}
                    onChange={e => setFormPhone(e.target.value)}
                    placeholder="ex: 06 12 34 56 78"
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Adresse E-mail</label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={e => setFormEmail(e.target.value)}
                    placeholder="ex: etudiant@email.com"
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Profil académique type (Optionnel)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormIsGood(true)}
                    className={`px-3 py-2 rounded-lg text-xs font-bold border text-center transition-all ${
                      formIsGood === true
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-500/20'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    🌟 Bon élève
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormIsGood(false)}
                    className={`px-3 py-2 rounded-lg text-xs font-bold border text-center transition-all ${
                      formIsGood === false
                        ? 'bg-amber-50 border-amber-500 text-amber-800 ring-2 ring-amber-500/20'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    ⚠️ En difficulté
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormIsGood(undefined)}
                    className={`px-3 py-2 rounded-lg text-xs font-bold border text-center transition-all ${
                      formIsGood === undefined
                        ? 'bg-blue-50 border-blue-500 text-blue-800 ring-2 ring-blue-500/20'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Standard
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Permet d'identifier rapidement l'élève bon et l'élève médiocre pour les tests et comparaisons de classe.
                </p>
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
                  {editingStudent ? 'Mettre à jour' : "Enregistrer l'inscription"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal Suppression */}
      {studentToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-center text-slate-900">
              Confirmer la suppression ?
            </h3>
            <p className="text-xs text-center text-slate-500 mt-2">
              Êtes-vous certain de vouloir supprimer l'étudiant{' '}
              <span className="font-bold text-slate-800">
                {studentToDelete.lastName.toUpperCase()} {studentToDelete.firstName}
              </span>{' '}
              ({studentToDelete.matricule}) ?
              <br />
              <span className="text-red-600 font-semibold mt-1 block">
                Toutes les notes et évaluations rattachées à cet élève seront définitivement effacées.
              </span>
            </p>

            <div className="mt-6 flex space-x-3">
              <button
                onClick={() => setStudentToDelete(null)}
                className="flex-1 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Annuler
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-xs"
              >
                Oui, Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
