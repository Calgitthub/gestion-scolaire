import React, { useState } from 'react';
import {
  Settings,
  Database,
  Download,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Building,
  Calendar,
  Save
} from 'lucide-react';
import { SchoolConfig } from '../types';

interface SettingsViewProps {
  schoolConfig: SchoolConfig;
  onUpdateSchoolConfig: (cfg: SchoolConfig) => void;
  onResetData: () => void;
  exportDatabaseJSON: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  schoolConfig,
  onUpdateSchoolConfig,
  onResetData,
  exportDatabaseJSON
}) => {
  const [formData, setFormData] = useState<SchoolConfig>(schoolConfig);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSchoolConfig(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Paramètres du Système & Établissement</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Configuration des coordonnées scolaires, sauvegarde de la base de données et maintenance.
        </p>
      </div>

      {/* Formulaire Établissement */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-6">
        <div className="flex items-center space-x-2 pb-4 border-b border-slate-100 mb-5">
          <Building className="w-5 h-5 text-blue-700" />
          <h3 className="font-bold text-slate-800 text-sm">Informations de l'Établissement & Directoire</h3>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {savedSuccess && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Paramètres enregistrés avec succès !</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nom de l'Établissement</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Année Académique Active</label>
              <input
                type="text"
                required
                value={formData.academicYear}
                onChange={e => setFormData({ ...formData, academicYear: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Téléphone Officiel</label>
              <input
                type="text"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Adresse E-mail Officielle</label>
              <input
                type="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Adresse Postale & Campus</label>
              <input
                type="text"
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nom du Chef d'Établissement</label>
              <input
                type="text"
                value={formData.directorName}
                onChange={e => setFormData({ ...formData, directorName: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="flex items-center space-x-1.5 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Enregistrer les modifications</span>
            </button>
          </div>
        </form>
      </div>

      {/* Sauvegarde & Restauration de la Base de Données */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-6 space-y-4">
        <div className="flex items-center space-x-2 pb-4 border-b border-slate-100">
          <Database className="w-5 h-5 text-emerald-600" />
          <h3 className="font-bold text-slate-800 text-sm">Sauvegarde & Restauration des Données</h3>
        </div>

        <p className="text-xs text-slate-500">
          Exportez une sauvegarde complète au format JSON ou réinitialisez les données initiales de démonstration.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            onClick={exportDatabaseJSON}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Télécharger la Sauvegarde Complète (.json)</span>
          </button>

          <button
            onClick={() => {
              if (confirm('Voulez-vous réinitialiser l\'ensemble des données avec le jeu d\'essai complet ?')) {
                onResetData();
              }
            }}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition-colors"
          >
            <RotateCcw className="w-4 h-4 text-slate-500" />
            <span>Réinitialiser avec le jeu de test</span>
          </button>
        </div>
      </div>
    </div>
  );
};
