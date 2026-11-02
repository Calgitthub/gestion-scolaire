# 🎓 EduGest - Application Complète de Gestion des Étudiants en Python

Logiciel moderne et ergonomique de gestion des étudiants, des matières, des notes, du calcul automatique des moyennes pondérées, des classements et de l'exportation de bulletins scolaires officiels (PDF & Excel).

Développé selon le patron d'architecture **MVC (Modèle - Vue - Contrôleur - Services)** avec **CustomTkinter** et **SQLAlchemy**.

---

## 1. 📁 Architecture Générale du Projet

```text
gestion_etudiants/
│
├── main.py                          # Point d'entrée de l'application et menu latéral CustomTkinter
├── config.py                        # Paramètres globaux, charte graphique (Bleu nuit / Bleu clair)
├── requirements.txt                 # Dépendances Python
├── README.md                        # Documentation complète et guide d'installation
│
├── database/                        # Couche de persistance relationnelle
│   ├── database.py                  # Moteur SQLAlchemy, gestion des sessions et jeu d'essai
│   └── models.py                    # Définition des tables (Users, Students, Classes, Subjects, etc.)
│
├── controllers/                     # Contrôleurs logiques et validation métier
│   ├── auth_controller.py           # Authentification sécurisée et gestion des rôles
│   ├── student_controller.py        # Inscription, modification, suppression et recherche
│   ├── subject_controller.py        # Configuration des matières et coefficients par classe
│   └── grade_controller.py          # Enregistrement des notes avec validation [0 à 20]
│
├── services/                        # Services spécialisés de calcul et d'édition
│   ├── calculation_service.py       # Algorithmes de moyennes pondérées, rangs et mentions
│   └── report_service.py            # Génération des bulletins PDF (ReportLab) et Excel (OpenPyXL)
│
├── views/                           # Interfaces graphiques CustomTkinter
│   ├── login_view.py                # Écran de connexion moderne
│   ├── dashboard_view.py            # Tableau de bord analytique et graphiques Matplotlib
│   ├── students_view.py             # Annuaire et formulaires modaux d'étudiants
│   ├── subjects_view.py             # Gestion des cours et coefficients
│   ├── grades_view.py               # Saisie des évaluations et notes
│   └── reports_view.py              # Visualisation des bulletins et exports
│
└── exports/                         # Dossier de sauvegarde des bulletins PDF et classeurs Excel
```

---

## 2. ⚙️ Prérequis et Installation

### A. Installer Python 3
1. Rendez-vous sur le site officiel [python.org/downloads](https://www.python.org/downloads/).
2. Téléchargez la dernière version de **Python 3.10+**.
3. **Important sous Windows :** Cochez impérativement la case **"Add Python to PATH"** lors de l'installation.

---

## 3. 💻 Commandes à exécuter dans le Terminal de VS Code

Ouvrez le dossier du projet dans **Visual Studio Code**, puis ouvrez le terminal intégré (`Ctrl + ~` ou menu *Terminal > Nouveau terminal*).

### Étape 1 : Créer un environnement virtuel (recommandé)
```bash
# Sous Windows
python -m venv venv
venv\Scripts\activate

# Sous macOS / Linux
python3 -m venv venv
source venv/bin/activate
```

### Étape 2 : Mettre à jour pip et installer les dépendances
```bash
python -m pip install --upgrade pip
pip install -r requirements.txt
```

*(Contenu de `requirements.txt` : customtkinter, SQLAlchemy, matplotlib, openpyxl, reportlab, bcrypt, Pillow)*

### Étape 3 : Lancer l'application
```bash
python main.py
```

Au premier lancement, la base de données SQLite `gestion_etudiants.db` est automatiquement créée et pré-remplie avec un jeu complet de données de test !

---

## 4. 🔑 Identifiants de Démonstration

L'application intègre deux comptes par défaut avec gestion des droits d'accès :

| Profil | Nom d'utilisateur | Mot de passe | Rôle & Permissions |
| :--- | :--- | :--- | :--- |
| **Administrateur** | `admin` | `admin123` | Accès total : Inscriptions, suppressions, saisie des notes, gestion des utilisateurs |
| **Enseignant** | `enseignant` | `prof123` | Consultation, saisie des évaluations et notes, génération des bulletins |

---

## 5. 🧮 Formules et Barème Officiel

### Calculs Mathématiques
1. **Moyenne d'une matière** :
   $$\text{Moyenne}_{\text{matière}} = \frac{\sum \text{Notes}}{\text{Nombre de notes}}$$

2. **Moyenne Générale Pondérée** :
   $$\text{Moyenne Générale} = \frac{\sum (\text{Moyenne}_{\text{matière}} \times \text{Coefficient})}{\sum \text{Coefficients pris en compte}}$$

### Barème des Mentions
- **16,00 à 20,00** : Très bien
- **14,00 à 15,99** : Bien
- **12,00 à 13,99** : Assez bien
- **10,00 à 11,99** : Passable
- **Moins de 10,00** : Insuffisant (Statut : Ajourné)

---

## 6. 📄 Fonctionnalités d'Exportation
- **Bulletins PDF individuels** : Mise en page professionnelle avec en-tête institutionnel, coefficients, moyennes, appréciations personnalisées et zones de signatures officielles.
- **Export Excel des Étudiants** : Tableau complet stylisé avec coordonnées des élèves.
- **Synthèse des Résultats Excel** : Classement par rang décroissant pour les conseils de classe.
