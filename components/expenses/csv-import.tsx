// Tag: core
// Path: /Users/hodduk/Documents/git/gearlog/components/expenses/csv-import.tsx

"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useVehicleStore } from "@/lib/store/vehicle-store";

const TYPES = [
  { value: "fuel", label: "주유 기록" },
  { value: "maintenance", label: "정비 기록" },
  { value: "expenses", label: "비용 기록" },
] as const;

export function CSVImport({ onSuccess }: { onSuccess?: () => void }) {
  const selectedVehicleId = useVehicleStore((s) => s.selectedVehicleId);
  const [type, setType] = useState("fuel");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    imported: number;
    skipped: number;
  } | null>(null);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleImport() {
    if (!selectedVehicleId) return;
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setError("파일을 선택해주세요");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("vehicleId", selectedVehicleId);
    formData.append("type", type);

    try {
      const res = await fetch("/api/import", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "가져오기 실패");
      }

      const data = await res.json();
      setResult(data);
      if (fileRef.current) fileRef.current.value = "";
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "가져오기 실패");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary";

  if (!selectedVehicleId) {
    return (
      <p className="text-sm text-muted-foreground">차량을 먼저 선택해주세요</p>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}
      {result && (
        <div className="rounded-lg bg-green-100 px-3 py-2 text-sm text-green-800 dark:bg-green-900/30 dark:text-green-400">
          {result.imported}건 가져옴{result.skipped > 0 && `, ${result.skipped}건 건너뜀`}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          데이터 유형
        </label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className={inputClass}
        >
          {TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          CSV 파일
        </label>
        <input
          ref={fileRef}
          type="file"
          accept=".csv"
          className={inputClass}
        />
        <p className="mt-1 text-xs text-muted-foreground">
          내보내기한 CSV 파일 또는 동일한 형식의 파일
        </p>
      </div>

      <Button className="w-full" onClick={handleImport} disabled={loading}>
        {loading ? "가져오는 중..." : "CSV 가져오기"}
      </Button>
    </div>
  );
}
