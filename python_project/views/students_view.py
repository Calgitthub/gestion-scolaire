"""
Vue de gestion des étudiants avec CustomTkinter
Recherche multicritère, filtrage par classe, fenêtres modales d'ajout/modification et confirmation de suppression
"""
import customtkinter as ctk
from datetime import datetime, date
from tkinter import messagebox
from typing import Optional

from controllers.student_controller import StudentController
from controllers.subject_controller import SubjectController
from controllers.auth_controller import AuthController
from config import COLOR_PRIMARY_NAVY, COLOR_SECONDARY_BLUE, COLOR_DANGER, COLOR_CARD_BG, COLOR_BG_LIGHT


class StudentsView(ctk.CTkFrame):
    def __init__(self, master):
        super().__init__(master, fg_color=COLOR_BG_LIGHT)
        self.pack(fill="both", expand=True, padx=25, pady=25)
        self.selected_student_id: Optional[int] = None
        self._build_ui()
        self._load_students()

    def _build_ui(self):
        # 1. Barre d'outils supérieure
        top_bar = ctk.CTkFrame(self, fg_color="transparent")
        top_bar.pack(fill="x", pady=(0, 15))

        title = ctk.CTkLabel(
            top_bar,
            text="Gestion du Répertoire des Étudiants",
            font=ctk.CTkFont(size=20, weight="bold"),
            text_color="#0F172A"
        )
        title.pack(side="left")

        # Bouton Ajouter (réservé aux admins ou utilisateurs autorisés)
        if AuthController.is_admin():
            btn_add = ctk.CTkButton(
                top_bar,
                text="➕ Inscrire un Étudiant",
                height=38,
                corner_radius=8,
                fg_color=COLOR_PRIMARY_NAVY,
                hover_color=COLOR_SECONDARY_BLUE,
                font=ctk.CTkFont(size=12, weight="bold"),
                command=self._open_add_modal
            )
            btn_add.pack(side="right")

        # 2. Zone de filtres et recherche
        filter_bar = ctk.CTkFrame(self, fg_color=COLOR_CARD_BG, corner_radius=10, border_width=1, border_color="#E2E8F0")
        filter_bar.pack(fill="x", pady=(0, 15), ipady=5)

        # Recherche
        self.search_entry = ctk.CTkEntry(
            filter_bar,
            placeholder_text="🔍 Rechercher par nom, prénom ou matricule...",
            width=320,
            height=36,
            corner_radius=8
        )
        self.search_entry.pack(side="left", padx=15, pady=10)
        self.search_entry.bind("<KeyRelease>", lambda e: self._load_students())

        # Filtre de classe
        self.classes = SubjectController.get_classes()
        class_options = ["Toutes les classes"] + [f"{c.name} ({c.code})" for c in self.classes]
        self.class_filter = ctk.CTkComboBox(
            filter_bar,
            values=class_options,
            width=240,
            height=36,
            corner_radius=8,
            command=lambda val: self._load_students()
        )
        self.class_filter.set("Toutes les classes")
        self.class_filter.pack(side="left", padx=10, pady=10)

        # Bouton Actualiser
        btn_refresh = ctk.CTkButton(
            filter_bar,
            text="🔄 Actualiser",
            width=100,
            height=36,
            corner_radius=8,
            fg_color="#475569",
            hover_color="#334155",
            command=self._load_students
        )
        btn_refresh.pack(side="left", padx=10, pady=10)

        # 3. Tableau de la liste des étudiants
        table_container = ctk.CTkFrame(self, fg_color=COLOR_CARD_BG, corner_radius=12, border_width=1, border_color="#E2E8F0")
        table_container.pack(fill="both", expand=True)

        # En-tête de table
        header = ctk.CTkFrame(table_container, fg_color="#1E3A8A", height=38, corner_radius=0)
        header.pack(fill="x")

        cols = [
            ("Matricule", 130),
            ("Nom & Prénom", 200),
            ("Sexe", 60),
            ("Date Naiss.", 100),
            ("Classe / Filière", 180),
            ("Téléphone", 130),
            ("Actions", 140)
        ]

        for title, width in cols:
            lbl = ctk.CTkLabel(header, text=title, font=ctk.CTkFont(size=11, weight="bold"), text_color="#FFFFFF", width=width, anchor="w")
            lbl.pack(side="left", padx=10, pady=8)

        # Zone scrollable pour les lignes
        self.rows_frame = ctk.CTkScrollableFrame(table_container, fg_color="transparent")
        self.rows_frame.pack(fill="both", expand=True)

    def _load_students(self):
        # Vider les lignes précédentes
        for widget in self.rows_frame.winfo_children():
            widget.destroy()

        search = self.search_entry.get().strip()
        selected_class_str = self.class_filter.get()
        class_id = None

        if selected_class_str != "Toutes les classes":
            for c in self.classes:
                if f"{c.name} ({c.code})" == selected_class_str:
                    class_id = c.id
                    break

        students = StudentController.get_students(search_query=search, class_id=class_id)

        if not students:
            empty_lbl = ctk.CTkLabel(
                self.rows_frame,
                text="Aucun étudiant ne correspond aux critères de recherche.",
                font=ctk.CTkFont(size=12, slant="italic"),
                text_color="#94A3B8"
            )
            empty_lbl.pack(pady=40)
            return

        for idx, st in enumerate(students):
            bg = "#FFFFFF" if idx % 2 == 0 else "#F8FAFC"
            row = ctk.CTkFrame(self.rows_frame, fg_color=bg, height=42, corner_radius=0)
            row.pack(fill="x", pady=1)

            # Matricule
            ctk.CTkLabel(row, text=st.matricule, font=ctk.CTkFont(size=11, weight="bold"), text_color="#1E3A8A", width=130, anchor="w").pack(side="left", padx=10)
            # Nom
            ctk.CTkLabel(row, text=st.full_name, font=ctk.CTkFont(size=11), text_color="#0F172A", width=200, anchor="w").pack(side="left", padx=10)
            # Sexe
            ctk.CTkLabel(row, text="Masculin" if st.gender == "M" else "Féminin", font=ctk.CTkFont(size=11), text_color="#475569", width=60, anchor="w").pack(side="left", padx=10)
            # Date
            d_str = st.birth_date.strftime("%d/%m/%Y") if st.birth_date else "-"
            ctk.CTkLabel(row, text=d_str, font=ctk.CTkFont(size=11), text_color="#475569", width=100, anchor="w").pack(side="left", padx=10)
            # Classe
            c_name = st.classroom.name if st.classroom else "-"
            ctk.CTkLabel(row, text=c_name, font=ctk.CTkFont(size=11), text_color="#0284C7", width=180, anchor="w").pack(side="left", padx=10)
            # Tel
            ctk.CTkLabel(row, text=st.phone or "-", font=ctk.CTkFont(size=11), text_color="#64748B", width=130, anchor="w").pack(side="left", padx=10)

            # Boutons Actions
            act_frame = ctk.CTkFrame(row, fg_color="transparent", width=140)
            act_frame.pack(side="left", padx=5)

            btn_edit = ctk.CTkButton(
                act_frame, text="✏️", width=32, height=28, corner_radius=6,
                fg_color="#0284C7", hover_color="#0369A1",
                command=lambda s_id=st.id: self._open_edit_modal(s_id)
            )
            btn_edit.pack(side="left", padx=3)

            if AuthController.is_admin():
                btn_del = ctk.CTkButton(
                    act_frame, text="🗑️", width=32, height=28, corner_radius=6,
                    fg_color="#EF4444", hover_color="#DC2626",
                    command=lambda s_id=st.id, name=st.full_name: self._confirm_delete(s_id, name)
                )
                btn_del.pack(side="left", padx=3)

    def _open_add_modal(self):
        StudentFormModal(self, mode="add", on_saved=self._load_students)

    def _open_edit_modal(self, student_id: int):
        StudentFormModal(self, mode="edit", student_id=student_id, on_saved=self._load_students)

    def _confirm_delete(self, student_id: int, student_name: str):
        # Confirmation de suppression obligatoire
        confirmed = messagebox.askyesno(
            "Confirmation de suppression",
            f"Êtes-vous absolument certain de vouloir supprimer définitivement l'étudiant '{student_name}' ?\n\nCette action supprimera également toutes ses notes et évaluations associées.",
            icon="warning"
        )
        if confirmed:
            success, msg = StudentController.delete_student(student_id)
            if success:
                messagebox.showinfo("Succès", msg)
                self._load_students()
            else:
                messagebox.showerror("Erreur", msg)


