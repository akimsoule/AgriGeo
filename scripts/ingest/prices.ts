/**
 * Ingestion des prix mensuels — World Bank Commodity Price Data ("Pink Sheet").
 *
 * Usage :
 *   bun run ingest:prices                      # découvre le lien actuel sur worldbank.org
 *   bun run ingest:prices -- --url <lien.xlsx>  # lien explicite
 *   bun run ingest:prices -- --file ./x.xlsx    # fichier local (tests, hors ligne)
 *
 * Écrit src/data/generated/prices.json (prix en USD / tonne, 60 derniers mois utilisés par l'app,
 * historique complet conservé depuis 2000).
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { readSheet } from "read-excel-file/node";
import type { PricePoint, PricesFile } from "../../src/data/prices-types";

const PAGE_URL = "https://www.worldbank.org/en/research/commodity-markets";
const OUTPUT = resolve(process.cwd(), "src/data/generated/prices.json");
const FIRST_YEAR = 2000;

/** Séries du Pink Sheet retenues pour chaque matière de l'app (premier nom trouvé gagne). */
export const SERIES_MAP: Record<string, { match: RegExp; label: string }> = {
  cacao: { match: /^cocoa\b/i, label: "Cocoa" },
  cafe: { match: /^coffee,?\s*arabica/i, label: "Coffee, Arabica" },
  sucre: { match: /^sugar,?\s*world/i, label: "Sugar, world" },
  "huile-palme": { match: /^palm oil/i, label: "Palm oil" },
  "huile-tournesol": { match: /^sunflower oil/i, label: "Sunflower oil" },
  ble: { match: /^wheat,?\s*us\s*hrw/i, label: "Wheat, US HRW" },
  mais: { match: /^maize/i, label: "Maize" },
  riz: { match: /^rice,?\s*thai\s*5/i, label: "Rice, Thai 5%" },
  soja: { match: /^soybeans\b/i, label: "Soybeans" },
};

type Cell = string | number | boolean | Date | null | undefined;

const MONTH_RE = /^(\d{4})M(\d{2})$/;
const cellText = (c: Cell) => (c == null ? "" : String(c).replace(/\s+/g, " ").trim());

/** Convertit une valeur du fichier vers USD / tonne selon l'unité d'origine. */
export function toUsdPerTonne(value: number, unit: string): number {
  const u = unit.toLowerCase().replace(/\s/g, "");
  if (u.includes("/kg")) return value * 1000;
  if (u.includes("/mt") || u.includes("/tonne")) return value;
  throw new Error(`Unité non gérée : "${unit}"`);
}

