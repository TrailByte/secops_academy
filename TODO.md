# SecOps Academy — TODO

_Last updated: this session. Stack: React + Express + Drizzle + PostgreSQL + Wouter. Run → `localhost:5000`._

## Done (this session)
- **Badges/achievements system** — `lib/achievements.ts` (pure logic, 14 achievements, 4 tiers) + `components/AchievementsPanel.tsx`, wired into `Home.tsx`. Fully computed client-side, no DB changes.

## High priority
- [ ] **Populate Learning Paths with proper content.** Currently placeholder/test data.
- [ ] **Nav layout fix** — logo / links / rank badge centering στο `Layout.tsx` δεν κεντράρει σωστά (`w-full px-8` + flex-1, αλλά κάτι ακόμα χαλάει σε μικρές οθόνες).

## Backlog
- [ ] **Android Security content review** — έλεγχος των 4 android modules (Overview, App Sandbox, Permissions, SELinux) + του AVC challenge.
- [ ] **Streak system** — `STREAK_7_DAY_BONUS: 200` ορίζεται ήδη στο `ranks.ts` αλλά δεν είναι wired. Χρειάζεται tracking ημερών δραστηριότητας (από `completedAt` ή νέο πεδίο).
- [ ] **Dashboard background** — scanlines + grain (option B, αποφασισμένο).

## Nice-to-have
- [ ] Standalone `/achievements` route (πέρα από το dashboard panel) + "achievement unlocked" toast όταν ξεκλειδώνει κάποιο.
- [ ] **DB backup** — `pg_dump` script ώστε να μη χαθεί ξανά περιεχόμενο αν σβηστεί το volume.
- [ ] Επιβεβαίωση ότι όλα τα seed scripts είναι στο git (reproducible DB από clean clone).

## Reference — fresh DB from scratch
```bash
docker compose up -d
npm run db:push
npx tsx script/seed-learning-paths.ts
npx tsx script/seed-malware-analysis.ts
npx tsx script/seed-android-security.ts
npx tsx script/link-android.ts
npm run dev          # → localhost:5000
```