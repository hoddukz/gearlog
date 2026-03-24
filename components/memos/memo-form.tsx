// Tag: core
// Path: /Users/hodduk/Documents/git/gearlog/components/memos/memo-form.tsx

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

export function MemoForm({ onSuccess }: { onSuccess?: () => void }) {
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
      content: form.get("content"),
    };

    try {
      const res = await fetch("/api/maintenance-memos", {
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

      <div>
        <label htmlFor="content" className={labelClass}>
          내용 *
        </label>
        <textarea
          id="content"
          name="content"
          required
          rows={3}
          placeholder="예: 브레이크 패드 마모 심함, 다음 정비 시 교환 필요"
          className={inputClass}
        />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "등록 중..." : "메모 등록"}
      </Button>
    </form>
  );
}
