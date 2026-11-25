import { useState } from "react";
import { Link } from "react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowDownUp, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { dashboardQuery } from "@/lib/api";
import { componentNames, formatNumber } from "@/data/agrigeo";
import { AlertList } from "./AlertList";
import { PriceChart } from "./PriceChart";
import { Change, CommodityIcon, RiskBadge, RiskStack, SectionTitle } from "./common";
export function RisksView() {
  const { data } = useSuspenseQuery(dashboardQuery);
  const [series, setSeries] = useState(["cacao", "cafe", "ble"]);
  const [period, setPeriod] = useState(60);
  const [indexed, setIndexed] = useState(true);
  const [sort, setSort] = useState<"risk" | "name" | "price">("risk");
  const [ascending, setAscending] = useState(false);
  const items = data.commodities.filter((c) => series.includes(c.id));
  const sorted = [...data.commodities].sort(
    (a, b) =>
      (sort === "name" ? a.name.localeCompare(b.name, "fr") : a[sort] - b[sort]) *
      (ascending ? 1 : -1),
  );
  function setSorting(value: typeof sort) {
    if (sort === value) setAscending((v) => !v);
    else {
      setSort(value);
      setAscending(false);
    }
  }
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">INDICATEURS & SIGNAUX FAIBLES</p>
          <h1>Prix et risques</h1>
          <p className="page-subtitle">
            Mettre les mouvements de prix en perspective avec les tensions mondiales.
          </p>
        </div>
        <span className="data-chip">DÉCEMBRE 2024</span>
      </div>
      <section className="price-section">
        <SectionTitle
          title="Évolution des prix"
          action={
            <div className="segmented-control">
              <Button
                size="sm"
                variant={period === 12 ? "secondary" : "ghost"}
                onClick={() => setPeriod(12)}
              >
                1 an
              </Button>
              <Button
                size="sm"
                variant={period === 60 ? "secondary" : "ghost"}
                onClick={() => setPeriod(60)}
              >
                5 ans
              </Button>
            </div>
          }
        />
        <div className="price-toolbar">
          <div className="series-options">
            {data.commodities.map((c, i) => (
              <label key={c.id}>
                <Checkbox
                  checked={series.includes(c.id)}
                  onCheckedChange={(v) =>
                    setSeries((ids) => (v ? [...ids, c.id] : ids.filter((id) => id !== c.id)))
                  }
                  aria-label={`Afficher ${c.name}`}
                />
                <span className={`series-dot series-${i % 6}`} />
                {c.name}
              </label>
            ))}
          </div>
          <label className="index-toggle">
            <Checkbox checked={indexed} onCheckedChange={(v) => setIndexed(v === true)} />
            Base 100
          </label>
        </div>
        <div className="chart-label">
          {indexed ? "Indice de prix · base 100 en début de période" : "Prix en USD / tonne"}{" "}
          <span>! Événements géopolitiques</span>
        </div>
        <PriceChart items={items} period={period} indexed={indexed} events />
      </section>
      <section className="mt-8">
        <SectionTitle title="Décomposition du risque" />
        <div className="component-legend">
          {componentNames.map((name, i) => (
            <span key={name}>
              <i className={`component-${i}`} />
              {name}
            </span>
          ))}
        </div>
        <div className="table-scroll">
          <table className="data-table risk-table">
            <thead>
              <tr>
                <th>
                  <Button variant="ghost" size="sm" onClick={() => setSorting("name")}>
                    Matière
                    <ArrowDownUp />
                  </Button>
                </th>
                <th>
                  <Button variant="ghost" size="sm" onClick={() => setSorting("risk")}>
                    Score de risque
                    <ArrowDownUp />
                  </Button>
                </th>
                <th>Composantes</th>
                <th>
                  <Button variant="ghost" size="sm" onClick={() => setSorting("price")}>
                    Dernier prix
                    <ArrowDownUp />
                  </Button>
                </th>
                <th>Variation sur 12 mois</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {sorted.map((c) => (
                <tr key={c.id}>
                  <td>
                    <Link className="country-name" to={`/matiere/${c.id}`}>
                      <CommodityIcon icon={c.icon} />
                      {c.name}
                    </Link>
                  </td>
                  <td>
                    <RiskBadge score={c.risk} />
                  </td>
                  <td>
                    <RiskStack commodity={c} />
                  </td>
                  <td>
                    {formatNumber(c.price)}{" "}
                    <span className="text-xs text-muted-foreground">USD/t</span>
                  </td>
                  <td>
                    <Change value={c.change} />
                  </td>
                  <td>
                    <Button asChild variant="ghost" size="icon">
                      <Link to={`/matiere/${c.id}`} aria-label={`Voir ${c.name}`}>
                        <ArrowUpRight />
                      </Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="alerts-section">
        <SectionTitle title="Alertes" />
        <p className="section-subtitle mb-5">
          Événements et tensions sur les filières alimentaires.
        </p>
        <AlertList filterable />
      </section>
    </>
  );
}
