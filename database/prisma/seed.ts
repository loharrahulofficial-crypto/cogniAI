import { PrismaClient, CompetencyCategory, ProficiencyEvidenceSource, GapPriority } from '@prisma/client';

const prisma = new PrismaClient();

// ─── MoSPI Divisions (verified against MoSPI "Know Your Ministry" Feb 2025) ──
const divisions = [
  // NSS Wing
  { name: 'Field Operations Division', code: 'FOD', wing: 'NSS' },
  { name: 'Household Survey Division', code: 'HSD', wing: 'NSS' },
  { name: 'Enterprise Survey Division', code: 'EnSD', wing: 'NSS' },
  { name: 'Coordination and Quality Control Division', code: 'C&QCD', wing: 'NSS' },
  // Statistics Wing
  { name: 'Economic Statistics Division', code: 'ESD', wing: 'Statistics' },
  { name: 'National Accounts Division', code: 'NAD', wing: 'Statistics' },
  { name: 'Social Statistics Division', code: 'SSD', wing: 'Statistics' },
  { name: 'Price Statistics Division', code: 'PSD', wing: 'Statistics' },
  // Other
  { name: 'Data Informatics & Innovation Division', code: 'DIID', wing: 'Other' },
  { name: 'Capacity Development Division', code: 'CDD', wing: 'Other' },
];

// ─── FRAC Taxonomy: JSO Role (Junior Statistical Officer) ──────────────────
// Role → Activity → Competencies (BDF categories)

const fracRoles = [
  {
    name: 'Junior Statistical Officer (JSO)',
    code: 'JSO',
    cadre: 'JSO',
    activities: [
      {
        name: 'Data Collection and Field Operations',
        competencies: [
          { name: 'Survey Design Methodology', category: 'DOMAIN' as CompetencyCategory, subjectTag: 'Survey Design' },
          { name: 'Sampling Techniques', category: 'DOMAIN' as CompetencyCategory, subjectTag: 'Sampling Theory' },
          { name: 'Field Data Collection', category: 'FUNCTIONAL' as CompetencyCategory, subjectTag: null },
          { name: 'Data Quality Assurance', category: 'FUNCTIONAL' as CompetencyCategory, subjectTag: 'Data Governance' },
          { name: 'Stakeholder Communication', category: 'BEHAVIOURAL' as CompetencyCategory, subjectTag: null },
        ],
      },
      {
        name: 'Data Processing and Analysis',
        competencies: [
          { name: 'Statistical Software (SPSS/R)', category: 'FUNCTIONAL' as CompetencyCategory, subjectTag: 'Statistical Tools' },
          { name: 'Data Cleaning and Validation', category: 'FUNCTIONAL' as CompetencyCategory, subjectTag: null },
          { name: 'Descriptive Statistics', category: 'DOMAIN' as CompetencyCategory, subjectTag: 'Statistical Methods' },
          { name: 'Report Writing', category: 'FUNCTIONAL' as CompetencyCategory, subjectTag: null },
          { name: 'Ethical Data Handling', category: 'BEHAVIOURAL' as CompetencyCategory, subjectTag: null },
        ],
      },
      {
        name: 'Survey Reporting',
        competencies: [
          { name: 'Technical Report Preparation', category: 'FUNCTIONAL' as CompetencyCategory, subjectTag: null },
          { name: 'Data Visualization', category: 'FUNCTIONAL' as CompetencyCategory, subjectTag: null },
          { name: 'Presentation Skills', category: 'BEHAVIOURAL' as CompetencyCategory, subjectTag: null },
        ],
      },
    ],
  },
  {
    name: 'Senior Statistical Officer (SSO)',
    code: 'SSO',
    cadre: 'SSO',
    activities: [
      {
        name: 'Survey Planning and Design',
        competencies: [
          { name: 'Advanced Survey Methodology', category: 'DOMAIN' as CompetencyCategory, subjectTag: 'Survey Design' },
          { name: 'Sample Design and Estimation', category: 'DOMAIN' as CompetencyCategory, subjectTag: 'Sampling Theory' },
          { name: 'Questionnaire Design', category: 'DOMAIN' as CompetencyCategory, subjectTag: 'Survey Design' },
          { name: 'Project Management', category: 'FUNCTIONAL' as CompetencyCategory, subjectTag: null },
          { name: 'Leadership', category: 'BEHAVIOURAL' as CompetencyCategory, subjectTag: null },
        ],
      },
      {
        name: 'Quality Control and Supervision',
        competencies: [
          { name: 'Quality Control Methods', category: 'DOMAIN' as CompetencyCategory, subjectTag: 'Data Governance' },
          { name: 'Team Supervision', category: 'BEHAVIOURAL' as CompetencyCategory, subjectTag: null },
          { name: 'Performance Monitoring', category: 'FUNCTIONAL' as CompetencyCategory, subjectTag: null },
          { name: 'Conflict Resolution', category: 'BEHAVIOURAL' as CompetencyCategory, subjectTag: null },
        ],
      },
      {
        name: 'Statistical Analysis and Reporting',
        competencies: [
          { name: 'Advanced Statistical Methods', category: 'DOMAIN' as CompetencyCategory, subjectTag: 'Statistical Methods' },
          { name: 'National Accounts Concepts', category: 'DOMAIN' as CompetencyCategory, subjectTag: 'National Accounts' },
          { name: 'GIS and Spatial Analysis', category: 'FUNCTIONAL' as CompetencyCategory, subjectTag: 'GIS' },
          { name: 'Policy Brief Writing', category: 'FUNCTIONAL' as CompetencyCategory, subjectTag: null },
        ],
      },
    ],
  },
];

