import { readFileSync } from "node:fs";
import { beforeAll, describe, expect, it, vi } from "vitest";

import dashboard from "../../netlify/functions/dashboard";
import { bundledDataset } from "@/data/agrigeo";
import { loadDashboard } from "../../shared/dashboard";
import { buildPricesFile } from "../../shared/pink-sheet";
import type { PricesFile } from "@/data/prices-types";

let sample: PricesFile;
beforeAll(async () => {
  sample = await buildPricesFile(
    readFileSync("scripts/ingest/fixtures/pink-sheet-sample.xlsx"),
    "file:sample",
  );
});

const withLastMonth = (lastMonth: string): PricesFile => ({
  ...sample,
  meta: { ...sample.meta!, lastMonth },
});

describe("/api/dashboard", () => {
  it("serves the bundled dataset when nothing is stored", async () => {
    const { dataset, pricesFrom } = await loadDashboard(async () => null);
    expect(pricesFrom).toBe("bundle");
    expect(dataset.commodities).toHaveLength(9);
  });

  it("ignores malformed stored prices", async () => {
    const { pricesFrom } = await loadDashboard(async () => ({ meta: {}, series: { cacao: 1 } }));
    expect(pricesFrom).toBe("bundle");
  });

  it("falls back to the bundle when the store throws", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const { pricesFrom } = await loadDashboard(async () => {
      throw new Error("no blobs");
    });
    expect(pricesFrom).toBe("bundle");
  });

  it("uses stored prices when they are newer than the bundled ones", async () => {
    const { dataset, pricesFrom } = await loadDashboard(async () => withLastMonth("2999-01-01"));
    expect(pricesFrom).toBe("store");
    expect(dataset.priceMeta?.lastMonth).toBe("2999-01-01");
    expect(dataset.commodities.every((c) => c.prices.length === 60)).toBe(true);
  });

  it("compares stored prices with the bundled ones by last month", async () => {
    const bundled = bundledDataset.priceMeta;
    if (bundled) {
      // Prix embarqués réels : des prix stockés de même mois ou plus anciens ne les remplacent pas.
      const same = await loadDashboard(async () => withLastMonth(bundled.lastMonth));
      expect(same.pricesFrom).toBe("bundle");
    } else {
      // Rien d'embarqué (prix illustratifs) : des prix stockés valides, même anciens, prennent le relais.
      const old = await loadDashboard(async () => withLastMonth("1999-01-01"));
      expect(old.pricesFrom).toBe("store");
    }
  });

  it("answers with JSON, cache headers and a usable dataset (store unavailable locally)", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const res = await dashboard();
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("application/json");
    expect(res.headers.get("cache-control")).toContain("max-age");
    const body = (await res.json()) as { commodities: unknown[]; countries: unknown[] };
    expect(body.commodities).toHaveLength(9);
    expect(body.countries.length).toBeGreaterThan(0);
  });
});
