// Tag: core
// Path: /Users/hodduk/Documents/git/gearlog/app/api/expenses/summary/route.ts

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma/client";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  const vehicleId = request.nextUrl.searchParams.get("vehicleId");
  if (!vehicleId) {
    return NextResponse.json({ error: "vehicleId가 필요합니다" }, { status: 400 });
  }

  const vehicle = await prisma.vehicle.findFirst({
    where: { id: vehicleId, userId: user.id },
  });
  if (!vehicle) {
    return NextResponse.json({ error: "차량을 찾을 수 없습니다" }, { status: 404 });
  }

  // 주유 비용 합계
  const fuelLogs = await prisma.fuelLog.findMany({
    where: { vehicleId },
    select: { totalCost: true, date: true },
  });
  const fuelTotal = fuelLogs.reduce((sum, l) => sum + l.totalCost, 0);

  // 정비 비용 합계
  const maintenanceLogs = await prisma.maintenanceLog.findMany({
    where: { vehicleId },
    select: { cost: true, date: true },
  });
  const maintenanceTotal = maintenanceLogs.reduce((sum, l) => sum + l.cost, 0);

  // 기타 비용 (보험, 세금 등) 카테고리별 합계
  const expenseLogs = await prisma.expenseLog.findMany({
    where: { vehicleId },
    select: { category: true, amount: true, date: true },
  });

  const expenseByCategory: Record<string, number> = {};
  let expenseTotal = 0;
  for (const e of expenseLogs) {
    expenseByCategory[e.category] =
      (expenseByCategory[e.category] || 0) + e.amount;
    expenseTotal += e.amount;
  }

  const grandTotal = fuelTotal + maintenanceTotal + expenseTotal;

  // 카테고리별 집계
  const categories = [
    { name: "주유", amount: fuelTotal },
    { name: "정비", amount: maintenanceTotal },
    ...Object.entries(expenseByCategory).map(([name, amount]) => {
      const labels: Record<string, string> = {
        INSURANCE: "보험",
        TAX: "세금",
        OTHER: "기타",
        FUEL: "주유(기타)",
        MAINTENANCE: "정비(기타)",
      };
      return { name: labels[name] || name, amount };
    }),
  ].filter((c) => c.amount > 0);

  // 총 소유비용 (구매가 + 누적 유지비)
  const purchasePrice = vehicle.purchasePrice
    ? vehicle.purchasePrice * 10000
    : 0; // DB에 만원 단위로 저장됨
  const totalCostOfOwnership = purchasePrice + grandTotal;

  // km당 비용 (주행거리 > 0일 때)
  const costPerKm =
    vehicle.currentMileage > 0
      ? Math.round(grandTotal / vehicle.currentMileage)
      : null;

  return NextResponse.json({
    grandTotal,
    fuelTotal,
    maintenanceTotal,
    expenseTotal,
    categories,
    purchasePrice,
    totalCostOfOwnership,
    costPerKm,
    currentMileage: vehicle.currentMileage,
  });
}
