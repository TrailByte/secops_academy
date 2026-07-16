/**
 * Seed script: Android Security — APK static analysis challenges
 * Two challenges that ship a downloadable APK for hands-on analysis
 * (unzip / apktool / jadx / strings).
 *
 * The APK files live in client/public/files/challenges/ and are committed
 * to the repo, so they are baked into the Docker image.
 *
 * Run with: npx tsx script/seed-android-apk-challenges.ts
 * Re-runnable: clears existing challenges with matching titles first.
 */
import { db } from "../server/db";
import { challenges } from "../shared/schema";
import { eq } from "drizzle-orm";

const LP_SLUG = "android-security";

const CHALLENGE_TITLES = [
  "Leaked Resource Strings",
  "Hardcoded Credential in AuthManager",
];

async function seed() {
  console.log("Seeding Android APK challenges...\n");

  for (const title of CHALLENGE_TITLES) {
    await db.delete(challenges).where(eq(challenges.title, title));
  }

  // ── Challenge 1: flag in res/values/strings.xml ──
  await db.insert(challenges).values({
    title: "Leaked Resource Strings",
    description:
      "A notes app called LeakyNotes has been flagged during a routine security review. The APK is attached. Inspect its packaged resources to find a value that should never have been shipped in a release build. Submit it as the flag.",
    difficulty: "Easy",
    category: "Android Security",
    flag: "exposed_in_resources",
    hints: [
      "An APK is just a ZIP file. You can extract it with `unzip` or any archive tool.",
      "Android string resources live in `res/values/strings.xml` inside the APK.",
      "Not every string in that file belongs in a production release — look for ones that suggest internal tooling or debugging.",
    ],
    artifact: "",
    technicalContext:
      "The string resource `debug_api_key` was left in the shipped APK. Anything placed in res/values/strings.xml is trivially readable by anyone who downloads the app — `unzip`, `apktool d`, or even plain `strings` will reveal it. Resource files are not a secure storage location: they are not encrypted, not obfuscated by default, and survive into every release build. Secrets belong in the Android Keystore or on a server, never in app resources.",
    fileUrl: "/files/challenges/1783878404916-130688856-LeakyNotes.apk",
    fileName: "LeakyNotes.apk",
    learningPathSlug: LP_SLUG,
  });
  console.log("  ✓ Leaked Resource Strings");

  // ── Challenge 2: flag hardcoded in compiled bytecode ──
  await db.insert(challenges).values({
    title: "Hardcoded Credential in AuthManager",
    description:
      "TrailVault is a credential storage app. A static analysis scan flagged its AuthManager class for containing a sensitive value baked directly into the compiled bytecode. Decompile the APK, locate AuthManager, and find the token used to validate admin sessions. Submit it as the flag.",
    difficulty: "Medium",
    category: "Android Security",
    flag: "hardcoded_build_secret",
    hints: [
      "Use `jadx-gui` or the `jadx` CLI to decompile the APK into readable Java — look under `com.trailbyte.vault`.",
      "There is more than one hardcoded string in AuthManager. You are looking specifically for the one used in `validateToken()`.",
      "If you don't have jadx, `strings TrailVault.apk` will reveal all string constants in the DEX — but you'll need to work out which one is the right answer from context.",
    ],
    artifact: "",
    technicalContext:
      "The `ADMIN_TOKEN` constant in AuthManager is compiled directly into classes.dex and is recoverable with any decompiler. Compilation is not obfuscation: string constants survive intact in the DEX string pool, so `strings` alone exposes them, and jadx reconstructs readable Java showing exactly where each one is used. The decoy constants (`MASTER_KEY`, `SESSION_SALT`) illustrate a real review problem — finding a hardcoded string is easy, but determining which one actually guards the privileged path requires reading the code. Validation secrets must never live client-side; token verification belongs on a server the attacker cannot decompile.",
    fileUrl: "/files/challenges/1783878466481-443683781-TrailVault.apk",
    fileName: "TrailVault.apk",
    learningPathSlug: LP_SLUG,
  });
  console.log("  ✓ Hardcoded Credential in AuthManager");

  console.log("\n✓ APK challenges seeded.");
  process.exit(0);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
