// Tag: core
// Path: /Users/hodduk/Documents/git/gearlog/components/maintenance/schedule-list.tsx

"use client";

import { useEffect, useState } from "react";
import { useVehicleStore } from "@/lib/store/vehicle-store";

type ScheduleItem = {
  item: string;
  category: string;
  intervalKm: number;
  intervalMonths: number;
  lastDate: string | null;
  lastMileage: number | null;
  nextDueKm: number;
  nextDueDate: string;
  kmRemaining: number;
  daysRemaining: number;
  status: "ok" | "soon" | "overdue";
};

const STATUS_CONFIG = {
  overdue: { label: "교체 필요", color: "bg-red-100 text-red-800" },
  soon: { label: "곧 교체", color: "bg-yellow-100 text-yellow-800" },
  ok: { label: "양호", color: "bg-green-100 text-green-800" },
} as const;

export function ScheduleList() {
  const selectedVehicleId = useVehicleStore((s) => s.selectedVehicleId);
  const [items, setItems] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedVehicleId) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(`/api/maintenance-schedule?vehicleId=${selectedVehicleId}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setItems(data);
      })
      .finally(() => setLoading(false));
  }, [selectedVehicleId]);

  if (!selectedVehicleId) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        차량을 먼저 선택해주세요
      </p>
    );
  }

  if (loading) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        로딩 중...
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const config = STATUS_CONFIG[item.status];
        return (
          <div
            key={item.item}
            className="rounded-xl border border-border bg-card p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">
                  {item.item}
                </span>
                <span className="text-xs text-muted-foreground">
                  {item.category}
                </span>
              </div>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${config.color}`}
              >
                {config.label}
              </span>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              <div>
                <span className="block font-medium text-foreground">
                  {item.kmRemaining > 0
                    ? `${item.kmRemaining.toLocaleString()}km 남음`
                    : "주행거리 초과"}
                </span>
                교체 주기: {item.intervalKm.toLocaleString()}km
              </div>
              <div>
                <span className="block font-medium text-foreground">
                  {item.daysRemaining > 0
                    ? `${item.daysRemaining}일 남음`
                    : "기간 초과"}
                </span>
                교체 주기: {item.intervalMonths}개월
              </div>
            </div>
            {item.lastDate && (
              <p className="mt-1 text-xs text-muted-foreground">
                마지막 교체:{" "}
                {new Date(item.lastDate).toLocaleDateString("ko-KR")} (
                {item.lastMileage?.toLocaleString()}km)
              </p>
            )}
            {!item.lastDate && (
              <p className="mt-1 text-xs text-muted-foreground">
                교체 이력 없음
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
