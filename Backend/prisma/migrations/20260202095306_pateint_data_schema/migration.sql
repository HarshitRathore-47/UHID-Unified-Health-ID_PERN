-- CreateEnum
CREATE TYPE "MealType" AS ENUM ('Breakfast', 'Lunch', 'Dinner', 'Snacks');

-- CreateTable
CREATE TABLE "HealthProfile" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "height" DOUBLE PRECISION,
    "weight" DOUBLE PRECISION,
    "bp" TEXT,
    "heartRate" INTEGER,
    "chronicConditions" TEXT[],
    "allergies" TEXT[],
    "longTermDiseases" TEXT,
    "bloodGroup" TEXT,
    "spO2" DOUBLE PRECISION,
    "bloodSugarLevels" DOUBLE PRECISION,
    "smokingStatus" TEXT,
    "alcoholConsumption" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HealthProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prescription" (
    "id" TEXT NOT NULL,
    "datePrescribed" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diagnosis" TEXT,
    "medicineSystem" TEXT,
    "prescribedMedicineName" TEXT NOT NULL,
    "brand" TEXT,
    "dosage" TEXT,
    "frequency" TEXT,
    "instructedTime" TEXT,
    "patientId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Prescription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LabReport" (
    "reportId" TEXT NOT NULL,
    "uploadDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uploadFormat" TEXT NOT NULL,
    "isDigitized" BOOLEAN NOT NULL DEFAULT false,
    "uhid" TEXT NOT NULL,
    "testName" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "resultValue" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "referenceRange" TEXT,
    "statusFlag" TEXT,
    "labName" TEXT NOT NULL,
    "labLocation" TEXT,
    "technicianName" TEXT,
    "doctorInCharge" TEXT,
    "collectionDate" TIMESTAMP(3),
    "reportDateTime" TIMESTAMP(3),
    "fileUrl" TEXT,
    "remarksNotes" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LabReport_pkey" PRIMARY KEY ("reportId")
);

-- CreateTable
CREATE TABLE "ActiveTreatment" (
    "id" TEXT NOT NULL,
    "conditionType" TEXT NOT NULL,
    "diseaseName" TEXT NOT NULL,
    "docName" TEXT NOT NULL,
    "hospitalOrClinicName" TEXT NOT NULL,
    "lastVisitedDate" TIMESTAMP(3) NOT NULL,
    "nextVisitedDate" TIMESTAMP(3),
    "prescriptionId" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "currentProgress" TEXT NOT NULL,

    CONSTRAINT "ActiveTreatment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActiveDiet" (
    "dietId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "dietName" TEXT NOT NULL,
    "mealType" "MealType" NOT NULL,
    "foodItems" TEXT[],
    "avoidanceRestriction" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "doctorHospitalName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActiveDiet_pkey" PRIMARY KEY ("dietId")
);

-- CreateTable
CREATE TABLE "VaccinationHistory" (
    "VaccinationId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "vaccineName" TEXT NOT NULL,
    "vaccineType" TEXT,
    "doseNumber" INTEGER NOT NULL,
    "VaccineDate" TIMESTAMP(3) NOT NULL,
    "nextDueDate" TIMESTAMP(3),
    "providerName" TEXT,
    "batchNumber" TEXT,
    "hospitalName" TEXT,

    CONSTRAINT "VaccinationHistory_pkey" PRIMARY KEY ("VaccinationId")
);

-- CreateTable
CREATE TABLE "VisitHistory" (
    "visitId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "hospitalName" TEXT NOT NULL,
    "hospitalAddress" TEXT,
    "visitDate" TIMESTAMP(3) NOT NULL,
    "purposeReason" TEXT NOT NULL,
    "physicianName" TEXT NOT NULL,
    "physicianSpeciality" TEXT,
    "refId" TEXT,

    CONSTRAINT "VisitHistory_pkey" PRIMARY KEY ("visitId")
);

-- AddForeignKey
ALTER TABLE "HealthProfile" ADD CONSTRAINT "HealthProfile_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prescription" ADD CONSTRAINT "Prescription_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabReport" ADD CONSTRAINT "LabReport_uhid_fkey" FOREIGN KEY ("uhid") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActiveTreatment" ADD CONSTRAINT "ActiveTreatment_prescriptionId_fkey" FOREIGN KEY ("prescriptionId") REFERENCES "Prescription"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActiveTreatment" ADD CONSTRAINT "ActiveTreatment_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "LabReport"("reportId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActiveDiet" ADD CONSTRAINT "ActiveDiet_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActiveDiet" ADD CONSTRAINT "ActiveDiet_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VaccinationHistory" ADD CONSTRAINT "VaccinationHistory_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisitHistory" ADD CONSTRAINT "VisitHistory_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
