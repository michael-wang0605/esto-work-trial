// Seed mock applications directly to database using Prisma
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const MOCK_APPLICATIONS = [
  {
    applicantName: "Sarah Johnson",
    applicantEmail: "sarah.johnson@example.com",
    applicantPhone: "555-0101",
    creditScore: 780,
    monthlyIncome: 7500.0,
    annualIncome: 90000.0,
    screeningScore: "green",
    status: "approved",
  },
  {
    applicantName: "Michael Chen",
    applicantEmail: "michael.chen@example.com",
    applicantPhone: "555-0102",
    creditScore: 720,
    monthlyIncome: 6800.0,
    annualIncome: 81600.0,
    screeningScore: "green",
    status: "awaiting_tenant",
  },
  {
    applicantName: "Emily Rodriguez",
    applicantEmail: "emily.rodriguez@example.com",
    applicantPhone: "555-0103",
    creditScore: 695,
    monthlyIncome: 6200.0,
    annualIncome: 74400.0,
    screeningScore: "green",
    status: "scheduled",
  },
  {
    applicantName: "David Kim",
    applicantEmail: "david.kim@example.com",
    applicantPhone: "555-0104",
    creditScore: 650,
    monthlyIncome: 5500.0,
    annualIncome: 66000.0,
    screeningScore: "yellow",
    status: "under_review",
  },
  {
    applicantName: "Jessica Martinez",
    applicantEmail: "jessica.martinez@example.com",
    applicantPhone: "555-0105",
    creditScore: 640,
    monthlyIncome: 5200.0,
    annualIncome: 62400.0,
    screeningScore: "yellow",
    status: "under_review",
  },
  {
    applicantName: "Robert Taylor",
    applicantEmail: "robert.taylor@example.com",
    applicantPhone: "555-0106",
    creditScore: 755,
    monthlyIncome: 8000.0,
    annualIncome: 96000.0,
    screeningScore: "green",
    status: "approved",
  },
  {
    applicantName: "Amanda White",
    applicantEmail: "amanda.white@example.com",
    applicantPhone: "555-0107",
    creditScore: 580,
    monthlyIncome: 4500.0,
    annualIncome: 54000.0,
    screeningScore: "red",
    status: "rejected",
  },
  {
    applicantName: "James Wilson",
    applicantEmail: "james.wilson@example.com",
    applicantPhone: "555-0108",
    creditScore: 710,
    monthlyIncome: 7200.0,
    annualIncome: 86400.0,
    screeningScore: "green",
    status: "awaiting_tenant",
  },
  {
    applicantName: "Lisa Anderson",
    applicantEmail: "lisa.anderson@example.com",
    applicantPhone: "555-0109",
    creditScore: 625,
    monthlyIncome: 5000.0,
    annualIncome: 60000.0,
    screeningScore: "yellow",
    status: "under_review",
  },
  {
    applicantName: "Christopher Lee",
    applicantEmail: "christopher.lee@example.com",
    applicantPhone: "555-0110",
    creditScore: 690,
    monthlyIncome: 6500.0,
    annualIncome: 78000.0,
    screeningScore: "green",
    status: "approved",
  },
  {
    applicantName: "Maria Garcia",
    applicantEmail: "maria.garcia@example.com",
    applicantPhone: "555-0111",
    creditScore: 550,
    monthlyIncome: 4000.0,
    annualIncome: 48000.0,
    screeningScore: "red",
    status: "rejected",
  },
  {
    applicantName: "Daniel Brown",
    applicantEmail: "daniel.brown@example.com",
    applicantPhone: "555-0112",
    creditScore: 740,
    monthlyIncome: 7800.0,
    annualIncome: 93600.0,
    screeningScore: "green",
    status: "approved",
  },
  {
    applicantName: "Jennifer Davis",
    applicantEmail: "jennifer.davis@example.com",
    applicantPhone: "555-0113",
    creditScore: 630,
    monthlyIncome: 4800.0,
    annualIncome: 57600.0,
    screeningScore: "yellow",
    status: "under_review",
  },
  {
    applicantName: "Matthew Thompson",
    applicantEmail: "matthew.thompson@example.com",
    applicantPhone: "555-0114",
    creditScore: 715,
    monthlyIncome: 7000.0,
    annualIncome: 84000.0,
    screeningScore: "green",
    status: "awaiting_tenant",
  },
  {
    applicantName: "Nicole Harris",
    applicantEmail: "nicole.harris@example.com",
    applicantPhone: "555-0115",
    creditScore: 675,
    monthlyIncome: 6000.0,
    annualIncome: 72000.0,
    screeningScore: "green",
    status: "approved",
  },
];

const USER_ID = process.argv[2] || "cmgk8d5yz0000l104mkwr8j0w"; // Michael Wang

async function seed() {
  console.log(`🌱 Seeding ${MOCK_APPLICATIONS.length} mock applications...`);
  console.log(`📊 User ID: ${USER_ID}\n`);

  let successful = 0;
  let failed = 0;

  for (let idx = 0; idx < MOCK_APPLICATIONS.length; idx++) {
    const appData = MOCK_APPLICATIONS[idx];
    const daysAgo = idx % 14;
    const receivedDate = new Date();
    receivedDate.setDate(receivedDate.getDate() - daysAgo);

    try {
      const app = await prisma.tenantApplication.create({
        data: {
          userId: USER_ID,
          propertyId: null,
          applicantName: appData.applicantName,
          applicantEmail: appData.applicantEmail,
          applicantPhone: appData.applicantPhone,
          emailSubject: "Mock Tenant Application",
          emailBody: "Mock application for demo purposes",
          driversLicenseUrl: "mock://license",
          payStubUrls: ["mock://paystub"],
          creditScoreUrl: "mock://credit",
          employerName: "Mock Employer",
          monthlyIncome: appData.monthlyIncome,
          annualIncome: appData.annualIncome,
          payFrequency: "monthly",
          creditScore: appData.creditScore,
          status: appData.status,
          screeningScore: appData.screeningScore,
          screeningNotes: `Mock application - ${appData.screeningScore} screening score`,
          receivedAt: receivedDate,
        },
      });

      successful++;
      console.log(
        `✅ [${idx + 1}/${MOCK_APPLICATIONS.length}] Created: ${appData.applicantName} ` +
        `(Credit: ${appData.creditScore}, Score: ${appData.screeningScore}, Status: ${appData.status})`
      );
    } catch (error) {
      failed++;
      console.log(
        `❌ [${idx + 1}/${MOCK_APPLICATIONS.length}] Failed: ${appData.applicantName} - ${error.message}`
      );
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   ✅ Successfully created: ${successful}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`\n🎉 ${successful} applications created - they should appear on /applications page!`);
}

seed()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

