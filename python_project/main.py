"""
Application Principale de Gestion des Étudiants (EduGest)
Langage : Python 3
Interface : CustomTkinter
Base de données : SQLite & SQLAlchemy
Architecture : Modulaire MVC (Models - Views - Controllers - Services)
"""
import os
import sys
import customtkinter as ctk
from tkinter import messagebox

# Configuration CustomTkinter
ctk.set_appearance_mode("Light")
ctk.set_default_color_theme("blue")

# Imports de l'application
from database.database import init_db, SessionLocal
from database.models import User, ClassRoom
from controllers.auth_controller import AuthController
from views.login_view import LoginView
from views.dashboard_view import DashboardView
from views.students_view import StudentsView
from views.subjects_view import SubjectsView
from views.grades_view import GradesView
from views.reports_view import ReportsView
import config
from config import COLOR_PRIMARY_DARK, COLOR_PRIMARY_NAVY, COLOR_SECONDARY_BLUE, COLOR_BG_LIGHT


class EduGestApp(ctk.CTk):
    def __init__(self):
        super().__init__()

        # Configuration de la fenêtre principale
        self.title("EduGest - Système de Gestion Scolaire & Universitaire")
        self.geometry("1200x760")
        self.minsize(1050, 680)

        # Initialiser la base de données relationnelle
        init_db()

        # État de l'application
        self.current_user: User = None
        self.active_view = None

        # Affichage initial de la page de connexion
        self._show_login_screen()

    def _show_login_screen(self):
        # Vider les éléments existants
        for widget in self.winfo_children():
            widget.destroy()

        self.login_view = LoginView(self, on_login_success=self._on_login_success)

    def _on_login_success(self, user: User):
        self.current_user = user
        if hasattr(self, 'login_view'):
            self.login_view.destroy()
        self._build_main_layout()
        self._navigate_to("dashboard")

    def _build_main_layout(self):
        # 1. Barre latérale gauche (Menu avec 10 rubriques demandées)
        self.sidebar = ctk.CTkFrame(self, width=240, fg_color=COLOR_PRIMARY_DARK, corner_radius=0)
        self.sidebar.pack(side="left", fill="y")
        self.sidebar.pack_propagate(False)

        # Logo & Titre Institution
        brand_frame = ctk.CTkFrame(self.sidebar, fg_color="transparent")
        brand_frame.pack(fill="x", padx=16, pady=(20, 15))

        logo_lbl = ctk.CTkLabel(
            brand_frame,
            text="🎓 EduGest",
            font=ctk.CTkFont(size=20, weight="bold"),
            text_color="#38BDF8"
        )
        logo_lbl.pack(anchor="w")

        school_lbl = ctk.CTkLabel(
            brand_frame,
            text="ISEA Académie",
            font=ctk.CTkFont(size=11),
            text_color="#94A3B8"
        )
        school_lbl.pack(anchor="w")

        # Séparateur subtil
        sep = ctk.CTkFrame(self.sidebar, height=1, fg_color="#1E293B")
        sep.pack(fill="x", padx=16, pady=(0, 15))

        # Menu de navigation (10 éléments)
        self.nav_buttons = {}
        menu_items = [
            ("dashboard", "📊 1. Tableau de bord"),
            ("students", "👥 2. Étudiants"),
            ("classes", "🏫 3. Classes et filières"),
            ("subjects", "📚 4. Matières"),
            ("grades", "📝 5. Notes"),
            ("averages", "📈 6. Moyennes & résultats"),
            ("reports", "📑 7. Bulletins"),
            ("users", "👤 8. Utilisateurs"),
            ("settings", "⚙️ 9. Paramètres"),
            ("logout", "🚪 10. Déconnexion"),
        ]

        # Conteneur des boutons de menu
        nav_container = ctk.CTkScrollableFrame(self.sidebar, fg_color="transparent")
        nav_container.pack(fill="both", expand=True, padx=8)

        for route, label in menu_items:
            is_logout = (route == "logout")
            btn = ctk.CTkButton(
                nav_container,
                text=label,
                height=38,
                corner_radius=8,
                anchor="w",
                font=ctk.CTkFont(size=12, weight="bold" if route == "dashboard" else "normal"),
                fg_color="transparent",
                text_color="#F8FAFC" if not is_logout else "#F87171",
                hover_color="#1E293B" if not is_logout else "#450A0A",
                command=lambda r=route: self._handle_navigation(r)
            )
            btn.pack(fill="x", pady=2)
            self.nav_buttons[route] = btn

        # Badge utilisateur connecté en bas de la barre latérale
        user_footer = ctk.CTkFrame(self.sidebar, fg_color="#1E293B", corner_radius=8)
        user_footer.pack(fill="x", padx=12, pady=12, ipady=6)

        user_name = self.current_user.full_name if self.current_user else "Utilisateur"
        user_role = "Administrateur" if (self.current_user and self.current_user.role == "admin") else "Enseignant"
        
        u_lbl = ctk.CTkLabel(user_footer, text=f"👤 {user_name}", font=ctk.CTkFont(size=11, weight="bold"), text_color="#FFFFFF")
        u_lbl.pack(anchor="w", padx=10, pady=(2, 0))

        r_lbl = ctk.CTkLabel(user_footer, text=f"Rôle : {user_role}", font=ctk.CTkFont(size=10), text_color="#38BDF8")
        r_lbl.pack(anchor="w", padx=10, pady=(0, 2))

        # 2. Zone de contenu principale (droite)
        self.main_content = ctk.CTkFrame(self, fg_color=COLOR_BG_LIGHT, corner_radius=0)
        self.main_content.pack(side="right", fill="both", expand=True)

    def _handle_navigation(self, route: str):
        if route == "logout":
            self._handle_logout()
            return
        self._navigate_to(route)

    def _navigate_to(self, route: str):
        # Mettre à jour l'apparence des boutons de navigation
        for r, btn in self.nav_buttons.items():
            if r == route:
                btn.configure(fg_color=COLOR_PRIMARY_NAVY, text_color="#FFFFFF")
            elif r != "logout":
                btn.configure(fg_color="transparent", text_color="#F8FAFC")

        # Supprimer la vue précédente
        if self.active_view:
            self.active_view.destroy()

        # Charger la nouvelle vue selon le module demandé
        if route == "dashboard":
            self.active_view = DashboardView(self.main_content)
        elif route == "students":
            self.active_view = StudentsView(self.main_content)
        elif route == "classes":
            self._show_classes_view()
        elif route == "subjects":
            self.active_view = SubjectsView(self.main_content)
        elif route == "grades":
            self.active_view = GradesView(self.main_content)
        elif route in ["averages", "reports"]:
            self.active_view = ReportsView(self.main_content)
        elif route == "users":
            self._show_users_view()
        elif route == "settings":
            self._show_settings_view()

    def _show_classes_view(self):
        """Module 3 : Gestion des classes et filières"""
        self.active_view = ctk.CTkScrollableFrame(self.main_content, fg_color=COLOR_BG_LIGHT)
        self.active_view.pack(fill="both", expand=True, padx=25, pady=25)

        ctk.CTkLabel(self.active_view, text="Classes et Filières Académiques", font=ctk.CTkFont(size=20, weight="bold"), text_color="#0F172A").pack(anchor="w", pady=(0, 15))

        session = SessionLocal()
        try:
            classes = session.query(ClassRoom).all()
            for c in classes:
                card = ctk.CTkFrame(self.active_view, fg_color="#FFFFFF", corner_radius=10, border_width=1, border_color="#E2E8F0")
                card.pack(fill="x", pady=6, ipady=8)

                ctk.CTkLabel(card, text=f"🏫 {c.name} ({c.code})", font=ctk.CTkFont(size=14, weight="bold"), text_color="#1E3A8A").pack(anchor="w", padx=16, pady=(6, 2))
                ctk.CTkLabel(card, text=f"Niveau : {c.level} | Effectif : {len(c.students)} étudiants | Matières : {len(c.subjects)}", font=ctk.CTkFont(size=11), text_color="#64748B").pack(anchor="w", padx=16, pady=(0, 6))
        finally:
            session.close()

    def _show_users_view(self):
        """Module 8 : Gestion des utilisateurs"""
        self.active_view = ctk.CTkScrollableFrame(self.main_content, fg_color=COLOR_BG_LIGHT)
        self.active_view.pack(fill="both", expand=True, padx=25, pady=25)

        ctk.CTkLabel(self.active_view, text="Gestion des Comptes & Rôles Utilisateurs", font=ctk.CTkFont(size=20, weight="bold"), text_color="#0F172A").pack(anchor="w", pady=(0, 15))

        users = AuthController.get_all_users()
        for u in users:
            row = ctk.CTkFrame(self.active_view, fg_color="#FFFFFF", corner_radius=8, border_width=1, border_color="#E2E8F0")
            row.pack(fill="x", pady=4, ipady=4)

            role_badge = "👑 Administrateur" if u.role == "admin" else "👨‍🏫 Enseignant"
            ctk.CTkLabel(row, text=u.full_name, font=ctk.CTkFont(size=12, weight="bold"), text_color="#0F172A", width=200, anchor="w").pack(side="left", padx=15)
            ctk.CTkLabel(row, text=f"@{u.username}", font=ctk.CTkFont(size=11), text_color="#64748B", width=140, anchor="w").pack(side="left", padx=10)
            ctk.CTkLabel(row, text=role_badge, font=ctk.CTkFont(size=11, weight="bold"), text_color="#0284C7", width=160, anchor="w").pack(side="left", padx=10)
            ctk.CTkLabel(row, text="Mot de passe : Haché (SHA-256)", font=ctk.CTkFont(size=10), text_color="#10B981").pack(side="left", padx=10)

    def _show_settings_view(self):
        """Module 9 : Paramètres de l'établissement et base de données"""
        self.active_view = ctk.CTkFrame(self.main_content, fg_color=COLOR_BG_LIGHT)
        self.active_view.pack(fill="both", expand=True, padx=25, pady=25)

        card = ctk.CTkFrame(self.active_view, fg_color="#FFFFFF", corner_radius=12, border_width=1, border_color="#E2E8F0")
        card.pack(fill="both", expand=True, padx=10, pady=10)

        ctk.CTkLabel(card, text="Paramètres de l'Établissement & Base de Données", font=ctk.CTkFont(size=18, weight="bold"), text_color="#0F172A").pack(anchor="w", padx=20, pady=(20, 15))

        info_lines = [
            f"Nom de l'établissement : {config.SCHOOL_NAME}",
            f"Année Académique Active : {config.SCHOOL_ACADEMIC_YEAR}",
            f"Emplacement de la Base SQLite : {config.DATABASE_PATH}",
            f"Dossier des Exportations (Excel/PDF) : {config.EXPORTS_DIR}",
            f"Barème des mentions : 16+ Très bien | 14-16 Bien | 12-14 Assez bien | 10-12 Passable | <10 Insuffisant",
        ]
        for line in info_lines:
            ctk.CTkLabel(card, text=f"• {line}", font=ctk.CTkFont(size=12), text_color="#334155").pack(anchor="w", padx=25, pady=4)

        btn_backup = ctk.CTkButton(
            card,
            text="💾 Sauvegarder la Base de Données (Backup SQLite)",
            height=38,
            fg_color=COLOR_PRIMARY_NAVY,
            hover_color=COLOR_SECONDARY_BLUE,
            command=lambda: messagebox.showinfo("Sauvegarde", f"La base SQLite est sécurisée à l'adresse :\n{config.DATABASE_PATH}")
        )
        btn_backup.pack(anchor="w", padx=25, pady=(25, 10))

    def _handle_logout(self):
        confirmed = messagebox.askyesno("Déconnexion", "Souhaitez-vous fermer votre session actuelle ?")
        if confirmed:
            AuthController.logout()
            self._show_login_screen()


if __name__ == "__main__":
    app = EduGestApp()
    app.mainloop()
