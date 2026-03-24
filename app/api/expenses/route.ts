// Tag: core
// Path: /Users/hodduk/Documents/git/gearlog/app/api/expenses/route.ts

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

  const expenses = await prisma.expenseLog.findMany({
    where: { vehicleId },
    orderBy: { date: "desc" },
  });

  return NextResponse.json(expenses);
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
  const { vehicleId, category, date, amount, notes } = body;

  if (!vehicleId || !category || !date || amount == null) {
    return NextResponse.json({ error: "필수 항목을 입력해주세요" }, { status: 400 });
  }

  const vehicle = await prisma.vehicle.findFirst({
    where: { id: vehicleId, userId: user.id },
  });
  if (!vehicle) {
    return NextResponse.json({ error: "차량을 찾을 수 없습니다" }, { status: 404 });
  }

  const expense = await prisma.expenseLog.create({
    data: {
      vehicleId,
      category,
      date: new Date(date),
      amount: Number(amount),
      notes: notes || null,
    },
  });

  return NextResponse.json(expense, { status: 201 });
}