class StudentFormModal(ctk.CTkToplevel):
    """Fenêtre modale d'inscription et de modification d'étudiant"""
    def __init__(self, parent, mode: str = "add", student_id: Optional[int] = None, on_saved=None):
        super().__init__(parent)
        self.mode = mode
        self.student_id = student_id
        self.on_saved = on_saved

        self.title("Inscrire un nouvel Étudiant" if mode == "add" else "Modifier la fiche de l'Étudiant")
        self.geometry("520x650")
        self.resizable(False, False)
        self.transient(parent)
        self.grab_set()

        self.classes = SubjectController.get_classes()
        self._build_form()

        if self.mode == "edit" and self.student_id:
            self._fill_existing_data()

    def _build_form(self):
        container = ctk.CTkScrollableFrame(self, fg_color="#FFFFFF")
        container.pack(fill="both", expand=True, padx=20, pady=20)

        ctk.CTkLabel(container, text="Fiche Individuelle de l'Étudiant", font=ctk.CTkFont(size=16, weight="bold"), text_color="#0F172A").pack(anchor="w", pady=(0, 15))

        # Matricule
        ctk.CTkLabel(container, text="Matricule *", font=ctk.CTkFont(size=11, weight="bold"), text_color="#334155").pack(anchor="w", pady=(4, 2))
        self.entry_mat = ctk.CTkEntry(container, placeholder_text="ex: MAT-2026-099", height=36)
        self.entry_mat.pack(fill="x", pady=(0, 8))

        # Nom
        ctk.CTkLabel(container, text="Nom de famille *", font=ctk.CTkFont(size=11, weight="bold"), text_color="#334155").pack(anchor="w", pady=(4, 2))
        self.entry_nom = ctk.CTkEntry(container, placeholder_text="ex: DUPONT", height=36)
        self.entry_nom.pack(fill="x", pady=(0, 8))

        # Prénom
        ctk.CTkLabel(container, text="Prénom(s) *", font=ctk.CTkFont(size=11, weight="bold"), text_color="#334155").pack(anchor="w", pady=(4, 2))
        self.entry_prenom = ctk.CTkEntry(container, placeholder_text="ex: Jean", height=36)
        self.entry_prenom.pack(fill="x", pady=(0, 8))

        # Sexe
        ctk.CTkLabel(container, text="Sexe *", font=ctk.CTkFont(size=11, weight="bold"), text_color="#334155").pack(anchor="w", pady=(4, 2))
        self.combo_sexe = ctk.CTkComboBox(container, values=["M", "F"], height=36)
        self.combo_sexe.set("M")
        self.combo_sexe.pack(fill="x", pady=(0, 8))

        # Date de Naissance (JJ/MM/AAAA)
        ctk.CTkLabel(container, text="Date de Naissance (JJ/MM/AAAA) *", font=ctk.CTkFont(size=11, weight="bold"), text_color="#334155").pack(anchor="w", pady=(4, 2))
        self.entry_birth = ctk.CTkEntry(container, placeholder_text="ex: 15/06/2007", height=36)
        self.entry_birth.pack(fill="x", pady=(0, 8))

        # Classe
        ctk.CTkLabel(container, text="Classe ou Filière *", font=ctk.CTkFont(size=11, weight="bold"), text_color="#334155").pack(anchor="w", pady=(4, 2))
        class_names = [f"{c.name} ({c.code})" for c in self.classes]
        self.combo_classe = ctk.CTkComboBox(container, values=class_names, height=36)
        if class_names:
            self.combo_classe.set(class_names[0])
        self.combo_classe.pack(fill="x", pady=(0, 8))

        # Téléphone
        ctk.CTkLabel(container, text="Téléphone", font=ctk.CTkFont(size=11, weight="bold"), text_color="#334155").pack(anchor="w", pady=(4, 2))
        self.entry_tel = ctk.CTkEntry(container, placeholder_text="ex: 06 12 34 56 78", height=36)
        self.entry_tel.pack(fill="x", pady=(0, 8))

        # Email
        ctk.CTkLabel(container, text="Adresse E-mail", font=ctk.CTkFont(size=11, weight="bold"), text_color="#334155").pack(anchor="w", pady=(4, 2))
        self.entry_email = ctk.CTkEntry(container, placeholder_text="ex: etudiant@email.com", height=36)
        self.entry_email.pack(fill="x", pady=(0, 8))

        # Adresse
        ctk.CTkLabel(container, text="Adresse de domicile", font=ctk.CTkFont(size=11, weight="bold"), text_color="#334155").pack(anchor="w", pady=(4, 2))
        self.entry_addr = ctk.CTkEntry(container, placeholder_text="ex: 12 Rue de Paris", height=36)
        self.entry_addr.pack(fill="x", pady=(0, 15))

        # Bouton Enregistrer
        btn_save = ctk.CTkButton(
            container,
            text="💾 Enregistrer l'étudiant",
            height=42,
            fg_color=COLOR_PRIMARY_NAVY,
            hover_color=COLOR_SECONDARY_BLUE,
            font=ctk.CTkFont(size=13, weight="bold"),
            command=self._save
        )
        btn_save.pack(fill="x", pady=(10, 15))

    def _fill_existing_data(self):
        st = StudentController.get_student_by_id(self.student_id)
        if not st:
            return
        self.entry_mat.insert(0, st.matricule)
        self.entry_nom.insert(0, st.last_name)
        self.entry_prenom.insert(0, st.first_name)
        self.combo_sexe.set(st.gender)
        if st.birth_date:
            self.entry_birth.insert(0, st.birth_date.strftime("%d/%m/%Y"))
        if st.classroom:
            self.combo_classe.set(f"{st.classroom.name} ({st.classroom.code})")
        if st.phone:
            self.entry_tel.insert(0, st.phone)
        if st.email:
            self.entry_email.insert(0, st.email)
        if st.address:
            self.entry_addr.insert(0, st.address)

    def _save(self):
        # Validation date de naissance
        b_str = self.entry_birth.get().strip()
        try:
            b_date = datetime.strptime(b_str, "%d/%m/%Y").date()
        except ValueError:
            messagebox.showerror("Format invalide", "La date de naissance doit respecter le format JJ/MM/AAAA (ex: 15/06/2007).")
            return

        # Récupération de la classe
        sel_c_str = self.combo_classe.get()
        class_id = None
        for c in self.classes:
            if f"{c.name} ({c.code})" == sel_c_str:
                class_id = c.id
                break

        if not class_id:
            messagebox.showerror("Erreur", "Veuillez sélectionner une classe valide.")
            return

        data = {
            "matricule": self.entry_mat.get(),
            "last_name": self.entry_nom.get(),
            "first_name": self.entry_prenom.get(),
            "gender": self.combo_sexe.get(),
            "birth_date": b_date,
            "class_id": class_id,
            "phone": self.entry_tel.get(),
            "email": self.entry_email.get(),
            "address": self.entry_addr.get(),
        }

        if self.mode == "add":
            success, msg, _ = StudentController.create_student(data)
        else:
            success, msg = StudentController.update_student(self.student_id, data)

        if success:
            messagebox.showinfo("Succès", msg)
            if self.on_saved:
                self.on_saved()
            self.destroy()
        else:
            messagebox.showerror("Erreur de validation", msg)
