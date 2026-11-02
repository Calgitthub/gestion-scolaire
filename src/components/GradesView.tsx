import React, { useState, useMemo } from 'react';
import {
  ClipboardCheck,
  Plus,
  Trash2,
  Calendar,
  AlertCircle,
  X,
  Search,
  Filter,
  CheckCircle2,
  Table,
  UserCheck,
  GraduationCap,
  Sparkles,
  Save
} from 'lucide-react';
import { Grade, Evaluation, Student, Subject, ClassRoom, User, EvaluationType } from '../types';

interface GradesViewProps {
  grades: Grade[];
  evaluations: Evaluation[];
  students: Student[];
  subjects: Subject[];
  classes: ClassRoom[];
  currentUser: User;
  onRecordGrade: (grade: Omit<Grade, 'id' | 'dateRecorded'>) => void;
  onDeleteGrade: (id: number) => void;
  onCreateEvaluation: (evaluation: Omit<Evaluation, 'id'>) => number;
  onRecordBatchGrades?: (grades: Array<Omit<Grade, 'id' | 'dateRecorded'>>) => void;
}

export const GradesView: React.FC<GradesViewProps> = ({
  grades,
  evaluations,
  students,
  subjects,
  classes,
  currentUser,
  onRecordGrade,
  onDeleteGrade,
  onCreateEvaluation,
  onRecordBatchGrades
}) => {
  const isTeacher = currentUser.role === 'prof' || currentUser.role === 'user';
  const hasAssignedClasses = isTeacher && currentUser.assignedClassIds && currentUser.assignedClassIds.length > 0;

  const [selectedClassId, setSelectedClassId] = useState<number | 'all'>('all');
  const [filterMyClassesOnly, setFilterMyClassesOnly] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal 1 : Saisie individuelle
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetStudentId, setTargetStudentId] = useState<number>(students[0]?.id || 1);
  const [targetEvaluationId, setTargetEvaluationId] = useState<number | 'new'>('new');
  const [scoreValue, setScoreValue] = useState<string>('15.0');
  const [comments, setComments] = useState('');

  // Quick evaluation creator if 'new'
  const [newEvalTitle, setNewEvalTitle] = useState('Contrôle Continu');
  const [newEvalType, setNewEvalType] = useState<EvaluationType>('Devoir');
  const [newEvalSubjectId, setNewEvalSubjectId] = useState<number>(subjects[0]?.id || 1);
  const [newEvalDate, setNewEvalDate] = useState(new Date().toISOString().slice(0, 10));

  // Modal 2 : Saisie Rapide / Collective par Classe
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [batchClassId, setBatchClassId] = useState<number>(classes[0]?.id || 1);
  const [batchEvalId, setBatchEvalId] = useState<number | 'new'>('new');
  const [batchScores, setBatchScores] = useState<Record<number, string>>({});
  const [batchComments, setBatchComments] = useState<Record<number, string>>({});
  const [batchTitle, setBatchTitle] = useState('Devoir Surveillé');
  const [batchType, setBatchType] = useState<EvaluationType>('Devoir');
  const [batchSubjectId, setBatchSubjectId] = useState<number>(subjects[0]?.id || 1);
  const [batchDate, setBatchDate] = useState(new Date().toISOString().slice(0, 10));

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Mapping lookup
  const studentMap = useMemo(() => new Map(students.map(s => [s.id, s])), [students]);
  const evalMap = useMemo(() => new Map(evaluations.map(e => [e.id, e])), [evaluations]);
  const subjectMap = useMemo(() => new Map(subjects.map(s => [s.id, s])), [subjects]);
  const classMap = useMemo(() => new Map(classes.map(c => [c.id, c])), [classes]);

  // Filtrage des notes
  const filteredGrades = useMemo(() => {
    return grades.filter(g => {
      const student = studentMap.get(g.studentId);
      const evalObj = evalMap.get(g.evaluationId);
      if (!student || !evalObj) return false;

      // Filtre "mes classes uniquement" pour professeur
      if (filterMyClassesOnly && currentUser.assignedClassIds && currentUser.assignedClassIds.length > 0) {
        if (!currentUser.assignedClassIds.includes(student.classId)) {
          return false;
        }
      }

      const matchClass = selectedClassId === 'all' || student.classId === selectedClassId;
      const matchSearch =
        searchTerm === '' ||
        student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.matricule.toLowerCase().includes(searchTerm.toLowerCase()) ||
        evalObj.title.toLowerCase().includes(searchTerm.toLowerCase());

      return matchClass && matchSearch;
    });
  }, [grades, studentMap, evalMap, selectedClassId, searchTerm, filterMyClassesOnly, currentUser]);

  // Ouvrir modal saisie individuelle
  const handleOpenModal = () => {
    setError('');
    setSuccessMsg('');
    setScoreValue('14.0');
    setComments('');

    // Pre-sélectionner selon la classe de l'enseignant si disponible
    const defaultStudent = hasAssignedClasses
      ? students.find(s => currentUser.assignedClassIds?.includes(s.classId)) || students[0]
      : students[0];

    if (defaultStudent) setTargetStudentId(defaultStudent.id);

    if (evaluations.length > 0) {
      setTargetEvaluationId(evaluations[0].id);
    } else {
      setTargetEvaluationId('new');
    }
    setIsModalOpen(true);
  };

  // Ouvrir modal saisie rapide par classe
  const handleOpenBatchModal = () => {
    setError('');
    setSuccessMsg('');

    const targetClass = hasAssignedClasses
      ? classes.find(c => currentUser.assignedClassIds?.includes(c.id)) || classes[0]
      : classes[0];

    const defaultClassId = targetClass?.id || 1;
    setBatchClassId(defaultClassId);

    // Matière par défaut de cette classe
    const classSubs = subjects.filter(s => s.classId === defaultClassId);
    if (classSubs.length > 0) {
      setBatchSubjectId(classSubs[0].id);
    }

    // Charger les notes actuelles pour les élèves de cette classe
    const classStudents = students.filter(s => s.classId === defaultClassId);
    const initialScores: Record<number, string> = {};
    const initialComments: Record<number, string> = {};

    classStudents.forEach(st => {
      initialScores[st.id] = '';
      initialComments[st.id] = '';
    });

    setBatchScores(initialScores);
    setBatchComments(initialComments);
    setBatchEvalId('new');
    setBatchTitle(`Évaluation du ${new Date().toLocaleDateString('fr-FR')}`);
    setIsBatchModalOpen(true);
  };

  // Changement de classe dans la saisie rapide
  const handleBatchClassChange = (newCid: number) => {
    setBatchClassId(newCid);
    const classSubs = subjects.filter(s => s.classId === newCid);
    if (classSubs.length > 0) {
      setBatchSubjectId(classSubs[0].id);
    }
  };

  // Enregistrer note individuelle
  const handleSaveGrade = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const val = parseFloat(scoreValue.replace(',', '.'));
    if (isNaN(val)) {
      setError('Veuillez saisir un nombre valide pour la note.');
      return;
    }
    if (val < 0 || val > 20) {
      setError('La note doit impérativement être comprise entre 0.00 et 20.00.');
      return;
    }

    let evalId = targetEvaluationId;

    if (evalId === 'new') {
      const selSub = subjectMap.get(newEvalSubjectId);
      if (!selSub) {
        setError('Veuillez sélectionner une matière valide.');
        return;
      }
      evalId = onCreateEvaluation({
        title: newEvalTitle.trim() || 'Évaluation',
        evalType: newEvalType,
        date: newEvalDate,
        period: '1er Semestre',
        subjectId: newEvalSubjectId,
        classId: selSub.classId,
        maxScore: 20
      });
    }

    onRecordGrade({
      studentId: targetStudentId,
      evaluationId: evalId as number,
      value: Math.round(val * 100) / 100,
      comments: comments.trim()
    });

    setSuccessMsg('Note enregistrée avec succès !');
    setTimeout(() => {
      setIsModalOpen(false);
    }, 600);
  };

  // Enregistrer saisie collective par classe
  const handleSaveBatch = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    let evalId = batchEvalId;

    if (evalId === 'new') {
      const selSub = subjectMap.get(batchSubjectId);
      if (!selSub) {
        setError('Veuillez sélectionner une matière valide.');
        return;
      }
      evalId = onCreateEvaluation({
        title: batchTitle.trim() || 'Évaluation',
        evalType: batchType,
        date: batchDate,
        period: '1er Semestre',
        subjectId: batchSubjectId,
        classId: batchClassId,
        maxScore: 20
      });
    }

    const classStudents = students.filter(s => s.classId === batchClassId);
    const toSave: Array<Omit<Grade, 'id' | 'dateRecorded'>> = [];

    for (const st of classStudents) {
      const raw = batchScores[st.id];
      if (raw !== undefined && raw.trim() !== '') {
        const val = parseFloat(raw.replace(',', '.'));
        if (isNaN(val) || val < 0 || val > 20) {
          setError(`La note de l'élève ${st.firstName} ${st.lastName} (${raw}) est invalide. Doit être entre 0 et 20.`);
          return;
        }
        toSave.push({
          studentId: st.id,
          evaluationId: evalId as number,
          value: Math.round(val * 100) / 100,
          comments: (batchComments[st.id] || '').trim()
        });
      }
    }

    if (toSave.length === 0) {
      setError('Veuillez saisir au moins une note pour un élève.');
      return;
    }

    if (onRecordBatchGrades) {
      onRecordBatchGrades(toSave);
    } else {
      toSave.forEach(g => onRecordGrade(g));
    }

    setSuccessMsg(`${toSave.length} notes ont été enregistrées avec succès pour la classe !`);
    setTimeout(() => {
      setIsBatchModalOpen(false);
      setSuccessMsg('');
    }, 800);
  };

  const currentTeacherAssignedClasses = (currentUser.assignedClassIds || [])
    .map(cid => classes.find(c => c.id === cid))
    .filter(Boolean) as ClassRoom[];

  return (
    <div className="space-y-6">
      {/* Teacher Status Banner */}
      {isTeacher && (
        <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border border-emerald-200/80 p-4 rounded-xl shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              👨‍🏫
            </div>
            <div>
              <div className="text-sm font-bold text-emerald-950 flex items-center gap-2">
                <span>Espace Enseignant : {currentUser.fullName}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-800 font-bold">
                  Saisie activée
                </span>
              </div>
              <div className="text-xs text-emerald-700 mt-0.5 flex flex-wrap items-center gap-1.5">
                <span>Vos classes :</span>
                {currentTeacherAssignedClasses.length > 0 ? (
                  currentTeacherAssignedClasses.map(c => (
                    <span key={c.id} className="font-bold bg-white px-1.5 py-0.2 rounded border border-emerald-300 text-[11px]">
                      {c.code} ({c.level})
                    </span>
                  ))
                ) : (
                  <span className="italic">Toutes les classes de l'établissement</span>
                )}
              </div>
            </div>
          </div>

          {currentTeacherAssignedClasses.length > 0 && (
            <button
              onClick={() => setFilterMyClassesOnly(!filterMyClassesOnly)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                filterMyClassesOnly
                  ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                  : 'bg-white text-emerald-800 border-emerald-300 hover:bg-emerald-100'
              }`}
            >
              {filterMyClassesOnly ? '✓ Mes classes uniquement' : 'Voir toutes les classes'}
            </button>
          )}
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Gestion & Saisie des Notes</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Saisie individuelle ou collective sur 20, devoirs, examens et appréciations pédagogiques ({grades.length} notes enregistrées).
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={handleOpenBatchModal}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition-colors"
            title="Saisir rapidement les notes de toute une classe en une seule fois"
          >
            <Table className="w-4 h-4" />
            <span>Saisie Rapide par Classe</span>
          </button>

          <button
            onClick={handleOpenModal}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Saisir une Note</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center space-x-3 flex-1">
          <div className="relative w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher par élève ou évaluation..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <select
            value={selectedClassId}
            onChange={e => setSelectedClassId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="all">Toutes les classes ({classes.length})</option>
            {classes.map(c => (
              <option key={c.id} value={c.id}>
                {c.cycle === 'primaire' ? '🏫' : c.cycle === 'superieur' ? '🏛️' : '🎓'} {c.name} ({c.code})
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs text-slate-500">
          <span className="font-bold text-slate-800">{filteredGrades.length}</span> note(s) affichée(s)
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-900 text-white font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Étudiant</th>
              <th className="py-3 px-4">Classe & Cycle</th>
              <th className="py-3 px-4">Évaluation & Matière</th>
              <th className="py-3 px-4 text-center">Note / 20</th>
              <th className="py-3 px-4">Appréciation / Observation</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredGrades.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400 italic">
                  Aucune note trouvée pour cette sélection. Cliquez sur "Saisie Rapide par Classe" pour ajouter des notes.
                </td>
              </tr>
            ) : (
              filteredGrades.map(g => {
                const student = studentMap.get(g.studentId);
                const evalObj = evalMap.get(g.evaluationId);
                const subject = evalObj ? subjectMap.get(evalObj.subjectId) : null;
                const classObj = student ? classMap.get(student.classId) : null;

                const scoreNum = g.value;
                const scoreColor =
                  scoreNum >= 16
                    ? 'text-emerald-700 bg-emerald-50 border-emerald-300'
                    : scoreNum >= 14
                    ? 'text-teal-700 bg-teal-50 border-teal-300'
                    : scoreNum >= 10
                    ? 'text-blue-700 bg-blue-50 border-blue-300'
                    : 'text-red-700 bg-red-50 border-red-300';

                return (
                  <tr key={g.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                      {evalObj?.date || g.dateRecorded}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                        <span>{student ? `${student.lastName.toUpperCase()} ${student.firstName}` : `ID: ${g.studentId}`}</span>
                        {student?.isGoodStudent === true && (
                          <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">🌟 Bon</span>
                        )}
                        {student?.isGoodStudent === false && (
                          <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">⚠️ Médiocre</span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {student?.matricule}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-medium text-slate-600">
                      {classObj ? (
                        <div className="flex items-center space-x-1">
                          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                            classObj.cycle === 'primaire' ? 'bg-amber-100 text-amber-800' :
                            classObj.cycle === 'superieur' ? 'bg-purple-100 text-purple-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {classObj.code}
                          </span>
                          <span className="text-slate-500 text-[11px]">{classObj.level}</span>
                        </div>
                      ) : '-'}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-800">{evalObj?.title || 'Évaluation'}</div>
                      <div className="text-[11px] text-slate-500">
                        {subject ? subject.name : 'Matière'} • Coef {subject?.coefficient || 1}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-block px-2.5 py-1 rounded-lg text-sm font-black border ${scoreColor}`}>
                        {g.value.toFixed(2)} / 20
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 text-xs italic max-w-xs truncate">
                      {g.comments || '-'}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => {
                          if (confirm(`Supprimer la note de ${student?.firstName} ${student?.lastName} ?`)) {
                            onDeleteGrade(g.id);
                          }
                        }}
                        className="p-1.5 rounded-md hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                        title="Supprimer la note"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL 1 : Saisie Individuelle */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">Saisie Individuelle d'une Note</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGrade} className="p-6 space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              {successMsg && (
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Sélection Élève */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Étudiant concerné *</label>
                <select
                  value={targetStudentId}
                  onChange={e => setTargetStudentId(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  {students.map(st => {
                    const c = classMap.get(st.classId);
                    return (
                      <option key={st.id} value={st.id}>
                        [{c?.code || '-'}] {st.lastName.toUpperCase()} {st.firstName} ({st.matricule})
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Évaluation */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">Évaluation rattachée *</label>
                  <button
                    type="button"
                    onClick={() => setTargetEvaluationId(targetEvaluationId === 'new' ? (evaluations[0]?.id || 'new') : 'new')}
                    className="text-[11px] font-bold text-blue-700 hover:underline"
                  >
                    {targetEvaluationId === 'new' ? 'Choisir existante' : '+ Créer nouvelle évaluation'}
                  </button>
                </div>

                {targetEvaluationId !== 'new' ? (
                  <select
                    value={targetEvaluationId}
                    onChange={e => setTargetEvaluationId(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-xs font-semibold text-slate-800"
                  >
                    {evaluations.map(ev => {
                      const sub = subjectMap.get(ev.subjectId);
                      return (
                        <option key={ev.id} value={ev.id}>
                          {ev.title} - {sub?.name} ({ev.date})
                        </option>
                      );
                    })}
                  </select>
                ) : (
                  <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-200/80 space-y-2.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Titre du Devoir / Examen</label>
                      <input
                        type="text"
                        required
                        value={newEvalTitle}
                        onChange={e => setNewEvalTitle(e.target.value)}
                        placeholder="ex: Devoir Surveillé N°2"
                        className="w-full px-2.5 py-1.5 rounded bg-white border border-slate-300 text-xs"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Matière</label>
                        <select
                          value={newEvalSubjectId}
                          onChange={e => setNewEvalSubjectId(Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 rounded bg-white border border-slate-300 text-xs font-semibold"
                        >
                          {subjects.map(sub => (
                            <option key={sub.id} value={sub.id}>
                              {sub.name} (Coef {sub.coefficient})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Date</label>
                        <input
                          type="date"
                          value={newEvalDate}
                          onChange={e => setNewEvalDate(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded bg-white border border-slate-300 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Note sur 20 */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Note attribuée (entre 0.00 et 20.00) *
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    step="0.25"
                    min="0"
                    max="20"
                    required
                    value={scoreValue}
                    onChange={e => setScoreValue(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-base font-extrabold text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  <span className="text-sm font-bold text-slate-400">/ 20</span>
                </div>
              </div>

              {/* Observation */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Appréciation pédagogique</label>
                <input
                  type="text"
                  placeholder="ex: Travail rigoureux et bien structuré"
                  value={comments}
                  onChange={e => setComments(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
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
                  Enregistrer la note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2 : Saisie Rapide / Collective par Classe */}
      {isBatchModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2">
                <Table className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-sm">Saisie Rapide des Notes par Classe</h3>
              </div>
              <button onClick={() => setIsBatchModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBatch} className="flex-1 flex flex-col overflow-hidden">
              <div className="p-6 space-y-4 overflow-y-auto flex-1">
                {error && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
                {successMsg && (
                  <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{successMsg}</span>
                  </div>
                )}

                {/* Configuration de l'évaluation pour la classe */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">1. Classe concernée *</label>
                    <select
                      value={batchClassId}
                      onChange={e => handleBatchClassChange(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs font-bold text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      {classes.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.cycle === 'primaire' ? '🏫' : c.cycle === 'superieur' ? '🏛️' : '🎓'} {c.name} ({c.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">2. Matière / UE *</label>
                    <select
                      value={batchSubjectId}
                      onChange={e => setBatchSubjectId(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      {subjects.filter(s => s.classId === batchClassId).map(s => (
                        <option key={s.id} value={s.id}>
                          {s.name} (Coef {s.coefficient})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">3. Type & Date *</label>
                    <div className="grid grid-cols-2 gap-1.5">
                      <select
                        value={batchType}
                        onChange={e => setBatchType(e.target.value as EvaluationType)}
                        className="px-2 py-2 rounded-lg bg-white border border-slate-300 text-xs font-semibold"
                      >
                        <option value="Devoir">Devoir</option>
                        <option value="Interrogation">Interro</option>
                        <option value="Examen">Examen</option>
                        <option value="Projet">Projet</option>
                      </select>
                      <input
                        type="date"
                        value={batchDate}
                        onChange={e => setBatchDate(e.target.value)}
                        className="px-2 py-2 rounded-lg bg-white border border-slate-300 text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Titre de l'évaluation *</label>
                  <input
                    type="text"
                    required
                    value={batchTitle}
                    onChange={e => setBatchTitle(e.target.value)}
                    placeholder="ex: Devoir Surveillé de Trigonométrie"
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-xs font-bold text-slate-800"
                  />
                </div>

                {/* Grille de saisie pour chaque élève de la classe */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-700">
                      Élèves inscrits dans cette classe ({students.filter(s => s.classId === batchClassId).length} élèves) :
                    </span>
                    <span className="text-[11px] text-slate-400">Barème officiel sur 20</span>
                  </div>

                  <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 text-[11px]">
                          <th className="py-2.5 px-3">Élève</th>
                          <th className="py-2.5 px-3">Matricule</th>
                          <th className="py-2.5 px-3 w-32 text-center">Note (/20) *</th>
                          <th className="py-2.5 px-3">Appréciation individuelle</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {students.filter(s => s.classId === batchClassId).map(st => {
                          const val = batchScores[st.id] || '';
                          const comm = batchComments[st.id] || '';

                          return (
                            <tr key={st.id} className="hover:bg-blue-50/40 transition-colors">
                              <td className="py-2.5 px-3">
                                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                  <span>{st.lastName.toUpperCase()} {st.firstName}</span>
                                  {st.isGoodStudent === true && (
                                    <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                                      🌟 Bon
                                    </span>
                                  )}
                                  {st.isGoodStudent === false && (
                                    <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">
                                      ⚠️ Médiocre
                                    </span>
                                  )}
                                </div>
                              </td>

                              <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500 font-bold">
                                {st.matricule}
                              </td>

                              <td className="py-2.5 px-3 text-center">
                                <div className="flex items-center justify-center space-x-1">
                                  <input
                                    type="number"
                                    step="0.25"
                                    min="0"
                                    max="20"
                                    placeholder="ex: 15.5"
                                    value={val}
                                    onChange={e => {
                                      const newVal = e.target.value;
                                      setBatchScores(prev => ({ ...prev, [st.id]: newVal }));
                                    }}
                                    className="w-20 px-2.5 py-1.5 rounded-lg border border-slate-300 font-extrabold text-blue-700 text-center text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
                                  />
                                  <span className="text-[11px] font-bold text-slate-400">/20</span>
                                </div>
                              </td>

                              <td className="py-2.5 px-3">
                                <input
                                  type="text"
                                  placeholder="Appréciation pour cet élève..."
                                  value={comm}
                                  onChange={e => {
                                    const newComm = e.target.value;
                                    setBatchComments(prev => ({ ...prev, [st.id]: newComm }));
                                  }}
                                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500/30"
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
                <span className="text-xs text-slate-500">
                  Remplissez les notes et cliquez sur Enregistrer pour créer l'évaluation et affecter les notes à tous les élèves.
                </span>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsBatchModalOpen(false)}
                    className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex items-center space-x-1.5 px-5 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    <span>Enregistrer toutes les notes</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
