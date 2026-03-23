// Tag: core
// Path: /Users/hodduk/Documents/git/gearlog/components/vehicles/vehicle-form.tsx

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useVehicleStore } from "@/lib/store/vehicle-store";

const FUEL_TYPES = [
  { value: "GASOLINE", label: "가솔린" },
  { value: "DIESEL", label: "디젤" },
  { value: "HYBRID", label: "하이브리드" },
] as const;

export function VehicleForm({ onSuccess }: { onSuccess?: () => void }) {
  const addVehicle = useVehicleStore((s) => s.addVehicle);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const body = {
      name: form.get("name"),
      year: Number(form.get("year")),
      fuelType: form.get("fuelType"),
      licensePlate: form.get("licensePlate") || null,
      currentMileage: Number(form.get("currentMileage")),
      purchasePrice: form.get("purchasePrice")
        ? Number(form.get("purchasePrice"))
        : null,
    };

    try {
      const res = await fetch("/api/vehicles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "등록 실패");
      }

      const vehicle = await res.json();
      addVehicle(vehicle);
      e.currentTarget.reset();
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="name" className={labelClass}>
          차량명 *
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          placeholder="예: 아반떼 CN7"
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="year" className={labelClass}>
            연식 *
          </label>
          <input
            id="year"
            name="year"
            type="number"
            required
            placeholder="2024"
            min={1990}
            max={new Date().getFullYear() + 1}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="fuelType" className={labelClass}>
            연료타입 *
          </label>
          <select id="fuelType" name="fuelType" required className={inputClass}>
            {FUEL_TYPES.map((ft) => (
              <option key={ft.value} value={ft.value}>
                {ft.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="licensePlate" className={labelClass}>
          번호판
        </label>
        <input
          id="licensePlate"
          name="licensePlate"
          type="text"
          placeholder="12가 3456"
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="currentMileage" className={labelClass}>
            현재 주행거리 (km) *
          </label>
          <input
            id="currentMileage"
            name="currentMileage"
            type="number"
            required
            placeholder="50000"
            min={0}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="purchasePrice" className={labelClass}>
            구매가 (만원)
          </label>
          <input
            id="purchasePrice"
            name="purchasePrice"
            type="number"
            placeholder="2500"
            min={0}
            className={inputClass}
          />
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "등록 중..." : "차량 등록"}
      </Button>
    </form>
  );
}
