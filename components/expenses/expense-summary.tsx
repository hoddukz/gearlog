// Tag: core
// Path: /Users/hodduk/Documents/git/gearlog/components/expenses/expense-summary.tsx

"use client";

import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";
import { useVehicleStore } from "@/lib/store/vehicle-store";

type Summary = {
  grandTotal: number;
  fuelTotal: number;
  maintenanceTotal: number;
  expenseTotal: number;
  categories: { name: string; amount: number }[];
  purchasePrice: number;
  totalCostOfOwnership: number;
  costPerKm: number | null;
  currentMileage: number;
};

const COLORS = [
  "var(--primary)",
  "#f59e0b",
  "#ef4444",
  "#10b981",
  "#8b5cf6",
  "#6366f1",
];

export function ExpenseSummary({ refreshKey }: { refreshKey: number }) {
  const selectedVehicleId = useVehicleStore((s) => s.selectedVehicleId);
  const [summary, setSummary] = useState<Summary | null>(null);

  useEffect(() => {
    if (!selectedVehicleId) return;
    fetch(`/api/expenses/summary?vehicleId=${selectedVehicleId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.grandTotal !== undefined) setSummary(data);
      });
  }, [selectedVehicleId, refreshKey]);

  if (!selectedVehicleId) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        차량을 먼저 선택해주세요
      </p>
    );
  }

  if (!summary || summary.grandTotal === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        비용 데이터가 없습니다
      </p>
    );
  }

  return (
    <div>
      {/* 총 비용 */}
      <div className="mb-4 text-center">
        <p className="text-xs text-muted-foreground">총 비용</p>
        <p className="text-2xl font-bold text-foreground">
          {summary.grandTotal.toLocaleString()}원
        </p>
      </div>

      {/* 파이 차트 */}
      <div className="mx-auto h-48 w-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={summary.categories}
              dataKey="amount"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              innerRadius={40}
            >
              {summary.categories.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => [`${Number(value).toLocaleString()}원`]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* 카테고리별 목록 */}
      <div className="mt-4 space-y-2">
        {summary.categories.map((c, i) => (
          <div key={c.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: COLORS[i % COLORS.length] }}
              />
              <span className="text-sm text-foreground">{c.name}</span>
            </div>
            <span className="text-sm font-medium text-foreground">
              {c.amount.toLocaleString()}원
            </span>
          </div>
        ))}
      </div>

      {/* 총 소유비용 */}
      <div className="mt-6 border-t border-border pt-4">
        <h3 className="mb-3 text-sm font-medium text-muted-foreground">
          총 소유비용 (TCO)
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {summary.purchasePrice > 0 && (
            <div>
              <p className="text-xs text-muted-foreground">구매가</p>
              <p className="text-sm font-medium text-foreground">
                {summary.purchasePrice.toLocaleString()}원
              </p>
            </div>
          )}
          <div>
            <p className="text-xs text-muted-foreground">누적 유지비</p>
            <p className="text-sm font-medium text-foreground">
              {summary.grandTotal.toLocaleString()}원
            </p>
          </div>
          {summary.purchasePrice > 0 && (
            <div>
              <p className="text-xs text-muted-foreground">총 소유비용</p>
              <p className="text-sm font-bold text-foreground">
                {summary.totalCostOfOwnership.toLocaleString()}원
              </p>
            </div>
          )}
          {summary.costPerKm !== null && (
            <div>
              <p className="text-xs text-muted-foreground">km당 유지비</p>
              <p className="text-sm font-medium text-foreground">
                {summary.costPerKm.toLocaleString()}원/km
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
