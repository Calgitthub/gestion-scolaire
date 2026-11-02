"""
Vue de gestion des matières et des classes avec CustomTkinter
Création de cours, paramétrage des coefficients et rattachement aux filières
"""
import customtkinter as ctk
from tkinter import messagebox
from typing import Optional

from controllers.subject_controller import SubjectController
from controllers.auth_controller import AuthController
from config import COLOR_PRIMARY_NAVY, COLOR_SECONDARY_BLUE, COLOR_DANGER, COLOR_CARD_BG, COLOR_BG_LIGHT


class SubjectsView(ctk.CTkFrame):
    def __init__(self, master):
        super().__init__(master, fg_color=COLOR_BG_LIGHT)
        self.pack(fill="both", expand=True, padx=25, pady=25)
        self._build_ui()
        self._load_subjects()

    def _build_ui(self):
        # 1. En-tête
        top_bar = ctk.CTkFrame(self, fg_color="transparent")
        top_bar.pack(fill="x", pady=(0, 15))

        title = ctk.CTkLabel(
            top_bar,
            text="Gestion des Matières & Coefficients",
            font=ctk.CTkFont(size=20, weight="bold"),
            text_color="#0F172A"
        )
        title.pack(side="left")

        if AuthController.is_admin():
            btn_add = ctk.CTkButton(
                top_bar,
                text="➕ Nouvelle Matière",
                height=38,
                corner_radius=8,
                fg_color=COLOR_PRIMARY_NAVY,
                hover_color=COLOR_SECONDARY_BLUE,
                font=ctk.CTkFont(size=12, weight="bold"),
                command=self._open_add_modal
            )
            btn_add.pack(side="right")

        # 2. Filtre par classe
        filter_bar = ctk.CTkFrame(self, fg_color=COLOR_CARD_BG, corner_radius=10, border_width=1, border_color="#E2E8F0")
        filter_bar.pack(fill="x", pady=(0, 15), ipady=5)

        self.classes = SubjectController.get_classes()
        class_options = ["Toutes les classes"] + [f"{c.name} ({c.code})" for c in self.classes]
        self.class_filter = ctk.CTkComboBox(
            filter_bar,
            values=class_options,
            width=280,
            height=36,
            corner_radius=8,
            command=lambda val: self._load_subjects()
        )
        self.class_filter.set("Toutes les classes")
        self.class_filter.pack(side="left", padx=15, pady=10)

        # 3. Tableau des matières
        table_container = ctk.CTkFrame(self, fg_color=COLOR_CARD_BG, corner_radius=12, border_width=1, border_color="#E2E8F0")
        table_container.pack(fill="both", expand=True)

        header = ctk.CTkFrame(table_container, fg_color="#1E3A8A", height=38, corner_radius=0)
        header.pack(fill="x")

        cols = [
            ("Code", 100),
            ("Intitulé du Cours", 260),
            ("Coefficient", 110),
            ("Classe / Section", 220),
            ("Actions", 120)
        ]
        for title, width in cols:
            lbl = ctk.CTkLabel(header, text=title, font=ctk.CTkFont(size=11, weight="bold"), text_color="#FFFFFF", width=width, anchor="w")
            lbl.pack(side="left", padx=10, pady=8)

        self.rows_frame = ctk.CTkScrollableFrame(table_container, fg_color="transparent")
        self.rows_frame.pack(fill="both", expand=True)

    def _load_subjects(self):
        for widget in self.rows_frame.winfo_children():
            widget.destroy()

        selected_str = self.class_filter.get()
        class_id = None
        if selected_str != "Toutes les classes":
            for c in self.classes:
                if f"{c.name} ({c.code})" == selected_str:
                    class_id = c.id
                    break

        subjects = SubjectController.get_subjects(class_id=class_id)
        if not subjects:
            ctk.CTkLabel(self.rows_frame, text="Aucune matière configurée.", font=ctk.CTkFont(size=12, slant="italic"), text_color="#94A3B8").pack(pady=40)
            return

        for idx, subj in enumerate(subjects):
            bg = "#FFFFFF" if idx % 2 == 0 else "#F8FAFC"
            row = ctk.CTkFrame(self.rows_frame, fg_color=bg, height=42, corner_radius=0)
            row.pack(fill="x", pady=1)

            ctk.CTkLabel(row, text=subj.code, font=ctk.CTkFont(size=11, weight="bold"), text_color="#1E3A8A", width=100, anchor="w").pack(side="left", padx=10)
            ctk.CTkLabel(row, text=subj.name, font=ctk.CTkFont(size=11), text_color="#0F172A", width=260, anchor="w").pack(side="left", padx=10)
            
            coef_badge = f"Coef. {subj.coefficient}"
            ctk.CTkLabel(row, text=coef_badge, font=ctk.CTkFont(size=11, weight="bold"), text_color="#0D9488", width=110, anchor="w").pack(side="left", padx=10)
            
            c_name = subj.classroom.name if subj.classroom else "-"
            ctk.CTkLabel(row, text=c_name, font=ctk.CTkFont(size=11), text_color="#475569", width=220, anchor="w").pack(side="left", padx=10)

            act_frame = ctk.CTkFrame(row, fg_color="transparent", width=120)
            act_frame.pack(side="left", padx=5)

            if AuthController.is_admin():
                btn_del = ctk.CTkButton(
                    act_frame, text="🗑️", width=32, height=28, corner_radius=6,
                    fg_color="#EF4444", hover_color="#DC2626",
                    command=lambda s_id=subj.id, n=subj.name: self._confirm_delete(s_id, n)
                )
                btn_del.pack(side="left", padx=3)

    def _open_add_modal(self):
        SubjectModal(self, on_saved=self._load_subjects)

    def _confirm_delete(self, subject_id: int, name: str):
        confirmed = messagebox.askyesno(
            "Supprimer la matière",
            f"Voulez-vous supprimer définitivement la matière '{name}' ?\nToutes les notes associées seront effacées."
        )
        if confirmed:
            success, msg = SubjectController.delete_subject(subject_id)
            if success:
                messagebox.showinfo("Succès", msg)
                self._load_subjects()
            else:
                messagebox.showerror("Erreur", msg)


