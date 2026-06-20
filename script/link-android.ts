/**
 * Links Android Security lessons + challenges to their learning path.
 * Robust: matches by category, not hardcoded ids.
 * Run with: npx tsx script/link-android.ts
 */
import { db } from "../server/db";
import { lessons, challenges } from "../shared/schema";
import { eq } from "drizzle-orm";

async function run() {
  await db.update(lessons)
    .set({ learningPathSlug: "android-security" })
    .where(eq(lessons.category, "android-security"));

  await db.update(challenges)
    .set({ learningPathSlug: "android-security" })
    .where(eq(challenges.category, "android-security"));

  console.log("✓ Linked android-security lessons + challenges to path");
  process.exit(0);
}

run().catch((e) => { console.error(e); process.exit(1); });
