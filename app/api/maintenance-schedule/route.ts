// Tag: core
// Path: /Users/hodduk/Documents/git/gearlog/app/api/maintenance-schedule/route.ts

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma/client";
import { MAINTENANCE_TEMPLATES } from "@/lib/data/maintenance-templates";

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

  const templates = MAINTENANCE_TEMPLATES[vehicle.fuelType] || [];

  // 각 템플릿 항목에 대해 마지막 정비 기록 조회
  const maintenanceLogs = await prisma.maintenanceLog.findMany({
    where: { vehicleId },
    orderBy: { date: "desc" },
  });

  const now = new Date();
  const currentMileage = vehicle.currentMileage;

  const schedule = templates.map((template) => {
    // 정비 이력에서 해당 항목 찾기 (item 이름 포함 매칭)
    const lastLog = maintenanceLogs.find(
      (log) =>
        log.item.includes(template.item) ||
        template.item.includes(log.item)
    );

    let lastDate: Date | null = null;
    let lastMileage: number | null = null;
    let nextDueKm: number | null = null;
    let nextDueDate: Date | null = null;
    let status: "ok" | "soon" | "overdue" = "ok";

    if (lastLog) {
      lastDate = lastLog.date;
      lastMileage = lastLog.mileage;
      nextDueKm = lastMileage + template.intervalKm;
      nextDueDate = new Date(lastDate);
      nextDueDate.setMonth(nextDueDate.getMonth() + template.intervalMonths);
    } else {
      // 기록 없으면 현재 기준으로 계산 (바로 점검 필요)
      nextDueKm = currentMileage;
      nextDueDate = now;
    }

    // 상태 판단
    const kmRemaining = nextDueKm - currentMileage;
    const daysRemaining = Math.floor(
      (nextDueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (kmRemaining <= 0 || daysRemaining <= 0) {
      status = "overdue";
    } else if (
      kmRemaining <= template.intervalKm * 0.2 ||
      daysRemaining <= 30
    ) {
      status = "soon";
    }

    return {
      item: template.item,
      category: template.category,
      intervalKm: template.intervalKm,
      intervalMonths: template.intervalMonths,
      lastDate: lastDate?.toISOString() || null,
      lastMileage,
      nextDueKm,
      nextDueDate: nextDueDate.toISOString(),
      kmRemaining: Math.max(0, kmRemaining),
      daysRemaining: Math.max(0, daysRemaining),
      status,
    };
  });

  // overdue → soon → ok 순서로 정렬
  const order = { overdue: 0, soon: 1, ok: 2 };
  schedule.sort((a, b) => order[a.status] - order[b.status]);

  return NextResponse.json(schedule);
}