// ─── Mock iGOT Courses (25 courses, realistic IDs) ─────────────────────────

const mockCourses = [
  { identifier: 'igot-cbc-001', name: 'Data Driven Decision Making For Government', source: 'IGOT', organisation: 'CBC', primaryCategory: 'Course', learningOutcome: 'Understand data-driven governance principles', duration: '4 hours', competencies: [{ code: 'DESCR-STAT', targetLevel: 3 }, { code: 'DQ-ASSURE', targetLevel: 3 }] },
  { identifier: 'igot-ispp-002', name: 'Fundamentals of Public Policy', source: 'IGOT', organisation: 'ISPP', primaryCategory: 'Course', learningOutcome: 'Analyze public policy frameworks', duration: '6 hours', competencies: [{ code: 'PRES-TECH', targetLevel: 2 }, { code: 'STAKEHOLDER-COMM', targetLevel: 3 }] },
  { identifier: 'igot-ii-003', name: 'AI Using Google Bard and ChatGPT for Beginners', source: 'IGOT', organisation: 'Invest India', primaryCategory: 'Course', learningOutcome: 'Use AI tools for governance tasks', duration: '2 hours', competencies: [{ code: 'STAT-SW', targetLevel: 2 }, { code: 'DATA-CLEAN', targetLevel: 2 }] },
  { identifier: 'igot-ms-004', name: 'Microsoft Excel for Beginners', source: 'IGOT', organisation: 'Microsoft', primaryCategory: 'Course', learningOutcome: 'Master Excel for data analysis', duration: '3 hours', competencies: [{ code: 'STAT-SW', targetLevel: 2 }] },
  { identifier: 'igot-lbsnaa-005', name: 'Basics of Administrative Law', source: 'IGOT', organisation: 'LBSNAA', primaryCategory: 'Course', learningOutcome: 'Understand administrative law fundamentals', duration: '5 hours', competencies: [{ code: 'ETH-DATA', targetLevel: 3 }, { code: 'LEADERSHIP', targetLevel: 2 }] },
  { identifier: 'igot-ms-006', name: 'Digital Safety Essentials', source: 'IGOT', organisation: 'Microsoft', primaryCategory: 'Course', learningOutcome: 'Practice digital safety in government systems', duration: '2 hours', competencies: [{ code: 'ETH-DATA', targetLevel: 3 }] },
  { identifier: 'igot-qci-007', name: 'Introduction: Basics of Project Management', source: 'IGOT', organisation: 'QCI', primaryCategory: 'Course', learningOutcome: 'Apply project management principles', duration: '4 hours', competencies: [{ code: 'PROJECT-MGMT', targetLevel: 3 }, { code: 'TEAM-SUPER', targetLevel: 2 }] },
  { identifier: 'igot-gp-008', name: 'Six Sigma Fundamentals', source: 'IGOT', organisation: 'Genpact', primaryCategory: 'Course', learningOutcome: 'Apply Six Sigma quality methods', duration: '5 hours', competencies: [{ code: 'QC-METHODS', targetLevel: 3 }] },
  { identifier: 'igot-cbc-009', name: 'Design Thinking', source: 'IGOT', organisation: 'CBC', primaryCategory: 'Course', learningOutcome: 'Apply design thinking to governance problems', duration: '4 hours', competencies: [{ code: 'STAKEHOLDER-COMM', targetLevel: 3 }, { code: 'PRES-TECH', targetLevel: 3 }] },
  { identifier: 'igot-istm-010', name: 'Prevention of Sexual Harassment at Workplace', source: 'IGOT', organisation: 'ISTM', primaryCategory: 'Course', learningOutcome: 'Understand POSH compliance requirements', duration: '2 hours', competencies: [{ code: 'ETH-DATA', targetLevel: 4 }, { code: 'TEAM-SUPER', targetLevel: 3 }] },
  { identifier: 'igot-ms-011', name: 'Cyber Security Basics', source: 'IGOT', organisation: 'Microsoft', primaryCategory: 'Course', learningOutcome: 'Practice cybersecurity hygiene', duration: '3 hours', competencies: [{ code: 'ETH-DATA', targetLevel: 3 }] },
  { identifier: 'igot-isb-012', name: 'Public Governance Models', source: 'IGOT', organisation: 'ISB Hyderabad', primaryCategory: 'Course', learningOutcome: 'Analyze governance models for policy design', duration: '6 hours', competencies: [{ code: 'ADV-SURVEY', targetLevel: 4 }, { code: 'POLICY-BRIEF', targetLevel: 3 }] },
  { identifier: 'igot-kb-013', name: 'Introduction: Basics of Bharatiya Nyaya Sanhita', source: 'IGOT', organisation: 'Karmayogi Bharat', primaryCategory: 'Course', learningOutcome: 'Understand BNS provisions relevant to governance', duration: '4 hours', competencies: [{ code: 'ETH-DATA', targetLevel: 3 }] },
  { identifier: 'igot-kb-014', name: 'Introduction to Bharatiya Nagarik Suraksha Sanhita', source: 'IGOT', organisation: 'Karmayogi Bharat', primaryCategory: 'Course', learningOutcome: 'Understand BNSS provisions', duration: '4 hours', competencies: [{ code: 'ETH-DATA', targetLevel: 3 }] },
  { identifier: 'igot-kb-015', name: 'Introduction to Bharatiya Sakshya Adhiniyam', source: 'IGOT', organisation: 'Karmayogi Bharat', primaryCategory: 'Course', learningOutcome: 'Understand BSA evidence provisions', duration: '3 hours', competencies: [{ code: 'ETH-DATA', targetLevel: 3 }] },
  { identifier: 'igot-heart-016', name: 'Heart in Governance', source: 'IGOT', organisation: 'Karmayogi Bharat', primaryCategory: 'Course', learningOutcome: 'Develop empathetic governance approach', duration: '2 hours', competencies: [{ code: 'STAKEHOLDER-COMM', targetLevel: 4 }, { code: 'LEADERSHIP', targetLevel: 3 }] },
  { identifier: 'igot-coc-017', name: 'Code of Conduct for Government Employees', source: 'IGOT', organisation: 'Karmayogi Bharat', primaryCategory: 'Course', learningOutcome: 'Understand and follow government conduct code', duration: '2 hours', competencies: [{ code: 'ETH-DATA', targetLevel: 4 }] },
  { identifier: 'igot-comm-018', name: 'The Art of Communication', source: 'IGOT', organisation: 'Karmayogi Bharat', primaryCategory: 'Course', learningOutcome: 'Improve professional communication skills', duration: '3 hours', competencies: [{ code: 'STAKEHOLDER-COMM', targetLevel: 4 }, { code: 'PRES-TECH', targetLevel: 3 }] },
  { identifier: 'igot-soft-019', name: 'Developing Effective Soft Skills', source: 'IGOT', organisation: 'Karmayogi Bharat', primaryCategory: 'Course', learningOutcome: 'Build soft skills for effective governance', duration: '4 hours', competencies: [{ code: 'TEAM-SUPER', targetLevel: 3 }, { code: 'CONFLICT-RES', targetLevel: 3 }] },
  { identifier: 'igot-rti-020', name: 'RTI And Good Governance', source: 'IGOT', organisation: 'Karmayogi Bharat', primaryCategory: 'Course', learningOutcome: 'Apply RTI principles in daily governance', duration: '3 hours', competencies: [{ code: 'ETH-DATA', targetLevel: 4 }, { code: 'STAKEHOLDER-COMM', targetLevel: 3 }] },
  { identifier: 'igot-work-021', name: 'Work Ethics', source: 'IGOT', organisation: 'Karmayogi Bharat', primaryCategory: 'Course', learningOutcome: 'Demonstrate strong work ethics', duration: '2 hours', competencies: [{ code: 'ETH-DATA', targetLevel: 4 }, { code: 'LEADERSHIP', targetLevel: 3 }] },
  { identifier: 'igot-grow-022', name: 'Helping Employees to Grow', source: 'IGOT', organisation: 'Karmayogi Bharat', primaryCategory: 'Course', learningOutcome: 'Mentor and develop team members', duration: '3 hours', competencies: [{ code: 'TEAM-SUPER', targetLevel: 4 }, { code: 'CONFLICT-RES', targetLevel: 3 }] },
  { identifier: 'igot-life-023', name: 'Orientation Module on Mission LiFE', source: 'IGOT', organisation: 'Karmayogi Bharat', primaryCategory: 'Course', learningOutcome: 'Understand Mission LiFE principles', duration: '2 hours', competencies: [{ code: 'PRES-TECH', targetLevel: 2 }] },
  { identifier: 'igot-land-024', name: 'Fair Compensation and Land Acquisition Act', source: 'IGOT', organisation: 'Karmayogi Bharat', primaryCategory: 'Course', learningOutcome: 'Understand RERA and land acquisition provisions', duration: '4 hours', competencies: [{ code: 'ADV-SURVEY', targetLevel: 3 }] },
  { identifier: 'igot-dpdp-025', name: 'Digital Personal Data Protection Act 2023', source: 'IGOT', organisation: 'Karmayogi Bharat', primaryCategory: 'Course', learningOutcome: 'Apply DPDP Act principles in data handling', duration: '3 hours', competencies: [{ code: 'ETH-DATA', targetLevel: 4 }, { code: 'DATA-CLEAN', targetLevel: 3 }] },
];

