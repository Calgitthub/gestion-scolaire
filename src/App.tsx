import React, { useState, useEffect } from 'react';
import { Sidebar, NavItem } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { StudentsView } from './components/StudentsView';
import { ClassesView } from './components/ClassesView';
import { SubjectsView } from './components/SubjectsView';
import { GradesView } from './components/GradesView';
import { AveragesView } from './components/AveragesView';
import { BulletinView } from './components/BulletinView';
import { UsersView } from './components/UsersView';
import { SettingsView } from './components/SettingsView';
import { LoginModal } from './components/LoginModal';

import {
  INITIAL_STUDENTS,
  INITIAL_CLASSES,
  INITIAL_SUBJECTS,
  INITIAL_EVALUATIONS,
  INITIAL_GRADES,
  INITIAL_USERS,
  INITIAL_SCHOOL_CONFIG
} from './data/initialData';

import { Student, ClassRoom, Subject, Evaluation, Grade, User, SchoolConfig } from './types';

export default function App() {
  // Load state from localStorage or initial defaults (v3 for multi-cycle dataset & teacher accounts)
  const DATA_VERSION = 'edugest_v3_teachers_ready';

  const [students, setStudents] = useState<Student[]>(() => {
    if (localStorage.getItem(DATA_VERSION) !== 'true') return INITIAL_STUDENTS;
    const saved = localStorage.getItem('edugest_v3_students');
    return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
  });

  const [classes, setClasses] = useState<ClassRoom[]>(() => {
    if (localStorage.getItem(DATA_VERSION) !== 'true') return INITIAL_CLASSES;
    const saved = localStorage.getItem('edugest_v3_classes');
    return saved ? JSON.parse(saved) : INITIAL_CLASSES;
  });

  const [subjects, setSubjects] = useState<Subject[]>(() => {
    if (localStorage.getItem(DATA_VERSION) !== 'true') return INITIAL_SUBJECTS;
    const saved = localStorage.getItem('edugest_v3_subjects');
    return saved ? JSON.parse(saved) : INITIAL_SUBJECTS;
  });

  const [evaluations, setEvaluations] = useState<Evaluation[]>(() => {
    if (localStorage.getItem(DATA_VERSION) !== 'true') return INITIAL_EVALUATIONS;
    const saved = localStorage.getItem('edugest_v3_evaluations');
    return saved ? JSON.parse(saved) : INITIAL_EVALUATIONS;
  });

  const [grades, setGrades] = useState<Grade[]>(() => {
    if (localStorage.getItem(DATA_VERSION) !== 'true') return INITIAL_GRADES;
    const saved = localStorage.getItem('edugest_v3_grades');
    return saved ? JSON.parse(saved) : INITIAL_GRADES;
  });

  const [users, setUsers] = useState<User[]>(() => {
    if (localStorage.getItem(DATA_VERSION) !== 'true') return INITIAL_USERS;
    const saved = localStorage.getItem('edugest_v3_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [schoolConfig, setSchoolConfig] = useState<SchoolConfig>(() => {
    if (localStorage.getItem(DATA_VERSION) !== 'true') return INITIAL_SCHOOL_CONFIG;
    const saved = localStorage.getItem('edugest_v3_config');
    return saved ? JSON.parse(saved) : INITIAL_SCHOOL_CONFIG;
  });

  // Current session user
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    return INITIAL_USERS[0]; // Admin by default
  });

  // Navigation tab
  const [currentTab, setCurrentTab] = useState<NavItem>('dashboard');
  const [preselectedStudentId, setPreselectedStudentId] = useState<number | undefined>();

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(DATA_VERSION, 'true');
    localStorage.setItem('edugest_v3_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('edugest_v3_classes', JSON.stringify(classes));
  }, [classes]);

  useEffect(() => {
    localStorage.setItem('edugest_v3_subjects', JSON.stringify(subjects));
  }, [subjects]);

  useEffect(() => {
    localStorage.setItem('edugest_v3_evaluations', JSON.stringify(evaluations));
  }, [evaluations]);

  useEffect(() => {
    localStorage.setItem('edugest_v3_grades', JSON.stringify(grades));
  }, [grades]);

  useEffect(() => {
    localStorage.setItem('edugest_v3_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('edugest_v3_config', JSON.stringify(schoolConfig));
  }, [schoolConfig]);

  // Actions: Students
  const handleAddStudent = (data: Omit<Student, 'id'>) => {
    const newId = students.length > 0 ? Math.max(...students.map(s => s.id)) + 1 : 1;
    const newStudent: Student = { ...data, id: newId };
    setStudents(prev => [...prev, newStudent]);
  };

  const handleUpdateStudent = (id: number, data: Partial<Student>) => {
    setStudents(prev => prev.map(s => (s.id === id ? { ...s, ...data } : s)));
  };

  const handleDeleteStudent = (id: number) => {
    setStudents(prev => prev.filter(s => s.id !== id));
    setGrades(prev => prev.filter(g => g.studentId !== id));
  };

  // Actions: Classes
  const handleAddClass = (data: Omit<ClassRoom, 'id'>) => {
    const newId = classes.length > 0 ? Math.max(...classes.map(c => c.id)) + 1 : 1;
    const newClass: ClassRoom = { ...data, id: newId };
    setClasses(prev => [...prev, newClass]);
  };

  // Actions: Subjects
  const handleAddSubject = (data: Omit<Subject, 'id'>) => {
    const newId = subjects.length > 0 ? Math.max(...subjects.map(s => s.id)) + 1 : 1;
    const newSubject: Subject = { ...data, id: newId };
    setSubjects(prev => [...prev, newSubject]);
  };

  const handleUpdateSubject = (id: number, data: Partial<Subject>) => {
    setSubjects(prev => prev.map(s => (s.id === id ? { ...s, ...data } : s)));
  };

  const handleDeleteSubject = (id: number) => {
    setSubjects(prev => prev.filter(s => s.id !== id));
    const evalsToDelete = evaluations.filter(e => e.subjectId === id).map(e => e.id);
    setEvaluations(prev => prev.filter(e => e.subjectId !== id));
    setGrades(prev => prev.filter(g => !evalsToDelete.includes(g.evaluationId)));
  };

  // Actions: Evaluations & Grades
  const handleCreateEvaluation = (data: Omit<Evaluation, 'id'>): number => {
    const newId = evaluations.length > 0 ? Math.max(...evaluations.map(e => e.id)) + 1 : 1;
    const newEval: Evaluation = { ...data, id: newId };
    setEvaluations(prev => [...prev, newEval]);
    return newId;
  };

  const handleRecordGrade = (data: Omit<Grade, 'id' | 'dateRecorded'>) => {
    // If grade already exists for this student and evaluation, update it
    const existingIndex = grades.findIndex(
      g => g.studentId === data.studentId && g.evaluationId === data.evaluationId
    );

    if (existingIndex >= 0) {
      setGrades(prev =>
        prev.map((g, idx) =>
          idx === existingIndex
            ? { ...g, value: data.value, comments: data.comments, dateRecorded: new Date().toISOString().slice(0, 10) }
            : g
        )
      );
    } else {
      const newId = grades.length > 0 ? Math.max(...grades.map(g => g.id)) + 1 : 1;
      const newGrade: Grade = {
        ...data,
        id: newId,
        dateRecorded: new Date().toISOString().slice(0, 10)
      };
      setGrades(prev => [newGrade, ...prev]);
    }
  };

  const handleDeleteGrade = (id: number) => {
    setGrades(prev => prev.filter(g => g.id !== id));
  };

  // Actions: Batch Grade Recording for Teachers
  const handleRecordBatchGrades = (batch: Array<Omit<Grade, 'id' | 'dateRecorded'>>) => {
    setGrades(prev => {
      let current = [...prev];
      let nextId = current.length > 0 ? Math.max(...current.map(g => g.id)) + 1 : 1;
      const today = new Date().toISOString().slice(0, 10);

      for (const item of batch) {
        const existingIdx = current.findIndex(
          g => g.studentId === item.studentId && g.evaluationId === item.evaluationId
        );
        if (existingIdx >= 0) {
          current[existingIdx] = {
            ...current[existingIdx],
            value: item.value,
            comments: item.comments || current[existingIdx].comments,
            dateRecorded: today
          };
        } else {
          current.unshift({
            ...item,
            id: nextId++,
            dateRecorded: today
          });
        }
      }
      return current;
    });
  };

  // Actions: Users
  const handleAddUser = (data: Omit<User, 'id' | 'createdAt'>) => {
    const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
    const newUser: User = { ...data, id: newId, createdAt: new Date().toISOString().slice(0, 10) };
    setUsers(prev => [...prev, newUser]);
  };

  const handleDeleteUser = (id: number) => {
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  // Direct User Switcher
  const handleSwitchUser = (user: User) => {
    setCurrentUser(user);
  };

  // Role Switcher
  const handleSwitchRole = (role: 'admin' | 'user') => {
    const targetUser = users.find(u => u.role === role) || {
      id: role === 'admin' ? 1 : 2,
      username: role === 'admin' ? 'admin' : 'enseignant',
      fullName: role === 'admin' ? 'Prof. Alexandre Martin' : 'Mme Sophie Bernard',
      role,
      isActive: true,
      createdAt: '2026-09-01'
    };
    setCurrentUser(targetUser);
  };

  // Reset to initial demo data
  const handleResetData = () => {
    setStudents(INITIAL_STUDENTS);
    setClasses(INITIAL_CLASSES);
    setSubjects(INITIAL_SUBJECTS);
    setEvaluations(INITIAL_EVALUATIONS);
    setGrades(INITIAL_GRADES);
    setUsers(INITIAL_USERS);
    setSchoolConfig(INITIAL_SCHOOL_CONFIG);
    localStorage.clear();
  };

  // Export database backup JSON
  const handleExportDatabaseJSON = () => {
    const backupData = {
      schoolConfig,
      classes,
      subjects,
      students,
      evaluations,
      grades,
      users,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `EduGest_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Navigate to student's bulletin
  const handleSelectStudentForBulletin = (studentId: number) => {
    setPreselectedStudentId(studentId);
    setCurrentTab('bulletins');
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 font-sans text-slate-800">
      {/* Login Screen Modal if logged out */}
      {!currentUser && (
        <LoginModal users={users} onLoginSuccess={user => setCurrentUser(user)} />
      )}

      {/* Main Sidebar (10 modules) */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={tab => {
          setPreselectedStudentId(undefined);
          setCurrentTab(tab);
        }}
        currentUser={currentUser || INITIAL_USERS[0]}
        onLogout={() => setCurrentUser(null)}
      />

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Header */}
        <Header
          currentUser={currentUser || INITIAL_USERS[0]}
          users={users}
          onSwitchUser={handleSwitchUser}
          onSwitchRole={handleSwitchRole}
          schoolConfig={schoolConfig}
          onResetData={handleResetData}
        />

        {/* View Content (Scrollable) */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {currentTab === 'dashboard' && (
            <DashboardView
              students={students}
              classes={classes}
              subjects={subjects}
              evaluations={evaluations}
              grades={grades}
              onNavigate={setCurrentTab}
            />
          )}

          {currentTab === 'students' && (
            <StudentsView
              students={students}
              classes={classes}
              currentUser={currentUser || INITIAL_USERS[0]}
              onAddStudent={handleAddStudent}
              onUpdateStudent={handleUpdateStudent}
              onDeleteStudent={handleDeleteStudent}
            />
          )}

          {currentTab === 'classes' && (
            <ClassesView
              classes={classes}
              students={students}
              subjects={subjects}
              currentUser={currentUser || INITIAL_USERS[0]}
              onAddClass={handleAddClass}
            />
          )}

          {currentTab === 'subjects' && (
            <SubjectsView
              subjects={subjects}
              classes={classes}
              currentUser={currentUser || INITIAL_USERS[0]}
              onAddSubject={handleAddSubject}
              onUpdateSubject={handleUpdateSubject}
              onDeleteSubject={handleDeleteSubject}
            />
          )}

          {currentTab === 'grades' && (
            <GradesView
              grades={grades}
              evaluations={evaluations}
              students={students}
              subjects={subjects}
              classes={classes}
              currentUser={currentUser || INITIAL_USERS[0]}
              onRecordGrade={handleRecordGrade}
              onRecordBatchGrades={handleRecordBatchGrades}
              onDeleteGrade={handleDeleteGrade}
              onCreateEvaluation={handleCreateEvaluation}
            />
          )}

          {currentTab === 'averages' && (
            <AveragesView
              students={students}
              classes={classes}
              subjects={subjects}
              evaluations={evaluations}
              grades={grades}
              onSelectStudentForBulletin={handleSelectStudentForBulletin}
            />
          )}

          {currentTab === 'bulletins' && (
            <BulletinView
              students={students}
              classes={classes}
              subjects={subjects}
              evaluations={evaluations}
              grades={grades}
              schoolConfig={schoolConfig}
              preselectedStudentId={preselectedStudentId}
            />
          )}

          {currentTab === 'users' && (
            <UsersView
              users={users}
              currentUser={currentUser || INITIAL_USERS[0]}
              classes={classes}
              subjects={subjects}
              onAddUser={handleAddUser}
              onDeleteUser={handleDeleteUser}
              onSwitchUser={handleSwitchUser}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsView
              schoolConfig={schoolConfig}
              onUpdateSchoolConfig={setSchoolConfig}
              onResetData={handleResetData}
              exportDatabaseJSON={handleExportDatabaseJSON}
            />
          )}
        </main>
      </div>
    </div>
  );
}
