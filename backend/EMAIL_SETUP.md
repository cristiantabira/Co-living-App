# Email Notifications Integration - Co-living App

## Overview

Sistemul de notificări prin email al aplicației permite:
1. **Notificări de cheltuieli** - când se adaugă o nouă cheltuială sau factură
2. **Reminder-uri de plată** - pentru a aminti utilizatorilor să plătească datoriile

## Setup - Cum să configurezi email-ul

### Opțiunea 1: Mailtrap (Recomandat pentru Development)

1. Mergi la https://mailtrap.io/ și creeaza un cont gratuit
2. Creeaza o "Inbox" nouă
3. Copiază credențialele SMTP din tab-ul "Integrations" (Node.js)
4. În `backend/.env`, adaugă:

```env
EMAIL_HOST=smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_SECURE=false
EMAIL_USER=your_mailtrap_username
EMAIL_PASS=your_mailtrap_password
EMAIL_FROM=noreply@coliving-app.com
```

5. Pornește backend-ul și testează!

### Opțiunea 2: MailPit (Local Testing - cel mai bun)

1. Instalează MailPit: https://github.com/axllent/mailpit
   - Pe Windows: `choco install mailpit`
   - Pe macOS: `brew install mailpit`
   - Pe Linux: Descarcă din releases

2. Pornește MailPit:
   ```bash
   mailpit
   ```

3. Deschide UI-ul la `http://localhost:8025`

4. În `backend/.env`:
```env
EMAIL_HOST=localhost
EMAIL_PORT=1025
EMAIL_SECURE=false
```

### Opțiunea 3: Gmail (Production)

1. Activează 2FA pe contul tău Google
2. Generează "App Password": https://myaccount.google.com/apppasswords
3. În `backend/.env`:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password-16-chars
EMAIL_FROM=noreply@coliving-app.com
```

## Features

### 1. Notificări de Cheltuieli Noi
- Trimise automat când se creează o cheltuială de grup
- Include descrierea, suma, și cine a plătit
- Template HTML frumos formatat

### 2. Notificări de Facturi Noi
- Trimise automat când administratorul creează o factură
- Menționează că e o factură administrativă
- Precizează cum e distribuită suma

### 3. Reminder-uri de Plată
- Endpoint: `POST /api/expenses/send-reminder`
- Se declanșează din butonul "Trimite Reminder" în pagina Debts
- Notifică datorul să plătească creditorului

## API Endpoints

### Trimite Reminder de Plată
```
POST /api/expenses/send-reminder
Headers: Authorization: Bearer <token>
Body: {
    debtId: 5,           // ID-ul datoriei (ExpenseDebt)
    creditId: undefined  // Optional, nu-l folosi pentru acum
}
Response: {
    message: "Reminder trimis cu succes lui [Nume]!",
    debtId: 5
}
```

## Flow-uri

### Când se adaugă o cheltuială de grup:
1. Utilizatorul 1 creează cheltuiala în `POST /api/expenses`
2. Server-ul distribuie datoriile la utilizatorii 2,3,4
3. Server-ul trimite automat emailuri la 2,3,4 cu detaliile
4. Utilizatorii primesc notificări + pot vedea în app

### Când se adaugă o factură administrativă:
1. Admin creează factură în `POST /api/expenses/admin/bill`
2. Server-ul distribuie datoriile la toți locuitorii
3. Server-ul trimite automat emailuri la toți cu "Noua Factură"
4. Utilizatorii pot vedea în Activity > "Facturi"

### Când se trimite reminder:
1. Utilizatorul 1 (creditor) deschide Debts Details
2. Apasă "Trimite Reminder" pe rândul cu Utilizatorul 2
3. Se apelează `POST /api/expenses/send-reminder` cu debtId
4. Server-ul trimite email lui Utilizatorul 2 cu reminder
5. Utilizatorul 2 primește email: "Utilizator 1 ți-a trimis reminder..."

## Troubleshooting

**Email-urile nu se trimit?**
- Verifică `.env` cu credențialele corecte
- Dacă folosești Mailtrap/Gmail, verifica că ai credențialele exacte
- Deschide browser DevTools (F12) și verifica Network tab pentru erori

**SMTP Error - Connection refused?**
- Dacă folosești localhost:1025, asigură-te că MailPit e pornit
- `mailpit` din terminal și deschide http://localhost:8025

**Email-urile merg dar nu le vezi?**
- Dacă folosești Mailtrap, deschide inbox-ul tău pe mailtrap.io
- Dacă folosești MailPit, deschide http://localhost:8025

## Testing Manual

1. Pornește backend: `cd backend && npm run dev`
2. Pornește frontend: `cd frontend && npm run dev`
3. Deschide MailPit/Mailtrap inbox
4. În app:
   - Adaugă o cheltuială nouă → ar trebui să apară email
   - Du-te în Debts Details, apasă "Trimite Reminder" → ar trebui email nou
5. Verifica inbox-ul: ar trebui să vezi emailurile cu HTML formatat frumos

## Code Structure

```
backend/
├── services/
│   └── emailService.js         # Serviciu email cu funcții
├── controllers/
│   └── expenseController.js    # Integrare notificări în endpoints
└── .env.example                # Configurare email
```

## Note Importante

- Emailurile se trimit **asincron** - nu blocăm răspunsul HTTP
- Dacă emailul eșuează, utilizatorul nu vede eroare (happy path)
- Emailurile au template HTML frumos cu culori și styling
- Pentru production, recomand SendGrid sau o soluție dedicată
