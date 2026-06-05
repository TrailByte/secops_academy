/**
 * One-time migration: seed the two initial learning paths
 * Run ONCE with: npx tsx script/seed-learning-paths.ts
 * 
 * Then update existing lessons/challenges to set learningPathSlug.
 */
import { db } from "../server/db";
import { learningPaths, lessons, challenges } from "../shared/schema";
import { eq } from "drizzle-orm";

async function seed() {
  // 1. Create learning paths
  const [malware] = await db.insert(learningPaths).values({
    title: "Malware Analysis",
    slug: "malware-analysis",
    description: "Learn to analyze malicious software. From static PE analysis and string extraction to dynamic sandbox behavior, process injection, and C2 communication.",
    icon: "Bug",
    color: "blue",
    order: 1,
  }).returning();

  const [android] = await db.insert(learningPaths).values({
    title: "Android Security",
    slug: "android-security",
    description: "Understand how Android isolates applications and protects system resources. Covers the App Sandbox, runtime permissions, and SELinux enforcement.",
    icon: "Smartphone",
    color: "green",
    order: 2,
  }).returning();

  console.log(`✓ Created: ${malware.title} (slug: ${malware.slug})`);
  console.log(`✓ Created: ${android.title} (slug: ${android.slug})`);

  // 2. Assign existing lessons to malware-analysis path
  //    (all lessons that don't have an android-security category)
  const result1 = await db
    .update(lessons)
    .set({ learningPathSlug: "malware-analysis" })
    .where(eq(lessons.learningPathSlug, null as any));

  console.log(`✓ Assigned existing lessons → malware-analysis`);

  // 3. Assign existing challenges to malware-analysis path
  const result2 = await db
    .update(challenges)
    .set({ learningPathSlug: "malware-analysis" })
    .where(eq(challenges.learningPathSlug, null as any));

  console.log(`✓ Assigned existing challenges → malware-analysis`);
  console.log(`\nDone! Run the Android Security seed next.`);
}

seed().catch(console.error).finally(() => process.exit(0));