// ─── Competency codes map for course mapping ──────────────────────────────

const competencyCodes: Record<string, string> = {
  'SURVEY-DESIGN': 'Survey Design Methodology',
  'SAMPLING-TECH': 'Sampling Techniques',
  'FIELD-COLLECT': 'Field Data Collection',
  'DQ-ASSURE': 'Data Quality Assurance',
  'STAKEHOLDER-COMM': 'Stakeholder Communication',
  'STAT-SW': 'Statistical Software (SPSS/R)',
  'DATA-CLEAN': 'Data Cleaning and Validation',
  'DESCR-STAT': 'Descriptive Statistics',
  'REPORT-WRITE': 'Report Writing',
  'ETH-DATA': 'Ethical Data Handling',
  'TECH-REPORT': 'Technical Report Preparation',
  'DATA-VIZ': 'Data Visualization',
  'PRES-TECH': 'Presentation Skills',
  'ADV-SURVEY': 'Advanced Survey Methodology',
  'SAMPLE-DESIGN': 'Sample Design and Estimation',
  'QNR-DESIGN': 'Questionnaire Design',
  'PROJECT-MGMT': 'Project Management',
  'LEADERSHIP': 'Leadership',
  'QC-METHODS': 'Quality Control Methods',
  'TEAM-SUPER': 'Team Supervision',
  'PERF-MON': 'Performance Monitoring',
  'CONFLICT-RES': 'Conflict Resolution',
  'ADV-STAT': 'Advanced Statistical Methods',
  'NAT-ACCOUNTS': 'National Accounts Concepts',
  'GIS-SPATIAL': 'GIS and Spatial Analysis',
  'POLICY-BRIEF': 'Policy Brief Writing',
};

