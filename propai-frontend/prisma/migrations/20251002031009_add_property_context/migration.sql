-- CreateTable
CREATE TABLE "public"."PropertyContext" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "bedrooms" INTEGER,
    "bathrooms" DOUBLE PRECISION,
    "squareFootage" INTEGER,
    "propertyType" TEXT,
    "yearBuilt" INTEGER,
    "lotSize" TEXT,
    "architecturalStyle" TEXT,
    "exteriorFeatures" TEXT,
    "interiorFeatures" TEXT,
    "neighborhood" TEXT,
    "walkScore" INTEGER,
    "transitScore" INTEGER,
    "bikeScore" INTEGER,
    "crimeRate" TEXT,
    "elementarySchool" TEXT,
    "middleSchool" TEXT,
    "highSchool" TEXT,
    "schoolDistrict" TEXT,
    "schoolRatings" TEXT,
    "nearbyTransit" TEXT,
    "majorHighways" TEXT,
    "commuteTimes" TEXT,
    "nearbyAmenities" TEXT,
    "healthcareFacilities" TEXT,
    "entertainment" TEXT,
    "estimatedValue" DOUBLE PRECISION,
    "pricePerSqFt" DOUBLE PRECISION,
    "marketTrends" TEXT,
    "comparableProperties" TEXT,
    "propertyDescription" TEXT,
    "keySellingPoints" TEXT,
    "potentialConcerns" TEXT,
    "targetDemographics" TEXT,
    "lastUpdated" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "aiModel" TEXT,
    "confidenceScore" DOUBLE PRECISION,

    CONSTRAINT "PropertyContext_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PropertyContext_propertyId_key" ON "public"."PropertyContext"("propertyId");

-- AddForeignKey
ALTER TABLE "public"."PropertyContext" ADD CONSTRAINT "PropertyContext_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "public"."Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;
