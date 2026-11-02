"""
Vue de gestion des évaluations et saisie des notes avec CustomTkinter
Validation stricte de la notation entre 0.0 et 20.0
"""
import customtkinter as ctk
from datetime import datetime, date
from tkinter import messagebox
from typing import Optional

from controllers.grade_controller import GradeController
from controllers.student_controller import StudentController
from controllers.subject_controller import SubjectController
from controllers.auth_controller import AuthController
from database.database import SessionLocal
from database.models import Grade, Evaluation, Student, Subject, ClassRoom
from config import COLOR_PRIMARY_NAVY, COLOR_SECONDARY_BLUE, COLOR_DANGER, COLOR_CARD_BG, COLOR_BG_LIGHT


class GradesView(ctk.CTkFrame):
    def __init__(self, master):
        super().__init__(master, fg_color=COLOR_BG_LIGHT)
        self.pack(fill="both", expand=True, padx=25, pady=25)
        self._build_ui()
        self._load_grades_history()

    def _build_ui(self):
        # 1. En-tête
        top_bar = ctk.CTkFrame(self, fg_color="transparent")
        top_bar.pack(fill="x", pady=(0, 15))

        title = ctk.CTkLabel(
            top_bar,
            text="Gestion des Notes & Évaluations",
            font=ctk.CTkFont(size=20, weight="bold"),
            text_color="#0F172A"
        )
        title.pack(side="left")

        btn_add = ctk.CTkButton(
            top_bar,
            text="➕ Saisir une Note",
            height=38,
            corner_radius=8,
            fg_color=COLOR_PRIMARY_NAVY,
            hover_color=COLOR_SECONDARY_BLUE,
            font=ctk.CTkFont(size=12, weight="bold"),
            command=self._open_record_modal
        )
        btn_add.pack(side="right")

        # 2. Tableau de l'historique des notes enregistrées
        table_container = ctk.CTkFrame(self, fg_color=COLOR_CARD_BG, corner_radius=12, border_width=1, border_color="#E2E8F0")
        table_container.pack(fill="both", expand=True)

        header = ctk.CTkFrame(table_container, fg_color="#1E3A8A", height=38, corner_radius=0)
        header.pack(fill="x")

        cols = [
            ("Date", 90),
            ("Étudiant", 190),
            ("Classe", 140),
            ("Matière", 180),
            ("Évaluation & Type", 190),
            ("Note / 20", 90),
            ("Actions", 80)
        ]
        for title, width in cols:
            lbl = ctk.CTkLabel(header, text=title, font=ctk.CTkFont(size=11, weight="bold"), text_color="#FFFFFF", width=width, anchor="w")
            lbl.pack(side="left", padx=10, pady=8)

        self.rows_frame = ctk.CTkScrollableFrame(table_container, fg_color="transparent")
        self.rows_frame.pack(fill="both", expand=True)

    def _load_grades_history(self):
        for widget in self.rows_frame.winfo_children():
            widget.destroy()

        session = SessionLocal()
        try:
            grades = (
                session.query(Grade)
                .join(Student)
                .join(Evaluation)
                .order_by(Grade.date_recorded.desc())
                .limit(100)
                .all()
            )

            if not grades:
                ctk.CTkLabel(self.rows_frame, text="Aucune note enregistrée pour le moment.", font=ctk.CTkFont(size=12, slant="italic"), text_color="#94A3B8").pack(pady=40)
                return

            for idx, g in enumerate(grades):
                bg = "#FFFFFF" if idx % 2 == 0 else "#F8FAFC"
                row = ctk.CTkFrame(self.rows_frame, fg_color=bg, height=40, corner_radius=0)
                row.pack(fill="x", pady=1)

                d_str = g.evaluation.date.strftime("%d/%m/%Y") if g.evaluation else "-"
                ctk.CTkLabel(row, text=d_str, font=ctk.CTkFont(size=11), text_color="#475569", width=90, anchor="w").pack(side="left", padx=10)
                
                st_name = g.student.full_name if g.student else "-"
                ctk.CTkLabel(row, text=st_name, font=ctk.CTkFont(size=11, weight="bold"), text_color="#0F172A", width=190, anchor="w").pack(side="left", padx=10)

                c_name = g.student.classroom.code if (g.student and g.student.classroom) else "-"
                ctk.CTkLabel(row, text=c_name, font=ctk.CTkFont(size=11), text_color="#64748B", width=140, anchor="w").pack(side="left", padx=10)

                subj_name = g.evaluation.subject.name if (g.evaluation and g.evaluation.subject) else "-"
                ctk.CTkLabel(row, text=subj_name, font=ctk.CTkFont(size=11), text_color="#0284C7", width=180, anchor="w").pack(side="left", padx=10)

                ev_info = f"{g.evaluation.title} ({g.evaluation.eval_type})" if g.evaluation else "-"
                ctk.CTkLabel(row, text=ev_info, font=ctk.CTkFont(size=11), text_color="#334155", width=190, anchor="w").pack(side="left", padx=10)

                # Badge Note
                score_color = "#10B981" if g.value >= 14 else ("#2563EB" if g.value >= 10 else "#EF4444")
                ctk.CTkLabel(row, text=f"{g.value:.2f}", font=ctk.CTkFont(size=12, weight="bold"), text_color=score_color, width=90, anchor="w").pack(side="left", padx=10)

                # Action Supprimer
                if AuthController.is_admin():
                    btn_del = ctk.CTkButton(
                        row, text="🗑️", width=30, height=26, corner_radius=6,
                        fg_color="#EF4444", hover_color="#DC2626",
                        command=lambda g_id=g.id: self._confirm_delete(g_id)
                    )
                    btn_del.pack(side="left", padx=5)
        finally:
            session.close()

    def _open_record_modal(self):
        GradeEntryModal(self, on_saved=self._load_grades_history)

    def _confirm_delete(self, grade_id: int):
        confirmed = messagebox.askyesno("Confirmation", "Supprimer cette note ?")
        if confirmed:
            GradeController.delete_grade(grade_id)
            self._load_grades_history()


