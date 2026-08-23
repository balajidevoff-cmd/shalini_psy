import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding PSYSCAN AI database (Demo Mode)...');

  // 1. Password hashing
  const defaultPasswordHash = await bcrypt.hash('Password123!', 10);

  // 2. Seed Users
  console.log('Creating users...');

  // Primary Psychologist as required by spec
  const psychologist = await prisma.user.upsert({
    where: { email: 'shalini.devi@psyscan.local' },
    update: {},
    create: {
      email: 'shalini.devi@psyscan.local',
      passwordHash: defaultPasswordHash,
      firstName: 'Shalini Devi',
      lastName: 'V',
      role: 'PSYCHOLOGIST',
      title: 'Senior Clinical Psychologist',
      licenseNumber: 'RCI-PSY-2024-8841',
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@psyscan.local' },
    update: {},
    create: {
      email: 'admin@psyscan.local',
      passwordHash: defaultPasswordHash,
      firstName: 'Ramesh',
      lastName: 'Kumar',
      role: 'ADMIN',
      title: 'Chief Clinical Administrator',
      licenseNumber: 'ADM-2023-010',
    },
  });

  const assessor = await prisma.user.upsert({
    where: { email: 'assessor@psyscan.local' },
    update: {},
    create: {
      email: 'assessor@psyscan.local',
      passwordHash: defaultPasswordHash,
      firstName: 'Ananya',
      lastName: 'Sharma',
      role: 'ASSESSOR',
      title: 'Psychometric Assessor',
      licenseNumber: 'ASR-2025-042',
    },
  });

  const patientUser = await prisma.user.upsert({
    where: { email: 'patient.demo@psyscan.local' },
    update: {},
    create: {
      email: 'patient.demo@psyscan.local',
      passwordHash: defaultPasswordHash,
      firstName: 'Demo',
      lastName: 'Patient',
      role: 'PATIENT',
      title: 'Patient Portal User',
    },
  });

  // 3. Seed Assessment Domains
  console.log('Creating assessment domains...');
  const domains = [
    { name: 'Mood Disorders', code: 'MOOD', description: 'Screening for depressive episodes, mood variability, and affective symptoms.', orderIndex: 1 },
    { name: 'Anxiety Disorders', code: 'ANXIETY', description: 'Screening for generalized anxiety, panic features, and autonomic arousal.', orderIndex: 2 },
    { name: 'Sleep & Stress', code: 'STRESS_SLEEP', description: 'Evaluation of sleep architecture disturbances and perceived psychosocial stress.', orderIndex: 3 },
    { name: 'Attention & Executive Function', code: 'EXECUTIVE_FX', description: 'Screening for attention regulation, working memory, and executive control.', orderIndex: 4 },
    { name: 'Intellectual & Adaptive Functioning', code: 'ADAPTIVE_BEHAVIOR', description: 'Evaluation of adaptive living skills, communication, and daily functioning.', orderIndex: 5 },
    { name: 'Other Clinical Scales', code: 'OTHER_SCALES', description: 'Screening for trauma responses, somatic complaints, and general well-being.', orderIndex: 6 },
  ];

  const domainMap: Record<string, string> = {};
  for (const d of domains) {
    const created = await prisma.assessmentDomain.upsert({
      where: { code: d.code },
      update: {},
      create: d,
    });
    domainMap[d.code] = created.id;
  }

  // 4. Seed Standardized Assessments
  console.log('Creating assessments & questions...');

  // Assessment 1: PHQ-9 (Patient Health Questionnaire-9)
  const phq9 = await prisma.assessment.upsert({
    where: { id: 'asmt-phq9-demo-001' },
    update: {},
    create: {
      id: 'asmt-phq9-demo-001',
      domainId: domainMap['MOOD'],
      name: 'Patient Health Questionnaire-9',
      shortName: 'PHQ-9',
      description: 'Standardized 9-item screening instrument for assessing depressive symptom presence and severity over the past 2 weeks.',
      ageMin: 12,
      ageMax: 100,
      administrationType: 'SELF_REPORT',
      licensingStatus: 'OPEN_ACCESS_CLINICAL',
      active: true,
      createdById: psychologist.id,
    },
  });

  const phq9Version = await prisma.assessmentVersion.upsert({
    where: { assessmentId_version: { assessmentId: phq9.id, version: '1.0' } },
    update: {},
    create: {
      id: 'ver-phq9-1.0',
      assessmentId: phq9.id,
      version: '1.0',
      instructions: 'Over the last 2 weeks, how often have you been bothered by any of the following problems? Please select the best option for each item.',
      isCurrent: true,
    },
  });

  // PHQ-9 Scoring Rule & Severity Bands
  await prisma.assessmentScoringRule.createMany({
    data: [
      {
        assessmentVersionId: phq9Version.id,
        scoringMethod: 'SUM',
        minScore: 0,
        maxScore: 27,
        cutoffScore: 10,
        ruleJson: JSON.stringify({ formula: 'SUM(q1..q9)', clinicalCutoff: 10 }),
      },
    ],
  });

  const phq9Bands = [
    { minScore: 0, maxScore: 4, severityLabel: 'Minimal or No Depression', colorHex: '#10B981', clinicalDescription: 'Scores in this range suggest absent or minimal depressive symptomatology. Typically no active clinical intervention required.', orderIndex: 1 },
    { minScore: 5, maxScore: 9, severityLabel: 'Mild Depressive Symptoms', colorHex: '#3B82F6', clinicalDescription: 'Mild depressive symptoms present. Clinician monitoring and psychoeducation recommended.', orderIndex: 2 },
    { minScore: 10, maxScore: 14, severityLabel: 'Moderate Depressive Symptoms', colorHex: '#F59E0B', clinicalDescription: 'Moderate depressive symptoms. Clinical evaluation for psychotherapy or counseling recommended.', orderIndex: 3 },
    { minScore: 15, maxScore: 19, severityLabel: 'Moderately Severe Depressive Symptoms', colorHex: '#F97316', clinicalDescription: 'Moderately severe depressive symptoms. Active clinical treatment and structured psychotherapy warranted.', orderIndex: 4 },
    { minScore: 20, maxScore: 27, severityLabel: 'Severe Depressive Symptoms', colorHex: '#EF4444', clinicalDescription: 'Severe depressive symptomatology. Comprehensive clinical evaluation, immediate risk review, and multidisciplinary intervention indicated.', orderIndex: 5 },
  ];

  for (const b of phq9Bands) {
    await prisma.assessmentSeverityBand.create({
      data: {
        assessmentVersionId: phq9Version.id,
        minScore: b.minScore,
        maxScore: b.maxScore,
        severityLabel: b.severityLabel,
        colorHex: b.colorHex,
        clinicalDescription: b.clinicalDescription,
        orderIndex: b.orderIndex,
      },
    });
  }

  // PHQ-9 Questions & Options
  const phq9Questions = [
    { num: 1, text: 'Little interest or pleasure in doing things', subscale: 'Affective', reverse: false, risk: null },
    { num: 2, text: 'Feeling down, depressed, or hopeless', subscale: 'Affective', reverse: false, risk: null },
    { num: 3, text: 'Trouble falling or staying asleep, or sleeping too much', subscale: 'Somatic', reverse: false, risk: null },
    { num: 4, text: 'Feeling tired or having little energy', subscale: 'Somatic', reverse: false, risk: null },
    { num: 5, text: 'Poor appetite or overeating', subscale: 'Somatic', reverse: false, risk: null },
    { num: 6, text: 'Feeling bad about yourself — or that you are a failure or have let yourself or your family down', subscale: 'Cognitive', reverse: false, risk: null },
    { num: 7, text: 'Trouble concentrating on things, such as reading the newspaper or watching television', subscale: 'Cognitive', reverse: false, risk: null },
    { num: 8, text: 'Moving or speaking so slowly that other people could have noticed? Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual', subscale: 'Somatic', reverse: false, risk: null },
    { num: 9, text: 'Thoughts that you would be better off dead or of hurting yourself in some way', subscale: 'Risk', reverse: false, risk: 1 },
  ];

  const phq9Options = [
    { label: 'Not at all', value: 0, orderIndex: 1 },
    { label: 'Several days', value: 1, orderIndex: 2 },
    { label: 'More than half the days', value: 2, orderIndex: 3 },
    { label: 'Nearly every day', value: 3, orderIndex: 4 },
  ];

  for (const q of phq9Questions) {
    const createdQ = await prisma.assessmentQuestion.create({
      data: {
        assessmentVersionId: phq9Version.id,
        questionNumber: q.num,
        questionText: q.text,
        questionType: 'SINGLE_CHOICE',
        subscale: q.subscale,
        required: true,
        isReverseScored: q.reverse,
        riskTriggerValue: q.risk,
        orderIndex: q.num,
      },
    });

    for (const opt of phq9Options) {
      await prisma.assessmentOption.create({
        data: {
          questionId: createdQ.id,
          label: opt.label,
          value: opt.value,
          orderIndex: opt.orderIndex,
        },
      });
    }
  }

  // Assessment 2: GAD-7 (Generalized Anxiety Disorder-7)
  const gad7 = await prisma.assessment.upsert({
    where: { id: 'asmt-gad7-demo-002' },
    update: {},
    create: {
      id: 'asmt-gad7-demo-002',
      domainId: domainMap['ANXIETY'],
      name: 'Generalized Anxiety Disorder-7',
      shortName: 'GAD-7',
      description: 'Standardized 7-item screening tool for identifying generalized anxiety symptoms and autonomic tension.',
      ageMin: 12,
      ageMax: 100,
      administrationType: 'SELF_REPORT',
      licensingStatus: 'OPEN_ACCESS_CLINICAL',
      active: true,
      createdById: psychologist.id,
    },
  });

  const gad7Version = await prisma.assessmentVersion.upsert({
    where: { assessmentId_version: { assessmentId: gad7.id, version: '1.0' } },
    update: {},
    create: {
      id: 'ver-gad7-1.0',
      assessmentId: gad7.id,
      version: '1.0',
      instructions: 'Over the last 2 weeks, how often have you been bothered by the following problems? Please mark the answer that best fits your experience.',
      isCurrent: true,
    },
  });

  const gad7Bands = [
    { minScore: 0, maxScore: 4, severityLabel: 'Minimal Anxiety', colorHex: '#10B981', clinicalDescription: 'Symptom levels indicate normal baseline emotional fluctuations without clinically significant anxiety.', orderIndex: 1 },
    { minScore: 5, maxScore: 9, severityLabel: 'Mild Anxiety', colorHex: '#3B82F6', clinicalDescription: 'Mild anxiety symptoms. Supportive counselling and psychoeducation on stress reduction recommended.', orderIndex: 2 },
    { minScore: 10, maxScore: 14, severityLabel: 'Moderate Anxiety', colorHex: '#F59E0B', clinicalDescription: 'Moderate anxiety symptoms. Clinical evaluation for cognitive behavioral strategies warranted.', orderIndex: 3 },
    { minScore: 15, maxScore: 21, severityLabel: 'Severe Anxiety', colorHex: '#EF4444', clinicalDescription: 'Severe anxiety symptoms. Comprehensive clinical review and active psychological intervention indicated.', orderIndex: 4 },
  ];

  for (const b of gad7Bands) {
    await prisma.assessmentSeverityBand.create({
      data: {
        assessmentVersionId: gad7Version.id,
        minScore: b.minScore,
        maxScore: b.maxScore,
        severityLabel: b.severityLabel,
        colorHex: b.colorHex,
        clinicalDescription: b.clinicalDescription,
        orderIndex: b.orderIndex,
      },
    });
  }

  const gad7Questions = [
    { num: 1, text: 'Feeling nervous, anxious, or on edge', subscale: 'Emotional' },
    { num: 2, text: 'Not being able to stop or control worrying', subscale: 'Cognitive' },
    { num: 3, text: 'Worrying too much about different things', subscale: 'Cognitive' },
    { num: 4, text: 'Trouble relaxing', subscale: 'Somatic' },
    { num: 5, text: 'Being so restless that it is hard to sit still', subscale: 'Somatic' },
    { num: 6, text: 'Becoming easily annoyed or irritable', subscale: 'Emotional' },
    { num: 7, text: 'Feeling afraid, as if something awful might happen', subscale: 'Cognitive' },
  ];

  for (const q of gad7Questions) {
    const createdQ = await prisma.assessmentQuestion.create({
      data: {
        assessmentVersionId: gad7Version.id,
        questionNumber: q.num,
        questionText: q.text,
        questionType: 'SINGLE_CHOICE',
        subscale: q.subscale,
        required: true,
        orderIndex: q.num,
      },
    });

    for (const opt of phq9Options) {
      await prisma.assessmentOption.create({
        data: {
          questionId: createdQ.id,
          label: opt.label,
          value: opt.value,
          orderIndex: opt.orderIndex,
        },
      });
    }
  }

  // Assessment 3: ISI (Insomnia Severity Index Demo)
  const isi = await prisma.assessment.upsert({
    where: { id: 'asmt-isi-demo-003' },
    update: {},
    create: {
      id: 'asmt-isi-demo-003',
      domainId: domainMap['STRESS_SLEEP'],
      name: 'Insomnia Severity Index (Demo Scale)',
      shortName: 'ISI-Demo',
      description: 'Standardized 7-item clinical questionnaire assessing the nature, severity, and daytime impact of insomnia symptoms.',
      ageMin: 16,
      ageMax: 100,
      administrationType: 'SELF_REPORT',
      licensingStatus: 'OPEN_ACCESS_DEMO',
      active: true,
      createdById: psychologist.id,
    },
  });

  const isiVersion = await prisma.assessmentVersion.upsert({
    where: { assessmentId_version: { assessmentId: isi.id, version: '1.0' } },
    update: {},
    create: {
      id: 'ver-isi-1.0',
      assessmentId: isi.id,
      version: '1.0',
      instructions: 'Please rate the current (past 2 weeks) severity of your insomnia problem(s).',
      isCurrent: true,
    },
  });

  const isiBands = [
    { minScore: 0, maxScore: 7, severityLabel: 'No Clinically Significant Insomnia', colorHex: '#10B981', clinicalDescription: 'Normal sleep functioning.', orderIndex: 1 },
    { minScore: 8, maxScore: 14, severityLabel: 'Subthreshold Insomnia', colorHex: '#3B82F6', clinicalDescription: 'Mild sleep difficulty with minimal functional impairment.', orderIndex: 2 },
    { minScore: 15, maxScore: 21, severityLabel: 'Clinical Insomnia (Moderate Severity)', colorHex: '#F59E0B', clinicalDescription: 'Moderate insomnia with noticeable daytime fatigue and distress.', orderIndex: 3 },
    { minScore: 22, maxScore: 28, severityLabel: 'Clinical Insomnia (Severe)', colorHex: '#EF4444', clinicalDescription: 'Severe insomnia significantly impairing daytime cognitive and occupational functioning.', orderIndex: 4 },
  ];

  for (const b of isiBands) {
    await prisma.assessmentSeverityBand.create({
      data: {
        assessmentVersionId: isiVersion.id,
        minScore: b.minScore,
        maxScore: b.maxScore,
        severityLabel: b.severityLabel,
        colorHex: b.colorHex,
        clinicalDescription: b.clinicalDescription,
        orderIndex: b.orderIndex,
      },
    });
  }

  const isiQuestions = [
    { num: 1, text: 'Difficulty falling asleep' },
    { num: 2, text: 'Difficulty staying asleep' },
    { num: 3, text: 'Problems waking up too early' },
    { num: 4, text: 'How satisfied/dissatisfied are you with your current sleep pattern?' },
    { num: 5, text: 'How noticeable to others do you think your sleep problem is in terms of impairing the quality of your life?' },
    { num: 6, text: 'How worried/distressed are you about your current sleep problem?' },
    { num: 7, text: 'To what extent do you consider your sleep problem to interfere with your daily functioning?' },
  ];

  const isiOptions = [
    { label: 'None / Very Satisfied', value: 0, orderIndex: 1 },
    { label: 'Mild / Satisfied', value: 1, orderIndex: 2 },
    { label: 'Moderate / Neutral', value: 2, orderIndex: 3 },
    { label: 'Severe / Dissatisfied', value: 3, orderIndex: 4 },
    { label: 'Very Severe / Very Dissatisfied', value: 4, orderIndex: 5 },
  ];

  for (const q of isiQuestions) {
    const createdQ = await prisma.assessmentQuestion.create({
      data: {
        assessmentVersionId: isiVersion.id,
        questionNumber: q.num,
        questionText: q.text,
        questionType: 'SINGLE_CHOICE',
        subscale: 'Sleep Hygiene',
        required: true,
        orderIndex: q.num,
      },
    });

    for (const opt of isiOptions) {
      await prisma.assessmentOption.create({
        data: {
          questionId: createdQ.id,
          label: opt.label,
          value: opt.value,
          orderIndex: opt.orderIndex,
        },
      });
    }
  }

  // 5. Seed Demo Patients (With PSY-10001 assigned to Shalini Devi V)
  console.log('Creating demo patients...');

  const patient1 = await prisma.patient.upsert({
    where: { patientCode: 'PSY-10001' },
    update: {},
    create: {
      patientCode: 'PSY-10001',
      firstName: 'Demo',
      lastName: 'Patient',
      dateOfBirth: new Date('1998-04-15'),
      age: 28,
      gender: 'FEMALE',
      education: "Master's Degree (Computer Science)",
      occupation: 'Software Quality Engineer',
      maritalStatus: 'SINGLE',
      socioeconomicStatus: 'Middle Class',
      status: 'ACTIVE',
      assignedPsychologistId: psychologist.id,
    },
  });

  await prisma.patientContact.upsert({
    where: { patientId: patient1.id },
    update: {},
    create: {
      patientId: patient1.id,
      phone: '+91 98765 43210',
      email: 'demo.patient@example.com',
      address: '42 Orchid Park, Sector 4',
      city: 'Bangalore',
      state: 'Karnataka',
      postalCode: '560001',
      emergencyName: 'Rajesh Sharma',
      emergencyRelation: 'Brother',
      emergencyPhone: '+91 98765 43211',
    },
  });

  await prisma.patientHistory.upsert({
    where: { patientId: patient1.id },
    update: {},
    create: {
      patientId: patient1.id,
      presentingComplaints: 'Persistent low energy, insomnia, feelings of excessive worry regarding work deadlines, difficulty maintaining concentration.',
      symptomDuration: '3 months',
      medicalHistory: 'No major chronic medical illnesses. Occasional tension headaches.',
      familyHistory: 'Maternal history of mild generalized anxiety.',
      traumaHistory: 'No reported acute physical trauma; reports high workplace burnout.',
      majorLifeEvents: 'Relocated to a new city 6 months ago for job change.',
      suicidalThoughts: false,
      selfHarmHistory: false,
      substanceUse: 'Occasional caffeine consumption (3 cups/day), non-smoker, social alcohol use.',
      sleepPattern: 'Difficulty falling asleep, average 4-5 hours of fragmented sleep per night.',
    },
  });

  // Consent for Patient 1
  await prisma.consentRecord.create({
    data: {
      patientId: patient1.id,
      consentType: 'PSYCHOLOGICAL_SCREENING',
      version: '1.0',
      status: 'GIVEN',
      acceptedBy: 'Demo Patient',
      ipAddress: '127.0.0.1',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      consentText: 'I understand that PSYSCAN AI is a psychological screening tool used to support qualified mental health professionals. I understand this is not a diagnostic tool and that my results will be reviewed by a licensed psychologist.',
    },
  });

  // Patient 2
  const patient2 = await prisma.patient.upsert({
    where: { patientCode: 'PSY-10002' },
    update: {},
    create: {
      patientCode: 'PSY-10002',
      firstName: 'Alex',
      lastName: 'Morgan',
      dateOfBirth: new Date('1992-09-20'),
      age: 34,
      gender: 'MALE',
      education: 'Bachelor of Business Administration',
      occupation: 'Financial Analyst',
      maritalStatus: 'MARRIED',
      socioeconomicStatus: 'Upper Middle Class',
      status: 'ACTIVE',
      assignedPsychologistId: psychologist.id,
    },
  });

  await prisma.patientContact.upsert({
    where: { patientId: patient2.id },
    update: {},
    create: {
      patientId: patient2.id,
      phone: '+91 98450 11223',
      email: 'alex.morgan@example.com',
      city: 'Hyderabad',
      state: 'Telangana',
      emergencyName: 'Elena Morgan',
      emergencyRelation: 'Spouse',
      emergencyPhone: '+91 98450 11224',
    },
  });

  await prisma.patientHistory.upsert({
    where: { patientId: patient2.id },
    update: {},
    create: {
      patientId: patient2.id,
      presentingComplaints: 'Episodes of rapid heart rate, intense apprehension, difficulty relaxing in social and work meetings.',
      symptomDuration: '6 months',
      medicalHistory: 'Cardiovascular checkup normal.',
      familyHistory: 'None reported.',
      suicidalThoughts: false,
      selfHarmHistory: false,
    },
  });

  // 6. Seed Completed Assessment Session for PSY-10001
  console.log('Creating demo assessment session & deterministic score for PSY-10001...');

  const session1 = await prisma.assessmentSession.create({
    data: {
      patientId: patient1.id,
      assessmentId: phq9.id,
      assessmentVersionId: phq9Version.id,
      conductedById: assessor.id,
      status: 'REVIEWED',
      currentQuestionIndex: 9,
      startedAt: new Date(Date.now() - 3600000 * 48),
      completedAt: new Date(Date.now() - 3600000 * 47),
    },
  });

  // Responses for PHQ-9 (Sum = 13 -> Moderate Depressive Symptoms)
  const phq9QuestionsDb = await prisma.assessmentQuestion.findMany({
    where: { assessmentVersionId: phq9Version.id },
    orderBy: { questionNumber: 'asc' },
  });

  const sampleResponses = [2, 2, 2, 2, 1, 1, 2, 1, 0]; // Total = 13 (Q9 is 0 - no suicide flag)
  for (let i = 0; i < phq9QuestionsDb.length; i++) {
    await prisma.assessmentResponse.create({
      data: {
        sessionId: session1.id,
        questionId: phq9QuestionsDb[i].id,
        responseValue: sampleResponses[i],
        responseText: sampleResponses[i] === 0 ? 'Not at all' : sampleResponses[i] === 1 ? 'Several days' : 'More than half the days',
      },
    });
  }

  // Deterministic Score Record for PHQ-9
  const score1 = await prisma.assessmentScore.create({
    data: {
      sessionId: session1.id,
      rawScore: 13,
      maxPossibleScore: 27,
      standardScore: 62.5,
      percentile: 74.0,
      severity: 'Moderate Depressive Symptoms',
      severityColor: '#F59E0B',
      hasRiskFlag: false,
      riskFlagDetails: 'No explicit self-harm or suicidal ideation endorsed on Item 9 (Score = 0).',
      interpretation: 'The patient obtained a total score of 13 on the PHQ-9, placing their reported symptoms in the Moderate Depressive Symptoms range. Elevated responses were observed primarily in sleep disruption, low energy, and concentration difficulty.',
    },
  });

  await prisma.assessmentSubscaleScore.createMany({
    data: [
      { scoreId: score1.id, subscaleName: 'Affective Symptoms', rawScore: 4, maxScore: 6, severity: 'Moderate', colorHex: '#F59E0B' },
      { scoreId: score1.id, subscaleName: 'Somatic Symptoms', rawScore: 7, maxScore: 12, severity: 'Elevated', colorHex: '#EF4444' },
      { scoreId: score1.id, subscaleName: 'Cognitive Symptoms', rawScore: 3, maxScore: 6, severity: 'Mild-Moderate', colorHex: '#3B82F6' },
      { scoreId: score1.id, subscaleName: 'Risk Items', rawScore: 0, maxScore: 3, severity: 'Minimal', colorHex: '#10B981' },
    ],
  });

  // 7. Seed AI Analysis & Explainability for Session 1
  console.log('Creating AI analysis & suggestions for Session 1...');

  const aiAnalysis1 = await prisma.aIAnalysis.create({
    data: {
      sessionId: session1.id,
      modelName: 'psyscan-clinical-decision-engine',
      modelVersion: '1.2.0',
      promptVersion: 'psyscan-screening-v2',
      summary: 'Screening results indicate moderate depressive symptomatology with prominent somatic and cognitive manifestations (sleep fragmentation, daytime fatigue, concentration challenges). No overt suicidal ideation flagged on screening.',
      riskObservation: 'Low acute risk flag based on questionnaire screening. Item 9 endorsed as 0. Continuous clinical monitoring advised.',
      status: 'REVIEWED',
    },
  });

  const suggestions = [
    {
      aiAnalysisId: aiAnalysis1.id,
      suggestionType: 'SYMPTOM_PATTERN',
      title: 'Somatic-Cognitive Fatigue Cluster',
      content: 'Strong clustering of sleep disruption (Item 3), persistent fatigue (Item 4), and concentration difficulty (Item 7). Pattern suggests high occupational exhaustion/burnout contributing to affective symptoms.',
      confidenceLevel: 'HIGH',
      status: 'ACCEPTED',
      decisionComment: 'Concur with symptom pattern. Fits presenting clinical interview.',
      orderIndex: 1,
    },
    {
      aiAnalysisId: aiAnalysis1.id,
      suggestionType: 'AREA_OF_CONCERN',
      title: 'Sleep Hygiene & Circadian Disruption',
      content: 'Sleep complaints appear to precede affective symptom onset. Addressing insomnia may significantly alleviate day-to-day cognitive fatigue.',
      confidenceLevel: 'HIGH',
      status: 'ACCEPTED',
      decisionComment: 'Agreed. Recommend CBT-I protocol.',
      orderIndex: 2,
    },
    {
      aiAnalysisId: aiAnalysis1.id,
      suggestionType: 'FURTHER_ASSESSMENT',
      title: 'Administer Insomnia Severity Index (ISI) & GAD-7',
      content: 'Recommend secondary screening with GAD-7 to assess overlapping generalized anxiety and ISI for detailed sleep architecture screening.',
      confidenceLevel: 'HIGH',
      status: 'ACCEPTED',
      decisionComment: 'Administered GAD-7 as planned.',
      orderIndex: 3,
    },
    {
      aiAnalysisId: aiAnalysis1.id,
      suggestionType: 'REFERRAL_CONSIDERATION',
      title: 'Consider Psychiatric Referral for Medication Evaluation',
      content: 'Automated screening rule flagged moderate threshold for medical consultation.',
      confidenceLevel: 'LOW',
      status: 'REJECTED',
      decisionComment: 'Premature. Will initiate psychological interventions (CBT) first; pharmacotherapy not indicated at this stage.',
      orderIndex: 4,
    },
  ];

  for (const s of suggestions) {
    await prisma.aISuggestion.create({ data: s });
  }

  // 8. Seed Clinical Review by Shalini Devi V
  console.log('Creating clinical review by Shalini Devi V...');

  const review1 = await prisma.clinicalReview.create({
    data: {
      sessionId: session1.id,
      psychologistId: psychologist.id,
      psychologistName: 'Shalini Devi V',
      clinicalInterview: 'Patient presented for clinical intake reporting 3 months of gradual energy loss and difficulty switching off after work. Mood is subdued but reactive to positive interpersonal interactions. Affect is congruous, cognitive processing intact.',
      clinicalObservations: 'Cooperative, well-groomed, good eye contact. Speech is coherent and relevant with normal rate and volume. Thought processes are goal-directed without delusional themes or perceptual abnormalities. Insight is Grade 6 (true emotional insight).',
      areasOfConcern: 'Workplace burnout, sleep onset latency (approx 90 minutes), cognitive fatigue during complex software testing tasks.',
      riskLevel: 'LOW',
      riskJustification: 'No active or passive suicidal ideation reported. Strong family support network and future goal orientation.',
      recommendations: '1. Initiate Cognitive Behavioral Therapy (CBT) focusing on cognitive restructuring of work-related perfectionism.\n2. Implement Sleep Restriction & Stimulus Control (CBT-I components).\n3. Progressive Muscle Relaxation (PMR) before bedtime.\n4. Bi-weekly clinical review sessions.',
      furtherAssessments: JSON.stringify(['GAD-7', 'Insomnia Severity Index (ISI)', 'Perceived Stress Scale (PSS-10)']),
      referralPlan: 'None required at present. Re-evaluate after 4 psychotherapy sessions.',
      followUpPlanNotes: 'Schedule follow-up psychotherapy session in 1 week.',
      finalClinicalImpression: 'The screening scores and clinical evaluation indicate Moderate Depressive Symptoms predominantly influenced by work-related stress and chronic sleep deficit. Clinical trajectory is responsive to outpatient cognitive-behavioral interventions.',
      status: 'FINALIZED',
      reviewedAt: new Date(Date.now() - 3600000 * 24),
    },
  });

  // 9. Seed Screening Report
  console.log('Creating demo report...');

  await prisma.report.create({
    data: {
      patientId: patient1.id,
      sessionId: session1.id,
      reportNumber: 'RPT-2026-0001',
      title: 'AI-Assisted Psychological Screening Report',
      version: 1,
      reviewedByName: 'Shalini Devi V',
      reviewedByRole: 'Senior Clinical Psychologist',
      summaryJson: JSON.stringify({
        patientCode: 'PSY-10001',
        patientName: 'Demo Patient',
        assessment: 'PHQ-9 (Patient Health Questionnaire-9)',
        rawScore: 13,
        severity: 'Moderate Depressive Symptoms',
        riskLevel: 'LOW',
        reviewedBy: 'Shalini Devi V',
        status: 'FINALIZED',
      }),
    },
  });

  // 10. Seed Follow-up Plan
  console.log('Creating follow-up plan...');

  await prisma.followUpPlan.create({
    data: {
      patientId: patient1.id,
      assignedClinicianId: psychologist.id,
      scheduledDate: new Date(Date.now() + 86400000 * 7), // 7 days from now
      followUpType: 'CBT_PSYCHOTHERAPY_SESSION',
      purpose: 'Session 1: CBT Cognitive Restructuring & Sleep Hygiene Review',
      notes: 'Review sleep diary data and practice 10-minute relaxation exercise.',
      status: 'SCHEDULED',
    },
  });

  // 11. Seed Audit Logs
  console.log('Creating audit logs...');

  await prisma.auditLog.createMany({
    data: [
      {
        userId: psychologist.id,
        userEmail: 'shalini.devi@psyscan.local',
        action: 'LOGIN',
        entityType: 'User',
        entityId: psychologist.id,
        ipAddress: '127.0.0.1',
        metadata: JSON.stringify({ userAgent: 'Chrome 128 / Windows 11' }),
      },
      {
        userId: psychologist.id,
        userEmail: 'shalini.devi@psyscan.local',
        action: 'CLINICAL_REVIEW_FINALIZED',
        entityType: 'ClinicalReview',
        entityId: review1.id,
        ipAddress: '127.0.0.1',
        metadata: JSON.stringify({ patientCode: 'PSY-10001', assessment: 'PHQ-9', riskLevel: 'LOW' }),
      },
      {
        userId: psychologist.id,
        userEmail: 'shalini.devi@psyscan.local',
        action: 'REPORT_GENERATED',
        entityType: 'Report',
        entityId: 'RPT-2026-0001',
        ipAddress: '127.0.0.1',
        metadata: JSON.stringify({ reportNumber: 'RPT-2026-0001' }),
      },
    ],
  });

  // 12. Seed Notifications
  console.log('Creating notifications...');

  await prisma.notification.createMany({
    data: [
      {
        userId: psychologist.id,
        title: 'New Assessment Completed',
        message: 'Patient PSY-10001 has completed the PHQ-9 assessment. AI Screening results are ready for your clinical review.',
        type: 'INFO',
        linkUrl: `/sessions/${session1.id}/clinical-review`,
        isRead: true,
      },
      {
        userId: psychologist.id,
        title: 'Follow-up Due Reminder',
        message: 'Upcoming CBT Psychotherapy Session scheduled for Demo Patient (PSY-10001) on next Monday.',
        type: 'FOLLOWUP_DUE',
        linkUrl: '/followups',
        isRead: false,
      },
    ],
  });

  console.log('✅ Database seeding complete!');
  console.log(`Psychologist: ${psychologist.firstName} ${psychologist.lastName} (${psychologist.email})`);
}

main()
  .catch((e) => {
    console.error('Error during database seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
