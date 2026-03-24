// Tag: core
// Path: /Users/hodduk/Documents/git/gearlog/components/auth/logout-button.tsx

"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useVehicleStore } from "@/lib/store/vehicle-store";

export function LogoutButton() {
  const router = useRouter();
  const resetVehicleStore = useVehicleStore((s) => s.reset);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    resetVehicleStore();
    router.push("/login");
  }

  return (
    <button
      onClick={handleLogout}
      className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      로그아웃
    </button>
  );
}
