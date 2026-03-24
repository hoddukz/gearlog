// Tag: core
// Path: /Users/hodduk/Documents/git/gearlog/app/maintenance/page.tsx

"use client";

import { useState } from "react";
import { MaintenanceForm } from "@/components/maintenance/maintenance-form";
import { MaintenanceList } from "@/components/maintenance/maintenance-list";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function MaintenancePage() {
  const [showForm, setShowForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="mx-auto w-full max-w-screen-md px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">정비 이력</h1>
        <div className="flex gap-2">
          <Link href="/">
            <Button variant="ghost" size="sm">
              대시보드
            </Button>
          </Link>
          <Button size="sm" onClick={() => setShowForm(!showForm)}>
            {showForm ? "취소" : "정비 기록"}
          </Button>
        </div>
      </div>

      {showForm && (
        <div className="mb-6 rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h2 className="mb-4 text-base font-medium text-card-foreground">
            새 정비 기록
          </h2>
          <MaintenanceForm
            onSuccess={() => {
              setShowForm(false);
              setRefreshKey((k) => k + 1);
            }}
          />
        </div>
      )}

      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <h2 className="mb-4 text-base font-medium text-card-foreground">
          기록 목록
        </h2>
        <MaintenanceList refreshKey={refreshKey} />
      </div>
    </div>
  );
}
