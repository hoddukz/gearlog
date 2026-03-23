// Tag: core
// Path: /Users/hodduk/Documents/git/gearlog/components/vehicles/vehicle-selector.tsx

"use client";

import { useEffect } from "react";
import { useVehicleStore } from "@/lib/store/vehicle-store";

export function VehicleSelector() {
  const vehicles = useVehicleStore((s) => s.vehicles);
  const selectedVehicleId = useVehicleStore((s) => s.selectedVehicleId);
  const selectVehicle = useVehicleStore((s) => s.selectVehicle);
  const setVehicles = useVehicleStore((s) => s.setVehicles);

  useEffect(() => {
    fetch("/api/vehicles")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setVehicles(data);
        }
      });
  }, [setVehicles]);

  if (vehicles.length === 0) {
    return (
      <span className="text-xs text-muted-foreground">차량을 등록하세요</span>
    );
  }

  return (
    <select
      value={selectedVehicleId || ""}
      onChange={(e) => selectVehicle(e.target.value)}
      className="rounded-lg border border-border bg-background px-2 py-1 text-sm text-foreground focus:border-primary focus:outline-none"
    >
      {vehicles.map((v) => (
        <option key={v.id} value={v.id}>
          {v.name}
        </option>
      ))}
    </select>
  );
}
