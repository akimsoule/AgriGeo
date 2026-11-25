/**
 * Ingestion des prix mensuels — World Bank Commodity Price Data ("Pink Sheet").
 *
 * Usage :
 *   npm run ingest:prices                      # découvre le lien actuel sur worldbank.org
 *   npm run ingest:prices -- --url <lien.xlsx>  # lien explicite
 *   npm run ingest:prices -- --file ./x.xlsx    # fichier local (tests, hors ligne)
 *
 * Écrit src/data/generated/prices.json : le jeu de prix embarqué dans l'application (repli).
 * En production, la fonction planifiée Netlify (netlify/functions/update-prices.ts) fait la même
 * chose chaque mois et publie le résultat dans Netlify Blobs, sans redéploiement.
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { buildPricesFile, fetchPricesFile } from "../../shared/pink-sheet";

const OUTPUT = resolve(process.cwd(), "src/data/generated/prices.json");

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

async function main() {
  const localFile = arg("file");
  const out = localFile
    ? await buildPricesFile(await readFile(localFile), `file:${localFile}`)
    : await fetchPricesFile(arg("url") ?? process.env["PINK_SHEET_URL"]);
  await mkdir(dirname(OUTPUT), { recursive: true });
  await writeFile(OUTPUT, JSON.stringify(out, null, 1) + "\n");
  console.log(
    `OK : ${Object.keys(out.series).length} séries, dernier mois commun ${out.meta?.lastMonth} → ${OUTPUT}`,
  );
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((e) => {
    console.error(`Échec : ${e.message}`);
    process.exit(1);
  });
}
