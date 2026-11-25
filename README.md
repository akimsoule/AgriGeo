# AgriGeo

Observatoire de la géopolitique des matières premières alimentaires : carte des flux commerciaux,
prix et alertes de risque, fiches matières et pays (cacao, café, sucre, huiles, blé, maïs, riz, soja).

## Démarrer

```sh
npm install
npm run dev      # http://localhost:8080 (front seul : l'API est absente, le jeu embarqué est utilisé)
npm test
npm run build    # produit dist/
```

Avec les fonctions Netlify en local (API `/api/dashboard` incluse) : `npx netlify dev` → http://localhost:8888.

Pile : Vite · React 19 · React Router · Tailwind 4 · shadcn/ui · react-simple-maps · Recharts · Vitest.
Backend : Netlify Functions (TypeScript) + Netlify Blobs.

## Déploiement (Netlify)

`netlify.toml` configure le build, les fonctions et la redirection SPA. **Chaque déploiement télécharge d'abord les derniers prix** (`npm run ingest:prices`) puis construit `dist` ; si le téléchargement échoue, le build continue avec les prix déjà dans le dépôt (voir les logs de build).

| Fonction | Rôle |
|---|---|
| `GET /api/dashboard` | Sert le jeu de données complet. Prend les prix stockés (Blobs) s'ils sont plus récents que ceux embarqués au dernier déploiement. |
| `update-prices` (planifiée, le 5 de chaque mois) | Télécharge le Pink Sheet de la Banque mondiale, le valide, le publie dans Blobs : les prix se mettent à jour sans redéploiement. |

Si l'API est indisponible, l'application affiche le jeu embarqué. Variable optionnelle : `PINK_SHEET_URL`
(lien explicite du classeur si la découverte automatique échoue).

## Données

| Donnée | Statut |
|---|---|
| Prix mensuels (Banque mondiale, Pink Sheet) | Réel après le premier passage de `update-prices` sur Netlify, ou `npm run ingest:prices` pour l'embarqué (voir `scripts/ingest/README.md`) |
| Flux, parts d'export/import (CEPII BACI) | Réel après `npm run ingest:flows` (voir `scripts/ingest/README.md`) |
| Scores de risque, alertes, vulnérabilité des pays | Illustratif pour l'instant |

Sources visées : FAOSTAT, UN Comtrade, CEPII BACI, Banque mondiale, GDELT.
