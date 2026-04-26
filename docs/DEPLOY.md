# Deployment

## Production

- **URL**: https://spark-code-mu.vercel.app
- **Vercel project**: `gskaz224-gmailcoms-projects/spark-code`
- **Region**: `iad1` (default Vercel)
- **Framework**: Next.js 16.2.4 (Turbopack), Node runtime

## How to redeploy

```bash
# from project root
vercel deploy --prod --yes
```

The first push to `main` after `vercel link` will also trigger a deploy
once Git integration is hooked up (not configured yet — manual `vercel
deploy` is the source of truth).

## Required environment variables

Set on Vercel via `vercel env add <NAME> production --sensitive`. All
four must be present for `/lesson/1` to fully work; missing Supabase
keys silently disable event logging but the lesson UI still runs.

| Name | Source | Notes |
|------|--------|-------|
| `ANTHROPIC_API_KEY` | https://console.anthropic.com → Settings → API Keys | Used by `/api/chat`. |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase dashboard → Project Settings → API | Public; embedded in client bundle. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase dashboard → Project Settings → API Keys → `anon` | Public; RLS guards the table. |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase dashboard → Project Settings → API Keys → `service_role` | **Secret.** Server-side only via `lib/supabase-server.ts` (`import "server-only"`). |

To verify what's set: `vercel env ls production`.

## Smoke checklist (post-deploy)

```bash
DEPLOY=https://spark-code-mu.vercel.app
curl -s -o /dev/null -w "%{http_code}\n" "$DEPLOY/"            # 307 → /lesson/1
curl -s -o /dev/null -w "%{http_code}\n" "$DEPLOY/lesson/1"    # 200
# regex-only judge fail (no Claude call):
curl -s -X POST "$DEPLOY/api/chat" -H "Content-Type: application/json" \
  -d '{"type":"judge","stepId":"1-1","code":""}'
# real Claude call:
curl -s -X POST "$DEPLOY/api/chat" -H "Content-Type: application/json" \
  -d '{"type":"judge","stepId":"1-1","code":"<h1>名前</h1>"}'
```

## Supabase

- **Project**: `spark_code` (`afuimkulijxyyuqyrqem`)
- **Region**: `ap-southeast-1`
- **Tables**: `public.learning_events` (see `supabase/migrations/`)

The application uses two clients:
- [lib/supabase-client.ts](../lib/supabase-client.ts) — anon key, currently
  unused at runtime (writes route through `/api/log`)
- [lib/supabase-server.ts](../lib/supabase-server.ts) — service_role,
  bypasses RLS, server-only