class GradeEntryModal(ctk.CTkToplevel):
    def __init__(self, parent, on_saved=None):
        super().__init__(parent)
        self.on_saved = on_saved
        self.title("Saisir ou Modifier une Note")
        self.geometry("500x580")
        self.resizable(False, False)
        self.transient(parent)
        self.grab_set()

        self._load_metadata()
        self._build_ui()

    def _load_metadata(self):
        session = SessionLocal()
        try:
            self.students = session.query(Student).all()
            self.evaluations = session.query(Evaluation).all()
        finally:
            session.close()

    def _build_ui(self):
        container = ctk.CTkScrollableFrame(self, fg_color="#FFFFFF")
        container.pack(fill="both", expand=True, padx=25, pady=25)

        ctk.CTkLabel(container, text="Enregistrement d'une Note", font=ctk.CTkFont(size=16, weight="bold"), text_color="#0F172A").pack(anchor="w", pady=(0, 15))

        # Choix de l'étudiant
        ctk.CTkLabel(container, text="Sélectionner l'étudiant *", font=ctk.CTkFont(size=11, weight="bold"), text_color="#334155").pack(anchor="w", pady=(4, 2))
        st_options = [f"{st.full_name} ({st.matricule})" for st in self.students]
        self.combo_st = ctk.CTkComboBox(container, values=st_options, height=36)
        if st_options:
            self.combo_st.set(st_options[0])
        self.combo_st.pack(fill="x", pady=(0, 10))

        # Choix de l'évaluation
        ctk.CTkLabel(container, text="Sélectionner l'évaluation *", font=ctk.CTkFont(size=11, weight="bold"), text_color="#334155").pack(anchor="w", pady=(4, 2))
        ev_options = [f"{ev.title} [{ev.subject.name}] ({ev.eval_type})" for ev in self.evaluations]
        self.combo_ev = ctk.CTkComboBox(container, values=ev_options, height=36)
        if ev_options:
            self.combo_ev.set(ev_options[0])
        self.combo_ev.pack(fill="x", pady=(0, 10))

        # Note sur 20
        ctk.CTkLabel(container, text="Note obtenue (entre 0.00 et 20.00) *", font=ctk.CTkFont(size=11, weight="bold"), text_color="#334155").pack(anchor="w", pady=(4, 2))
        self.entry_val = ctk.CTkEntry(container, placeholder_text="ex: 15.5", height=36)
        self.entry_val.pack(fill="x", pady=(0, 10))

        # Commentaire de l'enseignant
        ctk.CTkLabel(container, text="Observation / Commentaire", font=ctk.CTkFont(size=11, weight="bold"), text_color="#334155").pack(anchor="w", pady=(4, 2))
        self.entry_comm = ctk.CTkEntry(container, placeholder_text="ex: Très bonne maîtrise du sujet", height=36)
        self.entry_comm.pack(fill="x", pady=(0, 20))

        # Bouton Valider
        btn = ctk.CTkButton(
            container, text="💾 Enregistrer la note", height=42,
            fg_color=COLOR_PRIMARY_NAVY, hover_color=COLOR_SECONDARY_BLUE,
            command=self._save
        )
        btn.pack(fill="x")

    def _save(self):
        # Validation note
        try:
            val = float(self.entry_val.get().replace(",", "."))
            if val < 0.0 or val > 20.0:
                raise ValueError()
        except ValueError:
            messagebox.showerror("Note invalide", "La note doit impérativement être un nombre compris entre 0 et 20.")
            return

        sel_st_str = self.combo_st.get()
        student_id = None
        for st in self.students:
            if f"{st.full_name} ({st.matricule})" == sel_st_str:
                student_id = st.id
                break

        sel_ev_str = self.combo_ev.get()
        evaluation_id = None
        for ev in self.evaluations:
            if f"{ev.title} [{ev.subject.name}] ({ev.eval_type})" == sel_ev_str:
                evaluation_id = ev.id
                break

        if not student_id or not evaluation_id:
            messagebox.showerror("Erreur", "Veuillez sélectionner un étudiant et une évaluation valides.")
            return

        success, msg = GradeController.record_grade(
            student_id=student_id,
            evaluation_id=evaluation_id,
            value=val,
            comments=self.entry_comm.get().strip()
        )

        if success:
            messagebox.showinfo("Succès", msg)
            if self.on_saved:
                self.on_saved()
            self.destroy()
        else:
            messagebox.showerror("Erreur", msg)
