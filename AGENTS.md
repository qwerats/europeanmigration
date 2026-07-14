# AGENTS.md

## Cursor Cloud specific instructions

This is a static React SPA (no backend, no database) that visualizes EU migration data.

### Running the app

- **Dev server:** `npm run dev` — starts Vite on `http://localhost:5173/`
- **Build:** `npm run build` — outputs to `dist/`
- **Preview production build:** `npm run preview`

### Notes

- No lint script is configured in `package.json`. No ESLint or Prettier setup exists.
- No test framework is configured. There are no automated tests.
- All data is static JSON in `src/data/` — no APIs or external services are needed for local development.
- Node.js v22 is used (per CI workflow). The environment already has it installed.
- The UI is in Russian. Navigation items: HOME, ABOUT, CONTACT, RESOURCES. The main content is on the homepage with a "Узнать больше" (Learn more) button leading to the Statistical Explorer.
