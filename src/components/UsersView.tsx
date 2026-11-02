import React, { useState } from 'react';
import {
  UserCheck,
  Plus,
  ShieldCheck,
  User as UserIcon,
  Lock,
  Trash2,
  X,
  AlertCircle,
  GraduationCap,
  BookOpen,
  LogIn,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { User, Role, ClassRoom, Subject } from '../types';

interface UsersViewProps {
  users: User[];
  currentUser: User;
  classes: ClassRoom[];
  subjects: Subject[];
  onAddUser: (user: Omit<User, 'id' | 'createdAt'>) => void;
  onDeleteUser: (id: number) => void;
  onSwitchUser: (user: User) => void;
}

export const UsersView: React.FC<UsersViewProps> = ({
  users,
  currentUser,
  classes,
  subjects,
  onAddUser,
  onDeleteUser,
  onSwitchUser
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('prof123');
  const [role, setRole] = useState<Role>('prof');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedClassIds, setSelectedClassIds] = useState<number[]>([]);
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<number[]>([]);
  const [error, setError] = useState('');
  const [successBanner, setSuccessBanner] = useState('');

  const teachers = users.filter(u => u.role === 'prof' || u.role === 'user');
  const admins = users.filter(u => u.role === 'admin');

  const openAddTeacherModal = () => {
    setError('');
    setUsername(`prof.${Date.now().toString().slice(-4)}`);
    setFullName('');
    setPassword('prof123');
    setRole('prof');
    setEmail('');
    setPhone('');
    setSelectedClassIds(classes[0] ? [classes[0].id] : []);
    setSelectedSubjectIds(subjects[0] ? [subjects[0].id] : []);
    setIsModalOpen(true);
  };

  const openAddAdminModal = () => {
    setError('');
    setUsername(`admin.${Date.now().toString().slice(-4)}`);
    setFullName('');
    setPassword('admin123');
    setRole('admin');
    setEmail('');
    setPhone('');
    setSelectedClassIds([]);
    setSelectedSubjectIds([]);
    setIsModalOpen(true);
  };

  const toggleClass = (classId: number) => {
    setSelectedClassIds(prev =>
      prev.includes(classId) ? prev.filter(id => id !== classId) : [...prev, classId]
    );
  };

  const toggleSubject = (subjectId: number) => {
    setSelectedSubjectIds(prev =>
      prev.includes(subjectId) ? prev.filter(id => id !== subjectId) : [...prev, subjectId]
    );
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !fullName.trim() || !password.trim()) {
      setError('Le nom complet, l\'identifiant et le mot de passe sont requis.');
      return;
    }

    const cleanUsername = username.trim().toLowerCase();
    if (users.some(u => u.username.toLowerCase() === cleanUsername)) {
      setError(`Le nom d'utilisateur "${cleanUsername}" est déjà attribué.`);
      return;
    }

    onAddUser({
      username: cleanUsername,
      fullName: fullName.trim(),
      role,
      isActive: true,
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      assignedClassIds: role === 'prof' ? selectedClassIds : undefined,
      assignedSubjectIds: role === 'prof' ? selectedSubjectIds : undefined
    });

    setSuccessBanner(
      `Le compte ${role === 'prof' ? 'Professeur' : 'Administrateur'} "${fullName.trim()}" (@${cleanUsername}) a été créé avec succès ! Il peut désormais se connecter pour saisir ses notes.`
    );
    setIsModalOpen(false);

    // Auto clear success banner after 6 seconds
    setTimeout(() => {
      setSuccessBanner('');
    }, 6000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Comptes Utilisateurs & Corps Enseignant</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
              {teachers.length} Enseignant(s)
            </span>
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Gestion des profils administratifs et création des comptes professeurs habilités à saisir les notes et évaluations.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={openAddTeacherModal}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition-colors"
          >
            <UserCheck className="w-4 h-4" />
            <span>+ Ajouter un Professeur</span>
          </button>

          <button
            onClick={openAddAdminModal}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>+ Administrateur</span>
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {successBanner && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-medium flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successBanner}</span>
          </div>
          <button onClick={() => setSuccessBanner('')} className="text-emerald-700 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Utilisateurs</div>
          <div className="text-2xl font-black text-slate-800 mt-1">{users.length}</div>
          <div className="text-xs text-slate-500 mt-0.5">Comptes enregistrés</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200/80 shadow-xs bg-emerald-50/20">
          <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Professeurs Actifs</div>
          <div className="text-2xl font-black text-emerald-800 mt-1">{teachers.length}</div>
          <div className="text-xs text-emerald-600 mt-0.5">Habilités à saisir les notes</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-blue-200/80 shadow-xs bg-blue-50/20">
          <div className="text-[11px] font-bold uppercase tracking-wider text-blue-700">Administrateurs</div>
          <div className="text-2xl font-black text-blue-800 mt-1">{admins.length}</div>
          <div className="text-xs text-blue-600 mt-0.5">Accès direction complet</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Classes Assignées</div>
          <div className="text-2xl font-black text-purple-700 mt-1">{classes.length}</div>
          <div className="text-xs text-slate-500 mt-0.5">Tous cycles confondus</div>
        </div>
      </div>

      {/* Information Box for Admin */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/70 p-4 rounded-xl flex items-start space-x-3">
        <Sparkles className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="text-xs text-blue-900 leading-relaxed">
          <span className="font-bold">Fonctionnement des comptes Enseignants :</span> Lorsqu'un compte professeur est créé par l'administrateur, il peut se connecter avec son identifiant et son mot de passe. Dans l'onglet <strong>Notes</strong>, il a les droits complets pour créer des devoirs/examens et saisir les notes pour ses classes. Vous pouvez tester n'importe quel compte professeur en cliquant sur le bouton <strong>"Se connecter"</strong> ci-dessous.
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-900 text-white font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4">Utilisateur / Professeur</th>
              <th className="py-3 px-4">Identifiant (@username)</th>
              <th className="py-3 px-4">Rôle</th>
              <th className="py-3 px-4">Classes & Matières Assignées</th>
              <th className="py-3 px-4 text-center">Statut</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map(u => {
              const isCurrent = currentUser.id === u.id;
              const isTeacher = u.role === 'prof' || u.role === 'user';

              const assignedClasses = (u.assignedClassIds || [])
                .map(cid => classes.find(c => c.id === cid))
                .filter(Boolean) as ClassRoom[];

              const assignedSubjects = (u.assignedSubjectIds || [])
                .map(sid => subjects.find(s => s.id === sid))
                .filter(Boolean) as Subject[];

              return (
                <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-800 flex items-center gap-1.5">
                      <span>{u.fullName}</span>
                      {isCurrent && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-100 text-blue-800">
                          (Session active)
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {u.email || 'Aucun e-mail'} • Créé le {u.createdAt}
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                    <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      @{u.username}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    {u.role === 'admin' ? (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                        <span>Administrateur</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <UserIcon className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Professeur / Enseignant</span>
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-4">
                    {isTeacher ? (
                      <div className="space-y-1">
                        {assignedClasses.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {assignedClasses.map(c => (
                              <span
                                key={c.id}
                                className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                                  c.cycle === 'primaire'
                                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                                    : c.cycle === 'superieur'
                                    ? 'bg-purple-50 text-purple-800 border-purple-200'
                                    : 'bg-blue-50 text-blue-800 border-blue-200'
                                }`}
                              >
                                {c.code}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">Toutes les classes</span>
                        )}

                        {assignedSubjects.length > 0 && (
                          <div className="text-[10px] text-slate-500 truncate max-w-xs">
                            {assignedSubjects.map(s => s.name).join(', ')}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-[11px] text-blue-700 font-semibold bg-blue-50/50 px-2 py-0.5 rounded">
                        Accès général complet
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>Actif</span>
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      {!isCurrent && (
                        <button
                          onClick={() => onSwitchUser(u)}
                          className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-xs font-semibold border border-slate-200 transition-colors"
                          title={`Basculer immédiatement sur la session de ${u.fullName}`}
                        >
                          <LogIn className="w-3.5 h-3.5" />
                          <span>Se connecter</span>
                        </button>
                      )}

                      {!isCurrent && (
                        <button
                          onClick={() => {
                            if (confirm(`Supprimer définitivement le compte de "${u.fullName}" (@${u.username}) ?`)) {
                              onDeleteUser(u.id);
                            }
                          }}
                          className="p-1.5 rounded-md hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                          title="Supprimer l'utilisateur"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal Ajout Compte Utilisateur / Professeur */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {role === 'prof' ? (
                  <UserCheck className="w-5 h-5 text-emerald-400" />
                ) : (
                  <ShieldCheck className="w-5 h-5 text-sky-400" />
                )}
                <h3 className="font-bold text-sm">
                  {role === 'prof' ? 'Créer un Compte Professeur (Saisie des Notes)' : 'Créer un Compte Administrateur'}
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4 max-h-[85vh] overflow-y-auto">
              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Rôle */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Type de compte *</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('prof')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border flex items-center justify-center space-x-1.5 transition-all ${
                      role === 'prof'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <UserIcon className="w-4 h-4" />
                    <span>👨‍🏫 Professeur / Enseignant</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('admin')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border flex items-center justify-center space-x-1.5 transition-all ${
                      role === 'admin'
                        ? 'bg-blue-700 text-white border-blue-700 shadow-xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>🛡️ Administrateur</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nom complet & Titre *</label>
                <input
                  type="text"
                  required
                  placeholder={role === 'prof' ? 'ex: M. David Dubois (Professeur de Maths)' : 'ex: M. Pierre Legrand (Directeur Adjoint)'}
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Identifiant de connexion *</label>
                  <input
                    type="text"
                    required
                    placeholder="ex: prof.dubois"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mot de passe *</label>
                  <input
                    type="text"
                    required
                    placeholder="ex: prof123"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Adresse E-mail académique</label>
                  <input
                    type="email"
                    placeholder="professeur@edugest.edu"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Téléphone</label>
                  <input
                    type="tel"
                    placeholder="06 12 34 56 78"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              {/* Si Professeur : Sélection des classes et matières assignées */}
              {role === 'prof' && (
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Classes assignées à ce professeur (Saisie des notes) :
                    </label>
                    <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto p-2 bg-slate-50 rounded-lg border border-slate-200">
                      {classes.map(c => {
                        const isChecked = selectedClassIds.includes(c.id);
                        return (
                          <label
                            key={c.id}
                            className={`flex items-center space-x-2 p-1.5 rounded cursor-pointer text-xs border transition-colors ${
                              isChecked ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold' : 'bg-white border-slate-200 text-slate-700'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleClass(c.id)}
                              className="rounded text-emerald-600 focus:ring-emerald-500"
                            />
                            <span className="truncate">
                              {c.cycle === 'primaire' ? '🏫' : c.cycle === 'superieur' ? '🏛️' : '🎓'} {c.code} - {c.name}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Matières dispensées par ce professeur :
                    </label>
                    <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto p-2 bg-slate-50 rounded-lg border border-slate-200">
                      {subjects.map(s => {
                        const isChecked = selectedSubjectIds.includes(s.id);
                        const c = classes.find(cl => cl.id === s.classId);
                        return (
                          <label
                            key={s.id}
                            className={`flex items-center space-x-2 p-1.5 rounded cursor-pointer text-xs border transition-colors ${
                              isChecked ? 'bg-blue-50 border-blue-300 text-blue-900 font-bold' : 'bg-white border-slate-200 text-slate-700'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleSubject(s.id)}
                              className="rounded text-blue-600 focus:ring-blue-500"
                            />
                            <span className="truncate">
                              {s.name} ({c?.code || '-'})
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

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
                  className="px-5 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs"
                >
                  {role === 'prof' ? 'Créer le Compte Professeur' : 'Créer l\'Administrateur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
