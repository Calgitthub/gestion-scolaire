"""
Service d'exportation de données et génération de bulletins scolaires
- Excel (.xlsx) via OpenPyXL
- Bulletins officiels (.pdf) via ReportLab
"""
import os
from datetime import datetime
from openpyxl import Workbook
from openpyxl.styles import Font, Alignment, PatternFill, Border, Side
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, KeepTogether
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm

import config
from database.models import Student, ClassRoom, Subject, Grade, Evaluation
from services.calculation_service import calculate_student_overall, calculate_class_rankings, get_class_statistics


def export_students_to_excel(class_id: int, file_path: str, session) -> str:
    """Exporte la liste des étudiants avec leurs informations complètes au format Excel"""
    wb = Workbook()
    ws = wb.active
    ws.title = "Liste des Étudiants"

    # Récupération des données
    classroom = session.query(ClassRoom).filter(ClassRoom.id == class_id).first() if class_id else None
    query = session.query(Student)
    if class_id:
        query = query.filter(Student.class_id == class_id)
    students = query.order_by(Student.last_name, Student.first_name).all()

    # Styles
    navy_fill = PatternFill(start_color="0F172A", end_color="0F172A", fill_type="solid")
    header_fill = PatternFill(start_color="1E3A8A", end_color="1E3A8A", fill_type="solid")
    alt_fill = PatternFill(start_color="F8FAFC", end_color="F8FAFC", fill_type="solid")
    white_font = Font(name="Calibri", size=11, bold=True, color="FFFFFF")
    title_font = Font(name="Calibri", size=15, bold=True, color="FFFFFF")
    bold_font = Font(name="Calibri", size=10, bold=True)
    normal_font = Font(name="Calibri", size=10)
    thin_border = Border(
        left=Side(style='thin', color='E2E8F0'),
        right=Side(style='thin', color='E2E8F0'),
        top=Side(style='thin', color='E2E8F0'),
        bottom=Side(style='thin', color='E2E8F0')
    )

    # Titre du fichier
    ws.merge_cells("A1:H1")
    title_cell = ws["A1"]
    title_cell.value = f"{config.SCHOOL_NAME} - LISTE OFFICIELLE DES ÉTUDIANTS"
    title_cell.font = title_font
    title_cell.fill = navy_fill
    title_cell.alignment = Alignment(horizontal="center", vertical="center")
    ws.row_dimensions[1].height = 35

    # Sous-titre
    ws.merge_cells("A2:H2")
    sub_cell = ws["A2"]
    class_name = classroom.name if classroom else "Toutes les classes"
    sub_cell.value = f"Classe : {class_name} | Année Académique : {config.SCHOOL_ACADEMIC_YEAR} | Total : {len(students)} inscrits"
    sub_cell.font = Font(name="Calibri", size=10, italic=True, color="475569")
    sub_cell.alignment = Alignment(horizontal="center", vertical="center")
    ws.row_dimensions[2].height = 20

    # En-têtes de colonnes
    headers = [
        "N°", "Matricule", "Nom & Prénom", "Sexe", "Date Naissance",
        "Classe / Filière", "Téléphone", "Adresse E-mail"
    ]
    ws.row_dimensions[4].height = 25
    for col_num, header_title in enumerate(headers, 1):
        cell = ws.cell(row=4, column=col_num)
        cell.value = header_title
        cell.font = white_font
        cell.fill = header_fill
        cell.alignment = Alignment(horizontal="center", vertical="center")
        cell.border = thin_border

    # Remplissage des données
    for row_idx, st in enumerate(students, 5):
        ws.row_dimensions[row_idx].height = 20
        is_even = (row_idx % 2 == 0)
        current_fill = alt_fill if is_even else PatternFill(fill_type=None)

        values = [
            row_idx - 4,
            st.matricule,
            st.full_name,
            st.gender,
            st.birth_date.strftime("%d/%m/%Y") if st.birth_date else "-",
            st.classroom.name if st.classroom else "-",
            st.phone or "-",
            st.email or "-"
        ]

        for col_idx, val in enumerate(values, 1):
            cell = ws.cell(row=row_idx, column=col_idx)
            cell.value = val
            cell.font = normal_font
            cell.fill = current_fill
            cell.border = thin_border
            if col_idx in [1, 2, 4, 5]:
                cell.alignment = Alignment(horizontal="center", vertical="center")
            else:
                cell.alignment = Alignment(horizontal="left", vertical="center")

    # Ajustement des largeurs de colonnes
    column_widths = [6, 18, 30, 8, 16, 28, 18, 32]
    for i, width in enumerate(column_widths, 1):
        col_letter = chr(64 + i)
        ws.column_dimensions[col_letter].width = width

    wb.save(file_path)
    return file_path


