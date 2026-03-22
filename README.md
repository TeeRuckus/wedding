# T & J Wedding Check-In App

A mobile-first web application for managing wedding guest check-ins, table assignments, and event coordination.

---

## Architecture Overview

```
wedding-app/
├── public/
├── src/
│   ├── components/
│   │   ├── layout/          # Shared layout: PageWrapper, Banner, BotanicalDecor
│   │   ├── guest/           # Guest-facing pages (landing, find seats, agenda, etc.)
│   │   ├── admin/           # Admin portal pages (login, dashboard, guest management)
│   │   └── ui/              # Reusable UI components (Button, Input, Toast)
│   ├── hooks/               # Custom React hooks (useGuest, useAgenda, useAdmin)
│   ├── lib/                 # Service integrations (Supabase client, EmailJS, validation)
│   ├── App.jsx              # Route definitions
│   ├── main.jsx             # Entry point
│   └── index.css            # Global styles + Tailwind
├── .env.example             # Environment variable template
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

---

## Prerequisites

- **Node.js** ≥ 18 (check with `node --version`)
- **npm** ≥ 9 (comes with Node.js)
- A free **Supabase** account
- A free **EmailJS** account

---

## Step 1: Install Node.js (if needed)

If you don't have Node.js installed:

```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# macOS (with Homebrew)
brew install node

# Verify
node --version
npm --version
```

---

## Step 2: Clone and Install Dependencies

```bash
cd wedding-app
npm install
```

This installs React, Vite, Tailwind CSS, Supabase client, React Router, EmailJS, and Lucide icons.

---

## Step 3: Set Up Supabase (Free Tier — Database)

Supabase gives you a free PostgreSQL database with a generous free tier (500MB storage, 50K monthly active users). This is more than sufficient for 122 guests.

### 3.1 Create a Supabase project

1. Go to [https://supabase.com](https://supabase.com) and sign up (free)
2. Click **New Project**
3. Choose a name (e.g., `wedding-app`), set a strong database password, choose the closest region (for Perth, choose `Southeast Asia (Singapore)`)
4. Wait for the project to provision (~2 minutes)

### 3.2 Get your API credentials

1. Go to **Project Settings** → **API**
2. Copy the **Project URL** (looks like `https://abc123.supabase.co`)
3. Copy the **anon/public key** (starts with `eyJ...`)

### 3.3 Create the database tables

Go to **SQL Editor** in Supabase and run these queries one at a time:

#### Guests table

```sql
CREATE TABLE guests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  salutation TEXT DEFAULT '',
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  table_number INTEGER NOT NULL,
  seat_number INTEGER NOT NULL,
  seat_description TEXT DEFAULT '',
  tablemates JSONB DEFAULT '[]'::jsonb,
  checked_in BOOLEAN DEFAULT false,
  checked_in_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast name lookups (case-insensitive)
CREATE INDEX idx_guests_name ON guests (LOWER(first_name), LOWER(last_name));

-- Enable Row Level Security
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read guests (needed for check-in)
CREATE POLICY "Allow public read" ON guests
  FOR SELECT USING (true);

-- Allow anyone to update check-in status
CREATE POLICY "Allow public check-in" ON guests
  FOR UPDATE USING (true)
  WITH CHECK (true);

-- Allow authenticated users (admin) full access
CREATE POLICY "Allow admin full access" ON guests
  FOR ALL USING (auth.role() = 'authenticated');
```

#### Agenda table

```sql
CREATE TABLE agenda (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  start_time TEXT NOT NULL,
  end_time TEXT DEFAULT '',
  event_name TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  passed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE agenda ENABLE ROW LEVEL SECURITY;

-- Anyone can read the agenda
CREATE POLICY "Allow public read agenda" ON agenda
  FOR SELECT USING (true);

-- Only authenticated users can modify
CREATE POLICY "Allow admin modify agenda" ON agenda
  FOR ALL USING (auth.role() = 'authenticated');
```

#### Failed attempts table

```sql
CREATE TABLE failed_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name_attempted TEXT NOT NULL,
  last_name_attempted TEXT NOT NULL,
  attempt_number INTEGER DEFAULT 1,
  attempted_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE failed_attempts ENABLE ROW LEVEL SECURITY;

-- Anyone can insert failed attempts
CREATE POLICY "Allow public insert" ON failed_attempts
  FOR INSERT WITH CHECK (true);

-- Only admin can read
CREATE POLICY "Allow admin read" ON failed_attempts
  FOR SELECT USING (auth.role() = 'authenticated');
```

### 3.4 Enable Realtime for the agenda table

This is what makes the agenda update live for all guests when the admin edits it.

1. Go to **Database** → **Replication**
2. Under "Source", find the `agenda` table
3. Toggle it ON for realtime

### 3.5 Seed sample agenda data

```sql
INSERT INTO agenda (start_time, end_time, event_name, sort_order) VALUES
  ('2:30 PM', '3:15 PM', 'Ceremony Begins', 1),
  ('3:15 PM', '4:30 PM', 'Cocktail Hour', 2),
  ('4:30 PM', '6:00 PM', 'Reception & Dinner', 3),
  ('6:00 PM', '6:30 PM', 'First Dance', 4),
  ('6:30 PM', '7:00 PM', 'Cake Cutting', 5),
  ('7:00 PM', '11:00 PM', 'Dancing & Celebration', 6);
```

### 3.6 Create the admin user

1. Go to **Authentication** → **Users** → **Add User**
2. Enter an email and a strong password
3. This is your admin login for the app

