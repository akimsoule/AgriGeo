# AgriGeo — notes pour les agents

- Gestionnaire de paquets : **npm** (`npm install`, `npm run dev|build|test|lint`). Pas de bun.
  Si `npm install` plante avec npm 10 (`edgesOut`), utiliser `npx npm@11 install`.
- Front : **Vite + React 19 en SPA**, routage **React Router** (routes dans `src/app/routes.tsx`, pages dans
  `src/pages`). Pas de rendu serveur.
- Backend : **Netlify Functions** (`netlify/functions`) : `dashboard.ts` sert `/api/dashboard`,
  `update-prices.ts` (planifiée, le 5 de chaque mois) met à jour les prix dans Netlify Blobs.
- Les fichiers de `src/data/generated/` sont produits par `npm run ingest:*` ; ne pas les éditer à la main.

## Architecture
- `src/data/agrigeo.ts` : `buildDataset({ prices, flows })` construit tout le jeu de données (pur, utilisé par le
  front et par la fonction). `bundledDataset` est le jeu embarqué (repli) ; `setDataset()` installe le jeu courant,
  lu via les exports `commodities`, `countries`, `priceMeta`, `flowsMeta` (live bindings ESM).
- `src/lib/api.ts` : `getDashboard()` appelle `/api/dashboard`, valide la forme, sinon retombe sur le jeu embarqué,
  puis appelle `setDataset()` **avant** le rendu. Le loader de la route racine garantit cet ordre.
- `shared/` : code utilisé à la fois par les scripts et les fonctions Netlify (`pink-sheet.ts`, `dashboard.ts`).
  Les fichiers de `netlify/` et `shared/` utilisent des imports **relatifs** (pas l'alias `@/`).
- Cartes : react-simple-maps avec `public/data/world.geo.json` ; graphiques : Recharts.
- Les tokens de présentation et règles visuelles communes sont dans `src/styles.css`.
