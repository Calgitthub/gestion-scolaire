import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { StudentCalculation, SchoolConfig } from '../types';

export function generateBulletinPDF(
  calculation: StudentCalculation,
  classStats: { classAverage: number; totalStudents: number },
  schoolConfig: SchoolConfig,
  period: string = '1er Trimestre'
): void {
  const {
    student,
    classroom,
    subjects,
    overallAverage,
    totalCoefficients,
    mention,
    status,
    rankStr,
    totalEctsEarned,
    totalEctsPossible,
    councilDecision,
    conductAppreciation
  } = calculation;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const cycle = classroom.cycle;

  // 1. En-tête Institutionnel
  doc.setFillColor(15, 23, 42); // Bleu Nuit #0F172A
  doc.rect(0, 0, 210, 24, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text(schoolConfig.name.toUpperCase(), 14, 11);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`${schoolConfig.address} | Tél: ${schoolConfig.phone} | Email: ${schoolConfig.email}`, 14, 18);

  // Titre du Bulletin adapté au cycle
  let docTitle = `BULLETIN SCOLAIRE OFFICIEL - ${period.toUpperCase()}`;
  if (cycle === 'primaire') {
    docTitle = `LIVRET D'ÉVALUATION SCOLAIRE (ÉCOLE PRIMAIRE) - ${period.toUpperCase()}`;
  } else if (cycle === 'superieur') {
    docTitle = `RELEVÉ DE NOTES & CRÉDITS ECTS (UNIVERSITÉ LMD) - ${period.toUpperCase()}`;
  }

  doc.setFillColor(241, 245, 249);
  doc.roundedRect(14, 28, 182, 12, 2, 2, 'F');
  doc.setTextColor(30, 58, 138); // #1E3A8A
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(docTitle, 105, 35, { align: 'center' });
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.text(`Année Académique : ${schoolConfig.academicYear} | Cycle : ${classroom.cycleLabel}`, 105, 38.5, { align: 'center' });

  // 2. Fiche de l'étudiant
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(14, 43, 182, 24, 2, 2, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text('IDENTIFICATION DE L\'APPRENANT(E)', 18, 49);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`Nom & Prénom :`, 18, 55);
  doc.setFont('helvetica', 'bold');
  doc.text(`${student.lastName.toUpperCase()} ${student.firstName}`, 45, 55);

  doc.setFont('helvetica', 'normal');
  doc.text(`Identifiant / Matricule :`, 18, 61);
  doc.setFont('helvetica', 'bold');
  doc.text(student.matricule, 50, 61);

  doc.setFont('helvetica', 'normal');
  doc.text(`Classe / Filière :`, 105, 55);
  doc.setFont('helvetica', 'bold');
  doc.text(`${classroom.name} (${classroom.code})`, 132, 55);

  doc.setFont('helvetica', 'normal');
  doc.text(`Niveau & Effectif :`, 105, 61);
  doc.setFont('helvetica', 'bold');
  doc.text(`${classroom.level} • ${classStats.totalStudents} élèves inscrits`, 132, 61);

  // 3. Tableau des notes par matière selon le cycle
  let tableHeaders: string[] = [];
  let tableData: string[][] = [];

  if (cycle === 'superieur') {
    tableHeaders = ['Unités d\'Enseignement (UE)', 'ECTS', 'Moy. /20', 'Crédits Validés', 'Appréciation du Jury Universitaire'];
    tableData = subjects.map(item => {
      const avgStr = item.average !== null ? item.average.toFixed(2) : '-';
      const ects = item.subject.ectsCredits || 0;
      const statusEcts = item.ectsValidated ? `${ects} ECTS (Validée)` : `0 ECTS (À rattraper)`;
      return [
        `${item.subject.name} (${item.subject.code})`,
        ects.toString(),
        avgStr,
        statusEcts,
        item.appreciation
      ];
    });
  } else if (cycle === 'primaire') {
    tableHeaders = ['Domaines d\'Apprentissage', 'Poids', 'Notes /20', 'Moyenne', 'Bilan des Compétences & Progrès'];
    tableData = subjects.map(item => {
      const notesStr = item.hasGrades ? item.grades.map(n => n.toFixed(1)).join(', ') : '-';
      const avgStr = item.average !== null ? item.average.toFixed(2) : '-';
      return [
        item.subject.name,
        item.subject.coefficient.toString(),
        notesStr,
        avgStr,
        item.appreciation
      ];
    });
  } else {
    // Secondaire (Collège / Lycée)
    tableHeaders = ['Matières Enseignées', 'Coef', 'Notes Obtenues', 'Moy. /20', 'Points', 'Appréciation du Corps Enseignant'];
    tableData = subjects.map(item => {
      const notesStr = item.hasGrades ? item.grades.map(n => n.toFixed(1)).join(', ') : '-';
      const avgStr = item.average !== null ? item.average.toFixed(2) : '-';
      const ptsStr = item.weightedPoints !== null ? item.weightedPoints.toFixed(2) : '-';
      return [
        item.subject.name,
        item.subject.coefficient.toString(),
        notesStr,
        avgStr,
        ptsStr,
        item.appreciation
      ];
    });
  }

  autoTable(doc, {
    startY: 71,
    margin: { left: 14, right: 14 },
    head: [tableHeaders],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 58, 138],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'center'
    },
    styles: {
      fontSize: 7.5,
      cellPadding: 2,
      textColor: [30, 41, 59]
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    }
  });

  const finalY = (doc as any).lastAutoTable?.finalY || 160;

  // 4. Synthèse générale & Décision adaptée
  const summaryY = finalY + 5;
  doc.setFillColor(239, 246, 255);
  doc.setDrawColor(59, 130, 246);
  doc.roundedRect(14, summaryY, 182, 30, 2, 2, 'FD');

  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);

  // Ligne 1
  if (cycle === 'superieur') {
    doc.setFont('helvetica', 'normal');
    doc.text('Total Crédits ECTS Capitalisés :', 18, summaryY + 7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(13, 148, 136);
    doc.text(`${totalEctsEarned || 0} / ${totalEctsPossible || 30} ECTS`, 65, summaryY + 7);

    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'normal');
    doc.text('Moyenne de la Promotion :', 105, summaryY + 7);
    doc.setFont('helvetica', 'bold');
    doc.text(`${classStats.classAverage.toFixed(2)} / 20`, 145, summaryY + 7);
  } else {
    doc.setFont('helvetica', 'normal');
    doc.text('Total Coefficients :', 18, summaryY + 7);
    doc.setFont('helvetica', 'bold');
    doc.text(totalCoefficients.toString(), 55, summaryY + 7);

    doc.setFont('helvetica', 'normal');
    doc.text('Moyenne de la Classe :', 105, summaryY + 7);
    doc.setFont('helvetica', 'bold');
    doc.text(`${classStats.classAverage.toFixed(2)} / 20`, 145, summaryY + 7);
  }

  // Ligne 2 : Moyenne générale & Rang
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(cycle === 'superieur' ? 'MOYENNE SEMESTRIELLE :' : 'MOYENNE GÉNÉRALE :', 18, summaryY + 15);
  doc.setTextColor(30, 58, 138);
  doc.setFontSize(10.5);
  doc.text(overallAverage !== null ? `${overallAverage.toFixed(2)} / 20` : 'Non calculée', 65, summaryY + 15);

  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);
  doc.text('Rang :', 105, summaryY + 15);
  doc.setTextColor(13, 148, 136);
  doc.setFontSize(10.5);
  doc.text(rankStr || '-', 120, summaryY + 15);

  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  doc.text('Mention :', 145, summaryY + 15);
  doc.setTextColor(37, 99, 235);
  doc.text(mention, 160, summaryY + 15);

  // Ligne 3 : Décision du conseil adaptée au niveau
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('Décision Académique :', 18, summaryY + 23);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(status === 'Admis' ? 16 : 220, status === 'Admis' ? 140 : 38, status === 'Admis' ? 60 : 38);
  doc.setFont('helvetica', 'bold');
  doc.text(councilDecision || (status === 'Admis' ? 'ADMIS(E)' : 'AJOURNÉ(E)'), 55, summaryY + 23);

  // 5. Visas & Signatures selon le cycle
  const sigY = summaryY + 37;
  doc.setTextColor(71, 85, 105);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');

  let leftSig = 'Le Professeur Principal';
  let rightSig = 'Le Chef d\'Établissement';
  if (cycle === 'primaire') {
    leftSig = 'L\'Instituteur / Institutrice';
    rightSig = 'La Direction de l\'École';
  } else if (cycle === 'superieur') {
    leftSig = 'Le Responsable de Filière';
    rightSig = 'Le Doyen / Président de Jury';
  }

  doc.text(leftSig, 40, sigY, { align: 'center' });
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.text('(Visa & Remarques)', 40, sigY + 4, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text(rightSig, 160, sigY, { align: 'center' });
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.text(`${schoolConfig.directorName}`, 160, sigY + 4, { align: 'center' });
  doc.text('(Sceau & Signature)', 160, sigY + 8, { align: 'center' });

  // Ligne de signature
  doc.setDrawColor(203, 213, 225);
  doc.setLineDashPattern([2, 2], 0);
  doc.line(18, sigY + 20, 65, sigY + 20);
  doc.line(135, sigY + 20, 185, sigY + 20);

  // Pied de page
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  const nowStr = new Date().toLocaleDateString('fr-FR');
  doc.text(`Document officiel certifié généré le ${nowStr} par EduGest v2.0 • Cycle : ${classroom.cycleLabel}`, 105, 290, { align: 'center' });

  // Télécharger le fichier PDF
  const filename = `Bulletin_${classroom.code}_${student.matricule}_${student.lastName}.pdf`;
  doc.save(filename);
}