def export_grades_to_excel(class_id: int, file_path: str, session) -> str:
    """Exporte la synthèse académique des moyennes et résultats de la classe au format Excel"""
    wb = Workbook()
    ws = wb.active
    ws.title = "Synthèse des Résultats"

    classroom = session.query(ClassRoom).filter(ClassRoom.id == class_id).first()
    rankings = calculate_class_rankings(class_id, session)
    subjects = session.query(Subject).filter(Subject.class_id == class_id).all()

    # Entête Principal
    navy_fill = PatternFill(start_color="0F172A", end_color="0F172A", fill_type="solid")
    header_fill = PatternFill(start_color="1E3A8A", end_color="1E3A8A", fill_type="solid")
    white_font = Font(name="Calibri", size=11, bold=True, color="FFFFFF")

    ws.merge_cells("A1:G1")
    title_cell = ws["A1"]
    title_cell.value = f"SYNTHÈSE DES RÉSULTATS & CLASSEMENT - {classroom.name if classroom else ''}"
    title_cell.font = Font(name="Calibri", size=14, bold=True, color="FFFFFF")
    title_cell.fill = navy_fill
    title_cell.alignment = Alignment(horizontal="center", vertical="center")

    headers = ["Rang", "Matricule", "Nom de l'étudiant", "Total Coefs", "Moyenne /20", "Mention", "Décision"]
    for col_idx, h in enumerate(headers, 1):
        c = ws.cell(row=3, column=col_idx)
        c.value = h
        c.font = white_font
        c.fill = header_fill
        c.alignment = Alignment(horizontal="center", vertical="center")

    for r_idx, item in enumerate(rankings, 4):
        avg_str = f"{item['overall_average']:.2f}" if item['overall_average'] is not None else "-"
        values = [
            item["rank_str"],
            item["matricule"],
            item["name"],
            item["total_coefficients"],
            avg_str,
            item["mention"],
            item["status"]
        ]
        for c_idx, val in enumerate(values, 1):
            cell = ws.cell(row=r_idx, column=c_idx)
            cell.value = val
            cell.alignment = Alignment(horizontal="center" if c_idx in [1, 2, 4, 5, 7] else "left", vertical="center")

    wb.save(file_path)
    return file_path


