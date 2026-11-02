import {
  Student,
  Subject,
  Evaluation,
  Grade,
  ClassRoom,
  StudentCalculation,
  SubjectCalculation,
  ClassStatistics
} from '../types';

export function getMentionInfo(average: number | null): { mention: string; color: string } {
  if (average === null || isNaN(average)) {
    return { mention: 'Non évalué', color: '#64748B' };
  }
  if (average >= 16.0) {
    return { mention: 'Très bien', color: '#059669' };
  } else if (average >= 14.0) {
    return { mention: 'Bien', color: '#2563EB' };
  } else if (average >= 12.0) {
    return { mention: 'Assez bien', color: '#0D9488' };
  } else if (average >= 10.0) {
    return { mention: 'Passable', color: '#D97706' };
  } else {
    return { mention: 'Insuffisant', color: '#DC2626' };
  }
}

export function getAppreciationForSubject(avg: number | null, cycle: string): string {
  if (avg === null) return "Non évalué sur cette période";

  if (cycle === 'primaire') {
    if (avg >= 16) return "Compétence parfaitement acquise (A). Travail soigné et autonome.";
    if (avg >= 14) return "Compétence acquise (A). Bon investissement en classe.";
    if (avg >= 12) return "Compétence consolidée. Poursuivre les efforts de rigueur.";
    if (avg >= 10) return "En cours d'acquisition (ECA). Doit consolider les méthodes.";
    return "Non acquis (NA). De réelles difficultés, soutien recommandé.";
  }

  if (cycle === 'superieur') {
    if (avg >= 16) return "Excellente maîtrise théorique et pratique des concepts. UE validée avec brio.";
    if (avg >= 14) return "Très bonne compréhension des notions du programme. UE validée.";
    if (avg >= 12) return "Résultats satisfaisants. Travail régulier. UE validée.";
    if (avg >= 10) return "Moyenne atteinte de justesse. UE validée par compensation.";
    return "UE non validée (< 10/20). Convoqué à la session de rattrapage.";
  }

  // Secondaire (par défaut)
  if (avg >= 16) return "Excellent travail. Grande rigueur intellectuelle et régularité exemplaire.";
  if (avg >= 14) return "Très bon trimestre. Travail sérieux et dynamique positive.";
  if (avg >= 12) return "Ensemble satisfaisant. Les bases sont acquises, peut encore progresser.";
  if (avg >= 10) return "Résultats convenables mais l'attention doit être renforcée.";
  return "Trimestre insuffisant. Travail superficiel ou trop irrégulier. Doit réagir.";
}

export function getCouncilDecision(avg: number | null, cycle: string, totalEctsEarned?: number): { decision: string; conduct: string } {
  if (avg === null) {
    return { decision: "En attente de notation", conduct: "Non évalué" };
  }

  if (cycle === 'primaire') {
    if (avg >= 16) {
      return {
        decision: "Félicitations de l'instituteur - Passage en classe supérieure avec les compliments",
        conduct: "Comportement exemplaire, curiosité remarquable et grande politesse."
      };
    } else if (avg >= 13) {
      return {
        decision: "Avis très favorable pour le passage en classe supérieure",
        conduct: "Élève appliqué, attentif et respectueux des règles de vie scolaire."
      };
    } else if (avg >= 10) {
      return {
        decision: "Avis favorable pour le passage en classe supérieure",
        conduct: "Comportement convenable mais attention parfois dispersée."
      };
    } else {
      return {
        decision: "Passage sous conditions / Mise en place d'un PPRE (Programme de Soutien)",
        conduct: "Manque d'écoute et d'assiduité dans les devoirs du soir. Rigueur requise."
      };
    }
  }

  if (cycle === 'superieur') {
    if (avg >= 10) {
      return {
        decision: `Semestre Validé (${totalEctsEarned || 30} / 30 Crédits ECTS Capitalisés) - Admis`,
        conduct: "Assiduité conforme aux exigences universitaires."
      };
    } else {
      return {
        decision: `Semestre Ajourné (${totalEctsEarned || 0} / 30 ECTS) - Convoqué à la 2ème Session (Rattrapages)`,
        conduct: "Absences injustifiées aux Travaux Dirigés (TD). Revoir l'implication."
      };
    }
  }

  // Secondaire (Collège / Lycée)
  if (avg >= 16) {
    return {
      decision: "Félicitations unanimes du Conseil de Classe",
      conduct: "Attitude irréprochable et participation très active en cours."
    };
  } else if (avg >= 14) {
    return {
      decision: "Compliments du Conseil de Classe",
      conduct: "Élève sérieux et dynamique. Poursuivez ainsi."
    };
  } else if (avg >= 12) {
    return {
      decision: "Encouragements du Conseil de Classe",
      conduct: "Bonne volonté générale. Quelques bavardages à canaliser."
    };
  } else if (avg >= 10) {
    return {
      decision: "Admis(e) - Poursuite du cycle validée",
      conduct: "Comportement neutre. Doit fournir davantage d'efforts personnels."
    };
  } else {
    return {
      decision: "Ajourné(e) - Avertissement Travail & Stage de remise à niveau recommandé",
      conduct: "Manque manifeste de travail personnel et devoirs non rendus."
    };
  }
}

