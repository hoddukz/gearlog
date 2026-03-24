// Tag: core
// Path: /Users/hodduk/Documents/git/gearlog/app/schedule/page.tsx

"use client";

import { ScheduleList } from "@/components/maintenance/schedule-list";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function SchedulePage() {
  return (
    <div className="mx-auto w-full max-w-screen-md px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">
          소모품 교체 주기
        </h1>
        <div className="flex gap-2">
          <Link href="/">
            <Button variant="ghost" size="sm">
              대시보드
            </Button>
          </Link>
          <Link href="/maintenance">
            <Button variant="outline" size="sm">
              정비 기록
            </Button>
          </Link>
        </div>
      </div>

      <p className="mb-4 text-xs text-muted-foreground">
        차량 연료타입 기준 기본 교체 주기입니다. 정비 기록을 등록하면 자동으로
        반영됩니다.
      </p>

      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <ScheduleList />
      </div>
    </div>
  );
}
