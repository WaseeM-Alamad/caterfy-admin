# Caterfy Admin v2

## Setup

```bash
npm install
cp .env.local.example .env.local
# Fill in your Supabase URL and anon key
npm run dev
```

## First admin user

1. Go to **Supabase → Auth → Users → Add user**
2. Create a user with email + password
3. Then run in SQL editor:
```sql
INSERT INTO admins (id, email, full_name, role)
VALUES ('paste-uuid-here', 'you@email.com', 'Your Name', 'super_admin');
```

## Stack
- Next.js 14 (App Router) · TypeScript · Tailwind CSS · Supabase
