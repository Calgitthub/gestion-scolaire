"""
Contrôleur de gestion des étudiants
CRUD, validation des données, unicité du matricule, recherche multicritères et filtres
"""
import re
from datetime import datetime, date
from typing import List, Optional, Tuple, Dict, Any
from sqlalchemy.orm import Session, joinedload
from database.models import Student, ClassRoom, Grade
from database.database import SessionLocal


class StudentController:
    @staticmethod
    def get_students(search_query: str = "", class_id: Optional[int] = None) -> List[Student]:
        """Retourne la liste des étudiants filtrée par terme de recherche et classe"""
        session: Session = SessionLocal()
        try:
            query = session.query(Student).options(joinedload(Student.classroom))
            if class_id and class_id > 0:
                query = query.filter(Student.class_id == class_id)

            if search_query:
                term = f"%{search_query.strip().lower()}%"
                query = query.filter(
                    (Student.matricule.ilike(term)) |
                    (Student.first_name.ilike(term)) |
                    (Student.last_name.ilike(term))
                )

            return query.order_by(Student.last_name, Student.first_name).all()
        finally:
            session.close()

    @staticmethod
    def get_student_by_id(student_id: int) -> Optional[Student]:
        session = SessionLocal()
        try:
            return session.query(Student).options(joinedload(Student.classroom)).filter(Student.id == student_id).first()
        finally:
            session.close()

    @staticmethod
    def validate_student_data(data: Dict[str, Any], current_id: Optional[int] = None) -> Tuple[bool, str]:
        """Valide rigoureusement l'ensemble des données avant persistance"""
        matricule = data.get("matricule", "").strip()
        first_name = data.get("first_name", "").strip()
        last_name = data.get("last_name", "").strip()
        gender = data.get("gender", "").strip().upper()
        birth_date = data.get("birth_date")
        class_id = data.get("class_id")

        if not matricule:
            return False, "Le numéro de matricule est obligatoire."
        if not first_name:
            return False, "Le prénom de l'étudiant est obligatoire."
        if not last_name:
            return False, "Le nom de l'étudiant est obligatoire."
        if gender not in ["M", "F"]:
            return False, "Le genre doit être 'M' (Masculin) ou 'F' (Féminin)."
        if not birth_date:
            return False, "La date de naissance est obligatoire."
        if not class_id:
            return False, "Veuillez sélectionner une classe pour l'étudiant."

        # Validation de l'email si renseigné
        email = data.get("email", "").strip()
        if email and not re.match(r"[^@]+@[^@]+\.[^@]+", email):
            return False, "Format de l'adresse email invalide."

        # Vérification d'unicité du matricule
        session = SessionLocal()
        try:
            query = session.query(Student).filter(Student.matricule == matricule)
            if current_id:
                query = query.filter(Student.id != current_id)
            if query.first():
                return False, f"Le matricule '{matricule}' est déjà attribué à un autre étudiant."
        finally:
            session.close()

        return True, "Validation réussie."

    @staticmethod
    def create_student(data: Dict[str, Any]) -> Tuple[bool, str, Optional[int]]:
        """Ajoute un nouvel étudiant après validation"""
        is_valid, msg = StudentController.validate_student_data(data)
        if not is_valid:
            return False, msg, None

        session: Session = SessionLocal()
        try:
            new_student = Student(
                matricule=data["matricule"].strip().upper(),
                first_name=data["first_name"].strip(),
                last_name=data["last_name"].strip(),
                gender=data["gender"].strip().upper(),
                birth_date=data["birth_date"],
                address=data.get("address", "").strip(),
                phone=data.get("phone", "").strip(),
                email=data.get("email", "").strip(),
                class_id=int(data["class_id"]),
                enrollment_date=data.get("enrollment_date", date.today())
            )
            session.add(new_student)
            session.commit()
            return True, f"L'étudiant {new_student.full_name} a été enregistré avec succès !", new_student.id
        except Exception as e:
            session.rollback()
            return False, f"Erreur lors de l'enregistrement : {str(e)}", None
        finally:
            session.close()

    @staticmethod
    def update_student(student_id: int, data: Dict[str, Any]) -> Tuple[bool, str]:
        """Met à jour les informations d'un étudiant existant"""
        is_valid, msg = StudentController.validate_student_data(data, current_id=student_id)
        if not is_valid:
            return False, msg

        session: Session = SessionLocal()
        try:
            student = session.query(Student).filter(Student.id == student_id).first()
            if not student:
                return False, "Étudiant introuvable."

            student.matricule = data["matricule"].strip().upper()
            student.first_name = data["first_name"].strip()
            student.last_name = data["last_name"].strip()
            student.gender = data["gender"].strip().upper()
            student.birth_date = data["birth_date"]
            student.address = data.get("address", "").strip()
            student.phone = data.get("phone", "").strip()
            student.email = data.get("email", "").strip()
            student.class_id = int(data["class_id"])

            session.commit()
            return True, "Fiche étudiant mise à jour avec succès !"
        except Exception as e:
            session.rollback()
            return False, f"Erreur lors de la modification : {str(e)}"
        finally:
            session.close()

    @staticmethod
    def delete_student(student_id: int) -> Tuple[bool, str]:
        """Supprime un étudiant et l'ensemble de ses notes associées"""
        session: Session = SessionLocal()
        try:
            student = session.query(Student).filter(Student.id == student_id).first()
            if not student:
                return False, "Étudiant introuvable."
            full_name = student.full_name
            session.delete(student)
            session.commit()
            return True, f"L'étudiant {full_name} et son dossier ont été supprimés définitivement."
        except Exception as e:
            session.rollback()
            return False, f"Erreur lors de la suppression : {str(e)}"
        finally:
            session.close()
