/**
 * Seed script: Android Security Model — Learning Path
 * Run with: npx tsx script/seed-android-security.ts
 * 
 * Adds 4 lessons + 9 quizzes to SecOps Academy
 */

import { db } from "../server/db";
import { lessons, quizzes, challenges } from "../shared/schema";

async function seed() {
  console.log("Seeding Android Security Model learning path...\n");

  // ── LESSON 1: Introduction ───────────────────────────────────────────────
  const [l1] = await db.insert(lessons).values({
    title: "Android Security Model: Overview",
    slug: "android-security-overview",
    category: "android-security",
    difficulty: "Beginner",
    order: 100,
    content: `
# Android Security Model

Android is one of the most widely deployed operating systems in the world — running on billions of devices. Understanding how it protects users and isolates applications is foundational knowledge for any security professional.

## Three Layers of Defense

Android's security model is built around three complementary layers. No single layer is sufficient on its own — they work together to create **defense in depth**.

| Layer | Mechanism | Where it runs |
|-------|-----------|--------------|
| App Sandbox | Linux UID isolation (DAC) | Kernel |
| Permissions | Runtime access control | Android Framework |
| SELinux | Mandatory Access Control (MAC) | Kernel |

## Why It Matters

When a malicious app gets installed — whether via a phishing link, a third-party APK store, or a supply chain attack — these three layers are what stand between the attacker and sensitive user data.

Understanding how each layer works, where it can fail, and how they interact is essential for:

- **Threat modeling** Android applications
- **Penetration testing** mobile environments  
- **Incident response** on Android devices
- **Secure development** of Android apps

## Learning Path

This module covers each layer in depth:

1. **App Sandbox** — UID isolation and DAC at the kernel level
2. **Permissions** — Runtime permission model and dangerous permission categories
3. **SELinux** — Mandatory Access Control, policy enforcement, AVC denials
4. **Incident Scenario** — A complete attack chain and how each layer responds

Let's start from the foundation.
`.trim(),
  }).returning();

  console.log(`✓ Lesson 1: ${l1.title} (id: ${l1.id})`);

  // ── LESSON 2: App Sandbox ────────────────────────────────────────────────
  const [l2] = await db.insert(lessons).values({
    title: "Layer 1: The App Sandbox",
    slug: "android-app-sandbox",
    category: "android-security",
    difficulty: "Beginner",
    order: 101,
    content: `
# The App Sandbox

## What Is the App Sandbox?

The App Sandbox is Android's first and most fundamental layer of security. It ensures that every installed application is isolated from every other application and from the operating system itself.

The key insight: **Android didn't build a sandbox. It reused the Linux process isolation model that has been battle-tested for 50 years.**

## UID Isolation

When you install an app, the Android **Package Manager** assigns it a unique **Linux User ID (UID)**. This assignment happens once, at install time, and never changes for the lifetime of that installation.

\`\`\`
com.banking.app      → UID 10031
com.fake.flashlight  → UID 10184
com.messaging.app    → UID 10096
\`\`\`

From the Linux kernel's perspective, these are three completely different users — as separate as different human users on a multi-user Linux server.

## DAC: Discretionary Access Control

The kernel enforces isolation using **DAC (Discretionary Access Control)**. Files created by a process with UID 10031 are owned by that UID, with permission bits set to restrict access to the owner only.

\`\`\`bash
# Banking app's private database
ls -la /data/data/com.banking.app/databases/
-rw------- 1 u0_a31 u0_a31  65536 accounts.db
#           ^owner  ^group
#            UID 10031
\`\`\`

When the flashlight app (UID 10184) tries to open this file:

\`\`\`c
open("/data/data/com.banking.app/databases/accounts.db", O_RDONLY)
// Kernel checks: file owner = 10031, caller = 10184
// No match. Permission bits = 600 (owner-only).
// Returns: -1, errno = 13 (EACCES)
\`\`\`

This happens **before any Android framework code runs**. No Java, no Kotlin, no API. The kernel says no.

## Three Pillars

### 1. UID Isolation
Every app runs as its own Linux user. The kernel denies cross-UID filesystem access automatically.

### 2. Process Isolation
Each app runs in its own process with its own heap, stack, and address space. One app crashing doesn't affect others. One app being exploited can't read another app's memory directly.

### 3. Private Data Directory
Each app gets \`/data/data/com.package.name/\` created with mode **700** (owner read/write/execute only). No other UID can access files inside it.

## What the Sandbox Doesn't Protect Against

- Apps with **granted permissions** that the user approved
- **Root exploits** that bypass UID checks at the kernel level
- **SELinux policy gaps** that allow privilege escalation (mitigated by Layer 3)
- **Shared UIDs** (deprecated but historically used by vendor apps)

The sandbox is the foundation. The next two layers address its limitations.
`.trim(),
  }).returning();

  console.log(`✓ Lesson 2: ${l2.title} (id: ${l2.id})`);

  await db.insert(quizzes).values([
    {
      lessonId: l2.id,
      question: "What does the kernel return when UID 10184 tries to open a file owned by UID 10031 with permissions 600?",
      options: JSON.stringify([
        "EACCES — errno 13, permission denied",
        "The app crashes with a NullPointerException",
        "Android displays a permission dialog",
        "The file is returned read-only",
      ]),
      correctAnswer: 0,
      explanation: "EACCES (errno 13) is returned by the kernel's VFS layer before any Android framework code runs. The kernel checks UID ownership against the file's permission bits — no match means immediate denial.",
    },
    {
      lessonId: l2.id,
      question: "Where does Android's App Sandbox isolation actually come from?",
      options: JSON.stringify([
        "Linux kernel DAC — Android reuses standard Unix process isolation",
        "The Android Runtime (ART) enforces it",
        "The app's AndroidManifest.xml declares the sandbox",
        "Google Play Protect monitors cross-app access",
      ]),
      correctAnswer: 0,
      explanation: "Android assigns UIDs and the Linux kernel enforces isolation. The sandbox exists even for native C++ apps that never touch ART, and works below all Android framework layers.",
    },
  ]);

  console.log(`  + 2 quizzes for Lesson 2`);

  // ── LESSON 3: Permissions ────────────────────────────────────────────────
  const [l3] = await db.insert(lessons).values({
    title: "Layer 2: The Permission System",
    slug: "android-permissions",
    category: "android-security",
    difficulty: "Intermediate",
    order: 102,
    content: `
# The Android Permission System

## Why Permissions Exist

The App Sandbox isolates apps from each other — but what about shared device resources? The camera, contacts database, microphone, location, and call logs are resources that legitimate apps may need to access. The permission system provides **granular, user-controlled access** to these sensitive resources.

## Three Permission Categories

### Normal Permissions
Automatically granted at install time. Cover low-risk operations where no user data is at stake.

Examples: \`INTERNET\`, \`VIBRATE\`, \`SET_WALLPAPER\`, \`RECEIVE_BOOT_COMPLETED\`

The user never sees a dialog for these — they're just granted.

### Dangerous Permissions
Protect sensitive user data and device capabilities. Require **explicit user approval at runtime** (Android 6.0+).

\`\`\`
Group: Contacts     → READ_CONTACTS, WRITE_CONTACTS
Group: Location     → ACCESS_FINE_LOCATION, ACCESS_COARSE_LOCATION
Group: Camera       → CAMERA
Group: Microphone   → RECORD_AUDIO
Group: Phone        → READ_CALL_LOG, CALL_PHONE
Group: Storage      → READ_EXTERNAL_STORAGE (deprecated Android 13+)
\`\`\`

### Signature Permissions
Only granted to apps signed with the **same certificate** as the app that declared the permission. Used for privileged inter-app communication — third-party apps cannot obtain these.

### Privileged Permissions
A special category for apps pre-installed in \`/system/priv-app/\`. Include capabilities like \`INSTALL_PACKAGES\` and \`MANAGE_DEVICE_ADMINS\`.

## Runtime Permission Flow

\`\`\`kotlin
// Step 1: Check current state
val status = ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA)

if (status != PackageManager.PERMISSION_GRANTED) {
    // Step 2: Request — system shows the dialog
    ActivityCompat.requestPermissions(
        this,
        arrayOf(Manifest.permission.CAMERA),
        REQUEST_CODE_CAMERA
    )
}

// Step 3: Handle result
override fun onRequestPermissionsResult(requestCode: Int, permissions: Array<String>, grantResults: IntArray) {
    if (grantResults[0] == PackageManager.PERMISSION_GRANTED) {
        // Access granted
    } else {
        // Handle denial — check shouldShowRequestPermissionRationale()
    }
}
\`\`\`

## The "Don't Ask Again" Flag

If the user denies a dangerous permission **twice**, Android sets an internal flag:

- \`shouldShowRequestPermissionRationale()\` returns \`false\`
- Future calls to \`requestPermissions()\` silently return \`DENIED\` — **no dialog shown**
- The app must redirect the user to **Settings → Apps → [App Name] → Permissions** manually

This prevents apps from spam-requesting permissions after repeated denials.

## Permissions Are Scoped

A critical security property: **each dangerous permission maps to exactly one resource**.

\`READ_CONTACTS\` gives access to the system contacts provider — and nothing else. It doesn't give access to:
- Other apps' private databases
- The filesystem generally  
- Other dangerous permission groups

This scoping is enforced at the framework level. Permissions cannot be "stacked" to gain broader access.

## The Permission/SELinux Relationship

Even a granted permission doesn't guarantee access. **SELinux (Layer 3)** enforces policy independently of the permission system.

> A permission is the gate. SELinux is the wall behind the gate.

An operation can be:
- ✅ Permitted by both permission system and SELinux → **allowed**
- ❌ Denied by permission system → **blocked** (no SELinux check needed)
- ❌ Permitted by permissions, denied by SELinux → **blocked with AVC log**
`.trim(),
  }).returning();

  console.log(`✓ Lesson 3: ${l3.title} (id: ${l3.id})`);

  await db.insert(quizzes).values([
    {
      lessonId: l3.id,
      question: "What category is the INTERNET permission, and how is it granted?",
      options: JSON.stringify([
        "Normal — automatically granted at install, no user dialog",
        "Dangerous — requires explicit runtime approval",
        "Signature — only for apps signed with the system certificate",
        "Privileged — only for pre-installed system apps",
      ]),
      correctAnswer: 0,
      explanation: "INTERNET is classified as a Normal permission — low risk, automatically granted at install time. No dialog is shown to the user. If it were Dangerous, every app requesting network access would generate a popup, which would be unworkable.",
    },
    {
      lessonId: l3.id,
      question: "A user denies a permission twice. What happens on the next call to requestPermissions()?",
      options: JSON.stringify([
        "The dialog is silently suppressed — app must direct user to Settings",
        "The dialog shows with an additional 'don't ask again' checkbox",
        "The permission is permanently revoked and cannot be granted",
        "Android shows a system notification about the blocked request",
      ]),
      correctAnswer: 0,
      explanation: "After two denials, shouldShowRequestPermissionRationale() returns false and requestPermissions() silently returns DENIED without showing any dialog. The only way to grant the permission is for the user to navigate to Settings → Apps → Permissions manually.",
    },
    {
      lessonId: l3.id,
      question: "If a malicious app is granted READ_CONTACTS, what additional access does that give it?",
      options: JSON.stringify([
        "Only the system contacts provider — nothing else",
        "All contacts and data from any app that stores contact-like data",
        "Read access to the entire /data/data/ directory",
        "Access to the full permission group including call log and phone",
      ]),
      correctAnswer: 0,
      explanation: "Permissions are scoped to their specific resource. READ_CONTACTS opens access only to the system contacts content provider. The private databases of other apps remain protected by UID isolation (Layer 1). Permission groups in Android are for UX purposes — each permission still requires individual approval.",
    },
  ]);

  console.log(`  + 3 quizzes for Lesson 3`);

  // ── LESSON 4: SELinux ────────────────────────────────────────────────────
  const [l4] = await db.insert(lessons).values({
    title: "Layer 3: SELinux on Android",
    slug: "android-selinux",
    category: "android-security",
    difficulty: "Advanced",
    order: 103,
    content: `
# SELinux on Android

## What Is SELinux?

SELinux (Security-Enhanced Linux) is **Mandatory Access Control (MAC)** at the kernel level. Where DAC (Layer 1) is owner-controlled, MAC is system-controlled: policies are set by the OS vendor, not the file owner. Even root cannot override them.

Android has shipped SELinux in **enforcing mode** since Android 5.0 (Lollipop). Before that, Android 4.3–4.4 used permissive mode (logging only).

## DAC vs MAC

| | DAC (App Sandbox) | MAC (SELinux) |
|--|--|--|
| Policy set by | File owner | OS vendor (policy ships with OS) |
| Can root bypass? | Yes | No (in enforcing mode) |
| Granularity | UID/GID/permissions | Type transitions, object classes |
| Failure mode | Compromised owner = game over | Defense in depth even after root |

## Security Context Labels

Every process and every file/device/socket on the system has an **SELinux security context**:

\`\`\`
# Process context (from /proc/PID/attr/current)
u:r:untrusted_app:s0:c184,c512   ← third-party app
u:r:system_server:s0              ← Android system server
u:r:zygote:s0                     ← Zygote (app spawner)

# File context (from ls -Z)
u:object_r:app_data_file:s0:c184,c512  ← app's own data
u:object_r:system_file:s0              ← /system files
u:object_r:mem_device:s0               ← /dev/mem
\`\`\`

Format: \`user:role:type:level\`

The **type** is the primary component used in policy rules.

## Policy Rules

SELinux policy is a whitelist: **if an action is not explicitly allowed, it is denied**.

\`\`\`
# Allow untrusted_app to read/write its own data files
allow untrusted_app app_data_file:file { read write getattr };

# Allow zygote to create app processes  
allow zygote untrusted_app:process { transition };

# NO rule for untrusted_app → mem_device
# → any access attempt = AVC denial
\`\`\`

## AVC Denials

When SELinux blocks an operation, it generates an **AVC (Access Vector Cache) denial** in the kernel log:

\`\`\`
avc: denied { read } for 
  pid=4821 
  comm="flashlight" 
  path="/dev/mem" 
  scontext=u:r:untrusted_app:s0:c184,c512 
  tcontext=u:object_r:mem_device:s0 
  tclass=chr_file 
  permissive=0
\`\`\`

This log entry tells you:
- **What** was denied: \`read\` on a \`chr_file\` (character device)
- **Who** tried: \`untrusted_app\` context
- **What target**: \`mem_device\` type (\`/dev/mem\`)
- **Enforced**: \`permissive=0\` means the denial was real

## The Policy Chain

The SELinux policy ships with the Android OS image and is part of the **verified boot chain (dm-verity)**. This means:

1. The policy **cannot be modified at runtime** without triggering a boot failure
2. Changing the policy requires a full **OTA system update**  
3. A rooted device can disable enforcement — but this requires custom kernel/recovery

## Why Root Isn't Enough

This is the key takeaway: **in SELinux enforcing mode, UID 0 (root) is still subject to policy**.

A process running as root but with scontext \`u:r:untrusted_app:s0\` still gets AVC denials for anything not permitted in the \`untrusted_app\` policy.

To truly bypass SELinux, an attacker needs either:
- A **kernel exploit** that changes the SELinux enforcement mode
- A **policy exploit** that exploits an overly permissive allow rule
- The ability to **modify the policy file** — which requires breaking dm-verity

## Putting It Together: The Incident

An attacker sideloads a malicious flashlight app. It tries three attacks:

1. **Reads banking database** → EACCES from DAC (Layer 1)
2. **Uses READ_CONTACTS permission** → Scoped access only, banking data inaccessible (Layer 2)
3. **Accesses /proc/mem for memory read** → AVC denied, no allow rule for untrusted_app → proc_mem (Layer 3)

All three layers hold. Defense in depth.
`.trim(),
  }).returning();

  console.log(`✓ Lesson 4: ${l4.title} (id: ${l4.id})`);

  await db.insert(quizzes).values([
    {
      lessonId: l4.id,
      question: "A process running as UID 0 (root) tries to read /data/data/com.banking.app/. There is no SELinux allow rule for this. What happens?",
      options: JSON.stringify([
        "AVC denied — SELinux blocks the operation regardless of UID",
        "Root automatically bypasses SELinux in Android",
        "SELinux switches to permissive mode when root is detected",
        "The access is logged but allowed since root is trusted",
      ]),
      correctAnswer: 0,
      explanation: "MAC overrides DAC. In enforcing mode, even UID 0 is subject to SELinux policy. A root exploit gives you UID 0 but not necessarily the correct SELinux type — and without the right type, policy-denied operations are still blocked with an AVC denial.",
    },
    {
      lessonId: l4.id,
      question: "What does 'deny by default' mean in SELinux policy?",
      options: JSON.stringify([
        "Every action needs an explicit allow rule — no rule means the operation is blocked",
        "Dangerous system calls are blocked by default, safe ones are allowed",
        "New apps are denied all permissions until the user grants them",
        "The system prompts for confirmation before allowing unknown operations",
      ]),
      correctAnswer: 0,
      explanation: "SELinux is a whitelist model. Every single operation — read, write, execute, connect, create — needs an explicit allow rule in the policy. Nothing is assumed safe. This is fundamentally different from a blacklist where you enumerate the dangerous things.",
    },
    {
      lessonId: l4.id,
      question: "An AVC denial log shows: scontext=u:r:untrusted_app:s0, tcontext=u:object_r:system_file:s0, { read }. What does this mean?",
      options: JSON.stringify([
        "A third-party app tried to read a system file — blocked by SELinux",
        "The system server read an untrusted app's file — allowed",
        "An app was denied runtime permission to access system storage",
        "SELinux is running in permissive mode and logged but allowed the read",
      ]),
      correctAnswer: 0,
      explanation: "The scontext (source context) is untrusted_app — a third-party app. The tcontext (target context) is system_file — a file in /system. The { read } operation was denied. permissive=0 in AVC denials means the operation was actually blocked, not just logged.",
    },
    {
      lessonId: l4.id,
      question: "Why can't a rooted Android device easily modify the SELinux policy at runtime?",
      options: JSON.stringify([
        "The policy ships with the OS and is protected by dm-verity verified boot",
        "Root access doesn't include write permissions to /sys/fs/selinux",
        "Android re-downloads the policy from Google servers on every boot",
        "The policy is stored in encrypted hardware — inaccessible even with root",
      ]),
      correctAnswer: 0,
      explanation: "The SELinux policy is part of the verified boot chain (dm-verity). Modifying it requires modifying the system partition, which breaks dm-verity and triggers a boot failure on locked bootloaders. Changing policy requires either a full OTA update or an unlocked bootloader with a custom system image.",
    },
  ]);

  console.log(`  + 4 quizzes for Lesson 4`);

  // ── CHALLENGE ────────────────────────────────────────────────────────────
  const [c1] = await db.insert(challenges).values({
    title: "AVC Denial Analysis",
    description: "Analyze this SELinux AVC denial log and identify what security boundary was violated, which layer stopped the attack, and what the attacker was trying to do.",
    difficulty: "Medium",
    category: "android-security",
    flag: "SECOPS{untrusted_app_mem_device_read_blocked}",
    hints: JSON.stringify([
      "Look at the scontext — what type of process is the source?",
      "Look at the tcontext — what type of object is being accessed?",
      "What would /dev/mem access allow an attacker to do?",
      "The flag format encodes: source_type, target_type, operation",
    ]),
    artifact: `# AVC Denial Log — Incident 2024-11-14

\`\`\`
kernel: avc: denied { read } for 
  pid=9821 
  comm="com.fake.flashlight" 
  name="mem" 
  dev="tmpfs" 
  ino=47823 
  scontext=u:r:untrusted_app:s0:c184,c512 
  tcontext=u:object_r:mem_device:s0 
  tclass=chr_file 
  permissive=0

kernel: avc: denied { open } for 
  pid=9821 
  comm="com.fake.flashlight"
  path="/dev/mem" 
  dev="tmpfs" 
  ino=47823 
  scontext=u:r:untrusted_app:s0:c184,c512 
  tcontext=u:object_r:mem_device:s0 
  tclass=chr_file 
  permissive=0
\`\`\`

**Device:** Samsung Galaxy S23, Android 14, One UI 6.1  
**Time:** 2024-11-14 03:42:17 UTC  
**App installed:** com.fake.flashlight (sideloaded APK, not Play Store)

**Questions to answer:**
1. What process tried to perform this action?
2. What was it trying to access?
3. What would this access allow the attacker to accomplish?
4. Which security layer blocked this, and how?
5. What is the flag?`,
    technicalContext: `## Technical Deep Dive

### What is /dev/mem?

\`/dev/mem\` is a character device that provides direct access to the system's **physical memory**. On Linux/Android, reading \`/dev/mem\` allows:

- Direct reading of RAM contents — including other processes' memory
- Extraction of cryptographic keys stored in memory
- Reading sensitive data from other apps' heap/stack
- Kernel memory inspection (on older kernels without KASLR)

### The SELinux Block

The AVC denial shows:
- **Source**: \`untrusted_app\` — the SELinux type assigned to all third-party apps
- **Target**: \`mem_device\` — the type assigned to \`/dev/mem\` and similar memory devices
- **Operations**: \`read\` and \`open\` — both blocked
- **permissive=0** — enforcing mode, the operations were actually denied

The Android SELinux policy has no \`allow untrusted_app mem_device:chr_file { read open }\` rule. Deny by default means this is blocked regardless of the app's UID or any granted permissions.

### Why This Matters

Even if this app had been granted every available dangerous permission — READ_CONTACTS, CAMERA, LOCATION — none of those permissions would have opened access to \`/dev/mem\`. The permission system (Layer 2) doesn't govern device file access. SELinux (Layer 3) does.

This is precisely the defense-in-depth value of having three independent layers.`,
  }).returning();

  console.log(`✓ Challenge: ${c1.title} (id: ${c1.id})`);

  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Android Security Model learning path seeded!

Lessons created: 4
  #${l1.id} — ${l1.title}
  #${l2.id} — ${l2.title}  
  #${l3.id} — ${l3.title}
  #${l4.id} — ${l4.title}

Quizzes: 9 total
Challenges: 1

Category slug: android-security
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);
}

seed().catch(console.error).finally(() => process.exit(0));
