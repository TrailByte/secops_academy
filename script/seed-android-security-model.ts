/**
 * Seed script: Android Security Model learning path
 * 7 lessons (2 quizzes each) + 2 CTF challenges
 * Source: android-security-model-content-pack-with-images.md
 *
 * Images: copy the images/ folder from the zip into client/public/
 *         so that /images/android-security/*.png is served statically.
 *
 * Run with: npx tsx script/seed-android-security-model.ts
 * Re-runnable: clears existing records with matching slugs/titles first.
 */
import { db } from "../server/db";
import { learningPaths, lessons, quizzes, challenges, quizAnswers } from "../shared/schema";
import { eq, inArray } from "drizzle-orm";

const LP_SLUG = "android-security-model";

const LESSON_SLUGS = [
  "android-security-defense-in-depth",
  "android-application-sandbox",
  "android-permissions-system-resources",
  "android-secure-ipc-components",
  "android-data-keystore-protection",
  "android-selinux-containment",
  "android-integrity-verified-boot"
];

const CHALLENGE_TITLES = [
  "Manifest Attack Surface Review",
  "Permission Re-Delegation Triage"
];

async function clearExisting() {
  const existing = await db.select({ id: lessons.id }).from(lessons).where(inArray(lessons.slug, LESSON_SLUGS));
  const ids = existing.map((r) => r.id);
  if (ids.length) {
    await db.delete(quizAnswers).where(inArray(quizAnswers.lessonId, ids));
    await db.delete(quizzes).where(inArray(quizzes.lessonId, ids));
    await db.delete(lessons).where(inArray(lessons.id, ids));
  }
  for (const title of CHALLENGE_TITLES) {
    await db.delete(challenges).where(eq(challenges.title, title));
  }
  console.log(`Cleared ${ids.length} existing lesson(s) and challenges before reseed.`);
}

