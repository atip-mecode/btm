# BMT Web

Next.js app using React, strict TypeScript, Tailwind CSS v4, and shadcn/ui-ready configuration.

## Getting started

```sh
pnpm install
pnpm dev
```

Open http://localhost:3000. The app uses mobile-first Tailwind breakpoints and includes a development-only viewport panel (tap the bug button) inspired by the MAEC dev tools. On tablet/desktop, the panel can toggle a 390 × 844 phone frame; turn it off to inspect the responsive full-page layout.

After preparing courts and players, tap **จับคู่** to open `/match?state=...`. The result is encoded in the URL, so copying that URL lets someone else view the same match without your local storage. The encoding is not encryption; anyone with the URL can read the names in it.

## Docker development

Run `docker compose up --build` and open http://localhost:3000. The container mounts this project for hot reload and publishes port 3000 to the host.

## Environments

Use `.env.development.local` for local development overrides and `.env.test.local` for test-only values. Example files are committed as `.env.development.example` and `.env.test.example`; keep secrets in ignored `.env.*.local` files.

## UI components

Add shadcn/ui components with the shadcn CLI. Component source lives in `src/components/ui`; shared design tokens live in `src/app/globals.css`.