To **reset the admin password**: go to **Authentication** → **Users**, find the user, and click **Reset Password**. Alternatively, you can use Supabase's built-in password reset flow.

---

## Step 4: Set Up EmailJS (Free Tier — Email Notifications)

EmailJS lets you send emails directly from the browser. The free tier gives you 200 emails/month which is plenty.

### 4.1 Create an EmailJS account

1. Go to [https://www.emailjs.com](https://www.emailjs.com) and sign up (free)
2. Go to **Email Services** → **Add New Service** → choose Gmail (or your provider)
3. Connect your email account
4. Note the **Service ID** (e.g., `service_abc123`)

### 4.2 Create an email template

1. Go to **Email Templates** → **Create New Template**
2. Set up the template with these variables:

**Subject:** `Wedding App — Guest Needs Assistance`

**Body:**
```
A guest was unable to find their seat after 3 attempts.

Attempt 1: {{attempt_1}}
Attempt 2: {{attempt_2}}
Attempt 3: {{attempt_3}}

Photo attached: {{photo_attached}}
Time: {{timestamp}}
```

3. Set **To Email** to `{{to_email}}`
4. Note the **Template ID** (e.g., `template_abc123`)

### 4.3 Get your public key

1. Go to **Account** → **API Keys**
2. Copy the **Public Key**

---

## Step 5: Configure Environment Variables

```bash
cp .env.example .env
```

Open `.env` in Neovim and fill in your values:

```bash
nvim .env
```

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

VITE_EMAILJS_SERVICE_ID=service_abc123
VITE_EMAILJS_TEMPLATE_ID=template_abc123
VITE_EMAILJS_PUBLIC_KEY=your_public_key_here

VITE_ADMIN_EMAIL=tawanakwaramba@gmail.com
VITE_PHOTO_SHARE_URL=https://your-photo-sharing-link.com

# Wedding Registry (bank details)
VITE_REGISTRY_BSB=XXX-XXX
VITE_REGISTRY_ACCOUNT=XXXXXXXX
VITE_REGISTRY_ACCOUNT_NAME=T & J Wedding
```

**IMPORTANT:** Never commit your `.env` file to git. It's already in `.gitignore`.

---

## Step 6: Run Locally

```bash
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000)

- Guest interface: `http://localhost:3000`
- Admin portal: `http://localhost:3000/admin`

---

## Step 7: Import Your Guest List

You can import your 122 guests via the Supabase SQL editor. Format your data as:

```sql
INSERT INTO guests (salutation, first_name, last_name, table_number, seat_number, seat_description, tablemates)
VALUES
  ('Mr', 'John', 'Smith', 1, 1, 'Near the dance floor, left side', '["Jane Smith", "Bob Johnson"]'),
  ('Mrs', 'Jane', 'Smith', 1, 2, 'Near the dance floor, left side', '["John Smith", "Bob Johnson"]'),
  -- ... more guests
;
```

**Tip:** Create a spreadsheet with your guest data, export as CSV, then convert to SQL INSERT statements. Alternatively, use Supabase's CSV import feature:

1. Go to **Table Editor** → **guests** → **Insert** → **Import from CSV**
2. Upload a CSV with columns matching: `salutation, first_name, last_name, table_number, seat_number, seat_description`

---

## Step 8: Deploy (Free)

### Recommended: Vercel (Free)

1. Push your code to GitHub
2. Go to [https://vercel.com](https://vercel.com) and import your repo
3. Add your environment variables in the Vercel dashboard
4. Deploy!

### Alternative: Netlify (Free)

```bash
npm run build
# Upload the `dist` folder to Netlify
```

---

## Uploading the Coordinator Photo

To add the event coordinator's photo to the Help page:

1. Place the image in `public/coordinator.jpg`
2. In `src/components/guest/HelpPage.jsx`, replace the `<User>` icon placeholder with:

```jsx
<img
  src="/coordinator.jpg"
  alt="Event Coordinator"
  className="w-28 h-28 rounded-full object-cover mx-auto mb-4 border-2 border-wedding-border"
/>
```

---

## Database Schema Summary

| Table | Columns |
|-------|---------|
| **guests** | id, salutation, first_name, last_name, table_number, seat_number, seat_description, tablemates (JSON), checked_in, checked_in_at |
| **agenda** | id, start_time, end_time, event_name, sort_order, passed |
| **failed_attempts** | id, first_name_attempted, last_name_attempted, attempt_number, attempted_at |

---

## Key Design Decisions

- **Supabase Auth** for admin authentication — secure, battle-tested, free
- **Supabase Realtime** for live agenda updates — no polling needed
- **EmailJS** for client-side email — no server required, free tier sufficient
- **Environment variables** for all sensitive data — nothing hardcoded
- **Row Level Security** on all tables — guests can only read/check-in, admins have full access
- **Mobile-first design** — all layouts optimised for phone screens
- **Black accent colour** with cream/warm stone backgrounds — classy, modern wedding aesthetic

---

## Troubleshooting

**"Missing Supabase environment variables"** → Check your `.env` file has the correct `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

**Agenda not updating in real-time** → Make sure you enabled Realtime on the `agenda` table in Supabase (Database → Replication)

**Email not sending** → Verify your EmailJS service ID, template ID, and public key in `.env`. Check the EmailJS dashboard for delivery logs.

**Admin can't log in** → Make sure you created a user in Supabase Authentication. Use the exact email and password you set.

**Guest not found** → Names are matched case-insensitively. Check for extra spaces or special characters in the database entries.
