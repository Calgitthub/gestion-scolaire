"""
Contrôleur de gestion des matières et des classes
Gère l'attribution des coefficients et l'association des cours aux filières
"""
from typing import List, Optional, Tuple, Dict, Any
from sqlalchemy.orm import Session, joinedload
from database.models import Subject, ClassRoom, Student
from database.database import SessionLocal


class SubjectController:
    # --- GESTION DES CLASSES ---
    @staticmethod
    def get_classes() -> List[ClassRoom]:
        """Retourne toutes les classes avec le nombre d'élèves"""
        session: Session = SessionLocal()
        try:
            return session.query(ClassRoom).order_by(ClassRoom.name).all()
        finally:
            session.close()

    @staticmethod
    def create_class(code: str, name: str, level: str, description: str = "") -> Tuple[bool, str]:
        code = code.strip().upper()
        name = name.strip()
        if not code or not name or not level:
            return False, "Le code, l'intitulé et le niveau de la classe sont requis."

        session = SessionLocal()
        try:
            if session.query(ClassRoom).filter(ClassRoom.code == code).first():
                return False, f"La classe avec le code '{code}' existe déjà."

            classroom = ClassRoom(code=code, name=name, level=level, description=description)
            session.add(classroom)
            session.commit()
            return True, f"Classe '{name}' créée avec succès !"
        except Exception as e:
            session.rollback()
            return False, f"Erreur : {str(e)}"
        finally:
            session.close()

    # --- GESTION DES MATIÈRES ---
    @staticmethod
    def get_subjects(class_id: Optional[int] = None) -> List[Subject]:
        """Retourne les matières enseignées avec la classe associée"""
        session: Session = SessionLocal()
        try:
            query = session.query(Subject).options(joinedload(Subject.classroom))
            if class_id and class_id > 0:
                query = query.filter(Subject.class_id == class_id)
            return query.order_by(Subject.name).all()
        finally:
            session.close()

    @staticmethod
    def create_subject(code: str, name: str, coefficient: float, class_id: int) -> Tuple[bool, str]:
        code = code.strip().upper()
        name = name.strip()
        if not code or not name:
            return False, "Le code et le nom de la matière sont obligatoires."
        if coefficient <= 0:
            return False, "Le coefficient doit être strictement supérieur à 0."
        if not class_id:
            return False, "Une matière doit obligatoirement être rattachée à une classe."

        session = SessionLocal()
        try:
            existing = session.query(Subject).filter(Subject.code == code, Subject.class_id == class_id).first()
            if existing:
                return False, f"La matière '{code}' existe déjà pour cette classe."

            subj = Subject(code=code, name=name, coefficient=float(coefficient), class_id=class_id)
            session.add(subj)
            session.commit()
            return True, f"Matière '{name}' (Coef {coefficient}) ajoutée avec succès !"
        except Exception as e:
            session.rollback()
            return False, f"Erreur lors de la création : {str(e)}"
        finally:
            session.close()

    @staticmethod
    def update_subject(subject_id: int, code: str, name: str, coefficient: float, class_id: int) -> Tuple[bool, str]:
        code = code.strip().upper()
        name = name.strip()
        if not code or not name or coefficient <= 0:
            return False, "Veuillez fournir des valeurs valides."

        session = SessionLocal()
        try:
            subj = session.query(Subject).filter(Subject.id == subject_id).first()
            if not subj:
                return False, "Matière introuvable."

            subj.code = code
            subj.name = name
            subj.coefficient = float(coefficient)
            subj.class_id = class_id
            session.commit()
            return True, "Matière mise à jour avec succès !"
        except Exception as e:
            session.rollback()
            return False, f"Erreur : {str(e)}"
        finally:
            session.close()

    @staticmethod
    def delete_subject(subject_id: int) -> Tuple[bool, str]:
        session = SessionLocal()
        try:
            subj = session.query(Subject).filter(Subject.id == subject_id).first()
            if not subj:
                return False, "Matière introuvable."
            name = subj.name
            session.delete(subj)
            session.commit()
            return True, f"Matière '{name}' et ses notes associées ont été supprimées."
        except Exception as e:
            session.rollback()
            return False, f"Erreur lors de la suppression : {str(e)}"
        finally:
            session.close()
