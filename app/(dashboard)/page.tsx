// Tag: core
// Path: /Users/hodduk/Documents/git/gearlog/app/(dashboard)/page.tsx

import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/auth/logout-button";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card px-4 py-3">
        <div className="mx-auto flex max-w-screen-md items-center justify-between">
          <span className="text-lg font-bold tracking-tight text-foreground">
            Gearlog
          </span>
          <LogoutButton />
        </div>
      </header>

      {/* Main */}
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-screen-md">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h1 className="text-xl font-semibold text-card-foreground">
              대시보드
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {user?.email} 으로 로그인됨
            </p>
            <p className="mt-6 text-sm text-muted-foreground">
              차량 관리 기능은 준비 중입니다.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
