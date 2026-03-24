// Tag: core
// Path: /Users/hodduk/Documents/git/gearlog/components/expenses/expense-form.tsx

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useVehicleStore } from "@/lib/store/vehicle-store";

const CATEGORIES = [
  { value: "INSURANCE", label: "보험" },
  { value: "TAX", label: "세금" },
  { value: "OTHER", label: "기타" },
] as const;

export function ExpenseForm({ onSuccess }: { onSuccess?: () => void }) {
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
      category: form.get("category"),
      date: form.get("date"),
      amount: Number(form.get("amount")),
      notes: form.get("notes") || null,
    };

    try {
      const res = await fetch("/api/expenses", {
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
          <label htmlFor="category" className={labelClass}>
            카테고리 *
          </label>
          <select id="category" name="category" required className={inputClass}>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
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
      </div>

      <div>
        <label htmlFor="amount" className={labelClass}>
          금액 (원) *
        </label>
        <input
          id="amount"
          name="amount"
          type="number"
          required
          placeholder="500000"
          min={0}
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
          placeholder="예: 자동차보험 연납"
          className={inputClass}
        />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "등록 중..." : "비용 등록"}
      </Button>
    </form>
  );
}
