// Tag: core
// Path: /Users/hodduk/Documents/git/gearlog/app/auth/callback/route.ts

import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const rawNext = searchParams.get("next") ?? "/";
  // 오픈 리다이렉트 방지: /로 시작하되 //가 아닌 내부 경로만 허용
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/";

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
