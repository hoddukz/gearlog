// Tag: core
// Path: /Users/hodduk/Documents/git/gearlog/components/fuel/fuel-form.tsx

"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useVehicleStore } from "@/lib/store/vehicle-store";

type GasStation = {
  id: string;
  name: string;
  lastPricePerL: number | null;
};

export function FuelForm({ onSuccess }: { onSuccess?: () => void }) {
  const selectedVehicleId = useVehicleStore((s) => s.selectedVehicleId);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 자동 계산
  const [liters, setLiters] = useState("");
  const [pricePerL, setPricePerL] = useState("");
  const [totalCost, setTotalCost] = useState("");

  // 주유소 자동완성
  const [stations, setStations] = useState<GasStation[]>([]);
  const [stationName, setStationName] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // 주유소 목록 로드
  useEffect(() => {
    if (!selectedVehicleId) return;
    fetch(`/api/gas-stations?vehicleId=${selectedVehicleId}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setStations(data);
      });
  }, [selectedVehicleId]);

  // 리터 × 단가 → 총금액 자동 계산
  useEffect(() => {
    const l = parseFloat(liters);
    const p = parseFloat(pricePerL);
    if (!isNaN(l) && !isNaN(p) && l > 0 && p > 0) {
      setTotalCost(Math.round(l * p).toString());
    }
  }, [liters, pricePerL]);

  // 주유소 선택 시 최근 단가 채움
  function selectStation(station: GasStation) {
    setStationName(station.name);
    if (station.lastPricePerL && !pricePerL) {
      setPricePerL(station.lastPricePerL.toString());
    }
    setShowSuggestions(false);
  }

  // 외부 클릭 시 자동완성 닫기
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filteredStations = stations.filter((s) =>
    s.name.toLowerCase().includes(stationName.toLowerCase())
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedVehicleId) return;
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const body = {
      vehicleId: selectedVehicleId,
      date: form.get("date"),
      mileage: Number(form.get("mileage")),
      liters: parseFloat(liters),
      pricePerL: parseFloat(pricePerL),
      totalCost: parseFloat(totalCost),
      stationName: stationName || null,
      notes: form.get("notes") || null,
    };

    try {
      const res = await fetch("/api/fuel-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "등록 실패");
      }

      // 폼 초기화
      setLiters("");
      setPricePerL("");
      setTotalCost("");
      setStationName("");
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
          <label htmlFor="mileage" className={labelClass}>
            주행거리 (km) *
          </label>
          <input
            id="mileage"
            name="mileage"
            type="number"
            required
            placeholder="55000"
            min={0}
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label htmlFor="liters" className={labelClass}>
            주유량 (L) *
          </label>
          <input
            id="liters"
            type="number"
            step="0.01"
            required
            placeholder="45.5"
            min={0}
            value={liters}
            onChange={(e) => setLiters(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="pricePerL" className={labelClass}>
            단가 (원/L) *
          </label>
          <input
            id="pricePerL"
            type="number"
            required
            placeholder="1650"
            min={0}
            value={pricePerL}
            onChange={(e) => setPricePerL(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="totalCost" className={labelClass}>
            총금액 (원)
          </label>
          <input
            id="totalCost"
            type="number"
            placeholder="자동 계산"
            min={0}
            value={totalCost}
            onChange={(e) => setTotalCost(e.target.value)}
            className={`${inputClass} bg-muted/50`}
          />
        </div>
      </div>

      {/* 주유소 자동완성 */}
      <div className="relative" ref={suggestionsRef}>
        <label htmlFor="stationName" className={labelClass}>
          주유소명
        </label>
        <input
          id="stationName"
          type="text"
          placeholder="주유소 이름 입력"
          value={stationName}
          onChange={(e) => {
            setStationName(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          className={inputClass}
        />
        {showSuggestions && filteredStations.length > 0 && (
          <div className="absolute z-10 mt-1 w-full rounded-lg border border-border bg-card shadow-md">
            {filteredStations.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => selectStation(s)}
                className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-muted"
              >
                <span>{s.name}</span>
                {s.lastPricePerL && (
                  <span className="text-xs text-muted-foreground">
                    최근 {s.lastPricePerL.toLocaleString()}원/L
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        <label htmlFor="notes" className={labelClass}>
          메모
        </label>
        <input
          id="notes"
          name="notes"
          type="text"
          placeholder="셀프 주유, 할인 등"
          className={inputClass}
        />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "등록 중..." : "주유 기록 등록"}
      </Button>
    </form>
  );
}