// ─── Mock Officers ────────────────────────────────────────────────────────

const mockOfficers = [
  { name: 'Priya Sharma', email: 'priya.sharma@mospi.gov.in', cadre: 'JSO', divisionCode: 'FOD', tenure: '3 years', posting: 'Delhi' },
  { name: 'Rahul Verma', email: 'rahul.verma@mospi.gov.in', cadre: 'SSO', divisionCode: 'FOD', tenure: '8 years', posting: 'Mumbai' },
  { name: 'Anita Kumari', email: 'anita.kumari@mospi.gov.in', cadre: 'JSO', divisionCode: 'HSD', tenure: '2 years', posting: 'Chennai' },
  { name: 'Suresh Patel', email: 'suresh.patel@mospi.gov.in', cadre: 'SSO', divisionCode: 'ESD', tenure: '12 years', posting: 'Kolkata' },
  { name: 'Deepa Nair', email: 'deepa.nair@mospi.gov.in', cadre: 'JSO', divisionCode: 'NAD', tenure: '4 years', posting: 'Bangalore' },
  { name: 'Vikram Singh', email: 'vikram.singh@mospi.gov.in', cadre: 'SSO', divisionCode: 'EnSD', tenure: '10 years', posting: 'Hyderabad' },
  { name: 'Meera Reddy', email: 'meera.reddy@mospi.gov.in', cadre: 'JSO', divisionCode: 'DIID', tenure: '1 year', posting: 'Delhi' },
  { name: 'Arun Gupta', email: 'arun.gupta@mospi.gov.in', cadre: 'SSO', divisionCode: 'PSD', tenure: '7 years', posting: 'Pune' },
  { name: 'Sneha Iyer', email: 'sneha.iyer@mospi.gov.in', cadre: 'JSO', divisionCode: 'SSD', tenure: '3 years', posting: 'Chennai' },
  { name: 'Manoj Tiwari', email: 'manoj.tiwari@mospi.gov.in', cadre: 'SSO', divisionCode: 'CDD', tenure: '15 years', posting: 'Delhi' },
  { name: 'Kavitha Menon', email: 'kavitha.menon@mospi.gov.in', cadre: 'JSO', divisionCode: 'FOD', tenure: '2 years', posting: 'Thiruvananthapuram' },
  { name: 'Rajesh Kumar', email: 'rajesh.kumar@mospi.gov.in', cadre: 'SSO', divisionCode: 'HSD', tenure: '9 years', posting: 'Lucknow' },
];

// ─── Seed Functions ───────────────────────────────────────────────────────

async function seedDivisions() {
  console.log('Seeding divisions...');
  for (const div of divisions) {
    await prisma.division.upsert({
      where: { code: div.code },
      update: {},
      create: div,
    });
  }
  console.log(`  ✓ ${divisions.length} divisions`);
}

async function seedRoles() {
  console.log('Seeding FRAC roles, activities, and competencies...');
  for (const roleDef of fracRoles) {
    const role = await prisma.role.upsert({
      where: { code: roleDef.code },
      update: {},
      create: {
        name: roleDef.name,
        code: roleDef.code,
        cadre: roleDef.cadre,
      },
    });

    for (const actDef of roleDef.activities) {
      const activity = await prisma.activity.create({
        data: {
          name: actDef.name,
          roleId: role.id,
        },
      });

      for (const compDef of actDef.competencies) {
        const competency = await prisma.competency.create({
          data: {
            name: compDef.name,
            category: compDef.category,
            subjectTag: compDef.subjectTag,
            activityId: activity.id,
          },
        });

        // Create proficiency levels 1-5
        const levels = [
          { level: 1, label: 'Unaware', anchor: 'No knowledge or experience in this area' },
          { level: 2, label: 'Aware', anchor: 'Understands concepts but cannot apply independently' },
          { level: 3, label: 'Applies with guidance', anchor: 'Can apply with supervision or reference materials' },
          { level: 4, label: 'Independent', anchor: 'Works independently with consistent quality' },
          { level: 5, label: 'Expert', anchor: 'Mastery; can train others and develop new approaches' },
        ];

        for (const lvl of levels) {
          await prisma.proficiencyLevel.create({
            data: {
              level: lvl.level,
              label: lvl.label,
              anchor: lvl.anchor,
              competencyId: competency.id,
            },
          });
        }
      }
    }
  }
  console.log('  ✓ FRAC taxonomy seeded');
}

async function seedCourses() {
  console.log('Seeding iGOT mock courses...');
  for (const courseDef of mockCourses) {
    const course = await prisma.course.upsert({
      where: { identifier: courseDef.identifier },
      update: {},
      create: {
        identifier: courseDef.identifier,
        name: courseDef.name,
        source: courseDef.source,
        organisation: courseDef.organisation,
        primaryCategory: courseDef.primaryCategory,
        learningOutcome: courseDef.learningOutcome,
        duration: courseDef.duration,
        status: 'Live',
      },
    });

    // Map competencies to course
    for (const compMap of courseDef.competencies) {
      const compName = competencyCodes[compMap.code];
      if (!compName) continue;

      const competency = await prisma.competency.findFirst({ where: { name: compName } });
      if (!competency) continue;

      await prisma.courseCompetency.upsert({
        where: { courseId_competencyId: { courseId: course.id, competencyId: competency.id } },
        update: {},
        create: {
          courseId: course.id,
          competencyId: competency.id,
          targetLevel: compMap.targetLevel,
        },
      });
    }
  }
  console.log(`  ✓ ${mockCourses.length} courses seeded`);
}

