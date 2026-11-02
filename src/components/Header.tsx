import React, { useState, useRef, useEffect } from 'react';
import {
  Calendar,
  ShieldCheck,
  User as UserIcon,
  RefreshCw,
  ChevronDown,
  UserCheck,
  Check
} from 'lucide-react';
import { User, SchoolConfig } from '../types';

interface HeaderProps {
  currentUser: User;
  users: User[];
  onSwitchUser: (user: User) => void;
  onSwitchRole: (newRole: 'admin' | 'user') => void;
  schoolConfig: SchoolConfig;
  onResetData: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  users,
  onSwitchUser,
  schoolConfig,
  onResetData
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isTeacher = currentUser.role === 'prof' || currentUser.role === 'user';

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 shadow-xs relative z-30">
      <div className="flex items-center space-x-4">
        <h1 className="text-lg font-bold text-slate-800 tracking-tight flex items-center gap-2">
          <span>{schoolConfig.name}</span>
        </h1>
        <div className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200/60">
          <Calendar className="w-3.5 h-3.5 text-blue-600" />
          <span>Année Académique : {schoolConfig.academicYear}</span>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        {/* User Account Switcher Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
              isTeacher
                ? 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100'
                : 'bg-blue-50 text-blue-900 border-blue-300 hover:bg-blue-100'
            }`}
            title="Changer de compte d'utilisateur ou tester la vue professeur"
          >
            {isTeacher ? (
              <UserIcon className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            )}
            <span className="font-bold truncate max-w-[150px] sm:max-w-[200px]">
              {currentUser.fullName}
            </span>
            <span className={`text-[10px] uppercase font-bold px-1.5 py-0.2 rounded ${
              isTeacher ? 'bg-emerald-200 text-emerald-800' : 'bg-blue-200 text-blue-800'
            }`}>
              {isTeacher ? 'Professeur' : 'Admin'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 opacity-60" />
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                Basculer vers un compte :
              </div>
              <div className="max-h-64 overflow-y-auto py-1">
                {users.map(u => {
                  const isSelected = u.id === currentUser.id;
                  const isProf = u.role === 'prof' || u.role === 'user';

                  return (
                    <button
                      key={u.id}
                      onClick={() => {
                        onSwitchUser(u);
                        setDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 flex items-center justify-between hover:bg-slate-50 transition-colors ${
                        isSelected ? 'bg-slate-100/80 font-bold' : ''
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="text-xs text-slate-800 truncate flex items-center gap-1.5">
                          {isProf ? (
                            <UserCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          ) : (
                            <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          )}
                          <span className="truncate">{u.fullName}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          @{u.username} • {isProf ? 'Professeur' : 'Administrateur'}
                        </div>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Bouton Réinitialisation Données Démo */}
        <button
          onClick={onResetData}
          className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors border border-slate-200"
          title="Réinitialiser avec les données d'essai multi-cycles et professeurs"
        >
          <RefreshCw className="w-3 h-3 text-slate-500" />
          <span className="hidden sm:inline">Données test</span>
        </button>
      </div>
    </header>
  );
};
