// Tag: core
// Path: /Users/hodduk/Documents/git/gearlog/app/api/vehicles/route.ts

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma/client";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  const vehicles = await prisma.vehicle.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(vehicles);
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
  const { name, year, fuelType, licensePlate, currentMileage, purchasePrice } =
    body;

  if (!name || !year || !fuelType || currentMileage == null) {
    return NextResponse.json(
      { error: "필수 항목을 입력해주세요" },
      { status: 400 }
    );
  }

  const vehicle = await prisma.vehicle.create({
    data: {
      userId: user.id,
      name,
      year: Number(year),
      fuelType,
      licensePlate: licensePlate || null,
      currentMileage: Number(currentMileage),
      purchasePrice: purchasePrice ? Number(purchasePrice) : null,
    },
  });

  return NextResponse.json(vehicle, { status: 201 });
}
