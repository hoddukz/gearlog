<!-- Tag: docs -->
<!-- Path: /Users/hodduk/Documents/git/gearlog/docs/work_order/google-oauth-login.md -->

# Work Order: Google OAuth Login (Supabase Auth)

## Tasks

1. Create `app/(auth)/login/page.tsx`
   - Simple login page with Google login button
   - Mobile-first design (Tailwind CSS)
   - Show "Gearlog" branding
   - Tag: core

2. Create `app/auth/callback/route.ts`
   - Handle Supabase OAuth callback
   - Exchange code for session
   - Redirect to dashboard on success
   - Tag: core

3. Create `components/auth/login-button.tsx`
   - Client component ("use client")
   - Calls supabase.auth.signInWithOAuth({ provider: 'google' })
   - redirectTo: `${origin}/auth/callback`
   - Tag: core

4. Create `components/auth/logout-button.tsx`
   - Client component
   - Calls supabase.auth.signOut()
   - Redirects to /login after logout
   - Tag: core

5. Create `app/(dashboard)/page.tsx`
   - Replace the default Next.js page
   - Simple dashboard placeholder showing user email
   - Logout button
   - Tag: core

6. Create `app/(dashboard)/layout.tsx`
   - Server component that checks auth
   - Gets user from supabase server client
   - Passes user info down
   - Tag: core

7. Update `middleware.ts`
   - Keep existing session refresh logic
   - Add redirect: unauthenticated users → /login (except /login and /auth/callback)
   - Authenticated users on /login → redirect to /
   - Tag: core

## Notes
- Callback URL: `/auth/callback` (not inside route group)
- Login page URL: `/login` (inside (auth) route group)
- Use existing createClient from lib/supabase/client.ts and lib/supabase/server.ts
