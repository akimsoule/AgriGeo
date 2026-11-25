# AgriGeo

Observatoire de la géopolitique des matières premières alimentaires : carte des flux commerciaux,
prix et alertes de risque, fiches matières et pays (cacao, café, sucre, huiles, blé, maïs, riz, soja).

## Démarrer

```sh
npm install
npm run dev      # http://localhost:8080
npm test
npm run build
```

Pile : TanStack Start (React 19) · Tailwind 4 · shadcn/ui · react-simple-maps · Recharts · Vitest.
Déploiement : Cloudflare par défaut ; autre cible avec `NITRO_PRESET` (ex. `NITRO_PRESET=netlify npm run build`).

## Données

| Donnée | Statut |
|---|---|
| Prix mensuels (Banque mondiale, Pink Sheet) | Réel après `npm run ingest:prices` (voir `scripts/ingest/README.md`) |
| Flux, parts d'export/import, scores de risque, alertes | Illustratif pour l'instant |

Sources visées : FAOSTAT, UN Comtrade, CEPII BACI, Banque mondiale, GDELT.
