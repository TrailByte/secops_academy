import { db } from "../server/db";
import { lessons, challenges } from "../shared/schema";
import { inArray } from "drizzle-orm";

async function run() {
  await db.update(lessons)
    .set({ learningPathSlug: "android-security" })
    .where(inArray(lessons.id, [11, 12, 13, 14]));
  
  await db.update(challenges)
    .set({ learningPathSlug: "android-security" })
    .where(inArray(challenges.id, [8]));

  console.log("Done");
  process.exit(0);
}

run().catch(console.error);
