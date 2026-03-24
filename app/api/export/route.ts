// Tag: core
// Path: /Users/hodduk/Documents/git/gearlog/app/api/export/route.ts

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma/client";

function escapeCSV(value: string | number | null | undefined): string {
  if (value == null) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function toCSV(headers: string[], rows: (string | number | null)[][]): string {
  const bom = "\uFEFF"; // Excel 한글 깨짐 방지
  const headerLine = headers.map(escapeCSV).join(",");
  const dataLines = rows.map((row) => row.map(escapeCSV).join(","));
  return bom + [headerLine, ...dataLines].join("\n");
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  const vehicleId = request.nextUrl.searchParams.get("vehicleId");
  const type = request.nextUrl.searchParams.get("type") || "all";

  if (!vehicleId) {
    return NextResponse.json({ error: "vehicleId가 필요합니다" }, { status: 400 });
  }

  const vehicle = await prisma.vehicle.findFirst({
    where: { id: vehicleId, userId: user.id },
  });
  if (!vehicle) {
    return NextResponse.json({ error: "차량을 찾을 수 없습니다" }, { status: 404 });
  }

  let csv = "";
  let filename = "";
  const dateStr = new Date().toISOString().split("T")[0];

  if (type === "fuel" || type === "all") {
    const fuelLogs = await prisma.fuelLog.findMany({
      where: { vehicleId },
      orderBy: { date: "asc" },
    });

    const fuelCSV = toCSV(
      ["날짜", "주행거리(km)", "주유량(L)", "단가(원/L)", "총금액(원)", "주유소", "메모"],
      fuelLogs.map((l) => [
        l.date.toISOString().split("T")[0],
        l.mileage,
        l.liters,
        l.pricePerL,
        l.totalCost,
        l.stationName,
        l.notes,
      ])
    );

    if (type === "fuel") {
      csv = fuelCSV;
      filename = `gearlog_주유기록_${vehicle.name}_${dateStr}.csv`;
    } else {
      csv += fuelCSV;
    }
  }

  if (type === "maintenance" || type === "all") {
    const maintenanceLogs = await prisma.maintenanceLog.findMany({
      where: { vehicleId },
      orderBy: { date: "asc" },
    });

    const maintenanceCSV = toCSV(
      ["날짜", "카테고리", "항목", "비용(원)", "주행거리(km)", "정비소", "메모"],
      maintenanceLogs.map((l) => [
        l.date.toISOString().split("T")[0],
        l.category,
        l.item,
        l.cost,
        l.mileage,
        l.shopName,
        l.notes,
      ])
    );

    if (type === "maintenance") {
      csv = maintenanceCSV;
      filename = `gearlog_정비기록_${vehicle.name}_${dateStr}.csv`;
    } else {
      csv += "\n\n--- 정비 기록 ---\n" + maintenanceCSV;
    }
  }

  if (type === "expenses" || type === "all") {
    const expenseLogs = await prisma.expenseLog.findMany({
      where: { vehicleId },
      orderBy: { date: "asc" },
    });

    const labels: Record<string, string> = {
      FUEL: "주유",
      MAINTENANCE: "정비",
      INSURANCE: "보험",
      TAX: "세금",
      OTHER: "기타",
    };

    const expenseCSV = toCSV(
      ["날짜", "카테고리", "금액(원)", "메모"],
      expenseLogs.map((l) => [
        l.date.toISOString().split("T")[0],
        labels[l.category] || l.category,
        l.amount,
        l.notes,
      ])
    );

    if (type === "expenses") {
      csv = expenseCSV;
      filename = `gearlog_비용기록_${vehicle.name}_${dateStr}.csv`;
    } else {
      csv += "\n\n--- 비용 기록 ---\n" + expenseCSV;
    }
  }

  if (type === "all") {
    filename = `gearlog_전체기록_${vehicle.name}_${dateStr}.csv`;
  }

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
    },
  });
}