async function seedOfficers() {
  console.log('Seeding mock officers...');
  for (const officerDef of mockOfficers) {
    const division = await prisma.division.findUnique({ where: { code: officerDef.divisionCode } });
    if (!division) continue;

    const officer = await prisma.officer.upsert({
      where: { email: officerDef.email },
      update: {},
      create: {
        name: officerDef.name,
        email: officerDef.email,
        cadre: officerDef.cadre,
        divisionId: division.id,
        tenure: officerDef.tenure,
        posting: officerDef.posting,
      },
    });

    // Assign random proficiency levels to some competencies
    const competencies = await prisma.competency.findMany({
      where: { activity: { role: { cadre: officerDef.cadre } } },
    });

    for (const comp of competencies) {
      const currentLevel = Math.floor(Math.random() * 4) + 1; // 1-4
      const targetLevel = Math.min(currentLevel + Math.floor(Math.random() * 2) + 1, 5); // target is 1-2 levels above
      const sources: ProficiencyEvidenceSource[] = ['SELF', 'SUPERVISOR', 'QUIZ', 'AI_INFERRED'];
      const source = sources[Math.floor(Math.random() * sources.length)];

      await prisma.officerCompetencyProfile.upsert({
        where: { officerId_competencyId: { officerId: officer.id, competencyId: comp.id } },
        update: {},
        create: {
          officerId: officer.id,
          competencyId: comp.id,
          currentLevel,
          targetLevel,
          evidenceSource: source,
        },
      });

      // Create gap record if gap exists
      const gap = targetLevel - currentLevel;
      if (gap > 0) {
        const priority: GapPriority = gap >= 3 ? 'HIGH' : gap >= 2 ? 'MED' : 'LOW';
        await prisma.gapRecord.upsert({
          where: { officerId_competencyId: { officerId: officer.id, competencyId: comp.id } },
          update: {},
          create: {
            officerId: officer.id,
            competencyId: comp.id,
            gapSize: gap,
            priority,
          },
        });
      }
    }
  }
  console.log(`  ✓ ${mockOfficers.length} officers seeded with profiles and gaps`);
}

// ─── Seed Assessments (MCQs) ───────────────────────────────────────────────

interface McqTemplate {
  competency: string;
  level: number;
  bloom: string;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  rationale: string;
}

