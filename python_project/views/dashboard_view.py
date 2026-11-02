"""
Tableau de bord statistique avec CustomTkinter et Matplotlib
Affiche les indicateurs clés (KPIs) et graphiques analytiques
"""
import customtkinter as ctk
import matplotlib
matplotlib.use("TkAgg")
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg
from matplotlib.figure import Figure

from database.database import SessionLocal
from database.models import Student, Subject, Grade, ClassRoom
from services.calculation_service import calculate_student_overall, get_class_statistics
from config import COLOR_PRIMARY_NAVY, COLOR_SECONDARY_BLUE, COLOR_SUCCESS, COLOR_DANGER, COLOR_CARD_BG, COLOR_BG_LIGHT


class DashboardView(ctk.CTkScrollableFrame):
    def __init__(self, master):
        super().__init__(master, fg_color=COLOR_BG_LIGHT)
        self.pack(fill="both", expand=True, padx=25, pady=25)
        self._load_data()
        self._build_ui()

    def _load_data(self):
        session = SessionLocal()
        try:
            self.total_students = session.query(Student).count()
            self.total_subjects = session.query(Subject).count()
            self.total_grades = session.query(Grade).count()
            self.classes = session.query(ClassRoom).all()

            # Calcul des statistiques globales sur tous les élèves
            students = session.query(Student).all()
            averages = []
            for st in students:
                res = calculate_student_overall(st.id, session)
                if res["overall_average"] is not None:
                    averages.append(res["overall_average"])

            if averages:
                self.class_average = round(sum(averages) / len(averages), 2)
                self.passed_count = sum(1 for a in averages if a >= 10.0)
                self.failed_count = len(averages) - self.passed_count
                self.success_rate = round((self.passed_count / len(averages)) * 100, 1)
            else:
                self.class_average = 0.0
                self.passed_count = 0
                self.failed_count = 0
                self.success_rate = 0.0

            self.all_averages = averages
        finally:
            session.close()

    def _build_ui(self):
        # Titre de la page
        header_frame = ctk.CTkFrame(self, fg_color="transparent")
        header_frame.pack(fill="x", pady=(0, 20))

        title = ctk.CTkLabel(
            header_frame,
            text="Tableau de Bord & Indicateurs de Performance",
            font=ctk.CTkFont(size=22, weight="bold"),
            text_color="#0F172A"
        )
        title.pack(anchor="w")

        subtitle = ctk.CTkLabel(
            header_frame,
            text="Vue d'ensemble en temps réel des résultats académiques et des effectifs",
            font=ctk.CTkFont(size=12),
            text_color="#64748B"
        )
        subtitle.pack(anchor="w")

        # Grille des cartes de statistiques (KPIs)
        kpi_grid = ctk.CTkFrame(self, fg_color="transparent")
        kpi_grid.pack(fill="x", pady=(0, 25))

        kpis = [
            ("Total Étudiants", str(self.total_students), "👤 Inscrits actifs", "#1E3A8A"),
            ("Matières Enseignées", str(self.total_subjects), "📚 Cours au programme", "#0284C7"),
            ("Notes Enregistrées", str(self.total_grades), "📝 Évaluations notées", "#0D9488"),
            ("Moyenne Générale", f"{self.class_average:.2f} / 20", "📊 Moyenne globale", "#2563EB"),
            ("Étudiants Admis", f"{self.passed_count}", f"✅ {self.success_rate}% de réussite", "#10B981"),
            ("Étudiants Ajournés", f"{self.failed_count}", "⚠️ Moyenne < 10/20", "#EF4444"),
        ]

        # 3 colonnes de cartes
        for i, (label, val, subtext, color) in enumerate(kpis):
            col = i % 3
            row = i // 3
            card = ctk.CTkFrame(kpi_grid, fg_color=COLOR_CARD_BG, corner_radius=12, border_width=1, border_color="#E2E8F0")
            card.grid(row=row, column=col, padx=8, pady=8, sticky="nsew")
            kpi_grid.grid_columnconfigure(col, weight=1)

            lbl = ctk.CTkLabel(card, text=label, font=ctk.CTkFont(size=11, weight="bold"), text_color="#64748B")
            lbl.pack(anchor="w", padx=16, pady=(14, 2))

            val_lbl = ctk.CTkLabel(card, text=val, font=ctk.CTkFont(size=22, weight="bold"), text_color=color)
            val_lbl.pack(anchor="w", padx=16, pady=(0, 2))

            sub_lbl = ctk.CTkLabel(card, text=subtext, font=ctk.CTkFont(size=10), text_color="#94A3B8")
            sub_lbl.pack(anchor="w", padx=16, pady=(0, 14))

        # Graphiques Matplotlib intégrés
        charts_frame = ctk.CTkFrame(self, fg_color=COLOR_CARD_BG, corner_radius=14, border_width=1, border_color="#E2E8F0")
        charts_frame.pack(fill="both", expand=True, pady=(10, 20))

        chart_title = ctk.CTkLabel(
            charts_frame,
            text="Graphiques Statistiques des Résultats",
            font=ctk.CTkFont(size=14, weight="bold"),
            text_color="#0F172A"
        )
        chart_title.pack(anchor="w", padx=20, pady=(16, 5))

        self._render_matplotlib_charts(charts_frame)

    def _render_matplotlib_charts(self, parent_frame):
        # Création de la figure Matplotlib avec 2 sous-graphiques modernes
        fig = Figure(figsize=(9, 4.2), dpi=100, facecolor="#FFFFFF")
        
        # Graphique 1 : Camembert Admis vs Ajournés
        ax1 = fig.add_subplot(121)
        if self.passed_count + self.failed_count > 0:
            pie_data = [self.passed_count, self.failed_count]
            labels = [f"Admis ({self.passed_count})", f"Ajournés ({self.failed_count})"]
            colors = ["#10B981", "#EF4444"]
            wedges, texts, autotexts = ax1.pie(
                pie_data, labels=labels, autopct="%1.1f%%",
                startangle=140, colors=colors,
                textprops={'fontsize': 9, 'color': '#1E293B'}
            )
            for autotext in autotexts:
                autotext.set_color('white')
                autotext.set_weight('bold')
        else:
            ax1.text(0.5, 0.5, "Aucune note", horizontalalignment='center', verticalalignment='center')
        ax1.set_title("Répartition Admis / Ajournés", fontsize=11, fontweight="bold", pad=12, color="#0F172A")

        # Graphique 2 : Histogramme de répartition des moyennes par tranche
        ax2 = fig.add_subplot(122)
        bins = ["< 10", "10 - 12", "12 - 14", "14 - 16", "16 - 20"]
        counts = [0, 0, 0, 0, 0]
        for a in self.all_averages:
            if a < 10:
                counts[0] += 1
            elif a < 12:
                counts[1] += 1
            elif a < 14:
                counts[2] += 1
            elif a < 16:
                counts[3] += 1
            else:
                counts[4] += 1

        bar_colors = ["#EF4444", "#F59E0B", "#0D9488", "#2563EB", "#10B981"]
        bars = ax2.bar(bins, counts, color=bar_colors, width=0.6, edgecolor="#CBD5E1")
        ax2.set_title("Distribution des Moyennes par Mention", fontsize=11, fontweight="bold", pad=12, color="#0F172A")
        ax2.set_ylabel("Nombre d'élèves", fontsize=9, color="#64748B")
        ax2.grid(axis='y', linestyle='--', alpha=0.5)
        ax2.set_axisbelow(True)
        ax2.tick_params(axis='x', labelsize=8.5)
        ax2.tick_params(axis='y', labelsize=8.5)

        fig.tight_layout(pad=2.5)

        # Intégration Tkinter Canvas
        canvas = FigureCanvasTkAgg(fig, master=parent_frame)
        canvas.draw()
        canvas.get_tk_widget().pack(fill="both", expand=True, padx=15, pady=15)
