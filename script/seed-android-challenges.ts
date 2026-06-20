/**
 * Seed script: Android Security — Original CTF challenges
 * 6 original challenges spanning UID isolation, permissions, exported
 * components, content URIs, a holistic sandbox review, and confused-deputy
 * PendingIntent risks. Every flag is a literal token extractable from its
 * own artifact (UID, component name, code constant, finding label) —
 * no invented/summarized flags.
 * Run with: npx tsx script/seed-android-challenges.ts
 *
 * Re-runnable: clears any existing challenge with matching title first.
 */
import { db } from "../server/db";
import { challenges } from "../shared/schema";
import { eq } from "drizzle-orm";

async function clearExisting(titles: string[]) {
  for (const title of titles) {
    await db.delete(challenges).where(eq(challenges.title, title));
  }
}

async function seed() {
  console.log("Seeding Android Security challenges...\n");

  await clearExisting(["UID Isolation Audit", "Suspicious Manifest Permissions", "Exported Component Exposure", "Content URI Over-Grant", "Sandbox Review Checklist: Spot the Violation", "Confused Deputy: PendingIntent Review"]);

  // -- UID Isolation Audit (Easy) --
  await db.insert(challenges).values({
    title: "UID Isolation Audit",
    description: "Two apps run on the same device under different Linux UIDs. One of them just tried to read the other's private database, and the kernel blocked it. Find the UID that owns the targeted file. Submit it as digits only.",
    difficulty: "Easy",
    category: "Android Security",
    flag: "10231",
    hints: ["Each installed app is assigned its own Linux UID at install time.", "Filesystem permission checks happen at the kernel level, comparing the caller's UID to the file owner's UID.", "The answer is written directly in the artifact: \"Owner of target file: UID ____\"."],
    artifact: "Installed apps and assigned UIDs:\n\ncom.example.wallet      -> UID 10231\ncom.example.weather     -> UID 10232\ncom.example.gallery     -> UID 10233\n\nObserved attempt:\n\nProcess: com.example.weather (running as UID 10232)\nAction:  open()\nTarget:  /data/data/com.example.wallet/databases/transactions.db\nOwner of target file: UID 10231",
    technicalContext: "The target file /data/data/com.example.wallet/databases/transactions.db is owned by UID 10231. com.example.weather runs as a different UID (10232) and is blocked by the kernel before Android's own framework logic is even involved. This is what makes UID isolation a kernel-enforced boundary rather than just an application-level convention.",
    learningPathSlug: "android-security",
  });

  // -- Suspicious Manifest Permissions (Easy) --
  await db.insert(challenges).values({
    title: "Suspicious Manifest Permissions",
    description: "A simple flashlight app's manifest lists several requested permissions. Find the one with no legitimate connection to toggling a camera LED. Submit the permission name in lowercase, without the \"android.permission.\" prefix (e.g. \"camera\").",
    difficulty: "Easy",
    category: "Android Security",
    flag: "read_contacts",
    hints: ["Ask: does this permission have any plausible link to toggling a camera LED?", "CAMERA is expected here. INTERNET and ACCESS_FINE_LOCATION could weakly be argued (analytics, ads) even if undesirable.", "One permission in the list has zero plausible connection to a flashlight's function, no matter how you stretch the justification."],
    artifact: "App: SimpleFlashlight\nAdvertised function: Toggle the camera's LED flash on and off.\n\nAndroidManifest.xml (permissions section):\n\n<uses-permission android:name=\"android.permission.CAMERA\" />\n<uses-permission android:name=\"android.permission.INTERNET\" />\n<uses-permission android:name=\"android.permission.READ_CONTACTS\" />\n<uses-permission android:name=\"android.permission.ACCESS_FINE_LOCATION\" />",
    technicalContext: "READ_CONTACTS is the permission with no defensible connection to a flashlight app's stated function. CAMERA is expected and necessary. INTERNET and ACCESS_FINE_LOCATION are still worth questioning, but at least have weak justifications such as ad networks or analytics. Contact list access has no relationship at all to controlling an LED. During a permission review, the test is always the same: does this access map to the app's advertised function?",
    learningPathSlug: "android-security",
  });

  // -- Exported Component Exposure (Medium) --
  await db.insert(challenges).values({
    title: "Exported Component Exposure",
    description: "A manifest declares three components. One is reachable by any other app on the device without any permission check. Find it and submit its class name in lowercase, without the leading dot (e.g. \"myservice\").",
    difficulty: "Medium",
    category: "Android Security",
    flag: "backupsyncservice",
    hints: ["exported=\"false\" means the component cannot be reached by other apps at all -- rule that one out first.", "An exported component is only as safe as the access control placed on it.", "Compare the two exported components: only one of them declares an android:permission attribute."],
    artifact: "AndroidManifest.xml (components section):\n\n<activity\n    android:name=\".SettingsActivity\"\n    android:exported=\"false\" />\n\n<service\n    android:name=\".BackupSyncService\"\n    android:exported=\"true\" />\n\n<receiver\n    android:name=\".ConfigUpdateReceiver\"\n    android:exported=\"true\"\n    android:permission=\"com.example.app.permission.INTERNAL_CONFIG\" />",
    technicalContext: "BackupSyncService is exported (android:exported=\"true\") and declares no android:permission attribute, so Android performs no access check before allowing another app to interact with it. SettingsActivity is not reachable by other apps at all (exported=\"false\"). ConfigUpdateReceiver is also exported, but requires callers to hold a custom permission, which restricts who can reach it. An unprotected exported service that performs sensitive work (like sync or backup) is a realistic and common Android vulnerability pattern.",
    learningPathSlug: "android-security",
  });

  // -- Content URI Over-Grant (Medium) --
  await db.insert(challenges).values({
    title: "Content URI Over-Grant",
    description: "A document viewer shares a single PDF with an email app using a content URI grant. One of the granted flags gives the receiving app the ability to modify (not just read) the original file. Submit that flag's constant name in lowercase (e.g. \"flag_grant_read_uri_permission\").",
    difficulty: "Medium",
    category: "Android Security",
    flag: "flag_grant_write_uri_permission",
    hints: ["The action being performed is sharing a document so another app can read and display it.", "Three FLAG_GRANT_* constants are added. Only one of them grants the ability to change the file's contents.", "PERSISTABLE affects how long a grant lasts, not what it permits -- that's not the one you're looking for."],
    artifact: "// DocumentViewerApp.java -- sharing a single report with an email app\n\nUri reportUri = FileProvider.getUriForFile(\n    context,\n    \"com.example.docs.fileprovider\",\n    new File(documentsDir, \"report.pdf\")\n);\n\nIntent intent = new Intent(Intent.ACTION_SEND);\nintent.setType(\"application/pdf\");\nintent.putExtra(Intent.EXTRA_STREAM, reportUri);\nintent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);\nintent.addFlags(Intent.FLAG_GRANT_WRITE_URI_PERMISSION);\nintent.addFlags(Intent.FLAG_GRANT_PERSISTABLE_URI_PERMISSION);\n\nstartActivity(Intent.createChooser(intent, \"Share report\"));",
    technicalContext: "FLAG_GRANT_WRITE_URI_PERMISSION lets the receiving app modify or overwrite the original file through the content URI, which is unnecessary for simply sharing a PDF for viewing. FLAG_GRANT_PERSISTABLE_URI_PERMISSION is also broader than needed (it lets the grant outlive the current operation), but it controls duration, not capability. The secure version of this code would request only FLAG_GRANT_READ_URI_PERMISSION.",
    learningPathSlug: "android-security",
  });

  // -- Sandbox Review Checklist: Spot the Violation (Medium) --
  await db.insert(challenges).values({
    title: "Sandbox Review Checklist: Spot the Violation",
    description: "A security review produced four numbered findings. Three describe correct, non-issue behavior. One represents a real sandbox-boundary violation. Submit the finding number in the format \"finding_N\" (e.g. \"finding_1\").",
    difficulty: "Medium",
    category: "Android Security",
    flag: "finding_2",
    hints: ["Three of these findings describe completely normal, correctly-implemented behavior.", "App-private storage is normally protected by UID-based file ownership -- but file permission bits are a separate, additional layer.", "-rw-rw-rw- means readable and writable by owner, group, AND others."],
    artifact: "Review findings for com.example.notesapp:\n\nFinding 1:\nSession tokens are stored in /data/data/com.example.notesapp/shared_prefs/session.xml\n\nFinding 2:\nThe app's internal SQLite database file at\n/data/data/com.example.notesapp/databases/notes.db\nhas file permissions set to: -rw-rw-rw-\n\nFinding 3:\nThe app uses explicit intents (targeting its own package and class names)\nto navigate between its own internal activities.\n\nFinding 4:\nThe app requests RECORD_AUDIO permission, used only inside its\n\"voice memo\" recording feature.",
    technicalContext: "Finding 2 is the real violation. Even though notes.db sits inside the app's private data directory, its file mode -rw-rw-rw- makes it readable and writable by any local user or process, not just the app's own UID -- undermining the UID-based protection that app-private storage normally relies on. Findings 1, 3, and 4 all describe correct practice: storing session data in app-private storage, using explicit intents for internal navigation, and requesting a permission that matches an actual, related feature.",
    learningPathSlug: "android-security",
  });

  // -- Confused Deputy: PendingIntent Review (Hard) --
  await db.insert(challenges).values({
    title: "Confused Deputy: PendingIntent Review",
    description: "A banking app hands a PendingIntent to a third-party payment-helper app so it can confirm a transfer later. One flag passed when building the PendingIntent allows the receiving app to modify its contents before it fires. Submit that flag's constant name in lowercase (e.g. \"flag_immutable\").",
    difficulty: "Hard",
    category: "Android Security",
    flag: "flag_mutable",
    hints: ["A PendingIntent lets another app perform an action later, using the creator app's identity and authority.", "The underlying Intent is also implicit (no explicit target component) -- a second issue, but not the one being asked for here.", "Look at the flag passed as the last argument to PendingIntent.getBroadcast(). What does it allow the holder to do?"],
    artifact: "// BankApp.java -- handing a confirmation action to an external helper app\n\nIntent intent = new Intent();\nintent.setAction(\"com.example.bank.ACTION_CONFIRM_TRANSFER\");\nintent.putExtra(\"amount\", requestedAmount);\nintent.putExtra(\"destinationAccount\", destinationAccount);\n\nPendingIntent confirmationIntent = PendingIntent.getBroadcast(\n    context,\n    0,\n    intent,\n    PendingIntent.FLAG_MUTABLE\n);\n\n// Handed off to a third-party app the user installed separately\nexternalPaymentHelper.attachConfirmationIntent(confirmationIntent);",
    technicalContext: "PendingIntent.FLAG_MUTABLE allows the receiving app (the external payment helper) to modify the underlying Intent's extras -- including amount and destinationAccount -- before it is ultimately fired with BankApp's own authority. Combined with the implicit Intent (which doesn't pin down a specific target component either), this hands a third-party app the ability to alter a money-transfer confirmation that executes using the bank app's permissions: a textbook confused deputy pattern. The safer version uses FLAG_IMMUTABLE together with an explicit Intent.",
    learningPathSlug: "android-security",
  });

  console.log("✓ Seeded 6 Android Security challenges.");
  process.exit(0);
}

seed().catch((e) => { console.error(e); process.exit(1); });