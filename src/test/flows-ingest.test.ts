import { describe, expect, it } from "vitest";
import { addRow, finalizeYear, HS_CODES, parseCountryCodes } from "../../scripts/ingest/flows";

const newAcc = () => ({
  exp: new Map<string, [number, number, boolean]>(),
  imp: new Map<string, [number, number, boolean]>(),
  pairs: new Map<string, number>(),
  world: 0,
  worldTonnes: 0,
});

describe("BACI ingestion", () => {
  it("maps BACI country codes to ISO2 and ignores entries without one", () => {
    const map = parseCountryCodes(
      "country_code,country_name,country_iso2,country_iso3\n251,France,FR,FRA\n842,USA,US,USA\n490,Other Asia nes,,\n",
    );
    expect(map.get("251")).toBe("FR");
    expect(map.get("842")).toBe("US");
    expect(map.has("490")).toBe(false);
  });
  it("rejects a country file with unexpected columns", () => {
    expect(() => parseCountryCodes("a,b\n1,2\n")).toThrow(/colonnes/);
  });
  it("aggregates values (k USD → USD), shares and bilateral flows", () => {
    const acc = newAcc();
    addRow(acc, "CI", "NL", 600, 200);
    addRow(acc, "CI", "DE", 200, null);
    addRow(acc, "GH", "NL", 200, 70);
    const y = finalizeYear(acc);
    expect(y.worldValue).toBe(1_000_000);
    expect(y.exporters[0]).toEqual({ code: "CI", value: 800_000, tonnes: 200, share: 80 });
    expect(y.importers[0]?.code).toBe("NL");
    expect(y.flows[0]).toEqual({ from: "CI", to: "NL", value: 600_000 });
    expect(y.exporters.reduce((s, p) => s + p.share, 0)).toBeCloseTo(100, 5);
  });
  it("covers the ten commodities with distinct HS codes", () => {
    const codes = Object.values(HS_CODES).flat();
    expect(Object.keys(HS_CODES)).toHaveLength(10);
    expect(new Set(codes).size).toBe(codes.length);
  });
});