class SubjectModal(ctk.CTkToplevel):
    def __init__(self, parent, on_saved=None):
        super().__init__(parent)
        self.on_saved = on_saved
        self.title("Ajouter une Matière")
        self.geometry("450x420")
        self.resizable(False, False)
        self.transient(parent)
        self.grab_set()

        self.classes = SubjectController.get_classes()
        self._build_ui()

    def _build_ui(self):
        container = ctk.CTkFrame(self, fg_color="#FFFFFF")
        container.pack(fill="both", expand=True, padx=25, pady=25)

        ctk.CTkLabel(container, text="Nouvelle Matière", font=ctk.CTkFont(size=16, weight="bold"), text_color="#0F172A").pack(anchor="w", pady=(0, 15))

        # Code
        ctk.CTkLabel(container, text="Code de la matière (ex: MATH-01)", font=ctk.CTkFont(size=11, weight="bold"), text_color="#334155").pack(anchor="w", pady=(4, 2))
        self.entry_code = ctk.CTkEntry(container, height=36)
        self.entry_code.pack(fill="x", pady=(0, 8))

        # Nom
        ctk.CTkLabel(container, text="Intitulé complet de la matière", font=ctk.CTkFont(size=11, weight="bold"), text_color="#334155").pack(anchor="w", pady=(4, 2))
        self.entry_nom = ctk.CTkEntry(container, height=36)
        self.entry_nom.pack(fill="x", pady=(0, 8))

        # Coef
        ctk.CTkLabel(container, text="Coefficient pondérateur (ex: 4.0)", font=ctk.CTkFont(size=11, weight="bold"), text_color="#334155").pack(anchor="w", pady=(4, 2))
        self.entry_coef = ctk.CTkEntry(container, height=36)
        self.entry_coef.insert(0, "2.0")
        self.entry_coef.pack(fill="x", pady=(0, 8))

        # Classe
        ctk.CTkLabel(container, text="Classe concernée", font=ctk.CTkFont(size=11, weight="bold"), text_color="#334155").pack(anchor="w", pady=(4, 2))
        class_names = [f"{c.name} ({c.code})" for c in self.classes]
        self.combo_classe = ctk.CTkComboBox(container, values=class_names, height=36)
        if class_names:
            self.combo_classe.set(class_names[0])
        self.combo_classe.pack(fill="x", pady=(0, 15))

        # Bouton
        btn = ctk.CTkButton(
            container, text="Créer la matière", height=40,
            fg_color=COLOR_PRIMARY_NAVY, hover_color=COLOR_SECONDARY_BLUE,
            command=self._save
        )
        btn.pack(fill="x")

    def _save(self):
        code = self.entry_code.get().strip()
        nom = self.entry_nom.get().strip()
        try:
            coef = float(self.entry_coef.get().replace(",", "."))
        except ValueError:
            messagebox.showerror("Erreur", "Le coefficient doit être un nombre valide.")
            return

        sel_c_str = self.combo_classe.get()
        class_id = None
        for c in self.classes:
            if f"{c.name} ({c.code})" == sel_c_str:
                class_id = c.id
                break

        success, msg = SubjectController.create_subject(code, nom, coef, class_id)
        if success:
            messagebox.showinfo("Succès", msg)
            if self.on_saved:
                self.on_saved()
            self.destroy()
        else:
            messagebox.showerror("Erreur", msg)
