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

// ─── Main Seed ────────────────────────────────────────────────────────────

async function main() {
  console.log('🌱 Starting UNNATI seed...\n');

  await seedDivisions();
  await seedRoles();
  await seedCourses();
  await seedOfficers();

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
