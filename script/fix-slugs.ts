import { db } from "../server/db";
import { lessons, challenges } from "../shared/schema";
import { isNull } from "drizzle-orm";

async function run() {
  await db.update(lessons).set({ learningPathSlug: "malware-analysis" }).where(isNull(lessons.learningPathSlug));
  await db.update(challenges).set({ learningPathSlug: "malware-analysis" }).where(isNull(challenges.learningPathSlug));
  console.log("Done");
  process.exit(0);
}

run().catch(console.error);
