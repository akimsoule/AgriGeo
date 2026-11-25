# AgriGeo — notes pour les agents

- Gestionnaire de paquets : **npm** (`npm install`, `npm run dev|build|test|lint`). Pas de bun.
- Ne pas modifier à la main `src/routeTree.gen.ts` (généré par TanStack Router).
- Les fichiers de `src/data/generated/` sont produits par `npm run ingest:*` ; ne pas les éditer à la main.

## Application architecture
- Keep TanStack Router file routes for all pages.
- Keep datasets in `src/data` (generated files in `src/data/generated`, written by `scripts/ingest`) and expose asynchronous reads in `src/lib/api.ts`; the app must not require a backend.
- Use React Query route loaders for local API reads so loading and error boundaries apply consistently.
- Use react-simple-maps with local world-atlas topology for geographic views and Recharts for quantitative charts; both share browser-safe domain data.
- Define presentation tokens and reusable visual rules in the global stylesheet, with a shared application shell in the root route.
