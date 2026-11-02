"""
Vue de calcul des moyennes, classement et génération des bulletins scolaires (PDF & Excel)
Aperçu en direct du bulletin et boutons d'exportation
"""
import os
import customtkinter as ctk
from tkinter import messagebox, filedialog
from datetime import datetime

from database.database import SessionLocal
from database.models import Student, ClassRoom
from services.calculation_service import calculate_student_overall, calculate_class_rankings, get_class_statistics
from services.report_service import generate_student_bulletin_pdf, export_students_to_excel, export_grades_to_excel
import config
from config import COLOR_PRIMARY_NAVY, COLOR_SECONDARY_BLUE, COLOR_SUCCESS, COLOR_DANGER, COLOR_CARD_BG, COLOR_BG_LIGHT


class ReportsView(ctk.CTkFrame):
    def __init__(self, master):
        super().__init__(master, fg_color=COLOR_BG_LIGHT)
        self.pack(fill="both", expand=True, padx=25, pady=25)
        self._load_classes()
        self._build_ui()
        if self.students:
            self._display_selected_student_bulletin()

    def _load_classes(self):
        session = SessionLocal()
        try:
            self.classes = session.query(ClassRoom).all()
            self.students = session.query(Student).all()
        finally:
            session.close()

    def _build_ui(self):
        # 1. En-tête
        top_bar = ctk.CTkFrame(self, fg_color="transparent")
        top_bar.pack(fill="x", pady=(0, 15))

        title = ctk.CTkLabel(
            top_bar,
            text="Moyennes, Classements & Bulletins Scolaires",
            font=ctk.CTkFont(size=20, weight="bold"),
            text_color="#0F172A"
        )
        title.pack(side="left")

        # Boutons d'export globaux
        exports_box = ctk.CTkFrame(top_bar, fg_color="transparent")
        exports_box.pack(side="right")

        btn_excel_st = ctk.CTkButton(
            exports_box,
            text="📊 Export Élèves (Excel)",
            height=36,
            corner_radius=8,
            fg_color="#059669",
            hover_color="#047857",
            font=ctk.CTkFont(size=11, weight="bold"),
            command=self._export_students_excel
        )
        btn_excel_st.pack(side="left", padx=5)

        btn_excel_res = ctk.CTkButton(
            exports_box,
            text="📑 Synthèse Résultats (Excel)",
            height=36,
            corner_radius=8,
            fg_color="#0284C7",
            hover_color="#0369A1",
            font=ctk.CTkFont(size=11, weight="bold"),
            command=self._export_results_excel
        )
        btn_excel_res.pack(side="left", padx=5)

        # 2. Sélecteur d'étudiant
        selector_card = ctk.CTkFrame(self, fg_color=COLOR_CARD_BG, corner_radius=10, border_width=1, border_color="#E2E8F0")
        selector_card.pack(fill="x", pady=(0, 15), ipady=5)

        ctk.CTkLabel(selector_card, text="Sélectionner l'étudiant pour afficher le bulletin :", font=ctk.CTkFont(size=12, weight="bold"), text_color="#334155").pack(side="left", padx=15)

        st_options = [f"{st.full_name} ({st.matricule}) - {st.classroom.code if st.classroom else ''}" for st in self.students]
        self.combo_student = ctk.CTkComboBox(
            selector_card,
            values=st_options,
            width=360,
            height=36,
            corner_radius=8,
            command=lambda val: self._display_selected_student_bulletin()
        )
        if st_options:
            self.combo_student.set(st_options[0])
        self.combo_student.pack(side="left", padx=10)

        # Bouton Télécharger PDF
        btn_pdf = ctk.CTkButton(
            selector_card,
            text="📄 Télécharger le Bulletin (PDF)",
            height=36,
            corner_radius=8,
            fg_color=COLOR_PRIMARY_NAVY,
            hover_color=COLOR_SECONDARY_BLUE,
            font=ctk.CTkFont(size=12, weight="bold"),
            command=self._export_current_bulletin_pdf
        )
        btn_pdf.pack(side="left", padx=15)

        # 3. Zone d'aperçu du bulletin scolaire
        self.preview_container = ctk.CTkScrollableFrame(self, fg_color="#FFFFFF", corner_radius=12, border_width=1, border_color="#CBD5E1")
        self.preview_container.pack(fill="both", expand=True)

    def _get_current_student(self) -> Optional[Student]:
        sel_text = self.combo_student.get()
        for st in self.students:
            if f"{st.full_name} ({st.matricule})" in sel_text:
                return st
        return None

    def _display_selected_student_bulletin(self):
        for widget in self.preview_container.winfo_children():
            widget.destroy()

        student = self._get_current_student()
        if not student:
            return

        session = SessionLocal()
        try:
            overall = calculate_student_overall(student.id, session)
            rankings = calculate_class_rankings(student.class_id, session)
            class_stats = get_class_statistics(student.class_id, session)

            rank_str = "-"
            for r in rankings:
                if r["student_id"] == student.id:
                    rank_str = r["rank_str"]
                    break

            # En-tête officiel du bulletin
            head = ctk.CTkFrame(self.preview_container, fg_color="#F8FAFC", corner_radius=8, border_width=1, border_color="#E2E8F0")
            head.pack(fill="x", padx=15, pady=15)

            ctk.CTkLabel(head, text=config.SCHOOL_NAME.upper(), font=ctk.CTkFont(size=14, weight="bold"), text_color="#0F172A").pack(anchor="w", padx=15, pady=(10, 2))
            ctk.CTkLabel(head, text=f"Année Scolaire : {config.SCHOOL_ACADEMIC_YEAR} | Période : 1er Semestre", font=ctk.CTkFont(size=11), text_color="#64748B").pack(anchor="w", padx=15, pady=(0, 10))

            # Fiche élève
            info_frame = ctk.CTkFrame(self.preview_container, fg_color="#EFF6FF", corner_radius=8)
            info_frame.pack(fill="x", padx=15, pady=(0, 15), ipady=8)

            c1 = ctk.CTkLabel(info_frame, text=f"Élève : {student.full_name}\nMatricule : {student.matricule}", font=ctk.CTkFont(size=12, weight="bold"), text_color="#1E3A8A", justify="left")
            c1.pack(side="left", padx=20)

            c2 = ctk.CTkLabel(info_frame, text=f"Classe : {student.classroom.name}\nEffectif : {class_stats['total_students']} élèves", font=ctk.CTkFont(size=11), text_color="#334155", justify="left")
            c2.pack(side="left", padx=40)

            # Tableau des notes
            table_header = ctk.CTkFrame(self.preview_container, fg_color="#1E3A8A", height=34, corner_radius=6)
            table_header.pack(fill="x", padx=15, pady=(0, 5))

            cols = [("Matière", 200), ("Coef", 60), ("Notes", 180), ("Moyenne", 90), ("Points", 80), ("Appréciation", 200)]
            for t, w in cols:
                ctk.CTkLabel(table_header, text=t, font=ctk.CTkFont(size=11, weight="bold"), text_color="#FFFFFF", width=w, anchor="w").pack(side="left", padx=8)

            for idx, (subj_id, item) in enumerate(overall["subjects"].items()):
                bg = "#FFFFFF" if idx % 2 == 0 else "#F8FAFC"
                r = ctk.CTkFrame(self.preview_container, fg_color=bg, height=36, corner_radius=0)
                r.pack(fill="x", padx=15, pady=1)

                ctk.CTkLabel(r, text=f"{item['name']} ({item['code']})", font=ctk.CTkFont(size=11, weight="bold"), text_color="#0F172A", width=200, anchor="w").pack(side="left", padx=8)
                ctk.CTkLabel(r, text=str(item["coefficient"]), font=ctk.CTkFont(size=11), text_color="#475569", width=60, anchor="w").pack(side="left", padx=8)

                notes_text = ", ".join([f"{n:.1f}" for n in item["grades"]]) if item["grades"] else "-"
                ctk.CTkLabel(r, text=notes_text, font=ctk.CTkFont(size=10), text_color="#334155", width=180, anchor="w").pack(side="left", padx=8)

                avg_text = f"{item['average']:.2f}" if item["average"] is not None else "-"
                ctk.CTkLabel(r, text=avg_text, font=ctk.CTkFont(size=11, weight="bold"), text_color="#0284C7", width=90, anchor="w").pack(side="left", padx=8)

                pts_text = f"{item['weighted_points']:.2f}" if item["weighted_points"] is not None else "-"
                ctk.CTkLabel(r, text=pts_text, font=ctk.CTkFont(size=11), text_color="#64748B", width=80, anchor="w").pack(side="left", padx=8)

                # Appréciation
                m = item["average"]
                appr = "Très bien" if (m and m >= 14) else ("Passable" if (m and m >= 10) else "Insuffisant")
                ctk.CTkLabel(r, text=appr, font=ctk.CTkFont(size=10, slant="italic"), text_color="#64748B", width=200, anchor="w").pack(side="left", padx=8)

            # Synthèse générale
            summary = ctk.CTkFrame(self.preview_container, fg_color="#F1F5F9", corner_radius=8, border_width=1, border_color="#CBD5E1")
            summary.pack(fill="x", padx=15, pady=20, ipady=10)

            ov_avg = overall["overall_average"]
            avg_str = f"{ov_avg:.2f} / 20" if ov_avg is not None else "-"

            kpi1 = ctk.CTkLabel(summary, text=f"Moyenne Générale :\n{avg_str}", font=ctk.CTkFont(size=14, weight="bold"), text_color="#1E3A8A")
            kpi1.pack(side="left", padx=25)

            kpi2 = ctk.CTkLabel(summary, text=f"Rang :\n{rank_str}", font=ctk.CTkFont(size=14, weight="bold"), text_color="#0D9488")
            kpi2.pack(side="left", padx=25)

            kpi3 = ctk.CTkLabel(summary, text=f"Mention :\n{overall['mention']}", font=ctk.CTkFont(size=14, weight="bold"), text_color="#0284C7")
            kpi3.pack(side="left", padx=25)

            stat_color = "#10B981" if overall["status"] == "Admis" else "#EF4444"
            kpi4 = ctk.CTkLabel(summary, text=f"Décision :\n{overall['status']}", font=ctk.CTkFont(size=14, weight="bold"), text_color=stat_color)
            kpi4.pack(side="left", padx=25)
        finally:
            session.close()

    def _export_current_bulletin_pdf(self):
        student = self._get_current_student()
        if not student:
            return

        default_name = f"Bulletin_{student.matricule}_{student.last_name}.pdf"
        file_path = filedialog.asksaveasfilename(
            defaultextension=".pdf",
            filetypes=[("PDF Document", "*.pdf")],
            initialfile=default_name,
            title="Enregistrer le Bulletin Scolaire"
        )
        if not file_path:
            return

        session = SessionLocal()
        try:
            generate_student_bulletin_pdf(student.id, "1er Semestre", file_path, session)
            messagebox.showinfo("Exportation Réussie", f"Le bulletin officiel a été généré avec succès :\n{file_path}")
        except Exception as e:
            messagebox.showerror("Erreur d'exportation", str(e))
        finally:
            session.close()

    def _export_students_excel(self):
        file_path = filedialog.asksaveasfilename(
            defaultextension=".xlsx",
            filetypes=[("Feuille de calcul Excel", "*.xlsx")],
            initialfile="Liste_Etudiants.xlsx",
            title="Exporter la liste des étudiants"
        )
        if not file_path:
            return
        session = SessionLocal()
        try:
            export_students_to_excel(class_id=None, file_path=file_path, session=session)
            messagebox.showinfo("Succès", f"Fichier Excel exporté :\n{file_path}")
        except Exception as e:
            messagebox.showerror("Erreur", str(e))
        finally:
            session.close()

    def _export_results_excel(self):
        student = self._get_current_student()
        class_id = student.class_id if student else None
        if not class_id and self.classes:
            class_id = self.classes[0].id

        file_path = filedialog.asksaveasfilename(
            defaultextension=".xlsx",
            filetypes=[("Feuille de calcul Excel", "*.xlsx")],
            initialfile="Synthese_Resultats.xlsx",
            title="Exporter les moyennes et classements"
        )
        if not file_path:
            return
        session = SessionLocal()
        try:
            export_grades_to_excel(class_id=class_id, file_path=file_path, session=session)
            messagebox.showinfo("Succès", f"Synthèse Excel exportée :\n{file_path}")
        except Exception as e:
            messagebox.showerror("Erreur", str(e))
        finally:
            session.close()