// 30 approved + 10 pending MCQs across JSO/SSO gap competencies
const mcqTemplates: McqTemplate[] = [
  {
    competency: 'Sampling Techniques', level: 3, bloom: 'Apply',
    question: 'A household expenditure survey must represent both urban and rural strata proportionally. Which sampling approach is most appropriate?',
    options: ['Simple random sampling without stratification', 'Stratified random sampling with proportional allocation across urban/rural strata', 'Convenience sampling from easily reachable households', 'Judgment sampling based on field supervisor experience'],
    correct: 1,
    explanation: 'Stratified random sampling with proportional allocation ensures each stratum (urban/rural) is represented in proportion to its size in the population.',
    rationale: 'Tests application of stratified sampling design to a realistic NSS survey scenario.',
  },
  {
    competency: 'Sampling Techniques', level: 2, bloom: 'Understand',
    question: 'What is the primary purpose of using a sampling frame in survey design?',
    options: ['To decide the questionnaire language', 'To list all units in the target population from which a sample can be drawn', 'To train enumerators on field procedures', 'To validate the questionnaire before fieldwork'],
    correct: 1,
    explanation: 'A sampling frame is the list of all eligible units in the target population; the sample is drawn from it.',
    rationale: 'Verifies understanding of core sampling terminology required at level 2.',
  },
  {
    competency: 'Sampling Techniques', level: 4, bloom: 'Analyze',
    question: 'If the sample size is doubled while keeping the sampling design identical, what happens to the standard error of the estimate?',
    options: ['It increases by a factor of 2', 'It doubles', 'It decreases approximately by a factor of 1.4 (square root of 2)', 'It stays the same'],
    correct: 2,
    explanation: 'Standard error is inversely proportional to the square root of the sample size: SE ≈ σ/√n. Doubling n reduces SE by ~√2 ≈ 1.41.',
    rationale: 'Assesses analytical understanding of the sample-size / precision trade-off, a key concept for survey design officers.',
  },
  {
    competency: 'Data Quality Assurance', level: 3, bloom: 'Apply',
    question: 'During validation you find 15% of responses in the "monthly income" field are missing. What is the most appropriate first step?',
    options: ['Delete all records with missing income', 'Impute the mean income for all missing values without investigation', 'Investigate the pattern of missingness to decide if it is random or systematic before choosing a treatment', 'Ask enumerators to guess the income'],
    correct: 2,
    explanation: 'Understanding whether missing data is random (MCAR/MAR) or systematic (MNAR) determines whether imputation is valid. Blind deletion or imputation can bias estimates.',
    rationale: 'Professor-style check of data quality decision-making: pattern analysis before treatment.',
  },
  {
    competency: 'Data Quality Assurance', level: 2, bloom: 'Understand',
    question: 'Which of the following best defines a data quality dimension known as "completeness"?',
    options: ['How quickly data becomes available', 'The extent to which all required data values are present', 'The degree to which data matches the source of truth', 'Whether data is stored in a secure location'],
    correct: 1,
    explanation: 'Completeness measures whether all expected records and fields are actually populated.',
    rationale: 'Tests basic data-quality vocabulary.',
  },
  {
    competency: 'Descriptive Statistics', level: 2, bloom: 'Understand',
    question: 'In a heavily right-skewed (positively skewed) income distribution, which measure of central tendency is the most robust (least affected by extreme values)?',
    options: ['Arithmetic mean', 'Median', 'Mode', 'Range'],
    correct: 1,
    explanation: 'The median is resistant to outliers; the mean is pulled up by extreme high values in a right-skewed distribution.',
    rationale: 'Standard descriptive-statistics concept, directly relevant to income/expenditure surveys.',
  },
  {
    competency: 'Descriptive Statistics', level: 3, bloom: 'Apply',
    question: 'A survey dataset has a mean of 100 and a standard deviation of 15. Assuming a roughly normal distribution, approximately what percentage of observations lie between 85 and 115?',
    options: ['50%', '68%', '95%', '99.7%'],
    correct: 1,
    explanation: 'One standard deviation above and below the mean (100±15) captures approximately 68% of observations in a normal distribution.',
    rationale: 'Tests the empirical rule applied to a survey-style dataset.',
  },
  {
    competency: 'Field Data Collection', level: 3, bloom: 'Apply',
    question: 'During field enumeration, a respondent refuses to participate. Which action aligns with ethical data collection?',
    options: ['Coerce the respondent by citing legal penalties', 'Record a false response to meet the target', 'Respect the refusal, document it, and follow the prescribed non-response protocol', 'Replace the household silently without any recording'],
    correct: 2,
    explanation: 'Ethical surveys document refusals as non-response rather than fabricating or coercing. Non-response is recorded to assess bias.',
    rationale: 'Assesses ethical field behaviour under pressure, aligned to BEHAVIOURAL-adjacent data integrity.',
  },
  {
    competency: 'Field Data Collection', level: 2, bloom: 'Understand',
    question: 'What is the purpose of a pilot (pre-test) survey?',
    options: ['To collect the final production data', 'To test the questionnaire, procedures, and logistics on a small scale before the main survey', 'To train all enumerators once the main survey is complete', 'To publish preliminary results'],
    correct: 1,
    explanation: 'A pilot survey tests instruments and processes on a small scale to detect problems before full fieldwork.',
    rationale: 'Checks understanding of the survey lifecycle.',
  },
  {
    competency: 'Statistical Software (SPSS/R)', level: 2, bloom: 'Remember',
    question: 'In R, which command reads a comma-separated values file into a data frame?',
    options: ['read.csv()', 'load.csv()', 'import_csv()', 'read_excel()'],
    correct: 0,
    explanation: 'read.csv() reads a CSV file into a data frame in base R. read_excel() is for Excel files.',
    rationale: 'Remember-level check of common R data-import syntax.',
  },
  {
    competency: 'Data Cleaning and Validation', level: 3, bloom: 'Apply',
    question: 'You find a value of "999" in an "age" field, likely a placeholder for missing data. Which best practice applies?',
    options: ['Keep 999 as a real age', 'Convert to a coded missing value (NA) and document the decision', 'Replace with the median age silently', 'Drop the entire record'],
    correct: 1,
    explanation: 'Flag codes like 999 should be converted to a missing-value code and the transformation documented for reproducibility.',
    rationale: 'Tests a realistic data-cleaning workflow decision.',
  },
  {
    competency: 'Report Writing', level: 2, bloom: 'Understand',
    question: 'Which section of a survey report typically presents the sampling design and response rate?',
    options: ['Executive summary only', 'Methodology section', 'Appendix of questionnaires', 'Acknowledgements'],
    correct: 1,
    explanation: 'Sampling design, response rate, and data collection procedures belong in the methodology section.',
    rationale: 'Verifies report-structure knowledge.',
  },
  {
    competency: 'Ethical Data Handling', level: 3, bloom: 'Apply',
    question: 'A survey contains identifiable personal information of respondents. What is the required practice before publishing aggregate results?',
    options: ['Publish raw identifiers as they are public data', 'Anonymize/aggregate data so individuals cannot be re-identified', 'Ask only for the respondent district', 'Publish data but remove office names only'],
    correct: 1,
    explanation: 'Data must be anonymized or aggregated so that individuals cannot be identified, per statistical confidentiality principles (and DPDP Act considerations).',
    rationale: 'Tests confidentiality practice aligned to DPDP Act 2023 and statistical ethics.',
  },
  {
    competency: 'Ethical Data Handling', level: 4, bloom: 'Analyze',
    question: 'A statistical agency is required to release district-level data, but a small district has few households, making individuals potentially re-identifiable. What approach best balances usefulness and confidentiality?',
    options: ['Release exact values since the request came from government', 'Refuse to release anything', 'Apply disclosure control (e.g., cell suppression or aggregation to larger geographies) and document the method', 'Round all values to the nearest thousand'],
    correct: 2,
    explanation: 'Disclosure control methods like suppression, recoding, or aggregation reduce re-identification risk while preserving statistical utility.',
    rationale: 'Evaluate-level reasoning about the usefulness-confidentiality trade-off.',
  },
  {
    competency: 'Data Visualization', level: 2, bloom: 'Understand',
    question: 'Which chart type is best suited to showing parts of a whole (composition) at a single point in time?',
    options: ['Line chart', 'Pie chart or stacked bar chart', 'Scatter plot', 'Histogram'],
    correct: 1,
    explanation: 'Pie and stacked-bar charts convey composition. Line charts show trends, scatter plots show association.',
    rationale: 'Basic chart selection knowledge for official statistics communication.',
  },
  {
    competency: 'Presentation Skills', level: 2, bloom: 'Understand',
    question: 'When presenting survey findings to a non-technical audience, which practice is most effective?',
    options: ['Use dense technical jargon to show expertise', 'Lead with a clear headline finding and use plain language', 'Read directly from methodology tables', 'Skip the executive summary'],
    correct: 1,
    explanation: 'Lead with the key finding in plain language; technical detail goes in backup or an appendix.',
    rationale: 'Practical communication guidance for official statistics dissemination.',
  },
  {
    competency: 'Stakeholder Communication', level: 3, bloom: 'Apply',
    question: 'A state government requests survey microdata for a district not yet validated. What is the appropriate response?',
    options: ['Share immediately since they are a government body', 'Deny without explanation', 'Explain the data validation/approval timeline and redirect to published aggregates until release', 'Charge them for the data'],
    correct: 2,
    explanation: 'Communicate timelines honestly and point to official published data; unvalidated microdata should not be shared.',
    rationale: 'Tests stakeholder communication aligned to data-release governance.',
  },
  {
    competency: 'Project Management', level: 3, bloom: 'Apply',
    question: 'A survey is at risk of missing its fieldwork deadline. What is the most appropriate project management response?',
    options: ['Do nothing and hope the team accelerates', 'Assess the critical path, reallocate resources or adjust scope, and communicate revised milestones to stakeholders', 'Extend the deadline silently without informing anyone', 'Assign all remaining work to one officer'],
    correct: 1,
    explanation: 'Monitor the plan, act on the critical path, and communicate transparently — core project management practice.',
    rationale: 'Tests basic schedule-risk response.',
  },
  {
    competency: 'Quality Control Methods', level: 3, bloom: 'Apply',
    question: 'To monitor enumerator consistency during fieldwork, the best control technique is:',
    options: ['Post-fieldwork surprise audits only', 'Periodic re-interview of a sample of respondents and comparison of responses', 'Deleting all responses deemed inconsistent', 'Relying on enumerator self-reporting'],
    correct: 1,
    explanation: 'Re-interviewing a subsample verifies response consistency and enumerator accuracy.',
    rationale: 'Classic data-quality control technique for large-scale surveys.',
  },
  {
    competency: 'National Accounts Concepts', level: 3, bloom: 'Understand',
    question: 'Which aggregate best reflects the total value of final goods and services produced within a country in a year?',
    options: ['Gross Domestic Product (GDP)', 'Consumer Price Index (CPI)', 'Merchandise export volume index', 'Household disposable income for one month'],
    correct: 0,
    explanation: 'GDP measures the annual value of final goods and services produced within the country\'s borders.',
    rationale: 'Foundational National Accounts concept for NAD officers.',
  },
  {
    competency: 'National Accounts Concepts', level: 4, bloom: 'Analyze',
    question: 'GDP at constant prices is preferred over GDP at current prices for growth measurement because:',
    options: ['It is easier to calculate', 'It removes the effect of price changes, isolating real volume growth', 'It counts imports as output', 'It includes only exports'],
    correct: 1,
    explanation: 'Constant-price (real) GDP uses base-year prices, so changes reflect real output growth rather than inflation.',
    rationale: 'Analyze-level understanding of real vs nominal GDP.',
  },
  {
    competency: 'Advanced Statistical Methods', level: 4, bloom: 'Analyze',
    question: 'When testing whether two survey variables are associated, which measure/model combination is commonly used for a categorical outcome?',
    options: ['Pearson correlation on raw categories', 'Chi-square test of independence or a logistic model', 't-test on the means', 'Principal component analysis'],
    correct: 1,
    explanation: 'For categorical associations, chi-square tests or logistic regression are standard; correlation needs numeric variables.',
    rationale: 'Tests understanding of method selection for categorical data.',
  },
  {
    competency: 'GIS and Spatial Analysis', level: 2, bloom: 'Understand',
    question: 'What is the primary purpose of geocoding survey addresses?',
    options: ['To make maps look attractive', 'To assign geographic coordinates to records enabling spatial analysis and mapping', 'To replace the questionnaire', 'To shorten fieldwork time only'],
    correct: 1,
    explanation: 'Geocoding attaches coordinates so responses can be mapped and spatially analyzed.',
    rationale: 'Level-2 understanding of a core GIS data-preparation step.',
  },
  {
    competency: 'Policy Brief Writing', level: 3, bloom: 'Apply',
    question: 'Which structure best suits an official policy brief based on survey evidence?',
    options: ['A long technical annex with no summary', 'Executive summary → key findings with evidence → implications → recommended actions', 'A chronology of survey field operations', 'A list of all survey questions'],
    correct: 1,
    explanation: 'Policy briefs lead with the decision-relevant message: summary, evidence-backed findings, implications, and recommended actions.',
    rationale: 'Tests structure of evidence-based policy communication.',
  },
  {
    competency: 'Leadership', level: 3, bloom: 'Apply',
    question: 'Your junior officer is struggling with a new statistical software package. As a supervisor, the most effective leadership response is:',
    options: ['Do the work yourself to meet the deadline', 'Criticize the officer publicly to motivate them', 'Provide targeted training/mentoring and check progress with clear milestones', 'Reassign the task permanently without discussion'],
    correct: 2,
    explanation: 'Supportive coaching with defined milestones builds capability and addresses the root cause — a core people-management skill.',
    rationale: 'Behavioural competency: developing team capability under pressure.',
  },
  {
    competency: 'Team Supervision', level: 3, bloom: 'Apply',
    question: 'Two enumerators submit conflicting counts for the same block. As supervisor you should:',
    options: ['Average the two counts', 'Trust the senior enumerator automatically', 'Re-verify by checking original schedules and re-visiting the block if needed, then document the resolution', 'Ignore the discrepancy'],
    correct: 2,
    explanation: 'Verification against source records and targeted re-check resolves discrepancy objectively and documents the process for audit.',
    rationale: 'Tests supervision technique grounded in data verification.',
  },
  {
    competency: 'Survey Design Methodology', level: 3, bloom: 'Apply',
    question: 'Which component is the LEAST critical when designing a national household survey?',
    options: ['Clear definitions of target population and coverage', 'Well-defined sampling frame', 'Questionnaire language matching respondent preferences', 'The colour of the survey logo'],
    correct: 3,
    explanation: 'Definition of target population, sampling frame, and questionnaire design are essential; branding is not methodological.',
    rationale: 'Distinguishes essential survey-design elements from non-essentials.',
  },
  {
    competency: 'Sample Design and Estimation', level: 4, bloom: 'Analyze',
    question: 'Sampling weights are applied in survey estimation primarily to:',
    options: ['Increase the sample size', 'Correct for unequal selection probabilities and non-response, making estimates representative of the population', 'Simplify the questionnaire', 'Reduce the number of strata'],
    correct: 1,
    explanation: 'Weights compensate for unequal inclusion probabilities and non-response so estimates reflect the population.',
    rationale: 'Core estimation concept for weighted survey analysis.',
  },
  {
    competency: 'Questionnaire Design', level: 3, bloom: 'Understand',
    question: 'Which guideline most improves data quality in questionnaire design?',
    options: ['Use double-barrelled questions to save space', 'Use simple, unambiguous wording and avoid leading questions', 'Ask highly technical jargon questions', 'Order sensitive questions first'],
    correct: 1,
    explanation: 'Simple, unambiguous, non-leading wording reduces measurement error; question order matters for sensitive topics.',
    rationale: 'Tests questionnaire-design best practice.',
  },
  {
    competency: 'Performance Monitoring', level: 3, bloom: 'Apply',
    question: 'Which indicator best tracks enumerator productivity during a survey?',
    options: ['Number of cups of tea consumed', 'Completed valid questionnaires per day adjusted for complexity', 'Total hours spent in office', 'Number of complaints about parking'],
    correct: 1,
    explanation: 'Completed valid questionnaires per day (adjusted for difficulty) measures output quality and quantity.',
    rationale: 'Applies indicator design to field operations.',
  },
  {
    competency: 'Conflict Resolution', level: 3, bloom: 'Apply',
    question: 'Two team members dispute ownership of a task. The recommended first step is:',
    options: ['Escalate immediately to senior management', 'Facilitate a structured discussion to understand both perspectives and agree a resolution', 'Assign blame based on seniority', 'Ignore the conflict'],
    correct: 1,
    explanation: 'Structured facilitation to understand both perspectives and reach consensus is the standard first step in conflict resolution.',
    rationale: 'Behavioural competency: constructive conflict handling.',
  },
];

