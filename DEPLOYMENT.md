# SecOps Academy — Οδηγός Εγκατάστασης

Μια αυτόνομη πλατφόρμα εκπαίδευσης στην κυβερνοασφάλεια (ανάλυση κακόβουλου
λογισμικού + ασφάλεια Android) με διαδραστικά μαθήματα, κουίζ, CTF challenges,
και αφήγηση κειμένου μέσω τεχνητής νοημοσύνης. Όλα τρέχουν σε Docker — δεν
χρειάζεται εγκατάσταση κώδικα, βάσης δεδομένων ή εξαρτήσεων χειροκίνητα.

---

## Προαπαιτούμενα

- **Docker** και **Docker Compose** (το Docker Desktop σε Windows/Mac τα περιλαμβάνει και τα δύο)
- ~2 GB ελεύθερο χώρο στον δίσκο
- Η θύρα **5000** ελεύθερη στον host

Τίποτα άλλο. Δεν χρειάζεται Node.js, PostgreSQL ή Python στον host — όλα είναι
ενσωματωμένα στο image.

---

## Εγκατάσταση (5 λεπτά)

### 1. Τα δύο απαραίτητα αρχεία

Χρειάζεσαι μόνο:
- `docker-compose.prod.yml`
- `.env` (δημιουργείται από το template παρακάτω)

### 2. Δημιούργησε το αρχείο `.env`

Στον ίδιο φάκελο με το `docker-compose.prod.yml`, φτιάξε ένα αρχείο με όνομα `.env`:

```
SESSION_SECRET=ΑΛΛΑΞΕ_ΜΕ
ADMIN_EMAIL=to.email.sou@example.com
```

Δημιούργησε ένα ασφαλές `SESSION_SECRET` (οποιοδήποτε μεγάλο τυχαίο string). Για παράδειγμα:

**Linux / Mac:**
```bash
openssl rand -hex 32
```

**Windows (PowerShell):**
```powershell
-join ((1..64) | ForEach-Object { '{0:x}' -f (Get-Random -Max 16) })
```

Επικόλλησε το αποτέλεσμα ως τιμή του `SESSION_SECRET`. Όρισε το `ADMIN_EMAIL` στο
email με το οποίο θα εγγραφείς (αυτός ο λογαριασμός γίνεται αυτόματα διαχειριστής).

### 3. Εκκίνηση της πλατφόρμας

```bash
docker compose -f docker-compose.prod.yml up -d
```

Στην πρώτη εκτέλεση κατεβαίνει το image (~1 GB, περιλαμβάνει τα μοντέλα φωνής AI)
και ξεκινούν δύο containers: η εφαρμογή και μια βάση PostgreSQL. Κατά την εκκίνηση
αυτόματα:
- Δημιουργεί το σχήμα της βάσης
- Φορτώνει όλο το εκπαιδευτικό περιεχόμενο (μαθήματα, κουίζ, challenges)

Περίμενε ~30 δευτερόλεπτα και έλεγξε ότι είναι έτοιμο:

```bash
docker compose -f docker-compose.prod.yml logs app | tail -5
```

Θα πρέπει να δεις: `SecOps Academy running on http://localhost:5000`

### 4. Άνοιξε την εφαρμογή

Επισκέψου το **http://localhost:5000** σε έναν browser.

### 5. Γίνε διαχειριστής

1. Πάτησε **Register** και δημιούργησε λογαριασμό με το **ίδιο email** που έβαλες
   στο `ADMIN_EMAIL`.
2. Κάνε επανεκκίνηση της εφαρμογής μία φορά για να εφαρμοστούν τα δικαιώματα διαχειριστή:
   ```bash
   docker compose -f docker-compose.prod.yml restart app
   ```
3. Τώρα έχεις πρόσβαση στο admin panel (δημιουργία/επεξεργασία μαθημάτων, challenges,
   και learning paths).

---

## Καθημερινές εντολές

| Ενέργεια | Εντολή |
|---|---|
| Εκκίνηση | `docker compose -f docker-compose.prod.yml up -d` |
| Διακοπή | `docker compose -f docker-compose.prod.yml down` |
| Προβολή logs | `docker compose -f docker-compose.prod.yml logs -f app` |
| Επανεκκίνηση εφαρμογής | `docker compose -f docker-compose.prod.yml restart app` |
| Πλήρες reset (διαγραφή όλων των δεδομένων) | `docker compose -f docker-compose.prod.yml down -v` |

Τα δεδομένα (λογαριασμοί χρηστών, πρόοδος, ανεβασμένα αρχεία) διατηρούνται μεταξύ
επανεκκινήσεων σε Docker volumes. Μόνο το `down -v` τα διαγράφει.

---

## Χαρακτηριστικά προς εξερεύνηση

- **Δύο learning paths** — Malware Analysis και Android Security, το καθένα με
  θεωρητικά μαθήματα, κουίζ αξιολόγησης γνώσεων, και CTF challenges.
- **CTF challenges** — μερικά περιλαμβάνουν αρχεία προς λήψη (π.χ. Android APK)
  για πρακτική στατική ανάλυση. Υπόβαλε το flag που ανακαλύπτεις.
- **Αφήγηση με μασκότ** — κάθε μάθημα έχει κουμπί "Listen"· μια κινούμενη μασκότ
  διαβάζει το περιεχόμενο φωναχτά μέσω τοπικής μηχανής neural text-to-speech
  (χαρακτηριστικό προσβασιμότητας).
- **Πρόοδος & βαθμίδες** — η ολοκλήρωση μαθημάτων και η κατάκτηση flags κερδίζει XP
  και προάγει μέσα από επτά βαθμίδες αναλυτή ασφάλειας.
- **Admin panel** — πλήρης διαχείριση περιεχομένου: δημιουργία και επεξεργασία
  learning paths, μαθημάτων (με οπτικό quiz builder), και challenges (με μεταφόρτωση αρχείων).

---

## Επίλυση προβλημάτων

**Η θύρα 5000 χρησιμοποιείται ήδη** — σταμάτησε ό,τι τη χρησιμοποιεί, ή άλλαξε τη
γραμμή `ports` στο `docker-compose.prod.yml` (π.χ. `"8080:5000"` για να χρησιμοποιήσεις
τη θύρα 8080).

**"Admin user not found yet"** στα logs — δεν έχεις εγγραφεί ακόμα με τον λογαριασμό
`ADMIN_EMAIL`. Κάνε register στην εφαρμογή, μετά επανεκκίνηση του app container.

**Το login δεν διατηρείται / αποσυνδέεται συνέχεια** — βεβαιώσου ότι μπαίνεις μέσω
`http://localhost:5000` (όχι https:// URL).

**Χρειάζεσαι εντελώς καθαρή αρχή** —
`docker compose -f docker-compose.prod.yml down -v` και μετά `up -d` ξανά.
