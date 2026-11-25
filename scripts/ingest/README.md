# Ingestion des données

## Prix — World Bank Pink Sheet

```sh
npm run ingest:prices                       # trouve le lien du mois sur worldbank.org
npm run ingest:prices -- --url <lien.xlsx>  # lien explicite (« Monthly prices (XLS) »)
npm run ingest:prices -- --file ./x.xlsx    # fichier local
```

Écrit `src/data/generated/prices.json` : prix mensuels nominaux convertis en USD / tonne pour les 9 matières
(cacao, café arabica, sucre monde, huile de palme, huile de tournesol, blé US HRW, maïs, riz Thai 5 %, soja).
Tant que ce fichier a `"meta": null`, l'app reste sur les prix illustratifs.

- Le lien du fichier change chaque mois : le script le relit sur la page de la Banque mondiale.
- Si une série est renommée, le script s'arrête et liste les noms disponibles (voir `SERIES_MAP`).
- Mise à jour automatique : `.github/workflows/update-prices.yml` (le 5 de chaque mois, ouvre une PR).
- `fixtures/pink-sheet-sample.xlsx` est un faux classeur (valeurs inventées) pour tester le parseur hors ligne.

Reste illustratif : flux et parts d'export/import, scores de risque, alertes, concentration.

## Flux commerciaux — CEPII BACI

1. Télécharger l'archive BACI (révision **HS92** recommandée, la plus longue série) sur
   <https://www.cepii.fr/CEPII/en/bdd_modele/presentation.asp?id=37> et l'extraire dans un dossier
   (un CSV par année + `country_codes_*.csv`).
2. ```sh
   npm run ingest:flows -- --dir /chemin/vers/BACI_HS92_V2026xx            # 10 dernières années
   npm run ingest:flows -- --dir /chemin/vers/BACI_HS92_V2026xx --years 2015-2024
   ```

Écrit `src/data/generated/flows.json` : par matière et par année, top 12 exportateurs et importateurs
(valeur en USD, tonnes, part mondiale en valeur) et top 15 flux bilatéraux. Tant que le fichier a
`"meta": null`, l'app reste sur les flux illustratifs.

Codes HS retenus (4 chiffres, voir `HS_CODES`) : cacao 1801 (fèves), café 0901, sucre 1701, huile de palme 1511,
huile de tournesol 1512 (inclut carthame et coton), blé 1001, maïs 1005, riz 1006, soja 1201.

Limites à connaître : les parts sont en **valeur** ; les réexportations (ex. cacao via les Pays-Bas) comptent
comme exportations du pays réexportateur ; les centres de pays (flèches de la carte) sont des centroïdes
géométriques, approximatifs pour les pays à territoires lointains.
`fixtures/baci-sample/` est un faux jeu BACI (valeurs inventées) pour tester le script hors ligne.