async function seed() {
  console.log("Seeding Android Security Model learning path...\n");
  await clearExisting();

  // ── Learning Path ──────────────────────────────────────────────────────────
  const existingLp = await db.select().from(learningPaths).where(eq(learningPaths.slug, LP_SLUG));
  if (existingLp.length === 0) {
    await db.insert(learningPaths).values({
      slug: LP_SLUG,
      title: "Android Security Model",
      description: "Study how Android isolates applications and protects system resources through Linux UIDs, per-app sandboxes, permissions, secure IPC, SELinux, encrypted storage, Android Keystore, app signing, and Verified Boot.",
      icon: "Smartphone",
      color: "green",
      order: 2,
    });
    console.log("  Creating learning path...");
  } else {
    console.log("  Learning path already exists, skipping.");
  }

  // Lesson 01
  const [l1] = await db.insert(lessons).values({
    title: "01. Android Security as Defense in Depth",
    slug: "android-security-defense-in-depth",
    content: "# Android Security as Defense in Depth\n\n![Android defense-in-depth security layers](/images/android-security/01-defense-in-depth.png)\n\n\nAndroid runs many applications from different developers on the same device. These applications may process messages, photos, location data, authentication tokens, and enterprise information. The platform therefore assumes that apps do **not** automatically trust one another.\n\nAndroid protects users by combining several security layers:\n\n| Layer | Main purpose |\n|---|---|\n| **App signing and package identity** | Establishes an app's update identity and supports trust decisions based on signing certificates |\n| **Linux UID and process isolation** | Gives each app a separate operating-system identity and private execution boundary |\n| **Application sandbox** | Restricts direct access to another app's files, memory, and processes |\n| **Permissions and AppOps** | Mediate access to sensitive data and protected operations |\n| **Android IPC controls** | Control how apps deliberately communicate through Binder, intents, services, receivers, and providers |\n| **SELinux** | Adds mandatory, default-deny policy around apps and system services |\n| **Encrypted storage and Keystore** | Protect data at rest and cryptographic key material |\n| **Verified Boot** | Checks the integrity and authenticity of the operating system during startup |\n\n## Identity, Isolation, and Authorization\n\nThese concepts are related but different:\n\n- **Identity** answers: *Which app or process is making the request?*\n- **Isolation** answers: *What can this process reach directly?*\n- **Authorization** answers: *Should this caller be allowed to perform this action?*\n\nA Linux UID gives an application an operating-system identity. File ownership and process boundaries use that identity to isolate apps. Permissions, component rules, Binder caller checks, and SELinux policy then decide whether a specific operation is authorized.\n\n## Example: An App Requests Camera Access\n\nConsider a messaging app that wants to record a video:\n\n1. The app runs under its own UID and process.\n2. The app declares the camera permission.\n3. The user grants the runtime permission when the feature is used.\n4. The app communicates with Android system services through Binder.\n5. The system service identifies the caller and checks its permission and operational state.\n6. SELinux policy restricts which processes may communicate with camera-related services and device nodes.\n7. The app receives camera output through controlled framework APIs rather than directly controlling hardware.\n\nThe permission prompt is only one part of the decision. The sandbox, Binder identity, system service checks, and SELinux policy all contribute.\n\n## Security Boundaries Are Not the Same as App Quality\n\nThe sandbox can prevent an app from reading another app's private directory, but it cannot prevent an app from mishandling data that it legitimately owns. For example, an app may weaken its own security by:\n\n- exporting an internal component;\n- writing secrets to logs;\n- storing sensitive data in a broadly accessible location;\n- accepting untrusted intent input without validation;\n- requesting more permissions than it needs;\n- embedding cryptographic secrets in application code.\n\nAndroid provides secure defaults and enforcement mechanisms, but developers must still configure components and data flows correctly.\n\n## Analyst Mental Model\n\nWhen reviewing an Android security event, ask these questions in order:\n\n1. **Who is the caller?** Identify package name, UID, PID, signing identity, and SELinux domain.\n2. **What resource is being accessed?** File, provider, service, device capability, system API, or another app component.\n3. **What boundary should protect it?** DAC, permission, exported-component setting, Binder check, URI grant, SELinux, encryption, or Verified Boot.\n4. **Was the access direct or delegated?** A privileged app may accidentally perform an operation for an unprivileged caller.\n5. **Which control failed or was misconfigured?** Avoid describing every issue as a \"sandbox bypass.\"\n\n## Key Takeaways\n\n- Android apps are mutually distrusting by default.\n- The application sandbox is the baseline, not the entire security model.\n- Permissions grant selected capabilities; they do not remove the sandbox.\n- IPC is an intentional bridge between sandboxes and must be protected.\n- SELinux and boot integrity provide system-wide containment and trust.\n\n---\n\n## Further Reading\n\n- [AOSP: Application Sandbox](https://source.android.com/docs/security/app-sandbox)\n- [Android Developers: Security Checklist](https://developer.android.com/privacy-and-security/security-tips)\n- [AOSP: Security-Enhanced Linux in Android](https://source.android.com/docs/security/features/selinux)\n- [AOSP: Verified Boot](https://source.android.com/docs/security/features/verifiedboot)",
    order: 1,
    category: "foundations",
    difficulty: "Beginner",
    learningPathSlug: "android-security-model",
  }).returning();
  await db.insert(quizzes).values({
    lessonId: l1.id,
    question: "Which statement best describes Android's security model?",
    options: ["A single permission prompt protects all system resources", "Multiple controls combine identity, isolation, authorization, data protection, and boot integrity", "Only Java and Kotlin applications are sandboxed", "Application signing allows every app from the same store to trust every other app"],
    correctAnswer: 1,
    explanation: "Android uses defense in depth: Linux UIDs, sandboxing, permissions, IPC checks, SELinux, storage protections, app signing, and Verified Boot each enforce different parts of the security model.",
  });
  await db.insert(quizzes).values({
    lessonId: l1.id,
    question: "An app can read its own private files but cannot read another app's private files. Which concept is most directly demonstrated?",
    options: ["Availability", "Application isolation", "Certificate pinning", "Network segmentation"],
    correctAnswer: 1,
    explanation: "Per-app UIDs, process boundaries, and file ownership isolate one application's private resources from another.",
  });
  console.log("  Lesson 01 seeded.");

  // Lesson 02
  const [l2] = await db.insert(lessons).values({
    title: "02. The Application Sandbox",
    slug: "android-application-sandbox",
    content: "# The Application Sandbox\n\n![Separate Android app UIDs and private data enforced by the Linux kernel](/images/android-security/02-application-sandbox.png)\n\n\nThe Android application sandbox is built on Linux process and file protections. During installation, Android assigns an application a Linux user ID, commonly called the app UID. The app normally runs in its own process under that UID.\n\nThis creates several default boundaries:\n\n- another app cannot directly read the app's private files;\n- another app cannot directly inspect or modify the app's memory;\n- the app cannot directly access protected device resources;\n- the app cannot directly act as a system service;\n- native code is restricted by the same process and UID boundary as managed code.\n\n## UID Is the Security Principal\n\nThe package name is important to developers and users, but the kernel primarily enforces access using numeric identities such as UID and GID.\n\nA process listing may show an application user similar to:\n\n```text\nu0_a142   18421   com.example.notes\n```\n\nThe exact value varies by device. The important point is that processes with different app UIDs do not automatically receive access to one another's private resources.\n\n## Private Application Data\n\nApplication-private data is generally stored beneath per-user directories such as:\n\n```text\n/data/user/0/com.example.notes/\n```\n\nA regular third-party application should not be able to list or read another app's private directory. Internal storage APIs build on this isolation.\n\nThe sandbox does not make all data safe. An application can still expose its own data by:\n\n- publishing it through an exported content provider;\n- granting a URI permission;\n- writing it to external or shared storage;\n- logging it;\n- including it in an insecure backup;\n- returning it from an unprotected Binder interface.\n\n## One App, Multiple Processes\n\nAndroid components may run in additional processes when configured with the `android:process` attribute. Multiple processes belonging to the same application usually keep the same UID. They remain separate memory spaces but share the same underlying application identity for many access-control decisions.\n\nThis distinction matters during incident response:\n\n- **PID** identifies one running process.\n- **UID** identifies the app security principal.\n- **Package name** maps application metadata to that identity.\n- **SELinux context** adds another policy label.\n\n## App Signing and UID Assignment\n\nAndroid verifies that an APK is signed before installation. Signing establishes update continuity and supports signature-level trust relationships. It does not mean that the app is safe or that a public certificate authority approved it.\n\nHistorically, apps signed with the same key could request a shared UID. Shared UIDs weaken isolation and are deprecated for modern Android development. Separate UIDs plus explicit IPC are safer and easier to reason about.\n\n## Useful Defensive Commands\n\nOn an authorized test device or emulator:\n\n```bash\n# Show packages and assigned UIDs\nadb shell pm list packages -U\n\n# Inspect package metadata\nadb shell dumpsys package com.example.notes\n\n# Show processes with Linux user and SELinux context\nadb shell ps -A -o USER,PID,PPID,NAME,CONTEXT\n\n# Inspect the directory metadata; access may be denied on a production build\nadb shell ls -ld /data/user/0/com.example.notes\n```\n\nA permission-denied result can be evidence that the boundary is working as intended.\n\n## Sandbox Limits and Defense in Depth\n\nA properly configured sandbox is enforced in the kernel. A kernel compromise can therefore threaten the boundary. Android adds controls such as SELinux, syscall filtering, memory protections, hardened allocators, and Verified Boot to reduce the chance that a single vulnerability becomes a complete device compromise.\n\nRoot is also not an automatic bypass of every Android policy. SELinux can confine processes even when they have Linux superuser capabilities.\n\n## Analyst Checklist\n\nWhen investigating suspected cross-app access:\n\n1. Map package names to UIDs.\n2. Confirm whether the processes have the same or different UIDs.\n3. Identify the exact data path or IPC endpoint involved.\n4. Check component export settings and URI grants.\n5. Inspect permissions and Binder caller validation.\n6. Review SELinux context and denial logs.\n7. Reserve the term **sandbox escape** for cases that actually cross the enforced isolation boundary.\n\n---\n\n## Further Reading\n\n- [AOSP: Application Sandbox](https://source.android.com/docs/security/app-sandbox)\n- [AOSP: App Signing](https://source.android.com/docs/security/features/apksigning)\n- [Android Developers: Data and File Storage Overview](https://developer.android.com/training/data-storage)",
    order: 2,
    category: "sandbox",
    difficulty: "Beginner",
    learningPathSlug: "android-security-model",
  }).returning();
  await db.insert(quizzes).values({
    lessonId: l2.id,
    question: "Which identifier is the primary kernel-level security principal for a normal Android application?",
    options: ["The app's launcher icon", "The app's Linux UID", "The app's versionName", "The Play Store category"],
    correctAnswer: 1,
    explanation: "Linux UIDs and GIDs are used by the kernel for process and file access control. Package metadata maps the application to that operating-system identity.",
  });
  await db.insert(quizzes).values({
    lessonId: l2.id,
    question: "Why does native code not automatically escape the Android application sandbox?",
    options: ["Native code is converted to Java before execution", "The sandbox is enforced by the Linux kernel at the process and UID level", "Native libraries cannot access memory", "Only system apps may include native libraries"],
    correctAnswer: 1,
    explanation: "The sandbox applies to the process regardless of whether code is written in Kotlin, Java, C, C++, or another language.",
  });
  console.log("  Lesson 02 seeded.");

  // Lesson 03
  const [l3] = await db.insert(lessons).values({
    title: "03. Permissions and Protected System Resources",
    slug: "android-permissions-system-resources",
    content: "# Permissions and Protected System Resources\n\n![Android permission request with grant and deny paths](/images/android-security/03-permission-check.png)\n\n\nThe application sandbox gives an app a limited default environment. When an app needs access to protected data or actions, Android may require a permission or another mediated system workflow.\n\nExamples include:\n\n- recording audio;\n- reading contacts;\n- accessing precise location;\n- connecting to nearby devices;\n- posting notifications;\n- drawing over other apps;\n- binding to a privileged service.\n\n## Main Permission Types\n\n### Normal Permissions\n\nNormal permissions cover operations with relatively limited risk. The system normally grants them at install time.\n\nA normal permission still extends the app's capabilities, so it should not be requested without a functional reason.\n\n### Runtime Permissions\n\nRuntime permissions, historically called dangerous permissions, protect more sensitive data or actions. The app declares them in the manifest and requests them while running.\n\nSecure behavior includes:\n\n- requesting the permission only when the user invokes the related feature;\n- handling denial without crashing;\n- checking the permission before each protected operation;\n- not assuming that a previous grant still exists;\n- explaining why the access is needed.\n\n### Signature Permissions\n\nA signature permission is granted when the requesting app is signed with the certificate expected by the permission owner. This is useful for controlled IPC between apps maintained by the same organization.\n\nSignature permissions are stronger than relying on a package-name comparison. Package names can be imitated on another device; signing identity provides the cryptographic trust relationship.\n\n### Special Access and AppOps\n\nSome high-impact capabilities are controlled through special system settings and operational checks. Examples can include drawing over other apps or managing all files.\n\nAndroid's AppOps layer can track or restrict specific operations in addition to manifest permissions. From an analyst's perspective, a declared or even granted permission does not always prove that an operation is currently allowed.\n\n## Least Privilege\n\nEvery requested permission expands the consequences of an application compromise.\n\nReview each permission with three questions:\n\n1. Is it required for a current feature?\n2. Can a system picker, intent, or scoped API provide the result without broad access?\n3. Can the request be delayed until the user performs the related action?\n\nDependencies matter. A library can add manifest permissions during the build process, so review the merged manifest rather than only the source manifest.\n\n## The Confused Deputy Problem\n\nA privileged app may expose an IPC endpoint that performs protected operations for callers that do not hold the same permission.\n\nExample:\n\n1. A file-management app has broad storage access.\n2. It exports a service that accepts an arbitrary path.\n3. The service reads the file and returns its content.\n4. A second app without storage access invokes the service.\n\nThe second app did not bypass the permission system directly. Instead, the privileged app became a **confused deputy** and re-delegated its authority.\n\nDefenses include:\n\n- keeping internal components unexported;\n- protecting exported components with permissions;\n- validating Binder caller identity;\n- validating resource identifiers and paths;\n- returning only the minimum required data;\n- avoiding generic \"perform any action\" IPC interfaces.\n\n## Defensive Inspection Commands\n\n```bash\n# Review requested and granted permissions\nadb shell dumpsys package com.example.app\n\n# Review app operations for the package\nadb shell appops get com.example.app\n\n# Check one permission through Package Manager\nadb shell pm check-permission android.permission.RECORD_AUDIO com.example.app\n```\n\nCommand availability and output vary by Android version and build type.\n\n## Permission Review Checklist\n\n- Remove unused permissions.\n- Prefer narrow system-mediated APIs.\n- Request sensitive access in context.\n- Expect permissions to be denied or revoked.\n- Review the merged manifest and dependency contributions.\n- Protect privileged IPC against permission re-delegation.\n- Treat special access as high risk and document why it is necessary.\n\n---\n\n## Further Reading\n\n- [Android Developers: Permissions on Android](https://developer.android.com/guide/topics/permissions/overview)\n- [Android Developers: Minimize Permission Requests](https://developer.android.com/privacy-and-security/minimize-permission-requests)\n- [Android Developers: Define Custom Permissions](https://developer.android.com/guide/topics/permissions/defining)",
    order: 3,
    category: "permissions",
    difficulty: "Beginner",
    learningPathSlug: "android-security-model",
  }).returning();
  await db.insert(quizzes).values({
    lessonId: l3.id,
    question: "Which permission type is normally granted only to apps signed with the expected certificate?",
    options: ["Normal", "Runtime", "Signature", "Temporary"],
    correctAnswer: 2,
    explanation: "Signature permissions use app signing identity to restrict access, commonly for controlled communication between apps from the same developer or platform.",
  });
  await db.insert(quizzes).values({
    lessonId: l3.id,
    question: "A privileged app exposes an unprotected service that reads arbitrary files for any caller. What security problem does this illustrate?",
    options: ["Verified Boot rollback", "Permission re-delegation by a confused deputy", "Certificate expiration", "Process starvation"],
    correctAnswer: 1,
    explanation: "The caller gains an indirect benefit from the privileged app's permissions because the service fails to authorize and constrain the request.",
  });
  console.log("  Lesson 03 seeded.");

  // Lesson 04
  const [l4] = await db.insert(lessons).values({
    title: "04. Secure IPC and Component Exposure",
    slug: "android-secure-ipc-components",
    content: "# Secure IPC and Component Exposure\n\n![Android IPC request with caller validation and authorization](/images/android-security/04-secure-ipc.png)\n\n\nApps communicate through Android framework mechanisms such as:\n\n- Binder interfaces;\n- activities and intents;\n- services;\n- broadcast receivers;\n- content providers;\n- Messenger or AIDL interfaces;\n- URI permission grants.\n\nIPC is necessary because direct cross-app file and memory access is blocked by the sandbox. The security goal is to expose only the intended operation to the intended caller.\n\n## The `android:exported` Boundary\n\nA component with `android:exported=\"true\"` may be reachable from another application, subject to any additional permission or platform restrictions.\n\nA component with `android:exported=\"false\"` is generally restricted to the same application, apps sharing the same UID, or privileged system callers.\n\nAlways set the value explicitly. Historical defaults have varied across Android versions and component types, and implicit behavior makes security reviews harder.\n\n```xml\n<service\n    android:name=\".InternalSyncService\"\n    android:exported=\"false\" />\n```\n\nAn exported component is not automatically vulnerable. It becomes vulnerable when the exposed interface permits unintended callers or unsafe input.\n\n## Explicit and Implicit Intents\n\nAn **explicit intent** names the target component. It is preferred when the sender knows exactly which component should receive sensitive data.\n\nAn **implicit intent** describes an action and lets the system resolve a matching component. This can be useful for public workflows, but sensitive data may be intercepted or routed to an unintended handler if the design is weak.\n\nIntent filters describe how a component can be discovered. They are not input-validation rules and should not be treated as authorization controls.\n\n## Services and Binder Caller Identity\n\nA bound service may expose methods to other processes. The service should:\n\n- require an appropriate manifest permission where possible;\n- check the calling UID for sensitive operations;\n- avoid trusting caller-supplied package names;\n- clear and restore Binder identity only when necessary;\n- validate every argument;\n- return only data the caller is authorized to receive.\n\nThe caller's self-reported identity is not trustworthy. Use operating-system-provided identity such as Binder calling UID and package-manager mappings.\n\n## Broadcast Receivers\n\nBroadcasts may unintentionally leak data or trigger privileged actions.\n\nDefensive patterns include:\n\n- use explicit broadcasts for a known receiver;\n- require a receiver permission for sensitive broadcasts;\n- avoid including secrets in broadly delivered intents;\n- validate action, data, extras, and sender assumptions;\n- keep internal receivers unexported.\n\n## Content Providers and URI Grants\n\nContent providers expose structured data. Protect them using:\n\n- `android:exported`;\n- read and write permissions;\n- signature permissions for same-owner app suites;\n- path-level permissions where appropriate;\n- temporary URI grants with the narrowest possible scope;\n- parameterized database operations;\n- strict path and MIME-type validation.\n\nA temporary URI grant can be safer than giving another app broad storage access, because the grant can be limited to one resource and one operation.\n\n## Manifest Review Exercise\n\nReview the following component:\n\n```xml\n<service\n    android:name=\".BackupService\"\n    android:exported=\"true\">\n    <intent-filter>\n        <action android:name=\"com.example.BACKUP\" />\n    </intent-filter>\n</service>\n```\n\nQuestions:\n\n1. Which apps are intended to call it?\n2. Is a permission required?\n3. Does the service authorize the Binder caller?\n4. Can the caller choose arbitrary file paths or destinations?\n5. Does it return sensitive data?\n6. Could the service be unexported and invoked only within the app?\n\n## IPC Review Checklist\n\n- Enumerate every exported activity, service, receiver, and provider.\n- Document the intended caller for each exported component.\n- Apply a permission or caller check when the interface is not public.\n- Prefer explicit intents for sensitive operations.\n- Validate all IPC input as untrusted.\n- Limit URI grants by resource, operation, recipient, and duration.\n- Test components from a separate, unprivileged application.\n\n---\n\n## Further Reading\n\n- [Android Developers: Security Checklist — IPC](https://developer.android.com/privacy-and-security/security-tips#interprocess_communication)\n- [Android Developers: android:exported Risk](https://developer.android.com/privacy-and-security/risks/android-exported)\n- [Android Developers: Restrict Interactions with Other Apps](https://developer.android.com/training/permissions/restrict-interactions)",
    order: 4,
    category: "ipc",
    difficulty: "Intermediate",
    learningPathSlug: "android-security-model",
  }).returning();
  await db.insert(quizzes).values({
    lessonId: l4.id,
    question: "What is the safest default for a component that is used only inside the same application?",
    options: ["Set android:exported to true", "Set android:exported to false", "Add a broad intent filter", "Accept any Binder caller"],
    correctAnswer: 1,
    explanation: "Internal components should remain unexported so other apps cannot invoke them directly.",
  });
  await db.insert(quizzes).values({
    lessonId: l4.id,
    question: "Why is an intent filter not sufficient as a security control?",
    options: ["Intent filters disable application signing", "A component may still receive explicit intents and must validate and authorize requests", "Intent filters work only on rooted devices", "Intent filters automatically grant every runtime permission"],
    correctAnswer: 1,
    explanation: "Intent filters help routing and discovery. They do not replace caller authorization or input validation.",
  });
  console.log("  Lesson 04 seeded.");

  // Lesson 05
  const [l5] = await db.insert(lessons).values({
    title: "05. Protecting App Data and Cryptographic Keys",
    slug: "android-data-keystore-protection",
    content: "# Protecting App Data and Cryptographic Keys\n\n![Android internal storage, encrypted data, and non-exportable Keystore keys](/images/android-security/05-data-and-keystore.png)\n\n\nAndroid data protection begins with classifying the data:\n\n- Is it public, internal, confidential, or authentication material?\n- Must it be available before the user unlocks the device?\n- Must it be shared with another app?\n- How long should it remain on the device?\n- What happens during backup, device migration, or uninstall?\n\n## Internal and Shared Storage\n\nFiles created in app-internal storage are private to the app by default. This is appropriate for most application data.\n\nShared or external storage is designed for data that may need broader visibility. Treat data read from shared storage as untrusted, because another app or the user may modify it. Do not place long-term secrets, executable code, or private tokens there.\n\nWhen data must be shared, prefer a content provider or `FileProvider` with a narrowly scoped URI grant instead of publishing a filesystem path.\n\n## Credential-Encrypted and Device-Encrypted Storage\n\nFile-based encryption separates storage into two broad classes:\n\n- **Credential Encrypted (CE)** storage is the normal location for user data and is available after the user unlocks the device.\n- **Device Encrypted (DE)** storage is available during Direct Boot, before the user's credential unlock.\n\nStore data in CE storage whenever pre-unlock access is not required. DE storage should contain only the minimum data needed for direct-boot functionality.\n\nExample use cases:\n\n| Data | Recommended class |\n|---|---|\n| User messages or account database | CE |\n| Authentication refresh token | CE, with additional application controls |\n| Alarm schedule needed before unlock | Possibly DE |\n| Full message content for an alarm notification | Avoid DE unless essential |\n\n## Android Keystore\n\nAndroid Keystore stores cryptographic keys so that the key material can remain non-exportable. Applications request cryptographic operations without directly handling the raw private key bytes.\n\nDepending on device support and key configuration, key operations may be backed by a Trusted Execution Environment or StrongBox secure hardware.\n\nKeystore can also enforce usage restrictions, such as:\n\n- allowed algorithms, modes, and padding;\n- whether user authentication is required;\n- the time window after authentication;\n- whether a key may be used only for encryption, decryption, signing, or verification.\n\nKeystore protects **keys**, not automatically every piece of app data. The application still needs a sound encryption design, authenticated encryption, secure nonce handling, lifecycle management, and server-side controls.\n\n## Common Data-Handling Failures\n\n- hardcoded API keys or private keys in the APK;\n- tokens written to logs;\n- secrets copied to the clipboard;\n- sensitive files written to shared storage;\n- broad `FileProvider` paths;\n- plaintext data included in backups;\n- custom cryptography with static keys or IVs;\n- keeping sensitive data longer than necessary;\n- exposing decrypted data through screenshots, notifications, or IPC.\n\n## Defensive Review Commands\n\n```bash\n# Inspect the app's declared backup and data-extraction configuration\nadb shell dumpsys package com.example.app\n\n# Look for log leakage while exercising a test account\nadb logcat\n\n# Inspect app files on a debuggable test build\nadb shell run-as com.example.app find . -maxdepth 3 -type f\n```\n\nUse test accounts and authorized devices. Avoid collecting real user secrets into analysis logs.\n\n## Data Protection Checklist\n\n- Keep sensitive data in internal CE storage unless there is a documented need otherwise.\n- Share data through narrow URI grants rather than broad filesystem exposure.\n- Store cryptographic keys in Android Keystore.\n- Use authenticated encryption through maintained platform or library APIs.\n- Keep secrets out of source code, resources, logs, analytics, and crash reports.\n- Define backup behavior deliberately.\n- Minimize retention and securely invalidate server-side credentials when needed.\n- Test device-lock, logout, uninstall, restore, and migration scenarios.\n\n---\n\n## Further Reading\n\n- [Android Developers: Android Keystore System](https://developer.android.com/privacy-and-security/keystore)\n- [AOSP: File-Based Encryption](https://source.android.com/docs/security/features/encryption/file-based)\n- [Android Developers: Data Storage Security](https://developer.android.com/privacy-and-security/security-tips#data-storage)\n- [Android Developers: FileProvider](https://developer.android.com/reference/androidx/core/content/FileProvider)",
    order: 5,
    category: "data-protection",
    difficulty: "Intermediate",
    learningPathSlug: "android-security-model",
  }).returning();
  await db.insert(quizzes).values({
    lessonId: l5.id,
    question: "Which storage class is normally available only after the user unlocks the device?",
    options: ["Credential Encrypted storage", "Device Encrypted storage", "Shared storage", "Bootloader storage"],
    correctAnswer: 0,
    explanation: "Credential Encrypted storage is the normal location for user data and becomes available after credential unlock.",
  });
  await db.insert(quizzes).values({
    lessonId: l5.id,
    question: "What is a primary security property of an Android Keystore private key?",
    options: ["It is automatically uploaded to every app server", "The raw key material can remain non-exportable while the app requests cryptographic operations", "It makes all app files publicly readable", "It replaces the need for authenticated encryption"],
    correctAnswer: 1,
    explanation: "Keystore can keep key material outside the application process and, when supported, bind it to secure hardware. The app must still use sound cryptographic protocols.",
  });
  console.log("  Lesson 05 seeded.");

  // Lesson 06
  const [l6] = await db.insert(lessons).values({
    title: "06. SELinux and System Service Containment",
    slug: "android-selinux-containment",
    content: "# SELinux and System Service Containment\n\n![SELinux policy allowing or denying access based on security context](/images/android-security/06-selinux-policy.png)\n\n\nLinux UID-based controls are a form of discretionary access control. Android strengthens them with Security-Enhanced Linux, or SELinux.\n\nSELinux labels processes and resources, then applies policy rules to interactions between those labels.\n\nSimplified example:\n\n```text\nsource domain: untrusted_app\ntarget type:   camera_device\noperation:     open\ndecision:      denied unless policy explicitly permits it\n```\n\n## Default Denial\n\nAndroid SELinux policy follows a default-deny model. If policy does not explicitly allow an action, the action is denied.\n\nAndroid runs SELinux in enforcing mode on production devices. A denial can appear as an AVC message in kernel or log output.\n\nExample shape:\n\n```text\navc: denied { read } for pid=18421 comm=\"example.app\"\nscontext=u:r:untrusted_app:s0\ntcontext=u:object_r:system_data_file:s0\ntclass=file\n```\n\nKey fields:\n\n- `scontext`: source process label;\n- `tcontext`: target resource label;\n- `tclass`: target object class;\n- denied permission set: attempted operation.\n\n## SELinux Applies Beyond Apps\n\nSELinux confines Android system services as well as third-party apps. It can:\n\n- limit which services communicate through Binder;\n- restrict access to device nodes;\n- protect system and vendor data;\n- isolate media, network, storage, and hardware-facing components;\n- reduce the impact of a compromised privileged process.\n\nThis is why obtaining Linux root privileges does not necessarily grant unrestricted access to every Android resource. The process still operates in an SELinux domain with defined permissions.\n\n## App Domains\n\nThird-party apps normally run in untrusted-app-related domains. Exact domains vary based on Android version, target SDK, privilege level, isolation mode, and other platform decisions.\n\nDo not assume two processes have equivalent access merely because both are third-party apps. Compare their full security context and UID.\n\n## Useful Defensive Commands\n\n```bash\n# Show global SELinux mode\nadb shell getenforce\n\n# List processes with security contexts\nadb shell ps -AZ\n\n# Inspect file labels\nadb shell ls -Z /path/to/authorized/test/resource\n\n# Search recent AVC denials\nadb shell dmesg | grep 'avc: denied'\nadb logcat | grep 'avc: denied'\n```\n\nAccess to kernel logs may be restricted on production devices.\n\n## Interpreting Denials Carefully\n\nAn AVC denial is not automatically a vulnerability. It may show that policy successfully blocked an unintended action.\n\nDuring engineering, repeated denials can reveal:\n\n- a legitimate service missing a narrowly scoped policy rule;\n- a component attempting an unsupported access path;\n- incorrect file labeling;\n- an application or service behaving unexpectedly.\n\nThe correct fix is not to permit everything. Policy should grant the smallest access required for the intended design.\n\n## Defense-in-Depth Example\n\nSuppose an exported service accepts a path and tries to read a protected system file:\n\n1. The exported service is reachable because of app configuration.\n2. The caller passes malicious input.\n3. The service runs under its own UID, not the caller's UID.\n4. Linux file permissions may block the read.\n5. SELinux may independently block the service domain from the target type.\n6. If the service is privileged enough to read the file, the app's own authorization and input validation become critical.\n\nThe final result depends on every layer, not only the component's exported state.\n\n## SELinux Review Checklist\n\n- Confirm the device is enforcing.\n- Record source and target contexts for denied operations.\n- Distinguish expected denials from broken functionality.\n- Avoid broad allow rules.\n- Keep services in narrowly scoped domains.\n- Treat policy changes as security-sensitive code.\n- Combine SELinux findings with UID, permission, and Binder analysis.\n\n---\n\n## Further Reading\n\n- [AOSP: Security-Enhanced Linux in Android](https://source.android.com/docs/security/features/selinux)\n- [AOSP: SELinux Concepts](https://source.android.com/docs/security/features/selinux/concepts)\n- [AOSP: Write SELinux Policy](https://source.android.com/docs/security/features/selinux/device-policy)",
    order: 6,
    category: "system-security",
    difficulty: "Intermediate",
    learningPathSlug: "android-security-model",
  }).returning();
  await db.insert(quizzes).values({
    lessonId: l6.id,
    question: "What does SELinux default denial mean?",
    options: ["Every action is allowed until an administrator blocks it", "An action is denied unless policy explicitly allows it", "Only network operations are restricted", "SELinux applies only to files owned by root"],
    correctAnswer: 1,
    explanation: "SELinux uses mandatory access-control policy. Actions not explicitly authorized by policy are denied.",
  });
  await db.insert(quizzes).values({
    lessonId: l6.id,
    question: "Why can SELinux still matter for a process with Linux root privileges?",
    options: ["SELinux can confine the process according to its domain", "Root processes cannot execute on Android", "SELinux changes the app's signing certificate", "Root automatically becomes an untrusted app UID"],
    correctAnswer: 0,
    explanation: "SELinux policy applies to all processes, including privileged ones, and can reduce the impact of a compromised root-capable service.",
  });
  console.log("  Lesson 06 seeded.");

  // Lesson 07
  const [l7] = await db.insert(lessons).values({
    title: "07. App Integrity and Verified Boot",
    slug: "android-integrity-verified-boot",
    content: "# App Integrity and Verified Boot\n\n![Android Verified Boot chain of trust and rollback protection](/images/android-security/07-verified-boot.png)\n\n\nAndroid uses cryptographic verification at different layers.\n\n## App Signing\n\nEvery installable Android application must be signed. The Package Manager verifies the APK signature during installation.\n\nApp signing supports:\n\n- identifying which key controls app updates;\n- preventing an unrelated signer from replacing an installed app as a normal update;\n- signature-level permissions;\n- controlled trust between apps signed with the same organizational key.\n\nAn app certificate is an identity mechanism, not a quality rating. Android does not require a public certificate authority to approve ordinary app-signing certificates.\n\nProtecting the app-signing key is therefore critical. Loss or unauthorized use can affect update trust and any signature-based relationships.\n\n## Verified Boot\n\nVerified Boot establishes a chain of trust from a hardware-protected root through the bootloader and verified partitions. Each stage verifies the integrity and authenticity of the next stage before execution.\n\nThis helps detect or prevent persistent modification of system software.\n\nRollback protection prevents a device from silently returning to an older vulnerable software version when the platform supports and enforces the relevant version metadata.\n\n## Device State Matters\n\nA locked production device and an intentionally unlocked development device have different trust assumptions.\n\nDuring a security assessment, record:\n\n- bootloader lock state;\n- Verified Boot state;\n- build type and signing keys;\n- Android security patch level;\n- whether the device is rooted or instrumented;\n- whether system or vendor partitions were modified.\n\nThese conditions do not automatically invalidate all findings, but they change the confidence that can be placed in platform enforcement.\n\n## What These Controls Do Not Solve\n\nApp signing and Verified Boot do not prevent:\n\n- an authorized developer from shipping vulnerable code;\n- an app from exporting an unsafe component;\n- weak authentication or authorization;\n- secrets embedded in the APK;\n- a backend API from trusting unverified client claims;\n- social engineering that convinces a user to grant powerful access.\n\nThey establish integrity and identity boundaries. Application security still depends on correct design and implementation.\n\n## Capstone Review Method\n\nUse this sequence when reviewing an Android application:\n\n### 1. Establish Device Trust\n\nRecord OS version, patch level, boot state, build type, and SELinux mode.\n\n```bash\nadb shell getprop ro.build.version.release\nadb shell getprop ro.build.version.security_patch\nadb shell getprop ro.build.type\nadb shell getenforce\n```\n\n### 2. Establish App Identity\n\nRecord package name, UID, signing certificate information, install source, and version.\n\n```bash\nadb shell dumpsys package com.example.app\nadb shell pm path com.example.app\n```\n\n### 3. Map the Attack Surface\n\nEnumerate permissions, exported components, deep links, providers, Binder services, network endpoints, files, and backup behavior.\n\n### 4. Trace Sensitive Data\n\nFollow data from collection through memory, IPC, storage, logs, backups, network transport, and deletion.\n\n### 5. Test Authorization Boundaries\n\nUse a separate unprivileged test application to invoke exported components and verify that the callee authenticates and authorizes the caller.\n\n### 6. Confirm Containment\n\nCompare UID, process, filesystem access, SELinux context, and relevant denial logs.\n\n### 7. Report the Failed Control Precisely\n\nExamples:\n\n- **Unprotected exported service**, not \"Android sandbox failure\";\n- **Sensitive data in shared storage**, not \"encryption bypass\";\n- **Permission re-delegation**, not \"runtime permission bypass\";\n- **Compromised test device**, not necessarily a production Verified Boot failure.\n\n## Final Takeaways\n\n- App signing establishes application identity and update trust.\n- Verified Boot establishes operating-system startup integrity.\n- Rollback protection helps prevent persistent downgrade to vulnerable versions.\n- Device state is essential forensic context.\n- Precise reporting identifies which control was expected and why it failed.\n\n---\n\n## Further Reading\n\n- [AOSP: App Signing](https://source.android.com/docs/security/features/apksigning)\n- [AOSP: Verified Boot](https://source.android.com/docs/security/features/verifiedboot)\n- [Android Developers: Sign Your App](https://developer.android.com/studio/publish/app-signing)\n- [Android Security Bulletins](https://source.android.com/docs/security/bulletin)",
    order: 7,
    category: "integrity",
    difficulty: "Intermediate",
    learningPathSlug: "android-security-model",
  }).returning();
  await db.insert(quizzes).values({
    lessonId: l7.id,
    question: "What is the primary security role of Android app signing?",
    options: ["It proves the app contains no vulnerabilities", "It establishes app identity, update continuity, and signature-based trust relationships", "It grants every runtime permission", "It encrypts all network traffic"],
    correctAnswer: 1,
    explanation: "Signing establishes who controls updates and enables signature-level trust. It does not certify that the app's code is secure.",
  });
  await db.insert(quizzes).values({
    lessonId: l7.id,
    question: "What is the purpose of Verified Boot rollback protection?",
    options: ["To restore deleted application data", "To prevent installation of apps from another store", "To prevent returning the platform to an older vulnerable version", "To revoke all runtime permissions after reboot"],
    correctAnswer: 2,
    explanation: "Rollback protection helps stop persistent downgrade attacks by enforcing acceptable software version progression.",
  });
  console.log("  Lesson 07 seeded.");

  // ── Challenges ──
  await db.insert(challenges).values({
    title: "Manifest Attack Surface Review",
    description: "Review a simplified AndroidManifest.xml excerpt. Identify the component that can expose private account records to another app. Submit the fully qualified component class name.",
    difficulty: "Medium",
    category: "android-component-security",
    flag: "com.trailbyte.vault.TokenProvider",
    hints: ["Focus on components that expose structured application data.", "Look for an exported component without a read permission.", "The flag is the fully qualified class name."],
    artifact: "<manifest package=\"com.trailbyte.vault\"\n    xmlns:android=\"http://schemas.android.com/apk/res/android\">\n\n    <uses-permission android:name=\"android.permission.INTERNET\" />\n\n    <application\n        android:allowBackup=\"false\"\n        android:label=\"Trail Vault\">\n\n        <activity\n            android:name=\".MainActivity\"\n            android:exported=\"true\">\n            <intent-filter>\n                <action android:name=\"android.intent.action.MAIN\" />\n                <category android:name=\"android.intent.category.LAUNCHER\" />\n            </intent-filter>\n        </activity>\n\n        <service\n            android:name=\".InternalSyncService\"\n            android:exported=\"false\" />\n\n        <provider\n            android:name=\".TokenProvider\"\n            android:authorities=\"com.trailbyte.vault.tokens\"\n            android:exported=\"true\" />\n\n        <receiver\n            android:name=\".BootReceiver\"\n            android:exported=\"false\" />\n    </application>\n</manifest>",
    technicalContext: "The exported TokenProvider is the critical issue. A content provider can expose structured\napplication data. Because this provider is exported and no read/write permission is shown,\nanother app may be able to query it. The correct remediation depends on the intended design:\nset android:exported=\"false\" if it is internal, or protect it with narrow read/write\npermissions and validate every query if external access is required.",
    learningPathSlug: LP_SLUG,
  });
  console.log("  Challenge seeded: Manifest Attack Surface Review");

  await db.insert(challenges).values({
    title: "Permission Re-Delegation Triage",
    description: "Analyze a service implementation and package information. Determine the security failure that lets an unprivileged app obtain a protected file through a privileged helper app.",
    difficulty: "Hard",
    category: "android-ipc",
    flag: "confused_deputy",
    hints: ["The caller does not directly bypass Linux file permissions.", "The service performs an operation using its own UID and privileges.", "The issue is also called permission re-delegation."],
    artifact: "=== Package information ===\nPackage: com.trailbyte.backup\nUID: 10241\nGranted permission: android.permission.MANAGE_EXTERNAL_STORAGE\n\nPackage: com.example.untrusted\nUID: 10318\nGranted permission: none\n\n=== Manifest excerpt ===\n<service\n    android:name=\".BackupService\"\n    android:exported=\"true\" />\n\n=== Simplified Binder method ===\nbyte[] readForBackup(String requestedPath) {\n    // No calling UID check\n    // No allowlist of approved application directories\n    return Files.readAllBytes(Paths.get(requestedPath));\n}\n\n=== Observed request ===\nCaller UID 10318 invokes readForBackup(\n    \"/sdcard/CompanyExports/customer-list.csv\"\n)\n\nThe service returns the file bytes to UID 10318.",
    technicalContext: "The untrusted app does not hold the broad storage permission. The exported BackupService\nperforms the read under the privileged backup app's authority and returns the result without\nauthorizing the caller or constraining the path. This is a confused-deputy or permission\nre-delegation vulnerability. Defenses include making the service unexported, requiring a\nsuitable permission, validating Binder caller identity, and limiting requests to explicit,\npre-authorized resources.",
    learningPathSlug: LP_SLUG,
  });
  console.log("  Challenge seeded: Permission Re-Delegation Triage");

  console.log("\nAndroid Security Model seed complete.");
  process.exit(0);
}

seed().catch((e) => { console.error(e); process.exit(1); });