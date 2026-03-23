// Tag: core
// Path: /Users/hodduk/Documents/git/gearlog/components/fuel/fuel-list.tsx

"use client";

import { useEffect, useState } from "react";
import { useVehicleStore } from "@/lib/store/vehicle-store";

type FuelLogWithEfficiency = {
  id: string;
  date: string;
  mileage: number;
  liters: number;
  pricePerL: number;
  totalCost: number;
  stationName: string | null;
  notes: string | null;
  efficiency: number | null;
};

export function FuelList({ refreshKey }: { refreshKey: number }) {
  const selectedVehicleId = useVehicleStore((s) => s.selectedVehicleId);
  const [logs, setLogs] = useState<FuelLogWithEfficiency[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedVehicleId) {
      setLogs([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(`/api/fuel-logs?vehicleId=${selectedVehicleId}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setLogs(data);
      })
      .finally(() => setLoading(false));
  }, [selectedVehicleId, refreshKey]);

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

  if (logs.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        주유 기록이 없습니다
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {logs.map((log) => (
        <div
          key={log.id}
          className="rounded-xl border border-border bg-card p-4"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">
              {new Date(log.date).toLocaleDateString("ko-KR")}
            </span>
            {log.efficiency !== null && (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                {log.efficiency} km/L
              </span>
            )}
          </div>
          <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-muted-foreground">
            <div>
              <span className="block text-foreground font-medium">
                {log.liters}L
              </span>
              주유량
            </div>
            <div>
              <span className="block text-foreground font-medium">
                {log.totalCost.toLocaleString()}원
              </span>
              금액
            </div>
            <div>
              <span className="block text-foreground font-medium">
                {log.mileage.toLocaleString()}km
              </span>
              주행거리
            </div>
          </div>
          {(log.stationName || log.notes) && (
            <div className="mt-2 text-xs text-muted-foreground">
              {log.stationName && <span>{log.stationName}</span>}
              {log.stationName && log.notes && <span> · </span>}
              {log.notes && <span>{log.notes}</span>}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
