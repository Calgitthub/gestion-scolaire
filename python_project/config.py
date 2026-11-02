"""
Configuration globale de l'application EduGest
Gestion des Étudiants avec Python, CustomTkinter et SQLAlchemy
"""
import os
from pathlib import Path

# Chemins de base du projet
BASE_DIR = Path(__file__).resolve().parent
DATABASE_PATH = BASE_DIR / "gestion_etudiants.db"
EXPORTS_DIR = BASE_DIR / "exports"
ASSETS_DIR = BASE_DIR / "assets"

# Assurer l'existence des dossiers indispensables
EXPORTS_DIR.mkdir(parents=True, exist_ok=True)
ASSETS_DIR.mkdir(parents=True, exist_ok=True)

# Configuration de la base de données SQLite (facilement modifiable pour PostgreSQL/MySQL)
DATABASE_URI = f"sqlite:///{DATABASE_PATH}"

# Identité et informations de l'établissement
APP_NAME = "EduGest - Gestion Scolaire & Universitaire"
SCHOOL_NAME = "Institut Supérieur d'Excellence Académique (ISEA)"
SCHOOL_ACADEMIC_YEAR = "2026-2027"
SCHOOL_ADDRESS = "120 Avenue de l'Université, Campus des Sciences"
SCHOOL_PHONE = "+33 (0)1 45 67 89 00"
SCHOOL_EMAIL = "contact@isea-academie.edu"

# Charte Graphique Moderne
# Couleurs principales demandées : Bleu foncé, Bleu clair, Fond clair
COLOR_PRIMARY_DARK = "#0F172A"       # Bleu nuit / foncé pour la barre latérale et l'en-tête
COLOR_PRIMARY_NAVY = "#1E3A8A"       # Bleu profond pour les boutons principaux
COLOR_SECONDARY_BLUE = "#2563EB"     # Bleu vif pour les accents et sélections
COLOR_ACCENT_CYAN = "#0EA5E9"        # Bleu ciel / cyan d'accentuation
COLOR_BG_LIGHT = "#F8FAFC"           # Gris-blanc très clair pour le fond
COLOR_CARD_BG = "#FFFFFF"            # Blanc pur pour les cartes
COLOR_TEXT_MAIN = "#1E293B"          # Texte foncé
COLOR_TEXT_MUTED = "#64748B"         # Texte secondaire gris
COLOR_SUCCESS = "#10B981"            # Vert émeraude (Admis)
COLOR_DANGER = "#EF4444"             # Rouge vif (Ajourné / Supprimer)
COLOR_WARNING = "#F59E0B"            # Orange ambré

# Barème officiel des mentions (sur 20)
SCALE_MENTIONS = [
    (16.0, 20.0, "Très bien", "#059669"),
    (14.0, 15.999, "Bien", "#2563EB"),
    (12.0, 13.999, "Assez bien", "#0D9488"),
    (10.0, 11.999, "Passable", "#D97706"),
    (0.0, 9.999, "Insuffisant", "#DC2626"),
]

# Types d'évaluations standards
EVALUATION_TYPES = ["Devoir", "Interrogation", "Examen"]
