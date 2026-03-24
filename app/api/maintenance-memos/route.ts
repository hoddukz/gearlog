// Tag: core
// Path: /Users/hodduk/Documents/git/gearlog/app/api/maintenance-memos/route.ts

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

  const memos = await prisma.maintenanceMemo.findMany({
    where: { vehicleId },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });

  return NextResponse.json(memos);
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
  const { vehicleId, category, content } = body;

  if (!vehicleId || !category || !content) {
    return NextResponse.json({ error: "필수 항목을 입력해주세요" }, { status: 400 });
  }

  const vehicle = await prisma.vehicle.findFirst({
    where: { id: vehicleId, userId: user.id },
  });
  if (!vehicle) {
    return NextResponse.json({ error: "차량을 찾을 수 없습니다" }, { status: 404 });
  }

  const memo = await prisma.maintenanceMemo.create({
    data: {
      vehicleId,
      category,
      content,
    },
  });

  return NextResponse.json(memo, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  const body = await request.json();
  const { id, status } = body;

  if (!id || !status) {
    return NextResponse.json({ error: "id와 status가 필요합니다" }, { status: 400 });
  }

  if (!["PENDING", "SCHEDULED", "DONE"].includes(status)) {
    return NextResponse.json({ error: "유효하지 않은 상태입니다" }, { status: 400 });
  }

  // 메모 소유권 확인
  const memo = await prisma.maintenanceMemo.findFirst({
    where: { id },
    include: { vehicle: { select: { userId: true } } },
  });

  if (!memo || memo.vehicle.userId !== user.id) {
    return NextResponse.json({ error: "메모를 찾을 수 없습니다" }, { status: 404 });
  }

  const updated = await prisma.maintenanceMemo.update({
    where: { id },
    data: { status },
  });

  return NextResponse.json(updated);
}
