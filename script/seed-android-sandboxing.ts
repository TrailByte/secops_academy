/**
 * Seed script: Android Security — Application Sandboxing module
 * Source: authored content (android_security_sandboxing_module.md), 10 lessons + 1 practical challenge.
 * Run with: npx tsx script/seed-android-sandboxing.ts
 *
 * Re-runnable: clears any existing lessons/quizzes/challenge with matching
 * slugs/title first, so running it again replaces rather than duplicates.
 */
import { db } from "../server/db";
import { lessons, quizzes, challenges, quizAnswers } from "../shared/schema";
import { eq, inArray } from "drizzle-orm";

const LESSON_SLUGS = [
  "android-application-sandboxing",
  "linux-uid-isolation-process-boundaries",
  "filesystem-isolation-app-private-storage",
  "permissions-controlled-sandbox-exceptions",
  "app-to-app-communication-sandbox-boundaries",
  "secure-file-sharing-content-uris",
  "platform-protections-strengthen-sandbox",
  "android-sandbox-review-checklist",
  "advanced-sandbox-boundary-cases",
  "advanced-ipc-security-pendingintents-uri-grants"
];
const CHALLENGE_TITLE = "Sandbox Boundary Review";

async function clearExisting() {
  const existing = await db.select({ id: lessons.id }).from(lessons).where(inArray(lessons.slug, LESSON_SLUGS));
  const ids = existing.map((r) => r.id);
  if (ids.length) {
    await db.delete(quizAnswers).where(inArray(quizAnswers.lessonId, ids));
    await db.delete(quizzes).where(inArray(quizzes.lessonId, ids));
    await db.delete(lessons).where(inArray(lessons.id, ids));
  }
  await db.delete(challenges).where(eq(challenges.title, CHALLENGE_TITLE));
  console.log(`Cleared ${ids.length} existing lesson(s) before reseed.`);
}