async function seedAssessments() {
  console.log('Seeding assessments (MCQs)...');
  const existing = await prisma.assessment.count();
  if (existing > 0) {
    console.log(`  ✓ Already have ${existing} assessments — skipping`);
    return;
  }

  let approved = 0;
  let pending = 0;
  for (const t of mcqTemplates) {
    const competency = await prisma.competency.findFirst({ where: { name: t.competency } });
    if (!competency) {
      console.log(`  ⚠ competency not found: ${t.competency} — skipping`);
      continue;
    }
    const isPending = pending < 10 && Math.random() < 0.35;
    await prisma.assessment.create({
      data: {
        question: t.question,
        options: t.options,
        correctAnswer: t.correct,
        explanation: t.explanation,
        competencyId: competency.id,
        targetLevel: t.level,
        bloomLevel: t.bloom,
        rationale: t.rationale,
        reviewStatus: isPending ? 'PENDING' : 'APPROVED',
        reviewedBy: isPending ? null : 'content-admin',
        reviewedAt: isPending ? null : new Date(),
      },
    });
    if (isPending) pending++; else approved++;
  }
  console.log(`  ✓ ${approved} approved MCQs, ${pending} pending MCQs seeded`);
}

// ─── Main Seed ────────────────────────────────────────────────────────────

async function main() {
  console.log('🌱 Starting UNNATI seed...\n');

  await seedDivisions();
  await seedRoles();
  await seedCourses();
  await seedOfficers();
  await seedAssessments();

  console.log('\n✅ Seed complete!');
  console.log(`   Divisions: ${divisions.length}`);
  console.log(`   Roles: ${fracRoles.length}`);
  console.log(`   Courses: ${mockCourses.length}`);
  console.log(`   Officers: ${mockOfficers.length}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
