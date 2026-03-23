// Tag: core
// Path: /Users/hodduk/Documents/git/gearlog/components/vehicles/vehicle-list.tsx

"use client";

import { useVehicleStore, type Vehicle } from "@/lib/store/vehicle-store";

const FUEL_LABEL: Record<Vehicle["fuelType"], string> = {
  GASOLINE: "가솔린",
  DIESEL: "디젤",
  HYBRID: "하이브리드",
};

export function VehicleList() {
  const vehicles = useVehicleStore((s) => s.vehicles);
  const selectedVehicleId = useVehicleStore((s) => s.selectedVehicleId);
  const selectVehicle = useVehicleStore((s) => s.selectVehicle);

  if (vehicles.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        등록된 차량이 없습니다
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {vehicles.map((v) => (
        <button
          key={v.id}
          onClick={() => selectVehicle(v.id)}
          className={`w-full rounded-xl border p-4 text-left transition-colors ${
            v.id === selectedVehicleId
              ? "border-primary bg-primary/5"
              : "border-border bg-card hover:border-primary/40"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-medium text-foreground">{v.name}</span>
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              {FUEL_LABEL[v.fuelType]}
            </span>
          </div>
          <div className="mt-1 flex gap-3 text-xs text-muted-foreground">
            <span>{v.year}년식</span>
            <span>{v.currentMileage.toLocaleString()} km</span>
            {v.licensePlate && <span>{v.licensePlate}</span>}
          </div>
        </button>
      ))}
    </div>
  );
}
