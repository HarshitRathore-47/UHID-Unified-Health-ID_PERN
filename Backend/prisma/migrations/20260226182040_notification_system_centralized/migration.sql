-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('CONSENT_REQUEST', 'CONSENT_APPROVED', 'CONSENT_REVOKED', 'LAB_UPLOADED', 'LAB_VERIFIED', 'LAB_REJECTED', 'PRESCRIPTION_ADDED', 'DIET_UPDATED', 'TREATMENT_ADDED', 'VACCINATION_ADDED', 'CONSENT_EXPIRED', 'PATIENT_REVOKED_ACCESS', 'LAB_PENDING_REVIEW');

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "entityId" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Notification_userId_isRead_idx" ON "Notification"("userId", "isRead");

-- CreateIndex
CREATE INDEX "Notification_userId_createdAt_idx" ON "Notification"("userId", "createdAt");
