import React from 'react';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  ClipboardCheck,
  TrendingUp,
  FileText,
  UserCheck,
  Settings,
  LogOut,
  ShieldCheck,
  User as UserIcon
} from 'lucide-react';
import { User } from '../types';

export type NavItem =
  | 'dashboard'
  | 'students'
  | 'classes'
  | 'subjects'
  | 'grades'
  | 'averages'
  | 'bulletins'
  | 'users'
  | 'settings';

interface SidebarProps {
  currentTab: NavItem;
  onSelectTab: (tab: NavItem) => void;
  currentUser: User;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  currentUser,
  onLogout
}) => {
  const menuItems = [
    { id: 'dashboard' as NavItem, label: '1. Tableau de bord', icon: LayoutDashboard },
    { id: 'students' as NavItem, label: '2. Étudiants', icon: Users },
    { id: 'classes' as NavItem, label: '3. Classes & filières', icon: GraduationCap },
    { id: 'subjects' as NavItem, label: '4. Matières', icon: BookOpen },
    { id: 'grades' as NavItem, label: '5. Notes', icon: ClipboardCheck },
    { id: 'averages' as NavItem, label: '6. Moyennes & résultats', icon: TrendingUp },
    { id: 'bulletins' as NavItem, label: '7. Bulletins de notes', icon: FileText },
    { id: 'users' as NavItem, label: '8. Utilisateurs', icon: UserCheck, adminOnly: true },
    { id: 'settings' as NavItem, label: '9. Paramètres', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-200 flex flex-col shrink-0 border-r border-slate-800 shadow-xl select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-sky-500 flex items-center justify-center text-white font-black text-xl shadow-md">
            E
          </div>
          <div>
            <div className="text-base font-bold text-white tracking-wide flex items-center gap-1.5">
              EduGest <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-500/20 text-sky-400 font-semibold border border-blue-500/30">v2.0</span>
            </div>
            <div className="text-xs text-slate-400 font-medium truncate max-w-[140px]">
              ISEA Académie
            </div>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          Modules Scolaires
        </div>
        {menuItems.map(item => {
          if (item.adminOnly && currentUser.role !== 'admin') {
            return null;
          }
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all text-left ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}

        {/* 10. Déconnexion */}
        <button
          onClick={onLogout}
          className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-950/40 hover:text-red-300 transition-colors text-left"
        >
          <LogOut className="w-4 h-4 shrink-0 text-red-400" />
          <span className="truncate">10. Déconnexion</span>
        </button>
      </nav>

      {/* User Session Footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/40 space-y-2">
        <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/50 flex items-center justify-between">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400 font-bold text-xs shrink-0">
              {currentUser.fullName.charAt(0)}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-white truncate">
                {currentUser.fullName}
              </div>
              <div className="text-[11px] text-sky-400 font-medium flex items-center gap-1">
                {currentUser.role === 'admin' ? (
                  <>
                    <ShieldCheck className="w-3 h-3 text-sky-400" />
                    <span>Administrateur</span>
                  </>
                ) : (
                  <>
                    <UserIcon className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400 font-bold">Professeur</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-lg text-xs font-semibold text-red-400 hover:bg-red-950/40 hover:text-red-300 transition-colors border border-transparent hover:border-red-900/40"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
};