export function calculateStudentPerformance(
  student: Student,
  classroom: ClassRoom,
  subjects: Subject[],
  evaluations: Evaluation[],
  grades: Grade[]
): StudentCalculation {
  const classSubjects = subjects.filter(s => s.classId === student.classId);
  const evalMap = new Map<number, Evaluation>();
  evaluations.forEach(ev => evalMap.set(ev.id, ev));

  const studentGrades = grades.filter(g => g.studentId === student.id);
  const subjectGradesMap = new Map<number, number[]>();
  classSubjects.forEach(s => subjectGradesMap.set(s.id, []));

  studentGrades.forEach(g => {
    const ev = evalMap.get(g.evaluationId);
    if (ev && subjectGradesMap.has(ev.subjectId)) {
      subjectGradesMap.get(ev.subjectId)!.push(g.value);
    }
  });

  let totalWeightedPoints = 0;
  let totalEffectiveCoefficients = 0;
  let totalEctsPossible = 0;
  let rawEctsEarned = 0;

  const subjectCalculations: SubjectCalculation[] = classSubjects.map(s => {
    const list = subjectGradesMap.get(s.id) || [];
    const count = list.length;
    let avg: number | null = null;
    let weightedPts: number | null = null;

    if (count > 0) {
      const sum = list.reduce((a, b) => a + b, 0);
      avg = Math.round((sum / count) * 100) / 100;
      weightedPts = Math.round(avg * s.coefficient * 100) / 100;

      totalWeightedPoints += weightedPts;
      totalEffectiveCoefficients += s.coefficient;
    }

    const ects = s.ectsCredits || 0;
    totalEctsPossible += ects;

    // Si moyenne de l'UE >= 10, l'UE est validée
    const isEctsValidated = avg !== null && avg >= 10.0;
    if (isEctsValidated) {
      rawEctsEarned += ects;
    }

    return {
      subject: s,
      grades: list,
      count,
      average: avg,
      weightedPoints: weightedPts,
      hasGrades: count > 0,
      appreciation: getAppreciationForSubject(avg, classroom.cycle),
      ectsValidated: isEctsValidated
    };
  });

  let overallAverage: number | null = null;
  if (totalEffectiveCoefficients > 0) {
    overallAverage = Math.round((totalWeightedPoints / totalEffectiveCoefficients) * 100) / 100;
  }

  // Règle de compensation universitaire (LMD) :
  // Si la moyenne générale est >= 10, tous les ECTS du semestre (30) sont accordés par compensation
  let finalEctsEarned = rawEctsEarned;
  if (classroom.cycle === 'superieur' && overallAverage !== null && overallAverage >= 10.0) {
    finalEctsEarned = totalEctsPossible > 0 ? totalEctsPossible : 30;
    // Marquer toutes les UE comme validées par compensation
    subjectCalculations.forEach(sc => {
      sc.ectsValidated = true;
    });
  }

  const mentionData = getMentionInfo(overallAverage);
  const status: 'Admis' | 'Ajourné' | 'En cours' =
    overallAverage === null ? 'En cours' : overallAverage >= 10.0 ? 'Admis' : 'Ajourné';

  const { decision, conduct } = getCouncilDecision(overallAverage, classroom.cycle, finalEctsEarned);

  return {
    student,
    classroom,
    subjects: subjectCalculations,
    totalCoefficients: totalEffectiveCoefficients,
    totalWeightedPoints: Math.round(totalWeightedPoints * 100) / 100,
    overallAverage,
    mention: mentionData.mention,
    mentionColor: mentionData.color,
    status,
    totalEctsEarned: finalEctsEarned,
    totalEctsPossible: totalEctsPossible > 0 ? totalEctsPossible : 30,
    councilDecision: decision,
    conductAppreciation: conduct
  };
}

export function calculateClassRankings(
  classId: number,
  students: Student[],
  classes: ClassRoom[],
  subjects: Subject[],
  evaluations: Evaluation[],
  grades: Grade[]
): StudentCalculation[] {
  const classroom = classes.find(c => c.id === classId);
  if (!classroom) return [];

  const classStudents = students.filter(st => st.classId === classId);

  const calculations = classStudents.map(st =>
    calculateStudentPerformance(st, classroom, subjects, evaluations, grades)
  );

  calculations.sort((a, b) => {
    if (a.overallAverage === null && b.overallAverage === null) return 0;
    if (a.overallAverage === null) return 1;
    if (b.overallAverage === null) return -1;
    return b.overallAverage - a.overallAverage;
  });

  let currentRank = 1;
  calculations.forEach((calc, idx) => {
    if (calc.overallAverage === null) {
      calc.rank = undefined;
      calc.rankStr = 'Non classé';
    } else {
      if (idx > 0 && calculations[idx - 1].overallAverage === calc.overallAverage) {
        calc.rank = calculations[idx - 1].rank;
      } else {
        calc.rank = currentRank;
      }
      calc.rankStr = calc.rank === 1 ? '1er' : `${calc.rank}ème`;
      currentRank = idx + 2;
    }
  });

  return calculations;
}

export function getClassStatistics(rankings: StudentCalculation[]): ClassStatistics {
  const evaluated = rankings.filter(r => r.overallAverage !== null);
  const averages = evaluated.map(r => r.overallAverage!);

  if (averages.length === 0) {
    return {
      totalStudents: rankings.length,
      evaluatedStudents: 0,
      classAverage: 0,
      minAverage: 0,
      maxAverage: 0,
      passedCount: 0,
      failedCount: 0,
      successRate: 0
    };
  }

  const sum = averages.reduce((a, b) => a + b, 0);
  const classAvg = Math.round((sum / averages.length) * 100) / 100;
  const passed = averages.filter(a => a >= 10.0).length;
  const failed = averages.length - passed;
  const successRate = Math.round((passed / averages.length) * 1000) / 10;

  return {
    totalStudents: rankings.length,
    evaluatedStudents: evaluated.length,
    classAverage: classAvg,
    minAverage: Math.min(...averages),
    maxAverage: Math.max(...averages),
    passedCount: passed,
    failedCount: failed,
    successRate
  };
}
