// Tag: core
// Path: /Users/hodduk/Documents/git/gearlog/components/layout/dashboard-header.tsx

"use client";

import Link from "next/link";
import { LogoutButton } from "@/components/auth/logout-button";
import { VehicleSelector } from "@/components/vehicles/vehicle-selector";

export function DashboardHeader({ email }: { email: string }) {
  return (
    <header className="border-b border-border bg-card px-4 py-3">
      <div className="mx-auto flex max-w-screen-md items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="text-lg font-bold tracking-tight text-foreground"
          >
            Gearlog
          </Link>
          <VehicleSelector />
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/memos"
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            메모
          </Link>
          <Link
            href="/vehicles"
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            차량 관리
          </Link>
          <span className="hidden text-xs text-muted-foreground sm:inline">
            {email}
          </span>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