def generate_student_bulletin_pdf(student_id: int, period: str, file_path: str, session) -> str:
    """
    Génère un Bulletin Scolaire individuel professionnel de haute qualité au format PDF.
    Comprend :
    - En-tête officiel de l'établissement
    - Informations de l'étudiant et de la classe
    - Tableau détaillé des matières, coefficients, moyennes et appréciations
    - Synthèse générale : Moyenne générale, Rang, Mention, Décision du conseil
    - Zone de visa et signatures officielles
    """
    student = session.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise ValueError(f"Étudiant introuvable (ID: {student_id})")

    classroom = student.classroom
    overall_data = calculate_student_overall(student_id, session)
    rankings = calculate_class_rankings(classroom.id, session)
    class_stats = get_class_statistics(classroom.id, session)

    # Trouver le rang exact
    student_rank = "-"
    for r in rankings:
        if r["student_id"] == student_id:
            student_rank = r["rank_str"]
            break

    doc = SimpleDocTemplate(
        file_path,
        pagesize=A4,
        rightMargin=1.5 * cm,
        leftMargin=1.5 * cm,
        topMargin=1.5 * cm,
        bottomMargin=1.5 * cm
    )

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontSize=15,
        leading=18,
        textColor=colors.HexColor("#0F172A"),
        alignment=1,  # Center
        fontName="Helvetica-Bold"
    )
    subtitle_style = ParagraphStyle(
        'DocSub',
        parent=styles['Normal'],
        fontSize=9,
        leading=12,
        textColor=colors.HexColor("#475569"),
        alignment=1
    )
    cell_bold = ParagraphStyle(
        'CellBold',
        parent=styles['Normal'],
        fontSize=9,
        leading=11,
        fontName="Helvetica-Bold",
        textColor=colors.HexColor("#1E293B")
    )
    cell_normal = ParagraphStyle(
        'CellNormal',
        parent=styles['Normal'],
        fontSize=8.5,
        leading=10.5,
        textColor=colors.HexColor("#334155")
    )

    elements = []

    # 1. En-tête de l'institution
    header_data = [
        [
            Paragraph(f"<b>{config.SCHOOL_NAME}</b><br/>{config.SCHOOL_ADDRESS}<br/>Tél : {config.SCHOOL_PHONE} | Email : {config.SCHOOL_EMAIL}", cell_normal),
            Paragraph(f"<b>BULLETIN DE NOTES OFFICIEL</b><br/>Période : {period}<br/>Année Académique : {config.SCHOOL_ACADEMIC_YEAR}", cell_bold)
        ]
    ]
    header_table = Table(header_data, colWidths=[10 * cm, 7.5 * cm])
    header_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('LINEBELOW', (0, 0), (-1, -1), 1.5, colors.HexColor("#1E3A8A")),
    ]))
    elements.append(header_table)
    elements.append(Spacer(1, 0.4 * cm))

    # 2. Carte d'information de l'étudiant
    info_data = [
        [
            Paragraph(f"<b>Nom & Prénom :</b> {student.full_name}", cell_normal),
            Paragraph(f"<b>Matricule :</b> {student.matricule}", cell_normal),
            Paragraph(f"<b>Classe :</b> {classroom.name}", cell_normal),
        ],
        [
            Paragraph(f"<b>Date de Naissance :</b> {student.birth_date.strftime('%d/%m/%Y') if student.birth_date else '-'}", cell_normal),
            Paragraph(f"<b>Sexe :</b> {'Masculin' if student.gender == 'M' else 'Féminin'}", cell_normal),
            Paragraph(f"<b>Effectif de la classe :</b> {class_stats['total_students']} élèves", cell_normal),
        ]
    ]
    info_table = Table(info_data, colWidths=[6.5 * cm, 5.5 * cm, 5.5 * cm])
    info_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#F1F5F9")),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))
    elements.append(info_table)
    elements.append(Spacer(1, 0.5 * cm))

    # 3. Tableau des notes par matière
    table_headers = [
        Paragraph("<b>Matières Enseignées</b>", cell_bold),
        Paragraph("<b>Coef</b>", cell_bold),
        Paragraph("<b>Notes Obtenues</b>", cell_bold),
        Paragraph("<b>Moy. /20</b>", cell_bold),
        Paragraph("<b>Points Pondérés</b>", cell_bold),
        Paragraph("<b>Appréciation & Avis</b>", cell_bold),
    ]
    table_rows = [table_headers]

    for subj_id, item in overall_data["subjects"].items():
        if item["has_grades"]:
            notes_str = ", ".join([f"{n:.1f}" for n in item["grades"]])
            avg_str = f"<b>{item['average']:.2f}</b>"
            pts_str = f"{item['weighted_points']:.2f}"
            
            # Appréciation automatique personnalisée selon la moyenne
            m_val = item['average']
            if m_val >= 16:
                appr = "Excellent travail. Félicitations."
            elif m_val >= 14:
                appr = "Très bon trimestre, poursuivez ainsi."
            elif m_val >= 12:
                appr = "Résultats satisfaisants."
            elif m_val >= 10:
                appr = "Ensemble convenable mais peut progresser."
            else:
                appr = "Résultats insuffisants. Intensifier les efforts."
        else:
            notes_str = "-"
            avg_str = "-"
            pts_str = "-"
            appr = "Non évalué ce trimestre"

        table_rows.append([
            Paragraph(f"<b>{item['name']}</b> ({item['code']})", cell_normal),
            Paragraph(str(item["coefficient"]), cell_normal),
            Paragraph(notes_str, cell_normal),
            Paragraph(avg_str, cell_normal),
            Paragraph(pts_str, cell_normal),
            Paragraph(appr, cell_normal),
        ])

    grades_table = Table(table_rows, colWidths=[4.8 * cm, 1.2 * cm, 3.8 * cm, 1.8 * cm, 2.2 * cm, 3.7 * cm])
    grades_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#1E3A8A")),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (1, 0), (4, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor("#F8FAFC")]),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ]))
    elements.append(grades_table)
    elements.append(Spacer(1, 0.5 * cm))

    # 4. Synthèse globale et Décision du jury
    ov_avg = overall_data["overall_average"]
    ov_avg_str = f"{ov_avg:.2f} / 20" if ov_avg is not None else "-"
    summary_data = [
        [
            Paragraph("<b>Total des Coefficients :</b>", cell_normal),
            Paragraph(str(overall_data["total_coefficients"]), cell_bold),
            Paragraph("<b>Moyenne de la Classe :</b>", cell_normal),
            Paragraph(f"{class_stats['class_average']:.2f} / 20", cell_bold),
        ],
        [
            Paragraph("<b>Moyenne Générale Pondérée :</b>", cell_bold),
            Paragraph(f"<font color='#1E3A8A' size=11><b>{ov_avg_str}</b></font>", cell_bold),
            Paragraph("<b>Rang dans la classe :</b>", cell_bold),
            Paragraph(f"<font color='#0D9488' size=11><b>{student_rank}</b></font>", cell_bold),
        ],
        [
            Paragraph("<b>Mention Obtenue :</b>", cell_bold),
            Paragraph(f"<b>{overall_data['mention']}</b>", cell_bold),
            Paragraph("<b>Décision Académique :</b>", cell_bold),
            Paragraph(f"<b>{'ADMIS(E)' if overall_data['status'] == 'Admis' else 'AJOURNÉ(E)'}</b>", cell_bold),
        ]
    ]

    summary_table = Table(summary_data, colWidths=[4.5 * cm, 4.0 * cm, 4.5 * cm, 4.5 * cm])
    summary_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#EFF6FF")),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor("#2563EB")),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#BFDBFE")),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))
    elements.append(summary_table)
    elements.append(Spacer(1, 0.7 * cm))

    # 5. Signatures et Visas officiels
    sig_data = [
        [
            Paragraph("<b>Le Professeur Principal</b><br/><br/><br/><i>Visa & Signature</i>", cell_normal),
            Paragraph(f"Fait le {datetime.now().strftime('%d/%m/%Y')}<br/><b>Le Chef d'Établissement</b><br/><br/><i>Cachet officiel & Signature</i>", cell_normal)
        ]
    ]
    sig_table = Table(sig_data, colWidths=[9 * cm, 8.5 * cm])
    sig_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 10),
    ]))
    elements.append(KeepTogether(sig_table))

    # Génération du document PDF
    doc.build(elements)
    return file_path
