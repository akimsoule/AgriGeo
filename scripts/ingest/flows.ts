/**
 * Ingestion des flux commerciaux — CEPII BACI (données bilatérales HS6, source UN Comtrade).
 *
 * 1. Télécharger l'archive BACI (révision HS92 recommandée : plus longue série) depuis
 *    https://www.cepii.fr/CEPII/en/bdd_modele/presentation.asp?id=37 et l'extraire dans un dossier.
 * 2. npm run ingest:flows -- --dir /chemin/vers/BACI_HS92_V2026xx [--years 2015-2024]
 *
 * Écrit src/data/generated/flows.json : par matière et par année, top exportateurs/importateurs
 * (valeur, tonnes, part mondiale) et top flux bilatéraux.
 */
import { createReadStream } from "node:fs";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { createInterface } from "node:readline";
import { geoCentroid } from "d3-geo";
import isoCountries from "i18n-iso-countries";
import type { FlowParty, FlowsFile, YearFlows } from "../../src/data/flows-types";

const OUTPUT = resolve(process.cwd(), "src/data/generated/flows.json");
const GEOJSON = resolve(process.cwd(), "public/data/world.geo.json");
const TOP_PARTIES = 12;
const TOP_FLOWS = 15;

/** Codes HS (4 chiffres) par matière. Plusieurs produits d'une même matière peuvent être listés. */
export const HS_CODES: Record<string, string[]> = {
  cacao: ["1801"], // fèves de cacao
  cafe: ["0901"], // café vert et torréfié
  sucre: ["1701"], // sucre de canne ou de betterave
  "huile-palme": ["1511"],
  "huile-tournesol": ["1512"], // tournesol, carthame et coton
  ble: ["1001"],
  mais: ["1005"],
  riz: ["1006"],
  soja: ["1201"],
};

type Acc = {
  exp: Map<string, [number, number, boolean]>;
  imp: Map<string, [number, number, boolean]>;
  pairs: Map<string, number>;
  world: number;
  worldTonnes: number;
};

export type CountryCodes = Map<string, string>; // code BACI → ISO2

/** Lit country_codes_*.csv (country_code, country_name, country_iso2, country_iso3). */
export function parseCountryCodes(csv: string): CountryCodes {
  const lines = csv.split(/\r?\n/).filter(Boolean);
  const header = lines[0]!.split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
  const codeIdx = header.indexOf("country_code");
  const iso2Idx = header.indexOf("country_iso2");
  if (codeIdx < 0 || iso2Idx < 0) {
    throw new Error(`country_codes : colonnes attendues absentes (trouvé : ${header.join(", ")}).`);
  }
  const map: CountryCodes = new Map();
  for (const line of lines.slice(1)) {
    const cells = line.split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
    const iso2 = cells[iso2Idx] ?? "";
    if (/^[A-Z]{2}$/.test(iso2)) map.set(cells[codeIdx]!, iso2);
  }
  return map;
}

function newAcc(): Acc {
  return { exp: new Map(), imp: new Map(), pairs: new Map(), world: 0, worldTonnes: 0 };
}

function add(
  map: Map<string, [number, number, boolean]>,
  key: string,
  v: number,
  q: number | null,
) {
  const cur = map.get(key) ?? [0, 0, false];
  cur[0] += v;
  if (q != null) {
    cur[1] += q;
    cur[2] = true;
  }
  map.set(key, cur);
}

/** Ajoute une ligne BACI (déjà filtrée sur un produit) aux cumuls. v : milliers d'USD, q : tonnes. */
export function addRow(acc: Acc, from: string, to: string, v: number, q: number | null) {
  const value = v * 1000;
  add(acc.exp, from, value, q);
  add(acc.imp, to, value, q);
  acc.pairs.set(`${from}>${to}`, (acc.pairs.get(`${from}>${to}`) ?? 0) + value);
  acc.world += value;
  if (q != null) acc.worldTonnes += q;
}

function topParties(map: Acc["exp"], world: number): FlowParty[] {
  return [...map.entries()]
    .sort((a, b) => b[1][0] - a[1][0])
    .slice(0, TOP_PARTIES)
    .map(([code, [value, tonnes, hasQ]]) => ({
      code,
      value: Math.round(value),
      tonnes: hasQ ? Math.round(tonnes) : null,
      share: world > 0 ? Math.round((value / world) * 1000) / 10 : 0,
    }));
}

export function finalizeYear(acc: Acc): YearFlows {
  return {
    worldValue: Math.round(acc.world),
    worldTonnes: Math.round(acc.worldTonnes),
    exporters: topParties(acc.exp, acc.world),
    importers: topParties(acc.imp, acc.world),
    flows: [...acc.pairs.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, TOP_FLOWS)
      .map(([key, value]) => {
        const [from, to] = key.split(">") as [string, string];
        return { from, to, value: Math.round(value) };
      }),
  };
}

