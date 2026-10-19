# Next.js Frontend

Stack: Next.js (App Router) · TypeScript · Tailwind CSS v4 · ESLint · Prettier

## Pages

- `/` landing page -> **Go to Dashboard** button `/login` e niye jay
- `/dashboard` — EcomDrive style admin dashboard (sidebar, topbar, KPI, charts). Data: `src/data/dashboard.ts`, menu: `src/config/dashboard.ts`
- `/login` ar `/register` — dark + pink design, form er submit e backend connect korte hobe (`LoginForm.tsx`, `RegisterForm.tsx` er TODO)

## Run korar niyom

```bash
npm install
npm run dev
```

Browser e kholun: http://localhost:3000

## Scripts

| Command              | Kaj                          |
| -------------------- | ---------------------------- |
| `npm run dev`        | Development server           |
| `npm run build`      | Production build             |
| `npm run start`      | Production server            |
| `npm run lint`       | ESLint check                 |
| `npm run format`     | Prettier diye code format    |
| `npm run type-check` | TypeScript error check       |

## Folder structure

```
src/
├── app/            # Pages, layouts, API routes
├── components/
│   └── ui/         # Reusable UI (Button, Logo)
├── config/         # Site config
├── hooks/          # Custom hooks
├── lib/            # api client, env, utils
└── types/          # Shared TypeScript types
```

## Backend connect

`.env.local` e `NEXT_PUBLIC_API_URL` set korun (NestJS backend er URL), tarpor:

```ts
import { api } from '@/lib/api';
const users = await api.get<User[]>('/users');
```
