"""
Vue de connexion moderne avec CustomTkinter
Authentification sécurisée avec rôles Administrateur / Enseignant
"""
import customtkinter as ctk
from typing import Callable
from controllers.auth_controller import AuthController
from config import COLOR_PRIMARY_DARK, COLOR_PRIMARY_NAVY, COLOR_SECONDARY_BLUE, COLOR_BG_LIGHT


class LoginView(ctk.CTkFrame):
    def __init__(self, master, on_login_success: Callable):
        super().__init__(master, fg_color=COLOR_BG_LIGHT)
        self.on_login_success = on_login_success

        self.pack(fill="both", expand=True)
        self._build_ui()

    def _build_ui(self):
        # Conteneur centré façon carte élégante
        card = ctk.CTkFrame(self, fg_color="#FFFFFF", corner_radius=16, width=420, height=480, border_width=1, border_color="#E2E8F0")
        card.place(relx=0.5, rely=0.5, anchor="center")
        card.pack_propagate(False)

        # En-tête / Logo
        badge = ctk.CTkLabel(
            card,
            text="🎓 EduGest",
            font=ctk.CTkFont(size=26, weight="bold"),
            text_color=COLOR_PRIMARY_NAVY
        )
        badge.pack(pady=(35, 5))

        subtitle = ctk.CTkLabel(
            card,
            text="Portail de Gestion Académique",
            font=ctk.CTkFont(size=13),
            text_color="#64748B"
        )
        subtitle.pack(pady=(0, 25))

        # Champ Nom d'utilisateur
        lbl_user = ctk.CTkLabel(card, text="Nom d'utilisateur", font=ctk.CTkFont(size=12, weight="bold"), text_color="#334155")
        lbl_user.pack(anchor="w", padx=40, pady=(0, 4))
        self.entry_username = ctk.CTkEntry(
            card,
            placeholder_text="ex: admin ou enseignant",
            height=40,
            corner_radius=8,
            border_color="#CBD5E1",
            fg_color="#F8FAFC",
            text_color="#0F172A"
        )
        self.entry_username.pack(fill="x", padx=40, pady=(0, 15))
        self.entry_username.insert(0, "admin")

        # Champ Mot de passe
        lbl_pwd = ctk.CTkLabel(card, text="Mot de passe", font=ctk.CTkFont(size=12, weight="bold"), text_color="#334155")
        lbl_pwd.pack(anchor="w", padx=40, pady=(0, 4))
        self.entry_password = ctk.CTkEntry(
            card,
            placeholder_text="••••••••",
            show="•",
            height=40,
            corner_radius=8,
            border_color="#CBD5E1",
            fg_color="#F8FAFC",
            text_color="#0F172A"
        )
        self.entry_password.pack(fill="x", padx=40, pady=(0, 10))
        self.entry_password.insert(0, "admin123")
        self.entry_password.bind("<Return>", lambda event: self._handle_login())

        # Message d'erreur
        self.lbl_error = ctk.CTkLabel(card, text="", font=ctk.CTkFont(size=11), text_color="#EF4444")
        self.lbl_error.pack(pady=(0, 10))

        # Bouton Se connecter
        btn_login = ctk.CTkButton(
            card,
            text="Se connecter à la session",
            height=44,
            corner_radius=8,
            fg_color=COLOR_PRIMARY_NAVY,
            hover_color=COLOR_SECONDARY_BLUE,
            font=ctk.CTkFont(size=13, weight="bold"),
            command=self._handle_login
        )
        btn_login.pack(fill="x", padx=40, pady=(0, 15))

        # Raccourcis de démonstration
        demo_info = ctk.CTkLabel(
            card,
            text="Comptes de test : admin (admin123) | enseignant (prof123)",
            font=ctk.CTkFont(size=10),
            text_color="#94A3B8"
        )
        demo_info.pack(pady=(5, 10))

    def _handle_login(self):
        username = self.entry_username.get()
        password = self.entry_password.get()

        success, message, user = AuthController.login(username, password)
        if success and user:
            self.lbl_error.configure(text="")
            self.on_login_success(user)
        else:
            self.lbl_error.configure(text=message)
