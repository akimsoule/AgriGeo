import { describe, expect, it } from "vitest";
import { parseMonthlySheet, toUsdPerTonne } from "../../scripts/ingest/prices";

const names = [
  "",
  "Cocoa",
  "Coffee, Arabica",
  "Sugar, world",
  "Palm oil",
  "Sunflower oil",
  "Wheat, US HRW",
  "Maize",
  "Rice, Thai 5%",
  "Soybeans",
];
const units = [
  "",
  "($/kg)",
  "($/kg)",
  "($/kg)",
  "($/mt)",
  "($/mt)",
  "($/mt)",
  "($/mt)",
  "($/mt)",
  "($/mt)",
];

function sheet(months: number, missingCol?: number) {
  const rows: (string | number | null)[][] = [["Pink Sheet"], [], names, units, []];
  for (let i = 0; i < months; i++) {
    const y = 2000 + Math.floor(i / 12);
    rows.push([
      `${y}M${String((i % 12) + 1).padStart(2, "0")}`,
      ...names.slice(1).map((_, k) => (k === missingCol ? ".." : 1 + k)),
    ]);
  }
  return rows;
}

describe("Pink Sheet parser", () => {
  it("converts $/kg to USD per tonne", () => {
    expect(toUsdPerTonne(2.5, "($/kg)")).toBe(2500);
    expect(toUsdPerTonne(800, "($/mt)")).toBe(800);
    expect(() => toUsdPerTonne(1, "($/bbl)")).toThrow();
  });
  it("extracts the nine series in USD per tonne", () => {
    const series = parseMonthlySheet(sheet(72));
    expect(Object.keys(series)).toEqual([
      "cacao",
      "cafe",
      "sucre",
      "huile-palme",
      "huile-tournesol",
      "ble",
      "mais",
      "riz",
      "soja",
    ]);
    expect(series["cacao"]!.points[0]).toEqual({ date: "2000-01-01", value: 1000 });
    expect(series["soja"]!.points[71]!.date).toBe("2005-12-01");
  });
  it("skips '..' cells and rejects series that are too short", () => {
    expect(() => parseMonthlySheet(sheet(72, 0))).toThrow(/Cocoa/);
  });
  it("lists available names when a series is missing", () => {
    const rows = sheet(72);
    rows[2] = rows[2]!.map((n) => (n === "Maize" ? "Corn" : n));
    expect(() => parseMonthlySheet(rows)).toThrow(/Noms disponibles/);
  });
});