/** Analyse la feuille « Monthly Prices » (lignes brutes) en séries par matière. */
export function parseMonthlySheet(rows: Cell[][]): PricesFile["series"] {
  const firstData = rows.findIndex((r) => MONTH_RE.test(cellText(r[0])));
  if (firstData < 0) throw new Error("Aucune ligne de données de type 1960M01 trouvée.");

  // En-têtes : la ligne de noms est la dernière ligne texte dense au-dessus des données,
  // la ligne d'unités celle qui contient des "($/…)".
  let unitRow = -1;
  for (let i = firstData - 1; i >= 0; i--) {
    if (rows[i]!.some((c) => /\(\s*\$\s*\//.test(cellText(c)))) {
      unitRow = i;
      break;
    }
  }
  if (unitRow < 0) throw new Error("Ligne des unités introuvable.");
  let nameRow = -1;
  for (let i = unitRow - 1; i >= 0; i--) {
    if (rows[i]!.filter((c) => cellText(c) !== "").length >= 5) {
      nameRow = i;
      break;
    }
  }
  if (nameRow < 0) throw new Error("Ligne des noms de séries introuvable.");

  const names = rows[nameRow]!.map(cellText);
  const units = rows[unitRow]!.map(cellText);
  const result: PricesFile["series"] = {};
  const missing: string[] = [];

  for (const [id, { match, label }] of Object.entries(SERIES_MAP)) {
    const col = names.findIndex((n, i) => i > 0 && match.test(n));
    if (col < 0) {
      missing.push(`${id} (${label})`);
      continue;
    }
    const originalUnit = units[col] ?? "";
    const points: PricePoint[] = [];
    for (let r = firstData; r < rows.length; r++) {
      const m = MONTH_RE.exec(cellText(rows[r]![0]));
      if (!m) continue;
      if (Number(m[1]) < FIRST_YEAR) continue;
      const raw = rows[r]![col];
      const num = typeof raw === "number" ? raw : Number(cellText(raw));
      if (
        raw == null ||
        cellText(raw) === "" ||
        /^\.\.|…/.test(cellText(raw)) ||
        !Number.isFinite(num)
      )
        continue;
      points.push({
        date: `${m[1]}-${m[2]}-01`,
        value: Math.round(toUsdPerTonne(num, originalUnit) * 100) / 100,
      });
    }
    if (points.length < 60)
      throw new Error(`Série "${label}" : seulement ${points.length} points.`);
    result[id] = { label: names[col]!, originalUnit, points };
  }

  if (missing.length) {
    throw new Error(
      `Séries introuvables dans le fichier : ${missing.join(", ")}.\n` +
        `Noms disponibles : ${names.filter(Boolean).join(" | ")}`,
    );
  }
  return result;
}

async function discoverFileUrl(): Promise<string> {
  const res = await fetch(PAGE_URL, { headers: { "user-agent": "agrigeo-ingest/1.0" } });
  if (!res.ok) throw new Error(`Page ${PAGE_URL} : HTTP ${res.status}`);
  const html = await res.text();
  const hrefs = [...html.matchAll(/href="([^"]*CMO-Historical-Data-Monthly\.xlsx[^"]*)"/gi)].map(
    (m) => m[1]!,
  );
  if (!hrefs.length) {
    throw new Error(
      "Lien du fichier mensuel introuvable sur la page. Passe --url avec le lien « Monthly prices (XLS) ».",
    );
  }
  return new URL(hrefs[0]!, PAGE_URL).toString();
}

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

async function main() {
  const localFile = arg("file");
  let buffer: Buffer;
  let fileUrl: string;
  if (localFile) {
    buffer = await readFile(localFile);
    fileUrl = `file:${localFile}`;
  } else {
    fileUrl = arg("url") ?? process.env["PINK_SHEET_URL"] ?? (await discoverFileUrl());
    console.log(`Téléchargement : ${fileUrl}`);
    const res = await fetch(fileUrl, { headers: { "user-agent": "agrigeo-ingest/1.0" } });
    if (!res.ok) throw new Error(`Fichier : HTTP ${res.status}`);
    buffer = Buffer.from(await res.arrayBuffer());
  }

  let rows: Cell[][];
  try {
    rows = (await readSheet(buffer, "Monthly Prices")) as Cell[][];
  } catch (e) {
    throw new Error(`Feuille « Monthly Prices » illisible : ${(e as Error).message}`);
  }
  const series = parseMonthlySheet(rows);
  const lastMonth = Object.values(series)
    .map((s) => s.points[s.points.length - 1]!.date)
    .sort()[0]!;

  const out: PricesFile = {
    meta: {
      source: "World Bank Commodity Price Data (The Pink Sheet)",
      sourceUrl: PAGE_URL,
      fileUrl,
      licence:
        "Voir les conditions d’utilisation des données de la Banque mondiale (worldbank.org)",
      retrievedAt: new Date().toISOString(),
      lastMonth,
      unit: "USD / tonne (nominal)",
    },
    series,
  };
  await mkdir(dirname(OUTPUT), { recursive: true });
  await writeFile(OUTPUT, JSON.stringify(out, null, 1) + "\n");
  console.log(
    `OK : ${Object.keys(series).length} séries, dernier mois commun ${lastMonth} → ${OUTPUT}`,
  );
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((e) => {
    console.error(`Échec : ${e.message}`);
    process.exit(1);
  });
}
