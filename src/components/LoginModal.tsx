import React, { useState } from 'react';
import { Lock, User as UserIcon, ShieldCheck, AlertCircle, ArrowRight } from 'lucide-react';
import { User } from '../types';

interface LoginModalProps {
  users: User[];
  onLoginSuccess: (user: User) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ users, onLoginSuccess }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedUser = username.trim().toLowerCase();
    const user = users.find(u => u.username.toLowerCase() === trimmedUser);

    if (!user) {
      setError("Nom d'utilisateur introuvable.");
      return;
    }

    // Demo password checks
    if (trimmedUser === 'admin' && password !== 'admin123') {
      setError('Mot de passe incorrect pour le compte administrateur (admin123).');
      return;
    }
    if (!password) {
      setError('Veuillez saisir votre mot de passe.');
      return;
    }

    onLoginSuccess(user);
  };

  const setQuickAccount = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-8 text-center text-white relative">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-400 flex items-center justify-center mx-auto text-2xl font-black shadow-lg shadow-blue-500/30">
            🎓
          </div>
          <h2 className="text-xl font-bold mt-4 tracking-tight">EduGest Académie</h2>
          <p className="text-xs text-sky-200/80 mt-1">Connexion Administrateur & Professeurs</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Nom d'utilisateur</label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="ex: admin ou prof.martin"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Mot de passe</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold shadow-md shadow-blue-700/20 transition-all flex items-center justify-center space-x-2"
          >
            <span>Ouvrir la session</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Quick Demo Credentials */}
          <div className="pt-4 border-t border-slate-100">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center mb-2.5">
              Raccourcis de connexion rapide
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setQuickAccount('admin', 'admin123')}
                className="p-2 rounded-lg bg-slate-50 hover:bg-blue-50 border border-slate-200 text-left transition-colors"
              >
                <div className="text-xs font-bold text-slate-800 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-blue-600" />
                  <span>Admin Direction</span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">admin123</div>
              </button>

              <button
                type="button"
                onClick={() => setQuickAccount('prof.martin', 'prof123')}
                className="p-2 rounded-lg bg-emerald-50/70 hover:bg-emerald-100 border border-emerald-200 text-left transition-colors"
              >
                <div className="text-xs font-bold text-emerald-900 flex items-center gap-1">
                  <UserIcon className="w-3 h-3 text-emerald-600" />
                  <span>Prof. Maths (Lycée)</span>
                </div>
                <div className="text-[10px] text-emerald-600 font-mono mt-0.5">prof123</div>
              </button>

              <button
                type="button"
                onClick={() => setQuickAccount('prof.bernard', 'prof123')}
                className="p-2 rounded-lg bg-amber-50/70 hover:bg-amber-100 border border-amber-200 text-left transition-colors"
              >
                <div className="text-xs font-bold text-amber-900 flex items-center gap-1">
                  <UserIcon className="w-3 h-3 text-amber-600" />
                  <span>Prof. CM2 (Primaire)</span>
                </div>
                <div className="text-[10px] text-amber-600 font-mono mt-0.5">prof123</div>
              </button>

              <button
                type="button"
                onClick={() => setQuickAccount('prof.benali', 'prof123')}
                className="p-2 rounded-lg bg-purple-50/70 hover:bg-purple-100 border border-purple-200 text-left transition-colors"
              >
                <div className="text-xs font-bold text-purple-900 flex items-center gap-1">
                  <UserIcon className="w-3 h-3 text-purple-600" />
                  <span>Prof. Info (Supérieur)</span>
                </div>
                <div className="text-[10px] text-purple-600 font-mono mt-0.5">prof123</div>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
