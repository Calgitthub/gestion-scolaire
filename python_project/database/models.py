"""
Modèles Relationnels SQLAlchemy pour l'Application de Gestion des Étudiants
Tables: users, students, classes, subjects, evaluations, grades, academic_years
"""
from datetime import datetime, date
from sqlalchemy import (
    Column, Integer, String, Float, Date, DateTime, ForeignKey, Text, Boolean, UniqueConstraint
)
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

class User(Base):
    """Table des utilisateurs (administrateurs et enseignants)"""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=False)
    role = Column(String(20), nullable=False, default="user")  # 'admin' ou 'user'
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<User(username='{self.username}', role='{self.role}')>"


class AcademicYear(Base):
    """Table des années académiques"""
    __tablename__ = "academic_years"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(20), unique=True, nullable=False)  # Ex: '2026-2027'
    is_current = Column(Boolean, default=True)

    def __repr__(self):
        return f"<AcademicYear(name='{self.name}', current={self.is_current})>"


class ClassRoom(Base):
    """Table des classes ou filières scolaires"""
    __tablename__ = "classes"

    id = Column(Integer, primary_key=True, autoincrement=True)
    code = Column(String(20), unique=True, nullable=False, index=True)  # Ex: 'CM2-A', '3EME-B', 'TS1', 'L1-INFO'
    name = Column(String(100), nullable=False)  # Ex: 'Terminale Scientifique A'
    cycle = Column(String(20), nullable=False, default="secondaire")  # 'primaire', 'secondaire', 'superieur'
    cycle_label = Column(String(60), nullable=True)  # Ex: 'Enseignement Supérieur (LMD)'
    level = Column(String(50), nullable=False)  # Ex: 'CM2', '3ème', 'Lycée', 'Licence 1'
    description = Column(Text, nullable=True)

    # Relations
    students = relationship("Student", back_populates="classroom", cascade="all, delete-orphan")
    subjects = relationship("Subject", back_populates="classroom", cascade="all, delete-orphan")
    evaluations = relationship("Evaluation", back_populates="classroom", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<ClassRoom(code='{self.code}', name='{self.name}', cycle='{self.cycle}')>"


class Subject(Base):
    """Table des matières enseignées avec leurs coefficients"""
    __tablename__ = "subjects"

    id = Column(Integer, primary_key=True, autoincrement=True)
    code = Column(String(20), nullable=False)  # Ex: 'MATHS', 'PC', 'FR', 'INFO-101'
    name = Column(String(100), nullable=False)  # Ex: 'Mathématiques'
    coefficient = Column(Float, nullable=False, default=1.0)
    ects_credits = Column(Integer, nullable=True)  # Crédits ECTS pour le supérieur (LMD)
    class_id = Column(Integer, ForeignKey("classes.id", ondelete="CASCADE"), nullable=False)

    # Relations
    classroom = relationship("ClassRoom", back_populates="subjects")
    evaluations = relationship("Evaluation", back_populates="subject", cascade="all, delete-orphan")

    __table_args__ = (
        UniqueConstraint('code', 'class_id', name='uq_subject_code_class'),
    )

    def __repr__(self):
        return f"<Subject(code='{self.code}', name='{self.name}', coef={self.coefficient}, ects={self.ects_credits})>"


class Student(Base):
    """Table des étudiants inscrits"""
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, autoincrement=True)
    matricule = Column(String(30), unique=True, nullable=False, index=True)  # Ex: 'MAT-2026-001'
    first_name = Column(String(60), nullable=False)
    last_name = Column(String(60), nullable=False)
    gender = Column(String(10), nullable=False)  # 'M' ou 'F'
    birth_date = Column(Date, nullable=False)
    address = Column(String(255), nullable=True)
    phone = Column(String(30), nullable=True)
    email = Column(String(120), nullable=True)
    enrollment_date = Column(Date, default=date.today)
    is_good_student = Column(Boolean, nullable=True)  # True = élève bon, False = élève en difficulté / médiocre
    class_id = Column(Integer, ForeignKey("classes.id", ondelete="RESTRICT"), nullable=False)

    # Relations
    classroom = relationship("ClassRoom", back_populates="students")
    grades = relationship("Grade", back_populates="student", cascade="all, delete-orphan")

    @property
    def full_name(self):
        return f"{self.last_name.upper()} {self.first_name}"

    def __repr__(self):
        return f"<Student(matricule='{self.matricule}', name='{self.full_name}')>"


class Evaluation(Base):
    """Table des évaluations (devoir, interrogation, examen)"""
    __tablename__ = "evaluations"

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(100), nullable=False)  # Ex: 'Contrôle Continu N°1'
    eval_type = Column(String(30), nullable=False)  # 'Devoir', 'Interrogation', 'Examen'
    date = Column(Date, nullable=False, default=date.today)
    period = Column(String(30), default="Semestre 1")  # Semestre ou Trimestre
    max_score = Column(Float, default=20.0)
    subject_id = Column(Integer, ForeignKey("subjects.id", ondelete="CASCADE"), nullable=False)
    class_id = Column(Integer, ForeignKey("classes.id", ondelete="CASCADE"), nullable=False)

    # Relations
    subject = relationship("Subject", back_populates="evaluations")
    classroom = relationship("ClassRoom", back_populates="evaluations")
    grades = relationship("Grade", back_populates="evaluation", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Evaluation(title='{self.title}', type='{self.eval_type}', date='{self.date}')>"


class Grade(Base):
    """Table des notes des étudiants (notées sur 20)"""
    __tablename__ = "grades"

    id = Column(Integer, primary_key=True, autoincrement=True)
    value = Column(Float, nullable=False)  # Note entre 0.0 et 20.0
    comments = Column(String(255), nullable=True)
    date_recorded = Column(DateTime, default=datetime.utcnow)
    
    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    evaluation_id = Column(Integer, ForeignKey("evaluations.id", ondelete="CASCADE"), nullable=False)

    # Relations
    student = relationship("Student", back_populates="grades")
    evaluation = relationship("Evaluation", back_populates="grades")

    __table_args__ = (
        UniqueConstraint('student_id', 'evaluation_id', name='uq_student_evaluation_grade'),
    )

    def __repr__(self):
        return f"<Grade(student_id={self.student_id}, eval_id={self.evaluation_id}, value={self.value})>"
