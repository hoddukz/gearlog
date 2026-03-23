// Tag: core
// Path: /Users/hodduk/Documents/git/gearlog/app/vehicles/page.tsx

"use client";

import { useState } from "react";
import { VehicleForm } from "@/components/vehicles/vehicle-form";
import { VehicleList } from "@/components/vehicles/vehicle-list";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function VehiclesPage() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="mx-auto w-full max-w-screen-md px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">차량 관리</h1>
        <div className="flex gap-2">
          <Link href="/">
            <Button variant="ghost" size="sm">
              대시보드
            </Button>
          </Link>
          <Button size="sm" onClick={() => setShowForm(!showForm)}>
            {showForm ? "취소" : "차량 등록"}
          </Button>
        </div>
      </div>

      {showForm && (
        <div className="mb-6 rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h2 className="mb-4 text-base font-medium text-card-foreground">
            새 차량 등록
          </h2>
          <VehicleForm onSuccess={() => setShowForm(false)} />
        </div>
      )}

      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <h2 className="mb-4 text-base font-medium text-card-foreground">
          내 차량 목록
        </h2>
        <VehicleList />
      </div>
    </div>
  );
}
