## End-to-end platform smoke test

I'll drive the live preview with Playwright as a real signed-in user and verify every critical flow works — UI renders, server functions return data, writes persist, guards redirect.

### Test account
Use the existing `test@genesyx.app` / `GenesyxTest2026!` account created earlier.

### Coverage

**Public / marketing**
- `/` splash + desktop intro renders
- `/approach`, `/trust`, `/privacy`, `/terms`, `/support`, `/health-disclaimer` load with proper `<h1>` and meta

**Auth**
- `/auth` sign-in with test account → redirects to `/app`
- Guest visiting `/app` → redirected to `/auth?redirect=/app`
- Sign-out from header → returns to `/auth`

**Dashboard `/app` (overview)**
- KPIs render with real numbers from tracking engine
- `HydrationRingCard`, `PhNudgeCard`, `FirstRunCard` behave correctly for the test user
- Light mode is default; theme toggle flips and persists

**Trackers `/app/track/*`**
- Hydration: log water, ring updates, streak recomputes
- Vaginal pH: add a reading (4.5–9.0), appears in list + insights
- Cycle: settings dialog saves, phase reflects
- Sleep, Symptoms, Nutrition: log entries save
- Verify server functions (`listDailyLogsFull`, `listPhReadings`, `getCycleSettings`, `getHydrationGoal`) return 200

**Log History `/app/history`**
- Merged daily + pH entries render newest-first

**Insights `/app/insights`**
- Charts render for signed-in user (pH trend, hydration bars, symptom heatmap)
- Supplement adherence + weekly summary populate
- Signed-out preview state still works

**Learn `/app/learn`**
- Category filters, search, article detail page render from `articles.json`
- Medical disclaimer present on articles

**Profile `/app/profile`**
- Account info loads
- `/app/profile/reminders` toggles save to `reminder_preferences`
- Partner section renders (invite flow is known partial — will just verify UI)

**Backend health**
- Query Supabase for row counts on `daily_logs`, `ph_readings`, `cycle_settings`, `profiles`, `reminder_preferences` for the test user after writes
- Run the tracking-engine vector test suite (`vitest run engine.test`) — expect 16/16
- Check console + network for any 4xx/5xx during the flow

### Deliverable

A per-area verdict table using your 5-state schema:
1. real & working, 2. fake/static, 3. partial, 4. blocked by backend, 5. unsafe to launch.
Plus screenshots of any failures and the exact fix needed (no fixes applied in this pass — audit only).

### Out of scope for this pass
- Google OAuth (needs provider config check separately)
- Email delivery (custom domain DNS — external)
- Partner invite acceptance across two accounts
- Payments / Shopify (not enabled)

Approve and I'll run the audit and report back.