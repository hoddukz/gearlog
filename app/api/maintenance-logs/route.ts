// Tag: core
// Path: /Users/hodduk/Documents/git/gearlog/app/api/maintenance-logs/route.ts

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
    return NextResponse.json(
      { error: "vehicleId가 필요합니다" },
      { status: 400 }
    );
  }

  const vehicle = await prisma.vehicle.findFirst({
    where: { id: vehicleId, userId: user.id },
  });
  if (!vehicle) {
    return NextResponse.json({ error: "차량을 찾을 수 없습니다" }, { status: 404 });
  }

  const logs = await prisma.maintenanceLog.findMany({
    where: { vehicleId },
    orderBy: { date: "desc" },
  });

  return NextResponse.json(logs);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  const body = await request.json();
  const { vehicleId, date, category, item, cost, mileage, shopName, notes } = body;

  if (!vehicleId || !date || !category || !item || cost == null || mileage == null) {
    return NextResponse.json(
      { error: "필수 항목을 입력해주세요" },
      { status: 400 }
    );
  }

  const vehicle = await prisma.vehicle.findFirst({
    where: { id: vehicleId, userId: user.id },
  });
  if (!vehicle) {
    return NextResponse.json({ error: "차량을 찾을 수 없습니다" }, { status: 404 });
  }

  const mileageNum = Number(mileage);

  const log = await prisma.maintenanceLog.create({
    data: {
      vehicleId,
      date: new Date(date),
      category,
      item,
      cost: Number(cost),
      mileage: mileageNum,
      shopName: shopName || null,
      notes: notes || null,
    },
  });

  // 주행거리 갱신
  if (mileageNum > vehicle.currentMileage) {
    await prisma.vehicle.update({
      where: { id: vehicleId },
      data: { currentMileage: mileageNum },
    });
  }

  return NextResponse.json(log, { status: 201 });
}
