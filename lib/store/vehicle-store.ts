// Tag: core
// Path: /Users/hodduk/Documents/git/gearlog/lib/store/vehicle-store.ts

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Vehicle = {
  id: string;
  userId: string;
  name: string;
  year: number;
  fuelType: "GASOLINE" | "DIESEL" | "HYBRID";
  licensePlate: string | null;
  currentMileage: number;
  purchasePrice: number | null;
  createdAt: string;
};

type VehicleStore = {
  vehicles: Vehicle[];
  selectedVehicleId: string | null;
  setVehicles: (vehicles: Vehicle[]) => void;
  selectVehicle: (id: string) => void;
  addVehicle: (vehicle: Vehicle) => void;
  selectedVehicle: () => Vehicle | undefined;
  reset: () => void;
};

export const useVehicleStore = create<VehicleStore>()(
  persist(
    (set, get) => ({
      vehicles: [],
      selectedVehicleId: null,

      setVehicles: (vehicles) => {
        set({ vehicles });
        // 선택된 차량이 없거나 목록에 없으면 첫 번째 차량 자동 선택
        const { selectedVehicleId } = get();
        if (
          vehicles.length > 0 &&
          (!selectedVehicleId ||
            !vehicles.find((v) => v.id === selectedVehicleId))
        ) {
          set({ selectedVehicleId: vehicles[0].id });
        }
      },

      selectVehicle: (id) => set({ selectedVehicleId: id }),

      addVehicle: (vehicle) => {
        const { vehicles } = get();
        set({
          vehicles: [...vehicles, vehicle],
          selectedVehicleId: vehicle.id,
        });
      },

      selectedVehicle: () => {
        const { vehicles, selectedVehicleId } = get();
        return vehicles.find((v) => v.id === selectedVehicleId);
      },

      reset: () => set({ vehicles: [], selectedVehicleId: null }),
    }),
    {
      name: "gearlog-vehicle",
      partialize: (state) => ({
        selectedVehicleId: state.selectedVehicleId,
      }),
    }
  )
);
