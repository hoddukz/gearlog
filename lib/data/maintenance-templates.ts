// Tag: core
// Path: /Users/hodduk/Documents/git/gearlog/lib/data/maintenance-templates.ts

export type MaintenanceTemplate = {
  item: string;
  category: string;
  intervalKm: number;
  intervalMonths: number;
};

// 연료타입별 소모품 교체 주기 템플릿
export const MAINTENANCE_TEMPLATES: Record<string, MaintenanceTemplate[]> = {
  GASOLINE: [
    { item: "엔진오일", category: "오일류", intervalKm: 7500, intervalMonths: 6 },
    { item: "에어필터", category: "엔진", intervalKm: 15000, intervalMonths: 12 },
    { item: "에어컨 필터", category: "기타", intervalKm: 15000, intervalMonths: 12 },
    { item: "점화플러그", category: "엔진", intervalKm: 30000, intervalMonths: 24 },
    { item: "브레이크 패드", category: "브레이크", intervalKm: 30000, intervalMonths: 24 },
    { item: "브레이크 오일", category: "브레이크", intervalKm: 40000, intervalMonths: 24 },
    { item: "미션오일", category: "오일류", intervalKm: 60000, intervalMonths: 48 },
    { item: "냉각수", category: "냉각", intervalKm: 40000, intervalMonths: 24 },
    { item: "타이어 교체", category: "타이어", intervalKm: 50000, intervalMonths: 36 },
  ],
  DIESEL: [
    { item: "엔진오일", category: "오일류", intervalKm: 10000, intervalMonths: 12 },
    { item: "에어필터", category: "엔진", intervalKm: 20000, intervalMonths: 12 },
    { item: "에어컨 필터", category: "기타", intervalKm: 15000, intervalMonths: 12 },
    { item: "연료필터", category: "엔진", intervalKm: 30000, intervalMonths: 24 },
    { item: "브레이크 패드", category: "브레이크", intervalKm: 30000, intervalMonths: 24 },
    { item: "브레이크 오일", category: "브레이크", intervalKm: 40000, intervalMonths: 24 },
    { item: "미션오일", category: "오일류", intervalKm: 60000, intervalMonths: 48 },
    { item: "냉각수", category: "냉각", intervalKm: 40000, intervalMonths: 24 },
    { item: "DPF 클리닝", category: "엔진", intervalKm: 80000, intervalMonths: 48 },
    { item: "타이어 교체", category: "타이어", intervalKm: 50000, intervalMonths: 36 },
  ],
  HYBRID: [
    { item: "엔진오일", category: "오일류", intervalKm: 10000, intervalMonths: 12 },
    { item: "에어필터", category: "엔진", intervalKm: 20000, intervalMonths: 12 },
    { item: "에어컨 필터", category: "기타", intervalKm: 15000, intervalMonths: 12 },
    { item: "브레이크 패드", category: "브레이크", intervalKm: 40000, intervalMonths: 30 },
    { item: "브레이크 오일", category: "브레이크", intervalKm: 40000, intervalMonths: 24 },
    { item: "미션오일", category: "오일류", intervalKm: 60000, intervalMonths: 48 },
    { item: "냉각수", category: "냉각", intervalKm: 40000, intervalMonths: 24 },
    { item: "타이어 교체", category: "타이어", intervalKm: 50000, intervalMonths: 36 },
  ],
};
