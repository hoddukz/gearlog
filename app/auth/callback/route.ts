// Tag: core
// Path: /Users/hodduk/Documents/git/gearlog/app/auth/callback/route.ts

import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
    console.error("[auth/callback] exchangeCodeForSession error:", error);
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`);
  }

  console.error("[auth/callback] no code in URL, params:", searchParams.toString());
  // 코드가 없거나 세션 교환 실패 시 로그인 페이지로
  return NextResponse.redirect(`${origin}/login?error=no_code`);
}
