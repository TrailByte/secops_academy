# SecOps Academy - Οδηγός Εγκατάστασης

Ολόκληρη η εφαρμογή εκτελείται σε Docker. Δεν απαιτείται εγκατάσταση κώδικα, βάσης δεδομένων ή άλλων εξαρτήσεων.

---

## Προαπαιτούμενα

- **Docker** και **Docker Compose** (το Docker Desktop σε Windows και macOS τα περιλαμβάνει και τα δύο)
- Περίπου 1 GB ελεύθερου χώρου στον δίσκο
- Τη θύρα **5000** ελεύθερη

Δεν χρειάζεται Node.js, PostgreSQL ή Python - όλα είναι ενσωματωμένα στο image.

---

## Εγκατάσταση

### Βήμα 1 - Τα απαραίτητα αρχεία

Χρειάζονται μόνο δύο αρχεία στον ίδιο φάκελο:

- `docker-compose.prod.yml`
- `.env` (δημιουργείται στο επόμενο βήμα)

### Βήμα 2 - Δημιουργία του αρχείου `.env`

Δημιουργήστε ένα αρχείο με όνομα `.env` και το εξής περιεχόμενο:

```
SESSION_SECRET=
ADMIN_EMAIL=
```

Για το `SESSION_SECRET` χρειάζεται ένα τυχαίο string. Μπορείτε να το δημιουργήσετε ως εξής:

**Linux / macOS**

```bash
openssl rand -hex 32
```

**Windows (PowerShell)**

```powershell
-join ((1..64) | ForEach-Object { '{0:x}' -f (Get-Random -Max 16) })
```

Επικολλήστε το αποτέλεσμα ως τιμή του `SESSION_SECRET`.

Στο `ADMIN_EMAIL` συμπληρώστε το email με το οποίο θα εγγραφείτε στην πλατφόρμα. Ο λογαριασμός αυτός θα αποκτήσει αυτόματα δικαιώματα διαχειριστή.

Το τελικό αρχείο θα μοιάζει έτσι:

```
SESSION_SECRET=42d0d19b9334a711d7452e2cc6bfbc10e0e9b0ec77ed4f7826b31c3b07e003c2
ADMIN_EMAIL=professor@example.com
```

### Βήμα 3 - Εκκίνηση

```bash
docker compose -f docker-compose.prod.yml up -d
```

Στην πρώτη εκτέλεση κατεβαίνει το image (περίπου 1 GB - περιλαμβάνει τα μοντέλα φωνής) και ξεκινούν δύο containers: η εφαρμογή και η βάση δεδομένων.

Η εφαρμογή δημιουργεί αυτόματα το σχήμα της βάσης και φορτώνει όλο το εκπαιδευτικό περιεχόμενο.

Μετά από περίπου 30 δευτερόλεπτα, επιβεβαιώστε ότι είναι έτοιμη:

```bash
docker compose -f docker-compose.prod.yml logs app | tail -5
```

Αναμενόμενο μήνυμα:

```
SecOps Academy running on http://localhost:5000
```

### Βήμα 4 - Πρόσβαση

Ανοίξτε το http://localhost:5000 σε έναν browser.

### Βήμα 5 - Ενεργοποίηση διαχειριστή

1. Click **Sign in**
2. Click **Create one** και δημιουργήστε λογαριασμό με το ίδιο email που ορίσατε στο `ADMIN_EMAIL`.
3. Κάντε επανεκκίνηση της εφαρμογής ώστε να εφαρμοστούν τα δικαιώματα:

```bash
docker compose -f docker-compose.prod.yml restart app
```

3. Επιβεβαιώστε στα logs:

```bash
docker compose -f docker-compose.prod.yml logs app | grep -i admin
```

Αναμενόμενο μήνυμα: `Admin promoted: <το email σας>`

Μετά από αυτό, εμφανίζεται ο σύνδεσμος **Admin** στη γραμμή πλοήγησης.

---

## Βασικές εντολές

| Ενέργεια | Εντολή |
|---|---|
| Εκκίνηση | `docker compose -f docker-compose.prod.yml up -d` |
| Διακοπή | `docker compose -f docker-compose.prod.yml down` |
| Προβολή logs | `docker compose -f docker-compose.prod.yml logs -f app` |
| Επανεκκίνηση | `docker compose -f docker-compose.prod.yml restart app` |
| Πλήρης διαγραφή δεδομένων | `docker compose -f docker-compose.prod.yml down -v` |

Τα δεδομένα (λογαριασμοί, πρόοδος, αρχεία) διατηρούνται μεταξύ επανεκκινήσεων. Μόνο η εντολή `down -v` τα διαγράφει.

---

## Χαρακτηριστικά της πλατφόρμας

**Learning paths**

Δύο θεματικές ενότητες, Malware Analysis και Android Security. Κάθε μία περιλαμβάνει θεωρητικά μαθήματα με διαγράμματα και κουίζ αξιολόγησης.

**CTF challenges**

Ορισμένα challenges συνοδεύονται από αρχεία προς λήψη, όπως Android APK, για πρακτική στατική ανάλυση με εργαλεία όπως `unzip`, `apktool` ή `jadx`. Ο χρήστης υποβάλλει το flag που ανακαλύπτει.

**Αφήγηση με την "μασκότ" του κάθε Learning Path**

Κάθε μάθημα διαθέτει κουμπί **Listen**. Μια κινούμενη μασκότ αφηγείται το περιεχόμενο, χρησιμοποιώντας τοπική μηχανή neural text-to-speech. Λειτουργεί εξ ολοκλήρου εντός του container, χωρίς εξωτερική υπηρεσία.

**Πρόοδος και βαθμίδες**

Η ολοκλήρωση μαθημάτων και η επίλυση challenges αποδίδει πόντους εμπειρίας και οδηγεί σε προαγωγή μέσα από επτά βαθμίδες αναλυτή ασφάλειας.

**Πίνακας διαχείρισης**

Πλήρης διαχείριση περιεχομένου από το ίδιο το περιβάλλον: δημιουργία και επεξεργασία learning paths, μαθημάτων με οπτικό quiz builder, και challenges με δυνατότητα μεταφόρτωσης αρχείων.

---

## Κώδικας

https://github.com/TrailByte/secops_academy

---

## Επίλυση προβλημάτων

**Η θύρα 5000 χρησιμοποιείται ήδη**

Τερματίστε την εφαρμογή που τη δεσμεύει, ή τροποποιήστε τη γραμμή `ports` στο `docker-compose.prod.yml` - για παράδειγμα `"8080:5000"` ώστε να χρησιμοποιηθεί η θύρα 8080.

**Στα logs εμφανίζεται «Admin user not found yet»**

Το μήνυμα είναι αναμενόμενο πριν από την εγγραφή. Δημιουργήστε τον λογαριασμό με το email του `ADMIN_EMAIL` και κάντε επανεκκίνηση της εφαρμογής.

**Η σύνδεση δεν διατηρείται**

Βεβαιωθείτε ότι η πρόσβαση γίνεται μέσω `http://localhost:5000` και όχι μέσω διεύθυνσης `https://`.

**Επαναφορά σε αρχική κατάσταση**

```bash
docker compose -f docker-compose.prod.yml down -v
docker compose -f docker-compose.prod.yml up -d
```
