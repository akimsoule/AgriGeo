import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Globe2,
  Layers3,
  ShieldAlert,
  Siren,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { dashboardQuery } from "@/lib/api";
import { formatNumber } from "@/data/agrigeo";
import { AlertList } from "./AlertList";
import { FlowMap } from "./FlowMap";
import { CommodityIcon, CommoditySelect, KpiCard, SectionTitle } from "./common";
export function Dashboard() {
  const { data } = useSuspenseQuery(dashboardQuery);
  const [selection, setSelection] = useState("all");
  const selected = data.commodities.find((c) => c.id === selection);
  const cocoa = data.commodities[0];
  if (!cocoa) return null;
  const ranked = [...data.commodities].sort((a, b) => b.risk - a.risk);
  const average = data.commodities.reduce((s, c) => s + c.risk, 0) / data.commodities.length;
  const concentrated = [...data.commodities].sort(
    (a, b) =>
      (b.exporters[0]?.share ?? 0) +
      (b.exporters[1]?.share ?? 0) -
      (a.exporters[0]?.share ?? 0) -
      (a.exporters[1]?.share ?? 0),
  )[0];
  const filteredAlerts =
    selection === "all"
      ? data.alerts
      : data.alerts.filter((a) => a.commodities.includes(selection));
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">
            <span className="tiny-line" /> LE MONDE À TRAVERS SES MATIÈRES PREMIÈRES
          </p>
          <h1>Vue d’ensemble</h1>
          <p className="page-subtitle">
            Comprendre les dépendances alimentaires. Anticiper les tensions mondiales.
          </p>
        </div>
        <div className="heading-controls">
          <CommoditySelect value={selection} onChange={setSelection} />
          <span className="snapshot-date">
            <CalendarDays className="size-3.5" /> Décembre 2024
          </span>
        </div>
      </div>
      <div className="kpi-grid">
        <KpiCard
          label="Matières suivies"
          value="9"
          icon={Layers3}
          detail="Les grandes filières alimentaires"
        >
          <span className="kpi-unit">matières</span>
        </KpiCard>
        <KpiCard
          label="Risque moyen"
          value={formatNumber(average, 1)}
          icon={ShieldAlert}
          tone="warning"
          detail="Une exposition mondiale modérée"
        >
          <span className="kpi-unit">/ 100</span>
        </KpiCard>
        <KpiCard
          label="Alertes actives"
          value="8"
          icon={Siren}
          tone="high"
          detail="4 événements de gravité élevée"
        >
          <span className="kpi-alert-dot" />
        </KpiCard>
        <KpiCard
          label="Offre la plus concentrée"
          value={`${formatNumber((concentrated?.exporters[0]?.share ?? 0) + (concentrated?.exporters[1]?.share ?? 0))} %`}
          icon={Globe2}
          detail={`${concentrated?.name} · 2 pays exportateurs`}
        />
      </div>
      <div className="overview-grid">
        <section className="map-section">
          <SectionTitle
            title="Géographie des échanges"
            action={
              <Button asChild variant="ghost" size="sm">
                <Link to="/flux">
                  Explorer la carte <ArrowUpRight />
                </Link>
              </Button>
            }
          />
          <div className="map-section-meta">
            <span>
              <CommodityIcon icon={(selected ?? cocoa).icon} className="size-3.5" />
              {(selected ?? cocoa).name} <span className="meta-divider">/</span> Exportations
              mondiales
            </span>
            <span>2024</span>
          </div>
          <FlowMap commodity={selected ?? cocoa} compact />
          <div className="dependency-note">
            <span className="dependency-marker" />
            <p>
              <strong>
                {(selected ?? cocoa).exporters.slice(0, 2).reduce((sum, s) => sum + s.share, 0)} %
              </strong>{" "}
              des exportations de {(selected ?? cocoa).name.toLocaleLowerCase("fr")} proviennent de
              seulement <strong>2 pays.</strong>
            </p>
            <Link
              to="/matiere/$id"
              params={{ id: (selected ?? cocoa).id }}
              aria-label="Voir l’analyse de concentration"
            >
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </section>
        <section className="ranking-section">
          <SectionTitle title="Les matières sous tension" />
          <p className="section-subtitle">Classement par score de risque</p>
          <div className="ranking-list">
            {ranked.map((c, i) => (
              <Link to="/matiere/$id" params={{ id: c.id }} className="ranking-row" key={c.id}>
                <span className="rank-index">{String(i + 1).padStart(2, "0")}</span>
                <CommodityIcon icon={c.icon} className="size-4" />
                <span className="ranking-name">{c.name}</span>
                <div className="rank-track">
                  <span
                    className={
                      c.risk >= 75 ? "rank-high" : c.risk >= 60 ? "rank-medium" : "rank-low"
                    }
                    style={{ width: `${c.risk}%` }}
                  />
                </div>
                <strong className={c.risk >= 75 ? "text-danger" : "text-foreground"}>
                  {c.risk}
                </strong>
              </Link>
            ))}
          </div>
          <div className="rank-legend">
            <span>
              <i className="dot-high" />
              Élevé ≥ 75
            </span>
            <span>
              <i className="dot-medium" />
              Modéré ≥ 50
            </span>
            <span>
              <i className="dot-low" />
              Faible
            </span>
          </div>
          <Button asChild variant="outline" className="w-full mt-4">
            <Link to="/risques">
              Comparer les prix et risques <ArrowRight />
            </Link>
          </Button>
        </section>
      </div>
      <section className="alerts-section">
        <SectionTitle
          title="Alertes récentes"
          action={
            <Button asChild variant="ghost" size="sm">
              <Link to="/risques">
                Toutes les alertes <ArrowUpRight />
              </Link>
            </Button>
          }
        />
        <p className="section-subtitle">
          Les événements qui redessinent les équilibres alimentaires.
          <span className="count-pill">{filteredAlerts.length} événements</span>
        </p>
        <AlertList items={filteredAlerts} />
      </section>
      <div className="page-bottom-note">
        <span className="status-dot" /> Une lecture mondiale, des impacts locaux.
        <span>SCÉNARIO ILLUSTRATIF · DÉC. 2024</span>
      </div>
    </>
  );
}
