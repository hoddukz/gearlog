// Tag: core
// Path: /Users/hodduk/Documents/git/gearlog/app/expenses/page.tsx

"use client";

import { useState } from "react";
import { ExpenseForm } from "@/components/expenses/expense-form";
import { ExpenseSummary } from "@/components/expenses/expense-summary";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ExpensesPage() {
  const [showForm, setShowForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="mx-auto w-full max-w-screen-md px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">비용 현황</h1>
        <div className="flex gap-2">
          <Link href="/">
            <Button variant="ghost" size="sm">
              대시보드
            </Button>
          </Link>
          <Button size="sm" onClick={() => setShowForm(!showForm)}>
            {showForm ? "취소" : "비용 등록"}
          </Button>
        </div>
      </div>

      {showForm && (
        <div className="mb-6 rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h2 className="mb-4 text-base font-medium text-card-foreground">
            새 비용 등록
          </h2>
          <p className="mb-3 text-xs text-muted-foreground">
            보험, 세금 등 주유/정비 외 비용을 기록합니다. 주유/정비 비용은 자동
            집계됩니다.
          </p>
          <ExpenseForm
            onSuccess={() => {
              setShowForm(false);
              setRefreshKey((k) => k + 1);
            }}
          />
        </div>
      )}

      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <h2 className="mb-4 text-base font-medium text-card-foreground">
          카테고리별 비용
        </h2>
        <ExpenseSummary refreshKey={refreshKey} />
      </div>
    </div>
  );
}
