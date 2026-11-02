"""
Contrôleur de gestion des évaluations et des notes
Garantit la contrainte stricte que les notes sont comprises entre 0.0 et 20.0
"""
from typing import List, Optional, Tuple, Dict, Any
from datetime import date
from sqlalchemy.orm import Session, joinedload
from database.models import Grade, Evaluation, Student, Subject
from database.database import SessionLocal


class GradeController:
    @staticmethod
    def get_evaluations(subject_id: Optional[int] = None, class_id: Optional[int] = None) -> List[Evaluation]:
        session: Session = SessionLocal()
        try:
            query = session.query(Evaluation).options(joinedload(Evaluation.subject), joinedload(Evaluation.classroom))
            if subject_id:
                query = query.filter(Evaluation.subject_id == subject_id)
            if class_id:
                query = query.filter(Evaluation.class_id == class_id)
            return query.order_by(Evaluation.date.desc()).all()
        finally:
            session.close()

    @staticmethod
    def create_evaluation(title: str, eval_type: str, eval_date: date, subject_id: int, class_id: int, period: str = "Semestre 1") -> Tuple[bool, str, Optional[int]]:
        title = title.strip()
        if not title:
            return False, "Le titre de l'évaluation est requis.", None
        if eval_type not in ["Devoir", "Interrogation", "Examen"]:
            return False, "Type d'évaluation invalide (choisir Devoir, Interrogation ou Examen).", None

        session = SessionLocal()
        try:
            evaluation = Evaluation(
                title=title,
                eval_type=eval_type,
                date=eval_date,
                subject_id=subject_id,
                class_id=class_id,
                period=period
            )
            session.add(evaluation)
            session.commit()
            return True, f"Évaluation '{title}' créée !", evaluation.id
        except Exception as e:
            session.rollback()
            return False, f"Erreur : {str(e)}", None
        finally:
            session.close()

    @staticmethod
    def record_grade(student_id: int, evaluation_id: int, value: float, comments: str = "") -> Tuple[bool, str]:
        """Enregistre ou modifie la note d'un étudiant pour une évaluation donnée"""
        try:
            val = float(value)
        except (ValueError, TypeError):
            return False, "La note doit être un nombre valide."

        if val < 0.0 or val > 20.0:
            return False, "La note doit impérativement être comprise entre 0 et 20."

        session: Session = SessionLocal()
        try:
            # Vérifier si une note existe déjà pour cette évaluation
            grade = session.query(Grade).filter(
                Grade.student_id == student_id,
                Grade.evaluation_id == evaluation_id
            ).first()

            if grade:
                grade.value = round(val, 2)
                grade.comments = comments.strip()
                action = "mise à jour"
            else:
                grade = Grade(
                    student_id=student_id,
                    evaluation_id=evaluation_id,
                    value=round(val, 2),
                    comments=comments.strip()
                )
                session.add(grade)
                action = "enregistrée"

            session.commit()
            return True, f"Note de {val:.2f}/20 {action} avec succès !"
        except Exception as e:
            session.rollback()
            return False, f"Erreur lors de l'enregistrement de la note : {str(e)}"
        finally:
            session.close()

    @staticmethod
    def get_student_grades(student_id: int) -> List[Grade]:
        """Récupère toutes les notes d'un étudiant avec leurs évaluations et matières"""
        session: Session = SessionLocal()
        try:
            return (
                session.query(Grade)
                .options(joinedload(Grade.evaluation).joinedload(Evaluation.subject))
                .filter(Grade.student_id == student_id)
                .order_by(Grade.date_recorded.desc())
                .all()
            )
        finally:
            session.close()

    @staticmethod
    def delete_grade(grade_id: int) -> Tuple[bool, str]:
        session: Session = SessionLocal()
        try:
            grade = session.query(Grade).filter(Grade.id == grade_id).first()
            if not grade:
                return False, "Note introuvable."
            session.delete(grade)
            session.commit()
            return True, "Note supprimée."
        except Exception as e:
            session.rollback()
            return False, f"Erreur : {str(e)}"
        finally:
            session.close()
