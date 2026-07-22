<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Build / lint / type-check
- Build: `npm run build`
- Type-check + build: `npx next build`
- Lint: `npx next lint`
- Dev: `npm run dev`

# Project: Plataforma de Orientación y Denuncia de Violencia Digital
- Next.js 16 App Router, Tailwind CSS v4, Drizzle ORM, PostgreSQL
- `src/app/(chat)/` — chat route group (víctima)
- `src/app/(panel)/` — operator panel route group
- `src/app/api/` — API routes
- `src/db/` — Drizzle schema and connection
- `src/lib/` — utilities (auth, pin, s3, chat-machine)
