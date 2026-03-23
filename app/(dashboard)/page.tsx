// Tag: core
// Path: /Users/hodduk/Documents/git/gearlog/app/(dashboard)/page.tsx

"use client";

import { useVehicleStore } from "@/lib/store/vehicle-store";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const FUEL_LABEL: Record<string, string> = {
  GASOLINE: "가솔린",
  DIESEL: "디젤",
  HYBRID: "하이브리드",
};

export default function DashboardPage() {
  const selectedVehicle = useVehicleStore((s) => s.selectedVehicle());
  const vehicles = useVehicleStore((s) => s.vehicles);

  return (
    <div className="mx-auto w-full max-w-screen-md px-4 py-6">
      <h1 className="mb-6 text-xl font-semibold text-foreground">대시보드</h1>

      {vehicles.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
          <p className="mb-4 text-muted-foreground">
            등록된 차량이 없습니다
          </p>
          <Link href="/vehicles">
            <Button>차량 등록하기</Button>
          </Link>
        </div>
      ) : selectedVehicle ? (
        <div className="space-y-4">
          {/* 차량 요약 카드 */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-card-foreground">
                {selectedVehicle.name}
              </h2>
              <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
                {FUEL_LABEL[selectedVehicle.fuelType]}
              </span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div>
                <p className="text-xs text-muted-foreground">연식</p>
                <p className="text-sm font-medium text-foreground">
                  {selectedVehicle.year}년
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">주행거리</p>
                <p className="text-sm font-medium text-foreground">
                  {selectedVehicle.currentMileage.toLocaleString()} km
                </p>
              </div>
              {selectedVehicle.licensePlate && (
                <div>
                  <p className="text-xs text-muted-foreground">번호판</p>
                  <p className="text-sm font-medium text-foreground">
                    {selectedVehicle.licensePlate}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 기능 카드 (Phase 1 나머지 기능 자리) */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <p className="text-sm font-medium text-card-foreground">
                주유 기록
              </p>
              <p className="mt-1 text-xs text-muted-foreground">준비 중</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <p className="text-sm font-medium text-card-foreground">
                비용 현황
              </p>
              <p className="mt-1 text-xs text-muted-foreground">준비 중</p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