async function readYearFile(
  path: string,
  codes: CountryCodes,
  accs: Record<string, Acc>,
): Promise<number> {
  const rl = createInterface({ input: createReadStream(path), crlfDelay: Infinity });
  let idx: { i: number; j: number; k: number; v: number; q: number } | null = null;
  let kept = 0;
  const prefixes = Object.entries(HS_CODES).flatMap(([id, list]) =>
    list.map((p) => [p, id] as const),
  );
  for await (const line of rl) {
    if (!idx) {
      const h = line.split(",").map((x) => x.trim().replace(/^"|"$/g, ""));
      idx = {
        i: h.indexOf("i"),
        j: h.indexOf("j"),
        k: h.indexOf("k"),
        v: h.indexOf("v"),
        q: h.indexOf("q"),
      };
      if (Object.values(idx).some((n) => n < 0)) {
        throw new Error(`${path} : colonnes t,i,j,k,v,q attendues (trouvé : ${h.join(",")}).`);
      }
      continue;
    }
    const c = line.split(",");
    const k = (c[idx.k] ?? "").padStart(6, "0");
    const hit = prefixes.find(([p]) => k.startsWith(p));
    if (!hit) continue;
    const from = codes.get(c[idx.i]!);
    const to = codes.get(c[idx.j]!);
    const v = Number(c[idx.v]);
    if (!from || !to || !Number.isFinite(v)) continue;
    const qRaw = c[idx.q];
    const q = qRaw === undefined || qRaw === "" || qRaw === "NA" ? null : Number(qRaw);
    addRow(accs[hit[1]]!, from, to, v, Number.isFinite(q as number) ? q : null);
    kept++;
  }
  return kept;
}

async function buildCountries(isoCodes: Set<string>): Promise<FlowsFile["countries"]> {
  const geo = JSON.parse(await readFile(GEOJSON, "utf8")) as {
    features: { id?: string; geometry: Parameters<typeof geoCentroid>[0] }[];
  };
  const centroids = new Map<string, [number, number]>();
  for (const f of geo.features) {
    if (f.id)
      centroids.set(
        f.id,
        geoCentroid(f.geometry).map((x) => Math.round(x * 10) / 10) as [number, number],
      );
  }
  const names = new Intl.DisplayNames(["fr"], { type: "region" });
  const out: FlowsFile["countries"] = {};
  for (const code of [...isoCodes].sort()) {
    const numeric = isoCountries.alpha2ToNumeric(code);
    if (!numeric) continue;
    out[code] = {
      numeric,
      name: names.of(code) ?? code,
      coordinates: centroids.get(numeric) ?? null,
    };
  }
  return out;
}

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

async function main() {
  const dir = arg("dir");
  if (!dir)
    throw new Error(
      "Usage : npm run ingest:flows -- --dir <dossier BACI extrait> [--years 2015-2024]",
    );
  const files = await readdir(dir);
  const codeFile = files.find((f) => /^country_codes.*\.csv$/i.test(f));
  if (!codeFile) throw new Error(`Aucun country_codes*.csv dans ${dir}.`);
  const yearFiles = new Map<number, string>();
  let version = "";
  let revision = "";
  for (const f of files) {
    const m = /^BACI_(HS\d+)_Y(\d{4})_V(\w+)\.csv$/i.exec(f);
    if (m) {
      yearFiles.set(Number(m[2]), f);
      revision = m[1]!.toUpperCase();
      version = m[3]!;
    }
  }
  if (!yearFiles.size) throw new Error(`Aucun fichier BACI_HS*_Y*_V*.csv dans ${dir}.`);
  const available = [...yearFiles.keys()].sort((a, b) => a - b);
  const last = available[available.length - 1]!;
  const range = arg("years")?.split("-").map(Number);
  const first = range?.[0] ?? Math.max(available[0]!, last - 9);
  const until = range?.[1] ?? last;
  const years = available.filter((y) => y >= first && y <= until);
  if (!years.length)
    throw new Error(`Aucune année dans ${first}-${until} (disponibles : ${available.join(", ")}).`);

  const codes = parseCountryCodes(await readFile(join(dir, codeFile), "utf8"));
  const result: FlowsFile["commodities"] = {};
  for (const id of Object.keys(HS_CODES)) result[id] = { years: {} };

  for (const year of years) {
    const accs = Object.fromEntries(Object.keys(HS_CODES).map((id) => [id, newAcc()]));
    const kept = await readYearFile(join(dir, yearFiles.get(year)!), codes, accs);
    console.log(`${year} : ${kept} lignes retenues`);
    for (const [id, acc] of Object.entries(accs)) {
      if (acc.world === 0)
        throw new Error(
          `${year} : aucun flux pour "${id}" (codes HS ${HS_CODES[id]!.join(", ")}).`,
        );
      result[id]!.years[String(year)] = finalizeYear(acc);
    }
  }

  const isoSet = new Set<string>();
  for (const c of Object.values(result)) {
    for (const y of Object.values(c.years)) {
      for (const p of [...y.exporters, ...y.importers]) isoSet.add(p.code);
      for (const f of y.flows) {
        isoSet.add(f.from);
        isoSet.add(f.to);
      }
    }
  }
  const out: FlowsFile = {
    meta: {
      source: "CEPII BACI (d'après UN Comtrade)",
      sourceUrl: "https://www.cepii.fr/CEPII/en/bdd_modele/presentation.asp?id=37",
      hsRevision: revision,
      version,
      licence: "Etalab 2.0 — citer CEPII/BACI (Gaulier & Zignago, 2010)",
      retrievedAt: new Date().toISOString(),
      firstYear: years[0]!,
      lastYear: years[years.length - 1]!,
      unit: "USD courants ; tonnes",
      hsCodes: HS_CODES,
    },
    countries: await buildCountries(isoSet),
    commodities: result,
  };
  await mkdir(dirname(OUTPUT), { recursive: true });
  await writeFile(OUTPUT, JSON.stringify(out) + "\n");
  console.log(`OK : ${years.length} années (${years[0]}–${years[years.length - 1]}) → ${OUTPUT}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((e) => {
    console.error(`Échec : ${e.message}`);
    process.exit(1);
  });
}
