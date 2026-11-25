import { useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "react-router";
import { ArrowDownLeft, ArrowRight, ArrowUpRight, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { dashboardQuery } from "@/lib/api";
import { findCountry, formatNumber, tradeValue } from "@/data/agrigeo";
import { CommoditySelect, SectionTitle } from "./common";
import { FlowMap } from "./FlowMap";
export function FlowsView() {
  const { data } = useSuspenseQuery(dashboardQuery);
  const [id, setId] = useState("cacao");
  const [year, setYear] = useState(2024);
  const [mode, setMode] = useState<"export" | "import">("export");
  const commodity = data.commodities.find((c) => c.id === id);
  if (!commodity) return null;
  const shares = mode === "export" ? commodity.exporters : commodity.importers;
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">GÉOGRAPHIE DES DÉPENDANCES</p>
          <h1>Carte des flux</h1>
          <p className="page-subtitle">
            Les échanges alimentaires dessinent un monde interdépendant.
          </p>
        </div>
        <CommoditySelect value={id} onChange={setId} all={false} />
      </div>
      <div className="map-toolbar">
        <div className="segmented-control">
          <Button
            variant={mode === "export" ? "secondary" : "ghost"}
            onClick={() => setMode("export")}
          >
            <ArrowUpRight />
            Exportations
          </Button>
          <Button
            variant={mode === "import" ? "secondary" : "ghost"}
            onClick={() => setMode("import")}
          >
            <ArrowDownLeft />
            Importations
          </Button>
        </div>
        <div className="year-control">
          <span>
            Année <strong>{year}</strong>
          </span>
          <Slider
            min={2015}
            max={2024}
            step={1}
            value={[year]}
            onValueChange={(v) => setYear(v[0] ?? 2024)}
            aria-label="Année des échanges"
          />
          <span>2015 — 2024</span>
        </div>
      </div>
      <FlowMap commodity={commodity} year={year} mode={mode} />
      <div className="critical-band">
        <ShieldAlert className="size-5" />
        <div>
          <p className="eyebrow">DÉPENDANCE CRITIQUE</p>
          <p>
            <strong>
              {commodity.exporters.slice(0, 2).reduce((s, e) => s + e.share, 0)} % des exportations
              de {commodity.name.toLocaleLowerCase("fr")}
            </strong>{" "}
            sont concentrées en{" "}
            {commodity.exporters
              .slice(0, 2)
              .map((s) => findCountry(s.code)?.name)
              .join(" et ")}
            .
          </p>
        </div>
        <Button asChild variant="ghost">
          <Link to={`/matiere/${id}`}>
            Voir l’analyse
            <ArrowRight />
          </Link>
        </Button>
      </div>
      <section className="mt-8">
        <SectionTitle title={`Principaux ${mode === "export" ? "exportateurs" : "importateurs"}`} />
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Rang</th>
                <th>Pays</th>
                <th>Part mondiale</th>
                <th>Valeur échangée</th>
                <th>Rôle</th>
              </tr>
            </thead>
            <tbody>
              {shares.map((s, i) => {
                const c = findCountry(s.code);
                const v = tradeValue(commodity, s.code, mode, year);
                return (
                  <tr key={s.code}>
                    <td className="text-muted-foreground">{String(i + 1).padStart(2, "0")}</td>
                    <td>
                      <Link className="country-name" to={`/pays/${s.code}`}>
                        {c?.flag} {c?.name}
                        <ArrowUpRight className="size-3 text-muted-foreground" />
                      </Link>
                    </td>
                    <td>
                      <div className="share-cell">
                        <span>{formatNumber(v.share, 1)} %</span>
                        <div className="share-track">
                          <i style={{ width: `${v.share}%` }} />
                        </div>
                      </div>
                    </td>
                    <td>{formatNumber(v.value / 1e6, 1)} M USD</td>
                    <td className="text-muted-foreground">
                      {mode === "export" ? "Exportateur majeur" : "Importateur majeur"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
