"""
Contrôleur d'authentification et de gestion des utilisateurs
Sécurisation des accès et gestion des rôles (Admin / Utilisateur)
"""
from typing import Optional, List, Tuple
from sqlalchemy.orm import Session
from database.models import User
from database.database import hash_password, SessionLocal


class AuthController:
    """Gère la session de l'utilisateur connecté et les droits d'accès"""
    current_user: Optional[User] = None

    @classmethod
    def login(cls, username: str, password: str) -> Tuple[bool, str, Optional[User]]:
        """Vérifie les identifiants et connecte l'utilisateur"""
        username = username.strip()
        if not username or not password:
            return False, "Veuillez renseigner le nom d'utilisateur et le mot de passe.", None

        session: Session = SessionLocal()
        try:
            user = session.query(User).filter(User.username == username, User.is_active == True).first()
            if not user:
                return False, "Identifiants invalides ou compte inactif.", None

            hashed_input = hash_password(password)
            if user.password_hash != hashed_input:
                return False, "Mot de passe incorrect.", None

            cls.current_user = user
            return True, f"Bienvenue, {user.full_name} !", user
        finally:
            session.close()

    @classmethod
    def logout(cls):
        """Déconnecte l'utilisateur actuel"""
        cls.current_user = None

    @classmethod
    def is_authenticated(cls) -> bool:
        return cls.current_user is not None

    @classmethod
    def is_admin(cls) -> bool:
        return cls.current_user is not None and cls.current_user.role == "admin"

    @classmethod
    def is_teacher(cls) -> bool:
        return cls.current_user is not None and cls.current_user.role in ("prof", "user")

    @classmethod
    def get_all_users(cls) -> List[User]:
        session = SessionLocal()
        try:
            return session.query(User).order_by(User.username).all()
        finally:
            session.close()

    @classmethod
    def create_user(cls, username: str, password: str, full_name: str, role: str = "user") -> Tuple[bool, str]:
        """Crée un nouvel utilisateur avec validation et hachage"""
        username = username.strip().lower()
        full_name = full_name.strip()
        if not username or len(username) < 3:
            return False, "Le nom d'utilisateur doit contenir au moins 3 caractères."
        if not password or len(password) < 6:
            return False, "Le mot de passe doit contenir au moins 6 caractères."
        if not full_name:
            return False, "Le nom complet est obligatoire."

        session = SessionLocal()
        try:
            existing = session.query(User).filter(User.username == username).first()
            if existing:
                return False, f"Le nom d'utilisateur '{username}' est déjà utilisé."

            new_user = User(
                username=username,
                password_hash=hash_password(password),
                full_name=full_name,
                role=role
            )
            session.add(new_user)
            session.commit()
            return True, "Utilisateur créé avec succès !"
        except Exception as e:
            session.rollback()
            return False, f"Erreur lors de la création : {str(e)}"
        finally:
            session.close()

    @classmethod
    def delete_user(cls, user_id: int) -> Tuple[bool, str]:
        """Supprime un utilisateur en empêchant l'auto-suppression de l'admin en cours"""
        if cls.current_user and cls.current_user.id == user_id:
            return False, "Impossible de supprimer votre propre compte administrateur."

        session = SessionLocal()
        try:
            user = session.query(User).filter(User.id == user_id).first()
            if not user:
                return False, "Utilisateur non trouvé."
            session.delete(user)
            session.commit()
            return True, "Utilisateur supprimé avec succès."
        except Exception as e:
            session.rollback()
            return False, f"Erreur : {str(e)}"
        finally:
            session.close()
