"""
Initialisation et gestion de la session de Base de Données SQLite avec SQLAlchemy
"""
import os
import hashlib
from datetime import date, datetime
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, scoped_session
from config import DATABASE_URI
from database.models import Base, User, AcademicYear, ClassRoom, Subject, Student, Evaluation, Grade

# Création du moteur SQLite
# check_same_thread=False permet l'accès multi-thread sécurisé pour CustomTkinter
engine = create_engine(
    DATABASE_URI,
    echo=False,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URI else {}
)

# Session thread-safe
session_factory = sessionmaker(bind=engine, autoflush=False, autocommit=False)
SessionLocal = scoped_session(session_factory)


def get_db():
    """Générateur de session pour les contextes d'exécution"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def hash_password(password: str) -> str:
    """Hachage sécurisé du mot de passe (SHA-256 avec salage constant pour compatibilité native)"""
    salt = "EduGestSecure2026!#"
    return hashlib.sha256((salt + password).encode("utf-8")).hexdigest()


def seed_demo_data(session):
    """Insère un jeu complet de données de démonstration pour tester immédiatement le logiciel"""
    # 1. Année Académique
    year = AcademicYear(name="2026-2027", is_current=True)
    session.add(year)

    # 2. Utilisateurs : Administrateur et Utilisateur Enseignant
    admin_user = User(
        username="admin",
        password_hash=hash_password("admin123"),
        full_name="Prof. Alexandre Martin",
        role="admin"
    )
    teacher_user = User(
        username="enseignant",
        password_hash=hash_password("prof123"),
        full_name="Mme Sophie Bernard",
        role="user"
    )
    session.add_all([admin_user, teacher_user])
    session.flush()

    # 3. Classes
    c1 = ClassRoom(code="TS1", name="Terminale Scientifique A", level="Lycée - Terminale", description="Section Mathématiques & Physique")
    c2 = ClassRoom(code="L1-INFO", name="Licence 1 Informatique", level="Université - L1", description="Tronc commun Informatique & Maths")
    c3 = ClassRoom(code="2NDE-A", name="Seconde Générale A", level="Lycée - 2nde", description="Section générale")
    session.add_all([c1, c2, c3])
    session.flush()

    # 4. Matières avec Coefficients
    # Pour Terminale Scientifique (TS1)
    s_ts_math = Subject(code="MATH-TS", name="Mathématiques", coefficient=5.0, class_id=c1.id)
    s_ts_pc = Subject(code="PHYS-TS", name="Physique-Chimie", coefficient=4.0, class_id=c1.id)
    s_ts_svt = Subject(code="SVT-TS", name="Sciences de la Vie et Terre", coefficient=3.0, class_id=c1.id)
    s_ts_fr = Subject(code="PHIL-TS", name="Philosophie", coefficient=3.0, class_id=c1.id)
    s_ts_ang = Subject(code="ANG-TS", name="Anglais LV1", coefficient=2.0, class_id=c1.id)

    # Pour Licence 1 Info (L1-INFO)
    s_l1_algo = Subject(code="ALGO-1", name="Algorithmique & Python", coefficient=4.0, class_id=c2.id)
    s_l1_arch = Subject(code="ARCH-1", name="Architecture des Ordinateurs", coefficient=3.0, class_id=c2.id)
    s_l1_math = Subject(code="MATH-DISC", name="Mathématiques Discrètes", coefficient=4.0, class_id=c2.id)
    s_l1_web = Subject(code="DEV-WEB", name="Développement Web & BDD", coefficient=3.0, class_id=c2.id)
    s_l1_ang = Subject(code="ANG-TECH", name="Anglais Technique", coefficient=2.0, class_id=c2.id)

    session.add_all([
        s_ts_math, s_ts_pc, s_ts_svt, s_ts_fr, s_ts_ang,
        s_l1_algo, s_l1_arch, s_l1_math, s_l1_web, s_l1_ang
    ])
    session.flush()

    # 5. Étudiants
    students_data = [
        # TS1
        ("MAT-2026-001", "Lucas", "Dupont", "M", date(2008, 3, 14), "14 Rue Victor Hugo, Paris", "06 12 34 56 78", "lucas.dupont@email.com", c1.id),
        ("MAT-2026-002", "Camille", "Laurent", "F", date(2008, 7, 22), "8 Boulevard Saint-Michel, Paris", "06 23 45 67 89", "camille.laurent@email.com", c1.id),
        ("MAT-2026-003", "Thomas", "Moreau", "M", date(2008, 1, 9), "25 Avenue des Fleurs, Lyon", "06 34 56 78 90", "thomas.moreau@email.com", c1.id),
        ("MAT-2026-004", "Emma", "Petit", "F", date(2008, 11, 30), "3 Allée des Acacias, Versailles", "06 45 67 89 01", "emma.petit@email.com", c1.id),
        ("MAT-2026-005", "Maxime", "Roux", "M", date(2007, 12, 5), "78 Rue Nationale, Lille", "06 56 78 90 12", "maxime.roux@email.com", c1.id),
        ("MAT-2026-006", "Léa", "Fournier", "F", date(2008, 5, 18), "12 Rue de la Paix, Nantes", "06 67 89 01 23", "lea.fournier@email.com", c1.id),
        ("MAT-2026-007", "Antoine", "Girard", "M", date(2008, 9, 3), "45 Rue du Commerce, Bordeaux", "06 78 90 12 34", "antoine.girard@email.com", c1.id),
        ("MAT-2026-008", "Chloé", "Mercier", "F", date(2008, 4, 27), "90 Cours Gambetta, Toulouse", "06 89 01 23 45", "chloe.mercier@email.com", c1.id),
        
        # L1-INFO
        ("MAT-2026-009", "Yassine", "Benali", "M", date(2006, 6, 15), "18 Rue Voltaire, Marseille", "07 11 22 33 44", "yassine.b@univ.edu", c2.id),
        ("MAT-2026-010", "Inès", "Diallo", "F", date(2006, 2, 8), "5 Rue de l'Avenir, Rennes", "07 22 33 44 55", "ines.d@univ.edu", c2.id),
        ("MAT-2026-011", "Julien", "Fabre", "M", date(2005, 10, 12), "31 Rue Pasteur, Grenoble", "07 33 44 55 66", "julien.f@univ.edu", c2.id),
        ("MAT-2026-012", "Sarah", "Lemoine", "F", date(2006, 8, 20), "66 Avenue Jean Jaurès, Nice", "07 44 55 66 77", "sarah.l@univ.edu", c2.id),
    ]

    students_created = []
    for mat, fn, ln, g, bd, addr, ph, em, cid in students_data:
        st = Student(
            matricule=mat,
            first_name=fn,
            last_name=ln,
            gender=g,
            birth_date=bd,
            address=addr,
            phone=ph,
            email=em,
            class_id=cid,
            enrollment_date=date(2026, 9, 1)
        )
        session.add(st)
        students_created.append(st)
    session.flush()

    # 6. Évaluations et Notes pour TS1
    # Évaluations Mathématiques
    ev_math1 = Evaluation(title="Devoir Surveillé N°1", eval_type="Devoir", date=date(2026, 10, 10), subject_id=s_ts_math.id, class_id=c1.id)
    ev_math2 = Evaluation(title="Interrogation Surprise", eval_type="Interrogation", date=date(2026, 10, 25), subject_id=s_ts_math.id, class_id=c1.id)
    ev_math3 = Evaluation(title="Examen Blanc Trimestriel", eval_type="Examen", date=date(2026, 11, 20), subject_id=s_ts_math.id, class_id=c1.id)

    # Évaluations Physique
    ev_pc1 = Evaluation(title="Devoir Physique Mécanique", eval_type="Devoir", date=date(2026, 10, 15), subject_id=s_ts_pc.id, class_id=c1.id)
    ev_pc2 = Evaluation(title="Examen Chimie des Solutions", eval_type="Examen", date=date(2026, 11, 22), subject_id=s_ts_pc.id, class_id=c1.id)

    # Évaluations Philo & Anglais
    ev_philo1 = Evaluation(title="Dissertation Philosophique", eval_type="Devoir", date=date(2026, 10, 18), subject_id=s_ts_fr.id, class_id=c1.id)
    ev_ang1 = Evaluation(title="Compréhension et Expression", eval_type="Examen", date=date(2026, 11, 5), subject_id=s_ts_ang.id, class_id=c1.id)
    ev_svt1 = Evaluation(title="Évaluation Génétique", eval_type="Devoir", date=date(2026, 10, 30), subject_id=s_ts_svt.id, class_id=c1.id)

    session.add_all([ev_math1, ev_math2, ev_math3, ev_pc1, ev_pc2, ev_philo1, ev_ang1, ev_svt1])
    session.flush()

    # Notes pour les élèves de TS1 (notes réalistes et variées)
    # Lucas Dupont (Excellent: ~16-18)
    # Camille Laurent (Très bonne: ~15-17)
    # Thomas Moreau (Moyen: ~11-13)
    # Emma Petit (Bien: ~13-15)
    # Maxime Roux (Difficultés: ~7-9)
    # Léa Fournier (Passable: ~10-12)
    # Antoine Girard (Bon: ~14-16)
    # Chloé Mercier (Très bien: ~16-19)

    notes_mapping = {
        0: [17.5, 18.0, 16.5, 16.0, 17.0, 14.0, 18.0, 15.5],  # Lucas
        1: [15.0, 16.5, 15.5, 14.5, 16.0, 15.0, 17.5, 16.0],  # Camille
        2: [11.0, 12.0, 10.5, 11.5, 10.0, 13.0, 12.5, 11.0],  # Thomas
        3: [14.0, 13.5, 15.0, 13.0, 14.5, 12.0, 16.0, 14.0],  # Emma
        4: [8.5,  9.0,  7.5,  8.0,  9.5,  11.0, 10.0, 8.0],   # Maxime
        5: [10.5, 11.0, 10.0, 11.0, 12.0, 10.5, 13.0, 10.0],  # Léa
        6: [14.5, 15.0, 14.0, 15.5, 13.5, 12.5, 15.0, 14.0],  # Antoine
        7: [19.0, 18.5, 18.0, 17.5, 18.5, 16.0, 19.5, 17.0],  # Chloé
    }

    evals_list = [ev_math1, ev_math2, ev_math3, ev_pc1, ev_pc2, ev_philo1, ev_ang1, ev_svt1]

    for st_idx, grades_list in notes_mapping.items():
        st = students_created[st_idx]
        for eval_obj, val in zip(evals_list, grades_list):
            g = Grade(
                value=float(val),
                student_id=st.id,
                evaluation_id=eval_obj.id,
                comments="Bon travail" if val >= 14 else ("Satisfaisant" if val >= 10 else "À approfondir")
            )
            session.add(g)

    # Évaluations et notes pour L1 Info
    ev_algo = Evaluation(title="TP Noté Algorithmes de Tri", eval_type="Devoir", date=date(2026, 10, 12), subject_id=s_l1_algo.id, class_id=c2.id)
    ev_bdd = Evaluation(title="Projet Conception SQL", eval_type="Examen", date=date(2026, 11, 15), subject_id=s_l1_web.id, class_id=c2.id)
    session.add_all([ev_algo, ev_bdd])
    session.flush()

    for idx, l1_st in enumerate(students_created[8:]):
        vals = [14.5 + idx, 15.0 - idx]
        for ev, v in zip([ev_algo, ev_bdd], vals):
            session.add(Grade(value=min(20.0, max(0.0, float(v))), student_id=l1_st.id, evaluation_id=ev.id))

    session.commit()
    print("[EduGest DB] Initialisation et injection des donnees de demonstration effectuees avec succes !")


def init_db():
    """Initialise le schéma et insère les données de base si la base est vierge"""
    Base.metadata.create_all(bind=engine)
    session = SessionLocal()
    try:
        # Vérifie si la table users est déjà remplie
        if session.query(User).count() == 0:
            seed_demo_data(session)
    except Exception as e:
        session.rollback()
        print(f"[EduGest DB Error] Erreur lors de l'initialisation : {e}")
    finally:
        session.close()
