// Tag: core
// Path: /Users/hodduk/Documents/git/gearlog/app/api/fuel-logs/route.ts

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

  // 차량 소유권 확인
  const vehicle = await prisma.vehicle.findFirst({
    where: { id: vehicleId, userId: user.id },
  });
  if (!vehicle) {
    return NextResponse.json({ error: "차량을 찾을 수 없습니다" }, { status: 404 });
  }

  const logs = await prisma.fuelLog.findMany({
    where: { vehicleId },
    orderBy: { date: "desc" },
  });

  // 연비 계산: 이전 기록과의 주행거리 차이 / 주유량
  const logsWithEfficiency = logs.map((log, i) => {
    const prevLog = logs[i + 1]; // desc 정렬이므로 i+1이 이전 기록
    let efficiency: number | null = null;
    if (prevLog && log.mileage > prevLog.mileage && log.liters > 0) {
      efficiency =
        Math.round(((log.mileage - prevLog.mileage) / log.liters) * 10) / 10;
    }
    return { ...log, efficiency };
  });

  return NextResponse.json(logsWithEfficiency);
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
  const { vehicleId, date, mileage, liters, pricePerL, totalCost, stationName, notes } = body;

  if (!vehicleId || !date || mileage == null || !liters || !pricePerL || totalCost == null) {
    return NextResponse.json(
      { error: "필수 항목을 입력해주세요" },
      { status: 400 }
    );
  }

  // 차량 소유권 확인
  const vehicle = await prisma.vehicle.findFirst({
    where: { id: vehicleId, userId: user.id },
  });
  if (!vehicle) {
    return NextResponse.json({ error: "차량을 찾을 수 없습니다" }, { status: 404 });
  }

  const mileageNum = Number(mileage);

  // 주유 기록 생성 + 주행거리 갱신을 트랜잭션으로
  const [fuelLog] = await prisma.$transaction([
    prisma.fuelLog.create({
      data: {
        vehicleId,
        date: new Date(date),
        mileage: mileageNum,
        liters: Number(liters),
        pricePerL: Number(pricePerL),
        totalCost: Number(totalCost),
        stationName: stationName || null,
        notes: notes || null,
      },
    }),
    // 현재 주행거리보다 크면 갱신
    ...(mileageNum > vehicle.currentMileage
      ? [
          prisma.vehicle.update({
            where: { id: vehicleId },
            data: { currentMileage: mileageNum },
          }),
        ]
      : []),
  ]);

  // 주유소 정보 upsert (이름이 있는 경우)
  if (stationName) {
    const existing = await prisma.gasStation.findFirst({
      where: { vehicleId, name: stationName },
    });
    if (existing) {
      await prisma.gasStation.update({
        where: { id: existing.id },
        data: { lastPricePerL: Number(pricePerL) },
      });
    } else {
      await prisma.gasStation.create({
        data: {
          vehicleId,
          name: stationName,
          lastPricePerL: Number(pricePerL),
        },
      });
    }
  }

  // 연비 계산
  const prevLog = await prisma.fuelLog.findFirst({
    where: {
      vehicleId,
      date: { lt: new Date(date) },
    },
    orderBy: { date: "desc" },
  });

  let efficiency: number | null = null;
  if (prevLog && fuelLog.mileage > prevLog.mileage && fuelLog.liters > 0) {
    efficiency =
      Math.round(((fuelLog.mileage - prevLog.mileage) / fuelLog.liters) * 10) / 10;
  }

  return NextResponse.json({ ...fuelLog, efficiency }, { status: 201 });
}
