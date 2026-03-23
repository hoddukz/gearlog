// Tag: core
// Path: /Users/hodduk/Documents/git/gearlog/app/(auth)/login/page.tsx

import { LoginButton } from "@/components/auth/login-button";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        {/* Branding */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Gearlog
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            내 차량 관리를 한 곳에서
          </p>
        </div>

        {/* Login card */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="mb-1 text-base font-semibold text-card-foreground">
            로그인
          </h2>
          <p className="mb-6 text-sm text-muted-foreground">
            Google 계정으로 간편하게 시작하세요
          </p>

          <LoginButton />
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          계속 진행하면 서비스 이용약관 및 개인정보 처리방침에 동의하는 것으로
          간주됩니다.
        </p>
      </div>
    </div>
  );
}
