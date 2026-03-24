// Tag: core
// Path: /Users/hodduk/Documents/git/gearlog/components/maintenance/maintenance-list.tsx

"use client";

import { useEffect, useState } from "react";
import { useVehicleStore } from "@/lib/store/vehicle-store";

type MaintenanceLog = {
  id: string;
  date: string;
  category: string;
  item: string;
  cost: number;
  mileage: number;
  shopName: string | null;
  notes: string | null;
};

export function MaintenanceList({ refreshKey }: { refreshKey: number }) {
  const selectedVehicleId = useVehicleStore((s) => s.selectedVehicleId);
  const [logs, setLogs] = useState<MaintenanceLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedVehicleId) {
      setLogs([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(`/api/maintenance-logs?vehicleId=${selectedVehicleId}`)
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
        정비 기록이 없습니다
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
              {log.item}
            </span>
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              {log.category}
            </span>
          </div>
          <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-muted-foreground">
            <div>
              <span className="block font-medium text-foreground">
                {new Date(log.date).toLocaleDateString("ko-KR")}
              </span>
              날짜
            </div>
            <div>
              <span className="block font-medium text-foreground">
                {log.cost.toLocaleString()}원
              </span>
              비용
            </div>
            <div>
              <span className="block font-medium text-foreground">
                {log.mileage.toLocaleString()}km
              </span>
              주행거리
            </div>
          </div>
          {(log.shopName || log.notes) && (
            <div className="mt-2 text-xs text-muted-foreground">
              {log.shopName && <span>{log.shopName}</span>}
              {log.shopName && log.notes && <span> · </span>}
              {log.notes && <span>{log.notes}</span>}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