async function seed() {
  console.log("Seeding Android Security — Application Sandboxing module...\n");
  await clearExisting();

  // -- Lesson 01: 01. Android Application Sandboxing --
  const [l1] = await db.insert(lessons).values({
    title: "01. Android Application Sandboxing",
    slug: "android-application-sandboxing",
    content: "## Learning Objectives\n\nBy the end of this lesson, learners should be able to:\n\n- Explain what the Android Application Sandbox is.\n- Describe why Android isolates apps by default.\n- Understand the difference between default isolation and controlled access.\n- Recognize sandboxing as the foundation of Android application security.\n\n## Content\n\nAndroid Application Sandboxing is the security mechanism that isolates each app from other apps and from sensitive parts of the operating system.\n\nAndroid is designed around a strong default rule: an app should only access its own resources unless Android explicitly grants access to something else. This means one app cannot freely read another app's private data, change another app's internal files, or directly access protected system resources.\n\nThe sandbox reduces the impact of both accidental bugs and security vulnerabilities. If an app behaves incorrectly, Android limits what that app can access by default.\n\n### What the sandbox protects\n\nThe Android sandbox helps protect:\n\n- App-private data.\n- App runtime processes.\n- System resources.\n- User-sensitive information.\n- Other installed applications.\n- The operating system itself.\n\n### Default-deny mindset\n\nThe sandbox follows a default-deny model. Apps start with limited access. Access outside the sandbox must be granted, mediated, or explicitly exposed through Android-controlled mechanisms.\n\n```text\nApp installed -> App isolated -> App requests access -> Android mediates access\n```\n\n### Controlled exceptions\n\nApps can still interact with the system and with each other, but they should do so through controlled Android mechanisms such as:\n\n- Permissions.\n- Intents.\n- Services.\n- Broadcast receivers.\n- Content providers.\n- Binder IPC.\n- File sharing through content URIs.\n\nThe purpose of these mechanisms is not to remove sandboxing. Their purpose is to allow specific interactions while preserving security boundaries.\n\n## Summary\n\nAndroid sandboxing is the baseline security boundary for apps. It keeps applications isolated by default and forces sensitive interactions to go through Android-managed controls.",
    order: 1,
    category: "Android Security",
    difficulty: "Beginner",
    learningPathSlug: "android-security",
  }).returning();
  await db.insert(quizzes).values({
    lessonId: l1.id,
    question: "What is the main purpose of the Android Application Sandbox?",
    options: ["Faster app startup", "Shared private storage", "App isolation by default", "Automatic app signing"],
    correctAnswer: 2,
    explanation: "The sandbox isolates apps by default. Each app starts with limited access, and interactions outside that boundary must be mediated by Android-controlled mechanisms.",
  });

  // -- Lesson 02: 02. Linux UID Isolation and Process Boundaries --
  const [l2] = await db.insert(lessons).values({
    title: "02. Linux UID Isolation and Process Boundaries",
    slug: "linux-uid-isolation-process-boundaries",
    content: "## Learning Objectives\n\nBy the end of this lesson, learners should be able to:\n\n- Explain how Android uses Linux UIDs to isolate apps.\n- Understand why each app normally runs in its own process.\n- Describe why native code is still sandboxed.\n- Recognize UID isolation as a kernel-enforced boundary.\n\n## Content\n\nAndroid is built on the Linux kernel. Linux already has a mature security model based on users, groups, processes, and file permissions. Android uses these mechanisms to isolate applications.\n\nWhen an app is installed, Android assigns it a unique Linux user ID, usually called a UID. The app normally runs in its own Linux process under that UID.\n\nExample:\n\n```text\ncom.example.notes      -> UID 10123\ncom.example.calendar   -> UID 10124\ncom.example.camera     -> UID 10125\n```\n\nBecause each app runs as a different Linux user, the Linux kernel can enforce separation between apps.\n\n### Why UIDs matter\n\nUID isolation means Android security is not enforced only by the Android framework. It is also enforced by the Linux kernel.\n\nIf App A attempts to directly read App B's private files, the kernel checks whether App A's UID has permission to access those files. In normal conditions, it does not.\n\n```text\nApp A UID 10123 -> tries to read data owned by UID 10124 -> blocked\n```\n\n### Process boundaries\n\nEach app process runs under the app's UID. The process boundary helps separate:\n\n- App memory.\n- App runtime state.\n- App-specific execution context.\n- App-owned files and resources.\n\nAnother normal app cannot directly inspect or modify that process memory.\n\n### Native code is still sandboxed\n\nSome Android apps include native C or C++ code through JNI. Native code can introduce memory-safety risks, but it does not automatically escape the sandbox.\n\nNative code still runs:\n\n- Inside the app's process.\n- Under the app's UID.\n- Subject to the same sandbox restrictions.\n- Subject to platform hardening controls.\n\nThe language used to write the app does not remove the sandbox boundary.\n\n## Summary\n\nAndroid uses Linux UIDs and process separation to isolate apps. This makes application separation a kernel-enforced security boundary rather than only an application framework rule.",
    order: 2,
    category: "Android Security",
    difficulty: "Beginner",
    learningPathSlug: "android-security",
  }).returning();
  await db.insert(quizzes).values({
    lessonId: l2.id,
    question: "Which identifier supports Linux-level app separation on Android?",
    options: ["Package name", "Linux UID", "App label", "Intent filter"],
    correctAnswer: 1,
    explanation: "Android assigns apps Linux UIDs. The kernel uses those UIDs to help enforce process and filesystem separation between applications.",
  });

  // -- Lesson 03: 03. Filesystem Isolation and App-Private Storage --
  const [l3] = await db.insert(lessons).values({
    title: "03. Filesystem Isolation and App-Private Storage",
    slug: "filesystem-isolation-app-private-storage",
    content: "## Learning Objectives\n\nBy the end of this lesson, learners should be able to:\n\n- Identify common app-private storage paths.\n- Explain why other apps cannot normally access another app's private data.\n- Distinguish app-private storage from shared storage.\n- Recognize storage decisions that weaken sandbox boundaries.\n\n## Content\n\nEach Android app receives private storage areas for its own data. These directories are owned by the app's UID and are protected by filesystem permissions.\n\nCommon app-private paths include:\n\n```text\n/data/data/<package_name>/\n```\n\nand:\n\n```text\n/data/user/0/<package_name>/\n```\n\nFor example:\n\n```text\n/data/data/com.example.notes/\n```\n\nThis directory may contain:\n\n- SQLite databases.\n- Shared preferences.\n- Internal files.\n- Cache files.\n- App-specific configuration.\n- Session data.\n- User-created private content.\n\n### Example scenario\n\nA notes app stores private notes in:\n\n```text\n/data/data/com.example.notes/databases/notes.db\n```\n\nA separate calculator app runs as another UID:\n\n```text\ncom.example.calculator -> UID 10124\n```\n\nThe calculator app cannot directly read the notes database because it does not own the file and does not run as the notes app UID.\n\n### Internal storage vs shared storage\n\nApp-private internal storage is the right place for sensitive app data. Shared or external storage is different. Data placed in shared storage may be more exposed depending on Android version, storage model, file location, and permissions.\n\nSensitive data should not be placed casually in shared paths such as:\n\n```text\n/sdcard/\n```\n\nor:\n\n```text\n/storage/emulated/0/\n```\n\nunless the data is intended to be shared and is handled through the correct Android storage APIs.\n\n### Security issue example\n\n```text\n/data/data/com.example.notes/databases/notes.db      -> app-private\n/sdcard/notes_backup.txt                             -> higher exposure risk\n```\n\nThe first file is protected by the sandbox. The second file may expose sensitive content outside the app-private boundary.\n\n## Summary\n\nFilesystem isolation is one of the most visible parts of Android sandboxing. Private app data belongs in app-private directories, while shared storage must be treated carefully.",
    order: 3,
    category: "Android Security",
    difficulty: "Beginner",
    learningPathSlug: "android-security",
  }).returning();
  await db.insert(quizzes).values({
    lessonId: l3.id,
    question: "Which path usually represents app-private storage on Android?",
    options: ["/data/data/<package_name>/", "/sdcard/Android/media/", "/system/priv-app/<name>/", "/vendor/etc/permissions/"],
    correctAnswer: 0,
    explanation: "App-private data is commonly stored under paths such as `/data/data/<package_name>/` or `/data/user/0/<package_name>/`, where filesystem permissions and UID ownership protect it from other apps.",
  });

  // -- Lesson 04: 04. Permissions as Controlled Sandbox Exceptions --
  const [l4] = await db.insert(lessons).values({
    title: "04. Permissions as Controlled Sandbox Exceptions",
    slug: "permissions-controlled-sandbox-exceptions",
    content: "## Learning Objectives\n\nBy the end of this lesson, learners should be able to:\n\n- Explain how permissions relate to sandboxing.\n- Identify protected resources that require permissions.\n- Understand the difference between isolation and controlled access.\n- Recognize over-permissioned apps as a security concern.\n\n## Content\n\nSandboxing isolates an app by default. Permissions allow controlled access to protected resources outside the app's default sandbox.\n\nSandboxing answers:\n\n```text\nWhat is the app isolated from by default?\n```\n\nPermissions answer:\n\n```text\nWhat protected resources is the app allowed to access?\n```\n\nThese two controls work together.\n\n### Protected resources\n\nAndroid uses permissions to protect access to sensitive data and restricted actions, including:\n\n- Camera.\n- Microphone.\n- Contacts.\n- Location.\n- Calendar.\n- Bluetooth.\n- Notifications.\n- Phone state.\n- External storage or media collections.\n\nFor example, an app cannot simply access the camera because it is installed. It must request permission through the Android permission model.\n\n```xml\n<uses-permission android:name=\"android.permission.CAMERA\" />\n```\n\n### Permission types\n\nCommon permission categories include:\n\n- **Install-time permissions** — granted when the app is installed.\n- **Runtime permissions** — requested while the app is running.\n- **Special permissions** — powerful access controlled through dedicated settings.\n- **Signature permissions** — granted only when apps are signed with the same certificate as the app or platform defining the permission.\n\n### Suspicious permission example\n\nAssume a simple flashlight app requests:\n\n```xml\n<uses-permission android:name=\"android.permission.READ_CONTACTS\" />\n<uses-permission android:name=\"android.permission.RECORD_AUDIO\" />\n<uses-permission android:name=\"android.permission.ACCESS_FINE_LOCATION\" />\n<uses-permission android:name=\"android.permission.INTERNET\" />\n```\n\nThis does not automatically prove malicious behavior, but it is suspicious because the requested access does not match the app's advertised purpose.\n\n### Security review question\n\nWhen reviewing permissions, ask:\n\n```text\nDoes this app need this access to perform its advertised function?\n```\n\nIf the answer is no, the app may be over-permissioned and unnecessarily risky.\n\n## Summary\n\nPermissions create controlled exceptions to the Android sandbox. Good Android security requires both strong isolation and careful permission use.",
    order: 4,
    category: "Android Security",
    difficulty: "Beginner",
    learningPathSlug: "android-security",
  }).returning();
  await db.insert(quizzes).values({
    lessonId: l4.id,
    question: "How do sandboxing and permissions work together?",
    options: ["Permissions replace isolation", "UIDs are runtime prompts", "Sandbox only covers UI", "Isolation plus controlled access"],
    correctAnswer: 3,
    explanation: "Sandboxing creates the default isolation boundary. Permissions allow specific, controlled access to protected resources such as camera, microphone, contacts, or location.",
  });

  // -- Lesson 05: 05. App-to-App Communication and Sandbox Boundaries --
  const [l5] = await db.insert(lessons).values({
    title: "05. App-to-App Communication and Sandbox Boundaries",
    slug: "app-to-app-communication-sandbox-boundaries",
    content: "## Learning Objectives\n\nBy the end of this lesson, learners should be able to:\n\n- Explain how apps communicate without breaking sandbox boundaries.\n- Identify major Android app components involved in inter-app communication.\n- Understand why exported components increase attack surface.\n- Recognize why IPC must be validated and permission-protected.\n\n## Content\n\nSandboxing does not mean apps can never communicate. Android allows controlled inter-app communication through defined platform mechanisms.\n\nCommon mechanisms include:\n\n- Activities.\n- Services.\n- Broadcast receivers.\n- Content providers.\n- Intents.\n- Binder IPC.\n\nThese mechanisms let apps cooperate without giving them unrestricted access to each other's private memory or private files.\n\n### App components\n\nAndroid apps are built from components:\n\n- **Activities** provide user interface screens.\n- **Services** perform background or long-running work.\n- **Broadcast receivers** respond to broadcasts.\n- **Content providers** expose structured data.\n- **Intents** request actions from components.\n\n### Exported components\n\nA component is more exposed when it can be reached by other apps.\n\nExample:\n\n```xml\n<service\n    android:name=\".SyncService\"\n    android:exported=\"true\" />\n```\n\nIf this service performs sensitive operations, other apps may be able to invoke it unless the service enforces proper permissions and input validation.\n\n### Implicit vs explicit communication\n\nAn explicit intent targets a specific component:\n\n```text\nOpen com.example.app/.SettingsActivity\n```\n\nAn implicit intent describes an action and lets Android find a matching component:\n\n```text\nACTION_SEND\nACTION_VIEW\n```\n\nImplicit intents are useful, but sensitive data should not be sent blindly to unknown handlers.\n\n### Security concerns\n\nCommon IPC-related security mistakes include:\n\n- Exported components without permission checks.\n- Services that trust untrusted caller input.\n- Broadcast receivers that accept spoofed broadcasts.\n- Content providers that expose too much data.\n- Implicit intents carrying sensitive information.\n- Missing caller validation.\n\n## Summary\n\nAndroid IPC is designed to preserve sandbox boundaries while still allowing apps to interact. Any component reachable from another app should be treated as part of the app's external attack surface.",
    order: 5,
    category: "Android Security",
    difficulty: "Intermediate",
    learningPathSlug: "android-security",
  }).returning();
  await db.insert(quizzes).values({
    lessonId: l5.id,
    question: "Which option preserves sandbox boundaries during app communication?",
    options: ["Direct private file reads", "Android IPC components", "Shared UID for all apps", "Kernel memory access"],
    correctAnswer: 1,
    explanation: "IPC means Inter-Process Communication. Android IPC mechanisms such as intents, services, broadcast receivers, content providers, and Binder allow apps to communicate without direct access to each other's private data or memory.",
  });

  // -- Lesson 06: 06. Secure File Sharing with Content URIs --
  const [l6] = await db.insert(lessons).values({
    title: "06. Secure File Sharing with Content URIs",
    slug: "secure-file-sharing-content-uris",
    content: "## Learning Objectives\n\nBy the end of this lesson, learners should be able to:\n\n- Explain why raw file paths are risky for inter-app file sharing.\n- Understand the purpose of `content://` URIs.\n- Describe how `FileProvider` supports safer file sharing.\n- Recognize world-accessible app data as poor security practice.\n\n## Content\n\nApps often need to share files. A document app might share a PDF with an email app. A camera app might share an image with a chat app.\n\nThe security problem is that the receiving app should not receive broad access to the sender app's private directory.\n\n### Bad approach\n\n```text\nfile:///data/data/com.example.documents/files/report.pdf\n```\n\nSending raw private file paths is unsafe because it exposes implementation details and does not provide a controlled permission model.\n\n### Better approach\n\n```text\ncontent://com.example.documents.provider/report.pdf\n```\n\nA `content://` URI allows Android to grant controlled access to a specific resource.\n\n### FileProvider\n\n`FileProvider` is a common mechanism for secure file sharing. It creates a content URI for a file and allows temporary read or write access to another app.\n\nA safer sharing flow looks like this:\n\n```text\nPrivate file -> FileProvider -> content:// URI -> temporary URI permission -> receiving app\n```\n\n### Temporary access\n\nThe receiving app should receive only the access it needs:\n\n- Read access if it only needs to open the file.\n- Write access only if modification is necessary.\n- Temporary access rather than broad permanent access.\n\n### World-accessible data\n\nMaking app data world-accessible is poor security practice because access is granted broadly and cannot be limited to the intended recipient.\n\nRisky pattern:\n\n```text\nStore sensitive file in shared storage\nMake file globally readable\nSend raw path to another app\n```\n\nSafer pattern:\n\n```text\nKeep sensitive file private\nExpose only specific file through FileProvider\nGrant temporary content URI permission\n```\n\n## Summary\n\nSecure Android file sharing should use controlled mechanisms such as `FileProvider` or `ContentProvider`. Raw file paths and world-accessible app data weaken sandbox boundaries.",
    order: 6,
    category: "Android Security",
    difficulty: "Intermediate",
    learningPathSlug: "android-security",
  }).returning();
  await db.insert(quizzes).values({
    lessonId: l6.id,
    question: "Which option is the safer way to share an app-private file?",
    options: ["World-readable file", "Raw file URI", "Logcat copy", "Content URI grant"],
    correctAnswer: 3,
    explanation: "A content URI grant can provide narrow, temporary access to a specific file or resource without exposing private filesystem paths broadly.",
  });

  // -- Lesson 07: 07. Platform Protections that Strengthen the Sandbox --
  const [l7] = await db.insert(lessons).values({
    title: "07. Platform Protections that Strengthen the Sandbox",
    slug: "platform-protections-strengthen-sandbox",
    content: "## Learning Objectives\n\nBy the end of this lesson, learners should be able to:\n\n- Explain why Android sandboxing uses defense-in-depth.\n- Understand the role of SELinux in Android app isolation.\n- Understand the purpose of seccomp syscall filtering.\n- Describe how newer Android versions strengthened app separation.\n\n## Content\n\nThe original Android sandbox is based on Linux UID isolation. Over time, Android added more protections to strengthen the sandbox and reduce the impact of vulnerabilities.\n\nThis layered approach is called defense-in-depth.\n\n```text\nLinux UID isolation\n        ↓\nProcess isolation\n        ↓\nFilesystem permissions\n        ↓\nAndroid permissions\n        ↓\nSELinux policies\n        ↓\nSeccomp syscall filtering\n        ↓\nControlled IPC and file sharing\n```\n\n### SELinux\n\nSELinux provides mandatory access control. It can block access even when normal Linux permissions might appear to allow it.\n\nSELinux policies help separate:\n\n- Apps.\n- System services.\n- Hardware-related services.\n- Privileged components.\n- Platform domains.\n\nAndroid 5.0 introduced SELinux mandatory access control separation between the system and apps. Later Android versions expanded app separation further.\n\n### Seccomp\n\nSeccomp restricts which system calls a process can use. This reduces the exposed attack surface between app processes and the Linux kernel.\n\nThis matters because the kernel is a high-value boundary. Limiting available syscalls helps reduce the number of kernel interfaces reachable by app processes.\n\n### Filesystem restrictions\n\nAndroid also introduced stronger restrictions around raw filesystem access. Apps have a more limited raw view of shared storage and should use Android storage APIs rather than assuming broad filesystem access.\n\n### Why defense-in-depth matters\n\nNo individual security control is perfect. Defense-in-depth helps prevent one bug or misconfiguration from becoming a full compromise.\n\nFor example:\n\n```text\nA file permission mistake may still be limited by SELinux.\nA risky system call may be blocked by seccomp.\nAn exposed component may still require permission checks.\n```\n\n## Summary\n\nAndroid sandboxing is reinforced by multiple platform layers. UID isolation is the foundation, but SELinux, seccomp, storage restrictions, and Android permissions strengthen the overall boundary.",
    order: 7,
    category: "Android Security",
    difficulty: "Intermediate",
    learningPathSlug: "android-security",
  }).returning();
  await db.insert(quizzes).values({
    lessonId: l7.id,
    question: "What does seccomp do in Android app sandboxing?",
    options: ["Filters available syscalls", "Grants kernel capabilities", "Replaces app permissions", "Disables SELinux domains"],
    correctAnswer: 0,
    explanation: "Seccomp filters which system calls an app process can use. This reduces the kernel attack surface reachable from app processes.",
  });

  // -- Lesson 08: 08. Android Sandbox Review Checklist --
  const [l8] = await db.insert(lessons).values({
    title: "08. Android Sandbox Review Checklist",
    slug: "android-sandbox-review-checklist",
    content: "## Learning Objectives\n\nBy the end of this lesson, learners should be able to:\n\n- Perform a basic sandbox-focused Android security review.\n- Identify risky permissions, exported components, and storage choices.\n- Review an app manifest for sandbox-related exposure.\n- Understand which findings weaken sandbox assumptions.\n\n## Content\n\nA sandbox-focused Android security review checks whether the app keeps data and behavior inside safe boundaries or unnecessarily exposes them.\n\nThis lesson provides a practical checklist.\n\n## Step 1 — Manifest review\n\nInspect the Android manifest for:\n\n```xml\n<uses-permission>\n<activity>\n<service>\n<receiver>\n<provider>\nandroid:exported\nandroid:permission\nintent-filter\nallowBackup\ndebuggable\nnetworkSecurityConfig\n```\n\nQuestions to ask:\n\n- Which permissions does the app request?\n- Which components are exported?\n- Are exported components protected by permissions?\n- Does the manifest expose services, receivers, or providers unnecessarily?\n\n## Step 2 — Permission review\n\nClassify requested permissions:\n\n- Normal permissions.\n- Runtime or dangerous permissions.\n- Special permissions.\n- Signature-level permissions.\n- Permissions that do not match the app's purpose.\n\nExample concern:\n\n```text\nA simple notes app requests RECORD_AUDIO + ACCESS_FINE_LOCATION + INTERNET\n```\n\nThis may indicate unnecessary exposure or over-permissioning.\n\n## Step 3 — Storage review\n\nCheck whether sensitive data is stored in:\n\n- Internal app-private storage.\n- External/shared storage.\n- Logs.\n- Cache directories.\n- Exported backups.\n- World-accessible locations.\n\nHigher-risk pattern:\n\n```text\n/sdcard/session_tokens.txt\n```\n\nLower-risk pattern:\n\n```text\n/data/data/com.example.app/files/session_tokens.enc\n```\n\n## Step 4 — Component exposure review\n\nFor each exported component, ask:\n\n- Does this component need to be exported?\n- Is it protected by a permission?\n- Does it validate caller identity?\n- Does it accept untrusted input?\n- Can it leak private data?\n- Can it trigger sensitive actions?\n\n## Step 5 — File sharing review\n\nCheck whether the app uses:\n\n- Raw `file://` paths.\n- `content://` URIs.\n- `FileProvider`.\n- Temporary URI grants.\n- Broad storage permissions.\n\nPrefer content URIs with temporary grants.\n\n## Summary\n\nA good Android sandbox review looks at permissions, storage, IPC boundaries, exported components, and file sharing patterns. The goal is to identify where the app weakens Android's default isolation model.",
    order: 8,
    category: "Android Security",
    difficulty: "Intermediate",
    learningPathSlug: "android-security",
  }).returning();
  await db.insert(quizzes).values({
    lessonId: l8.id,
    question: "Which review finding most clearly weakens sandbox assumptions?",
    options: ["Private internal database", "Temporary content URI", "Raw shared-storage secrets", "Unique per-app UID"],
    correctAnswer: 2,
    explanation: "Secrets written to raw shared-storage paths may leave the app-private sandbox boundary. Sensitive data should stay in private storage or be shared only through controlled mechanisms.",
  });

  // -- Lesson 09: 09. Advanced Sandbox Boundary Cases: Isolated Processes, Shared UIDs, and Sandbox Versions --
  const [l9] = await db.insert(lessons).values({
    title: "09. Advanced Sandbox Boundary Cases: Isolated Processes, Shared UIDs, and Sandbox Versions",
    slug: "advanced-sandbox-boundary-cases",
    content: "## Learning Objectives\n\nBy the end of this lesson, learners should be able to:\n\n- Explain how isolated services add another boundary inside an app design.\n- Understand why `sharedUserId` weakens the normal one-app-one-UID model.\n- Understand why `sharedUserId` is deprecated and strongly discouraged.\n- Explain the role of `targetSandboxVersion` in Android's sandbox model.\n- Recognize advanced manifest attributes that affect sandbox behavior.\n\n## Content\n\nMost Android sandbox explanations focus on the common case: one app receives one UID and runs in its own process. Advanced Android security also requires understanding boundary exceptions and hardening features.\n\nThree important concepts are:\n\n- `android:isolatedProcess`\n- `android:sharedUserId`\n- `android:targetSandboxVersion`\n\n## Isolated services\n\nA service can declare:\n\n```xml\n<service\n    android:name=\".RenderService\"\n    android:isolatedProcess=\"true\" />\n```\n\nWhen `android:isolatedProcess=\"true\"` is used, the service runs in a special isolated process with no permissions of its own. Communication with that process happens through the Service API.\n\nThis can be useful when an app wants to execute risky or untrusted processing in a more restricted process.\n\nExamples of possible use cases:\n\n- Parsing complex files.\n- Rendering untrusted content.\n- Handling less-trusted input.\n- Separating a sensitive main app process from risky processing code.\n\n### Security value\n\nAn isolated process can reduce the damage from a bug in a risky component. If the isolated service is compromised, it does not automatically inherit all app permissions.\n\nHowever, it is not magic. The app still needs secure IPC design, input validation, and careful data handling.\n\n## Shared UIDs\n\nOlder Android apps could use `android:sharedUserId` to share a Linux UID with other apps signed with the same certificate.\n\nExample:\n\n```xml\n<manifest\n    android:sharedUserId=\"com.example.shared\" />\n```\n\nIf two apps use the same shared user ID and meet certificate requirements, they can access each other's data and may run in the same process.\n\nThis weakens the usual one-app-one-UID model.\n\n### Why this is risky\n\nShared UID behavior can blur sandbox boundaries between apps. If one app in the shared UID group has a vulnerability, the impact may extend to data or privileges shared with the other apps.\n\nSecurity issues include:\n\n- Broader data access than expected.\n- Harder reasoning about privilege boundaries.\n- More complex package manager behavior.\n- Difficult migration away from the shared UID model.\n\n`sharedUserId` is deprecated as of API level 29 and is strongly discouraged. Android documentation recommends proper communication mechanisms such as services and content providers instead of shared UIDs.\n\n## Sandbox versioning\n\nAndroid also supports `android:targetSandboxVersion`.\n\nA higher sandbox version means a higher level of sandbox security. For example, sandbox version 2 changes behavior in ways that include stronger defaults and disallowing UID sharing.\n\nExample:\n\n```xml\n<manifest\n    android:targetSandboxVersion=\"2\" />\n```\n\nThis setting is especially relevant when reasoning about compatibility, instant apps, and apps that need to move toward stricter security behavior.\n\n## Review checklist for advanced boundary cases\n\nWhen reviewing a manifest, look for:\n\n```xml\nandroid:isolatedProcess\nandroid:sharedUserId\nandroid:sharedUserMaxSdkVersion\nandroid:targetSandboxVersion\nandroid:process\n```\n\nQuestions to ask:\n\n- Is `isolatedProcess` used for risky or untrusted operations?\n- Does the app rely on deprecated shared UID behavior?\n- Could shared UID access expand the impact of a vulnerability?\n- Is sandbox versioning used intentionally?\n- Are separate processes actually separate security boundaries, or just architecture boundaries?\n\n## Summary\n\nAdvanced Android sandboxing includes exceptions and hardening features. Isolated processes can reduce privileges for risky components. Shared UIDs weaken normal app isolation and are deprecated. Sandbox versioning helps Android enforce stronger security behavior over time.",
    order: 9,
    category: "Android Security",
    difficulty: "Advanced",
    learningPathSlug: "android-security",
  }).returning();
  await db.insert(quizzes).values({
    lessonId: l9.id,
    question: "What is the core risk of `android:sharedUserId`?",
    options: ["More stable app icons", "Shared UID expands access", "Faster activity startup", "Disabled intent filters"],
    correctAnswer: 1,
    explanation: "`sharedUserId` can cause apps to share the same Linux UID when requirements are met. That expands the trust boundary and weakens the usual one-app-one-UID sandbox model.",
  });

  // -- Lesson 10: 10. Advanced IPC Security: PendingIntents, URI Grants, and Confused Deputy Risks --
  const [l10] = await db.insert(lessons).values({
    title: "10. Advanced IPC Security: PendingIntents, URI Grants, and Confused Deputy Risks",
    slug: "advanced-ipc-security-pendingintents-uri-grants",
    content: "## Learning Objectives\n\nBy the end of this lesson, learners should be able to:\n\n- Explain how IPC can create security risk even when sandboxing is working.\n- Understand the confused deputy pattern in Android app interactions.\n- Recognize risky PendingIntent usage.\n- Explain why URI grants must be narrow and intentional.\n- Understand why data crossing IPC boundaries must be treated as untrusted.\n\n## Content\n\nAndroid sandboxing prevents direct unrestricted access between apps. However, apps can still interact through IPC mechanisms. Security issues often appear when an app exposes too much authority through a controlled mechanism.\n\nAdvanced Android IPC security is about understanding how an app can accidentally become a bridge between an untrusted caller and a protected action.\n\n## Confused deputy problem\n\nA confused deputy issue happens when a more privileged component is tricked into performing an action for a less privileged caller.\n\nExample pattern:\n\n```text\nUntrusted app -> exported component -> privileged app action -> protected resource\n```\n\nThe sandbox is still active, but the privileged app misuses its own authority on behalf of another app.\n\n## PendingIntent security\n\nA `PendingIntent` allows another app or system component to perform a predefined action later using the creator app's identity and permissions.\n\nThis is powerful, but risky if not designed carefully.\n\nRisky patterns include:\n\n- Mutable PendingIntents when immutability would be safer.\n- Implicit intents inside PendingIntents.\n- Reusing request codes carelessly.\n- Allowing another app to modify important extras.\n- Creating PendingIntents that perform sensitive actions without enough constraints.\n\nSafer patterns include:\n\n- Use immutable PendingIntents when the receiver should not modify them.\n- Use explicit intents where possible.\n- Keep actions narrow and specific.\n- Avoid placing sensitive data in mutable extras.\n- Treat PendingIntents as delegated authority.\n\n## URI permission grants\n\nContent URI grants allow temporary access to specific data.\n\nExample:\n\n```text\ncontent://com.example.provider/private/report.pdf\n```\n\nURI grants are useful because they can provide narrow access to a specific resource instead of exposing an entire directory.\n\nHowever, mistakes can create exposure:\n\n- Granting write access when only read access is needed.\n- Granting access to broad URI patterns.\n- Failing to validate which resource is being shared.\n- Combining exported providers with weak permission checks.\n- Sending sensitive content URIs through implicit intents.\n\n## IPC input should be untrusted\n\nData received over IPC should be treated as untrusted, even if it appears to come from another app on the same device.\n\nIPC data may include:\n\n- Intent actions.\n- Intent extras.\n- Bundle values.\n- Parcelable objects.\n- URI parameters.\n- Provider query arguments.\n\nSecurity checks should happen before sensitive actions are performed.\n\nQuestions to ask:\n\n- Who can call this component?\n- What authority does this component have?\n- Can the caller influence the action?\n- Can the caller influence the target resource?\n- Is the app validating both the caller and the input?\n- Does the app grant only the minimum required access?\n\n## Example: risky delegated action\n\n```text\n1. App A has permission to access private document data.\n2. App A exposes an exported Activity that accepts a document ID.\n3. App B sends an Intent with another user's document ID.\n4. App A loads and shares the document without verifying the caller.\n```\n\nThe sandbox did not fail. App A's access control failed.\n\n## Summary\n\nAndroid IPC allows controlled communication across sandbox boundaries, but control must be explicit and narrow. PendingIntents, URI grants, exported components, and IPC inputs must be designed carefully to avoid confused deputy vulnerabilities.",
    order: 10,
    category: "Android Security",
    difficulty: "Advanced",
    learningPathSlug: "android-security",
  }).returning();
  await db.insert(quizzes).values({
    lessonId: l10.id,
    question: "What is the main risk of a poorly designed PendingIntent?",
    options: ["Stronger storage boundary", "Blocked binder message", "Removed file provider", "Overbroad delegated action"],
    correctAnswer: 3,
    explanation: "A PendingIntent represents delegated authority. If it is mutable, implicit, or too broad, another app may influence a sensitive action performed with the creator app's authority.",
  });

  // -- Practical Challenge --
  await db.insert(challenges).values({
    title: "Sandbox Boundary Review",
    description: "Identify which file is protected by the Android Application Sandbox and which file creates a higher exposure risk.",
    difficulty: "Easy",
    category: "Android Security",
    flag: "sandbox_private_storage",
    hints: [],
    artifact: "You are reviewing the following Android app behavior:\n\n```text\nPackage name:\ncom.example.notes\n\nPrivate data path:\n/data/data/com.example.notes/databases/notes.db\n\nObserved behavior:\nThe app stores user notes in its private database.\nThe app also exports a backup file to:\n/sdcard/notes_backup.txt\n```",
    technicalContext: "The private database is stored inside the app's sandboxed data directory. The backup file is placed in shared storage, which may expose sensitive data outside the app's private sandbox depending on Android version, storage configuration, and permissions.\n\nExpected answer: The private database is protected by the app sandbox:\n\n```text\n/data/data/com.example.notes/databases/notes.db\n```\n\nThe backup file creates a higher exposure risk because it is written to shared storage:\n\n```text\n/sdcard/notes_backup.txt\n```",
    learningPathSlug: "android-security",
  });

  console.log("✓ Seeded 10 lessons + 1 challenge for Android Security.");
  process.exit(0);
}

seed().catch((e) => { console.error(e); process.exit(1); });