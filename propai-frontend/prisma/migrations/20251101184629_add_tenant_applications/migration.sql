-- CreateTable
CREATE TABLE "public"."PropertySettings" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "minCreditScore" INTEGER NOT NULL DEFAULT 600,
    "incomeMultiplier" DOUBLE PRECISION NOT NULL DEFAULT 3.0,
    "minIncomeMultiplier" DOUBLE PRECISION NOT NULL DEFAULT 2.5,
    "businessHoursStart" TEXT NOT NULL DEFAULT '09:00',
    "businessHoursEnd" TEXT NOT NULL DEFAULT '18:00',
    "excludeWeekends" BOOLEAN NOT NULL DEFAULT false,
    "parkingInstructions" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PropertySettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TenantApplication" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "propertyId" TEXT,
    "applicantName" TEXT NOT NULL,
    "applicantEmail" TEXT NOT NULL,
    "applicantPhone" TEXT,
    "emailSubject" TEXT,
    "emailBody" TEXT,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "driversLicenseUrl" TEXT,
    "driversLicenseText" TEXT,
    "payStubUrls" TEXT[],
    "payStubTexts" TEXT[],
    "creditScoreUrl" TEXT,
    "creditScoreText" TEXT,
    "licenseName" TEXT,
    "licenseDOB" TIMESTAMP(3),
    "licenseExpiration" TIMESTAMP(3),
    "licenseNumber" TEXT,
    "employerName" TEXT,
    "monthlyIncome" DOUBLE PRECISION,
    "annualIncome" DOUBLE PRECISION,
    "payFrequency" TEXT,
    "creditScore" INTEGER,
    "creditScoreDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'pending',
    "screeningScore" TEXT,
    "screeningNotes" TEXT,
    "backgroundCheckResult" JSONB,
    "backgroundCheckCompletedAt" TIMESTAMP(3),
    "calendarEventId" TEXT,
    "scheduledDate" TIMESTAMP(3),
    "scheduledTime" TEXT,
    "showingConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TenantApplication_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PropertySettings_propertyId_key" ON "public"."PropertySettings"("propertyId");

-- CreateIndex
CREATE INDEX "TenantApplication_userId_idx" ON "public"."TenantApplication"("userId");

-- CreateIndex
CREATE INDEX "TenantApplication_propertyId_idx" ON "public"."TenantApplication"("propertyId");

-- CreateIndex
CREATE INDEX "TenantApplication_status_idx" ON "public"."TenantApplication"("status");

-- AddForeignKey
ALTER TABLE "public"."PropertySettings" ADD CONSTRAINT "PropertySettings_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "public"."Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TenantApplication" ADD CONSTRAINT "TenantApplication_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "public"."Property"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TenantApplication" ADD CONSTRAINT "TenantApplication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
