-- CreateEnum
CREATE TYPE "FuelType" AS ENUM ('GASOLINE', 'DIESEL', 'HYBRID');

-- CreateEnum
CREATE TYPE "MemoStatus" AS ENUM ('PENDING', 'SCHEDULED', 'DONE');

-- CreateEnum
CREATE TYPE "ExpenseCategory" AS ENUM ('FUEL', 'MAINTENANCE', 'INSURANCE', 'TAX', 'OTHER');

-- CreateTable
CREATE TABLE "Vehicle" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "fuelType" "FuelType" NOT NULL,
    "licensePlate" TEXT,
    "currentMileage" INTEGER NOT NULL,
    "purchasePrice" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FuelLog" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "mileage" INTEGER NOT NULL,
    "liters" DOUBLE PRECISION NOT NULL,
    "pricePerL" DOUBLE PRECISION NOT NULL,
    "totalCost" DOUBLE PRECISION NOT NULL,
    "stationName" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FuelLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaintenanceLog" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "category" TEXT NOT NULL,
    "item" TEXT NOT NULL,
    "cost" DOUBLE PRECISION NOT NULL,
    "mileage" INTEGER NOT NULL,
    "shopName" TEXT,
    "notes" TEXT,
    "memoId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MaintenanceLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaintenanceMemo" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" "MemoStatus" NOT NULL DEFAULT 'PENDING',
    "linkedLogId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MaintenanceMemo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExpenseLog" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "category" "ExpenseCategory" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExpenseLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reminder" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "triggerDate" TIMESTAMP(3),
    "triggerMileage" INTEGER,
    "isSent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Reminder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GasStation" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "lastPricePerL" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GasStation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Vehicle_userId_idx" ON "Vehicle"("userId");

-- CreateIndex
CREATE INDEX "FuelLog_vehicleId_idx" ON "FuelLog"("vehicleId");

-- CreateIndex
CREATE INDEX "MaintenanceLog_vehicleId_idx" ON "MaintenanceLog"("vehicleId");

-- CreateIndex
CREATE INDEX "MaintenanceMemo_vehicleId_idx" ON "MaintenanceMemo"("vehicleId");

-- CreateIndex
CREATE INDEX "ExpenseLog_vehicleId_idx" ON "ExpenseLog"("vehicleId");

-- CreateIndex
CREATE INDEX "Reminder_vehicleId_idx" ON "Reminder"("vehicleId");

-- CreateIndex
CREATE INDEX "GasStation_vehicleId_idx" ON "GasStation"("vehicleId");

-- AddForeignKey
ALTER TABLE "FuelLog" ADD CONSTRAINT "FuelLog_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceLog" ADD CONSTRAINT "MaintenanceLog_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceLog" ADD CONSTRAINT "MaintenanceLog_memoId_fkey" FOREIGN KEY ("memoId") REFERENCES "MaintenanceMemo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceMemo" ADD CONSTRAINT "MaintenanceMemo_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpenseLog" ADD CONSTRAINT "ExpenseLog_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GasStation" ADD CONSTRAINT "GasStation_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
