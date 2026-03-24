// Tag: core
// Path: /Users/hodduk/Documents/git/gearlog/components/maintenance/maintenance-form.tsx

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useVehicleStore } from "@/lib/store/vehicle-store";

const CATEGORIES = [
  "엔진",
  "타이어",
  "브레이크",
  "전기",
  "오일류",
  "냉각",
  "서스펜션",
  "기타",
];

export function MaintenanceForm({ onSuccess }: { onSuccess?: () => void }) {
  const selectedVehicleId = useVehicleStore((s) => s.selectedVehicleId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedVehicleId) return;
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const body = {
      vehicleId: selectedVehicleId,
      date: form.get("date"),
      category: form.get("category"),
      item: form.get("item"),
      cost: Number(form.get("cost")),
      mileage: Number(form.get("mileage")),
      shopName: form.get("shopName") || null,
      notes: form.get("notes") || null,
    };

    try {
      const res = await fetch("/api/maintenance-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "등록 실패");
      }

      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "등록 실패");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary";
  const labelClass = "block text-sm font-medium text-foreground mb-1";

  if (!selectedVehicleId) {
    return (
      <p className="text-sm text-muted-foreground">차량을 먼저 선택해주세요</p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="date" className={labelClass}>
            날짜 *
          </label>
          <input
            id="date"
            name="date"
            type="date"
            required
            defaultValue={new Date().toISOString().split("T")[0]}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="category" className={labelClass}>
            카테고리 *
          </label>
          <select id="category" name="category" required className={inputClass}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="item" className={labelClass}>
          정비 항목 *
        </label>
        <input
          id="item"
          name="item"
          type="text"
          required
          placeholder="예: 엔진오일 교환"
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="cost" className={labelClass}>
            비용 (원) *
          </label>
          <input
            id="cost"
            name="cost"
            type="number"
            required
            placeholder="80000"
            min={0}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="mileage" className={labelClass}>
            주행거리 (km) *
          </label>
          <input
            id="mileage"
            name="mileage"
            type="number"
            required
            placeholder="85000"
            min={0}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor="shopName" className={labelClass}>
          정비소명
        </label>
        <input
          id="shopName"
          name="shopName"
          type="text"
          placeholder="정비소 이름"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="notes" className={labelClass}>
          메모
        </label>
        <input
          id="notes"
          name="notes"
          type="text"
          placeholder="추가 메모"
          className={inputClass}
        />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "등록 중..." : "정비 기록 등록"}
      </Button>
    </form>
  );
}
