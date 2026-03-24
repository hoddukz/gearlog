// Tag: core
// Path: /Users/hodduk/Documents/git/gearlog/app/api/import/route.ts

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma/client";

function parseCSV(text: string): string[][] {
  // BOM 제거
  const cleaned = text.replace(/^\uFEFF/, "").trim();
  const rows: string[][] = [];
  let current = "";
  let inQuotes = false;
  let row: string[] = [];

  for (let i = 0; i < cleaned.length; i++) {
    const char = cleaned[i];
    const next = cleaned[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        current += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ",") {
        row.push(current.trim());
        current = "";
      } else if (char === "\n" || (char === "\r" && next === "\n")) {
        row.push(current.trim());
        if (row.some((cell) => cell !== "")) rows.push(row);
        row = [];
        current = "";
        if (char === "\r") i++;
      } else {
        current += char;
      }
    }
  }
  // 마지막 행
  row.push(current.trim());
  if (row.some((cell) => cell !== "")) rows.push(row);

  return rows;
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const vehicleId = formData.get("vehicleId") as string | null;
  const type = formData.get("type") as string | null;

  if (!file || !vehicleId || !type) {
    return NextResponse.json(
      { error: "file, vehicleId, type이 필요합니다" },
      { status: 400 }
    );
  }

  const vehicle = await prisma.vehicle.findFirst({
    where: { id: vehicleId, userId: user.id },
  });
  if (!vehicle) {
    return NextResponse.json({ error: "차량을 찾을 수 없습니다" }, { status: 404 });
  }

  const text = await file.text();
  const rows = parseCSV(text);

  if (rows.length < 2) {
    return NextResponse.json(
      { error: "데이터가 없습니다 (헤더 포함 2행 이상 필요)" },
      { status: 400 }
    );
  }

  // 첫 행은 헤더, 나머지가 데이터
  const dataRows = rows.slice(1);
  let imported = 0;
  let skipped = 0;

  if (type === "fuel") {
    // 헤더: 날짜, 주행거리(km), 주유량(L), 단가(원/L), 총금액(원), 주유소, 메모
    for (const row of dataRows) {
      const [date, mileage, liters, pricePerL, totalCost, stationName, notes] = row;
      if (!date || !mileage || !liters || !pricePerL || !totalCost) {
        skipped++;
        continue;
      }
      const m = Number(mileage);
      if (isNaN(m) || isNaN(Number(liters))) {
        skipped++;
        continue;
      }
      await prisma.fuelLog.create({
        data: {
          vehicleId,
          date: new Date(date),
          mileage: m,
          liters: Number(liters),
          pricePerL: Number(pricePerL),
          totalCost: Number(totalCost),
          stationName: stationName || null,
          notes: notes || null,
        },
      });
      imported++;
    }
  } else if (type === "maintenance") {
    // 헤더: 날짜, 카테고리, 항목, 비용(원), 주행거리(km), 정비소, 메모
    for (const row of dataRows) {
      const [date, category, item, cost, mileage, shopName, notes] = row;
      if (!date || !category || !item || !cost || !mileage) {
        skipped++;
        continue;
      }
      if (isNaN(Number(cost)) || isNaN(Number(mileage))) {
        skipped++;
        continue;
      }
      await prisma.maintenanceLog.create({
        data: {
          vehicleId,
          date: new Date(date),
          category,
          item,
          cost: Number(cost),
          mileage: Number(mileage),
          shopName: shopName || null,
          notes: notes || null,
        },
      });
      imported++;
    }
  } else if (type === "expenses") {
    // 헤더: 날짜, 카테고리, 금액(원), 메모
    const categoryMap: Record<string, string> = {
      보험: "INSURANCE",
      세금: "TAX",
      기타: "OTHER",
      주유: "FUEL",
      정비: "MAINTENANCE",
    };
    for (const row of dataRows) {
      const [date, category, amount, notes] = row;
      if (!date || !category || !amount) {
        skipped++;
        continue;
      }
      if (isNaN(Number(amount))) {
        skipped++;
        continue;
      }
      const enumCategory = categoryMap[category] || "OTHER";
      await prisma.expenseLog.create({
        data: {
          vehicleId,
          date: new Date(date),
          category: enumCategory as "FUEL" | "MAINTENANCE" | "INSURANCE" | "TAX" | "OTHER",
          amount: Number(amount),
          notes: notes || null,
        },
      });
      imported++;
    }
  } else {
    return NextResponse.json({ error: "유효하지 않은 type입니다" }, { status: 400 });
  }

  return NextResponse.json({ imported, skipped });
}
