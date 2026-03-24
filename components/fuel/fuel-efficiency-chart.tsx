// Tag: core
// Path: /Users/hodduk/Documents/git/gearlog/components/fuel/fuel-efficiency-chart.tsx

"use client";

import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { useVehicleStore } from "@/lib/store/vehicle-store";

type FuelLog = {
  id: string;
  date: string;
  efficiency: number | null;
  liters: number;
  totalCost: number;
};

type ChartData = {
  date: string;
  efficiency: number;
};

export function FuelEfficiencyChart({ refreshKey }: { refreshKey: number }) {
  const selectedVehicleId = useVehicleStore((s) => s.selectedVehicleId);
  const [data, setData] = useState<ChartData[]>([]);

  useEffect(() => {
    if (!selectedVehicleId) return;
    fetch(`/api/fuel-logs?vehicleId=${selectedVehicleId}`)
      .then((res) => res.json())
      .then((logs: FuelLog[]) => {
        if (!Array.isArray(logs)) return;
        const chartData = logs
          .filter((l) => l.efficiency !== null)
          .reverse() // 오래된 순서로 (차트 왼→오)
          .map((l) => ({
            date: new Date(l.date).toLocaleDateString("ko-KR", {
              month: "short",
              day: "numeric",
            }),
            efficiency: l.efficiency!,
          }));
        setData(chartData);
      });
  }, [selectedVehicleId, refreshKey]);

  if (data.length < 2) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        연비 그래프는 주유 기록 2건 이상부터 표시됩니다
      </p>
    );
  }

  return (
    <div className="h-52 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11 }}
            className="fill-muted-foreground"
          />
          <YAxis
            tick={{ fontSize: 11 }}
            className="fill-muted-foreground"
            unit=" km/L"
          />
          <Tooltip
            formatter={(value) => [`${value} km/L`, "연비"]}
            contentStyle={{
              borderRadius: "8px",
              fontSize: "13px",
              border: "1px solid var(--border)",
            }}
          />
          <Line
            type="monotone"
            dataKey="efficiency"
            stroke="var(--primary)"
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
