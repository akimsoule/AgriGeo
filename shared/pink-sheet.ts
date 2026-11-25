/**
 * Lecture du World Bank Commodity Price Data (« Pink Sheet »), partagée entre le script
 * `npm run ingest:prices` et la fonction planifiée Netlify.
 */
import { readSheet } from "read-excel-file/node";
import type { PricePoint, PricesFile } from "../src/data/prices-types";

export const PAGE_URL = "https://www.worldbank.org/en/research/commodity-markets";
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

export async function discoverFileUrl(): Promise<string> {
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

/** Transforme le classeur mensuel en fichier de prix prêt à servir (USD / tonne). */
export async function buildPricesFile(
  buffer: Buffer | Uint8Array,
  fileUrl: string,
): Promise<PricesFile> {
  let rows: Cell[][];
  try {
    rows = (await readSheet(buffer as Buffer, "Monthly Prices")) as Cell[][];
  } catch (e) {
    throw new Error(`Feuille « Monthly Prices » illisible : ${(e as Error).message}`);
  }
  const series = parseMonthlySheet(rows);
  const lastMonth = Object.values(series)
    .map((s) => s.points[s.points.length - 1]!.date)
    .sort()[0]!;
  return {
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
}

/** Télécharge le classeur (lien donné, sinon découvert sur la page) et le transforme. */
export async function fetchPricesFile(url?: string): Promise<PricesFile> {
  const fileUrl = url ?? (await discoverFileUrl());
  const res = await fetch(fileUrl, { headers: { "user-agent": "agrigeo-ingest/1.0" } });
  if (!res.ok) throw new Error(`Fichier : HTTP ${res.status}`);
  return buildPricesFile(Buffer.from(await res.arrayBuffer()), fileUrl);
}

/** Garde de forme pour des prix reçus d'ailleurs (stockage, réseau) : les ignorer plutôt que casser l'app. */
export function isPricesFile(value: unknown): value is PricesFile {
  const v = value as Partial<PricesFile> | null;
  if (!v?.meta || typeof v.meta.lastMonth !== "string" || !v.series) return false;
  const ids = Object.keys(SERIES_MAP);
  return ids.every((id) => {
    const points = v.series?.[id]?.points;
    return Array.isArray(points) && points.length >= 60 && typeof points[0]?.value === "number";
  });
}
