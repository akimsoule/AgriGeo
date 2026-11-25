# Ingestion des données

## Prix — World Bank Pink Sheet

```sh
bun run ingest:prices                       # trouve le lien du mois sur worldbank.org
bun run ingest:prices -- --url <lien.xlsx>  # lien explicite (« Monthly prices (XLS) »)
bun run ingest:prices -- --file ./x.xlsx    # fichier local
```

Écrit `src/data/generated/prices.json` : prix mensuels nominaux convertis en USD / tonne pour les 9 matières
(cacao, café arabica, sucre monde, huile de palme, huile de tournesol, blé US HRW, maïs, riz Thai 5 %, soja).
Tant que ce fichier a `"meta": null`, l'app reste sur les prix illustratifs.

- Le lien du fichier change chaque mois : le script le relit sur la page de la Banque mondiale.
- Si une série est renommée, le script s'arrête et liste les noms disponibles (voir `SERIES_MAP`).
- Mise à jour automatique : `.github/workflows/update-prices.yml` (le 5 de chaque mois, ouvre une PR).
- `fixtures/pink-sheet-sample.xlsx` est un faux classeur (valeurs inventées) pour tester le parseur hors ligne.

Reste illustratif : flux et parts d'export/import, scores de risque, alertes, concentration.
