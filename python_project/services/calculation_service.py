"""
Service de calcul mathématique des moyennes, classements et mentions
Respecte les règles académiques strictes :
- Moyenne par matière = Somme des notes / Nombre de notes
- Moyenne générale pondérée = Somme(Moyenne matière * Coef) / Somme(Coefs)
- Prise en compte uniquement des matières avec au moins une note
- Détermination automatique du Rang, de la Mention et du Statut (Admis / Ajourné)
"""
from typing import Dict, List, Optional, Tuple
from sqlalchemy.orm import Session
from database.models import Student, Subject, Evaluation, Grade, ClassRoom


def get_mention(average: float) -> str:
    """Retourne la mention académique selon le barème officiel"""
    if average is None:
        return "Non évalué"
    if average >= 16.0:
        return "Très bien"
    elif average >= 14.0:
        return "Bien"
    elif average >= 12.0:
        return "Assez bien"
    elif average >= 10.0:
        return "Passable"
    else:
        return "Insuffisant"


def get_status(average: float) -> str:
    """Retourne le statut d'admission (Admis si >= 10.0, sinon Ajourné)"""
    if average is None:
        return "En cours"
    return "Admis" if average >= 10.0 else "Ajourné"


def get_student_subject_averages(student_id: int, session: Session) -> Dict[int, Dict]:
    """
    Calcule pour chaque matière de la classe de l'étudiant :
    - La liste des notes obtenues
    - Le nombre de notes
    - La moyenne brute de la matière
    - Le coefficient
    - Les points pondérés (moyenne * coefficient)
    """
    student = session.query(Student).filter(Student.id == student_id).first()
    if not student:
        return {}

    # Récupérer toutes les matières de sa classe
    subjects = session.query(Subject).filter(Subject.class_id == student.class_id).all()
    
    # Récupérer toutes les notes de l'étudiant avec l'évaluation liée
    grades = (
        session.query(Grade)
        .join(Evaluation, Grade.evaluation_id == Evaluation.id)
        .filter(Grade.student_id == student_id)
        .all()
    )

    # Grouper les notes par matière
    grades_by_subject: Dict[int, List[float]] = {s.id: [] for s in subjects}
    for g in grades:
        subj_id = g.evaluation.subject_id
        if subj_id in grades_by_subject:
            grades_by_subject[subj_id].append(g.value)

    results = {}
    for subj in subjects:
        subj_grades = grades_by_subject[subj.id]
        if subj_grades:
            avg = sum(subj_grades) / len(subj_grades)
            weighted_points = avg * subj.coefficient
            has_grades = True
        else:
            avg = None
            weighted_points = None
            has_grades = False

        results[subj.id] = {
            "subject_id": subj.id,
            "code": subj.code,
            "name": subj.name,
            "coefficient": subj.coefficient,
            "grades": subj_grades,
            "count": len(subj_grades),
            "average": round(avg, 2) if avg is not None else None,
            "weighted_points": round(weighted_points, 2) if weighted_points is not None else None,
            "has_grades": has_grades
        }

    return results


def calculate_student_overall(student_id: int, session: Session) -> Dict:
    """
    Calcule la moyenne générale pondérée de l'étudiant.
    Règle : Moyenne = Somme(moyenne_matière * coef) / Somme(coefficients pris en compte)
    """
    subject_details = get_student_subject_averages(student_id, session)
    
    total_weighted_points = 0.0
    total_effective_coefficients = 0.0
    evaluated_subjects_count = 0

    for item in subject_details.values():
        if item["has_grades"] and item["average"] is not None:
            total_weighted_points += (item["average"] * item["coefficient"])
            total_effective_coefficients += item["coefficient"]
            evaluated_subjects_count += 1

    if total_effective_coefficients > 0:
        overall_average = round(total_weighted_points / total_effective_coefficients, 2)
    else:
        overall_average = None

    return {
        "student_id": student_id,
        "subjects": subject_details,
        "overall_average": overall_average,
        "total_weighted_points": round(total_weighted_points, 2),
        "total_coefficients": total_effective_coefficients,
        "evaluated_subjects_count": evaluated_subjects_count,
        "mention": get_mention(overall_average),
        "status": get_status(overall_average)
    }


def calculate_class_rankings(class_id: int, session: Session) -> List[Dict]:
    """
    Calcule les moyennes de tous les étudiants d'une classe et attribue les rangs.
    Gère les ex-aequo avec courtoisie.
    """
    students = session.query(Student).filter(Student.class_id == class_id).all()
    results = []

    for st in students:
        overview = calculate_student_overall(st.id, session)
        results.append({
            "student": st,
            "student_id": st.id,
            "matricule": st.matricule,
            "name": st.full_name,
            "gender": st.gender,
            "overall_average": overview["overall_average"],
            "mention": overview["mention"],
            "status": overview["status"],
            "total_weighted_points": overview["total_weighted_points"],
            "total_coefficients": overview["total_coefficients"]
        })

    # Tri par moyenne décroissante (les None vont à la fin)
    results.sort(
        key=lambda x: (x["overall_average"] is not None, x["overall_average"] if x["overall_average"] is not None else -1),
        reverse=True
    )

    # Attribution du rang (1er, 2ème, 3ème...)
    current_rank = 1
    for i, item in enumerate(results):
        if item["overall_average"] is None:
            item["rank"] = "-"
            item["rank_str"] = "Non classé"
        else:
            if i > 0 and results[i - 1]["overall_average"] == item["overall_average"]:
                item["rank"] = results[i - 1]["rank"]
            else:
                item["rank"] = current_rank
            
            rank_val = item["rank"]
            item["rank_str"] = f"{rank_val}er" if rank_val == 1 else f"{rank_val}ème"
            current_rank = i + 2

    return results


def get_class_statistics(class_id: int, session: Session) -> Dict:
    """Statistiques globales d'une classe : moyenne générale, taux de réussite, min, max"""
    rankings = calculate_class_rankings(class_id, session)
    valid_averages = [r["overall_average"] for r in rankings if r["overall_average"] is not None]

    if not valid_averages:
        return {
            "total_students": len(rankings),
            "evaluated_students": 0,
            "class_average": 0.0,
            "min_average": 0.0,
            "max_average": 0.0,
            "passed_count": 0,
            "failed_count": 0,
            "success_rate": 0.0
        }

    passed = sum(1 for a in valid_averages if a >= 10.0)
    failed = len(valid_averages) - passed
    class_avg = sum(valid_averages) / len(valid_averages)
    success_rate = (passed / len(valid_averages)) * 100.0

    return {
        "total_students": len(rankings),
        "evaluated_students": len(valid_averages),
        "class_average": round(class_avg, 2),
        "min_average": round(min(valid_averages), 2),
        "max_average": round(max(valid_averages), 2),
        "passed_count": passed,
        "failed_count": failed,
        "success_rate": round(success_rate, 1)
    }
