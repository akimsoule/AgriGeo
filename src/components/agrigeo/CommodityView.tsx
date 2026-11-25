import { useState } from "react";
import { Link } from "react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  Area,
  AreaChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowLeft, ArrowUpRight, Globe2, ShieldAlert, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { dashboardQuery } from "@/lib/api";
import { componentNames, findCountry, formatNumber } from "@/data/agrigeo";
import { PriceChart } from "./PriceChart";
import { AlertList } from "./AlertList";
import { Change, CommodityIcon, EmptyState, KpiCard, RiskBadge, SectionTitle } from "./common";
export function CommodityView({ id }: { id: string }) {
  const { data } = useSuspenseQuery(dashboardQuery);
  const c = data.commodities.find((c) => c.id === id);
  const [period, setPeriod] = useState(60);
  if (!c) return <EmptyState text="Cette matière n’est pas suivie dans le prototype." />;
  const top = c.exporters.slice(0, 2).reduce((s, e) => s + e.share, 0);
  const pie = [
    ...c.exporters.map((s) => ({ name: findCountry(s.code)?.name ?? s.code, value: s.share })),
    { name: "Autres pays", value: 100 - c.exporters.reduce((s, e) => s + e.share, 0) },
  ];
  return (
    <>
      <Button asChild variant="ghost" size="sm" className="back-link">
        <Link to="/">
          <ArrowLeft />
          Vue d’ensemble
        </Link>
      </Button>
      <div className="page-heading">
        <div>
          <p className="eyebrow">FICHE MATIÈRE PREMIÈRE</p>
          <h1 className="flex items-center gap-4">
            <span className="commodity-heading-icon">
              <CommodityIcon icon={c.icon} className="size-7" />
            </span>
            {c.name}
          </h1>
          <p className="page-subtitle">
            Une filière mondiale, des équilibres géopolitiques singuliers.
          </p>
        </div>
        <RiskBadge score={c.risk} />
      </div>
      <div className="kpi-grid three-kpis">
        <KpiCard
          label="Dernier prix"
          value={formatNumber(c.price)}
          detail="Décembre 2024 · USD / tonne"
          icon={TrendingUp}
        />
        <KpiCard
          label="Variation sur 12 mois"
          value={`${c.change >= 0 ? "+" : ""}${formatNumber(c.change, 1)} %`}
          detail="Par rapport à décembre 2023"
          icon={TrendingUp}
          tone={c.change > 0 ? "high" : "default"}
        />
        <KpiCard
          label="Concentration de l’offre"
          value={`${top} %`}
          detail="Part des deux premiers exportateurs"
          icon={Globe2}
        />
      </div>
      <section className="price-section">
        <SectionTitle
          title={`Prix du ${c.name.toLowerCase()}`}
          action={
            <div className="segmented-control">
              {[12, 60].map((p) => (
                <Button
                  size="sm"
                  key={p}
                  variant={period === p ? "secondary" : "ghost"}
                  onClick={() => setPeriod(p)}
                >
                  {p === 12 ? "1 an" : "5 ans"}
                </Button>
              ))}
            </div>
          }
        />
        <p className="section-subtitle">USD / tonne · données mensuelles</p>
        <PriceChart items={[c]} period={period} events />
      </section>
      <div className="detail-chart-grid">
        <section>
          <SectionTitle title="Les principaux exportateurs" />
          <div className="donut-layout">
            <div className="donut-wrap">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pie}
                    dataKey="value"
                    innerRadius={58}
                    outerRadius={86}
                    paddingAngle={2}
                    stroke="var(--background)"
                  >
                    {pie.map((p, i) => (
                      <Cell key={p.name} fill={`var(--series-${i % 6})`} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v) => `${formatNumber(Number(v), 1)} %`}
                    contentStyle={{
                      background: "var(--popover)",
                      borderColor: "var(--border)",
                      borderRadius: 6,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="donut-center">
                <strong>{top} %</strong>
                <span>2 pays</span>
              </div>
            </div>
            <div className="donut-legend">
              {c.exporters.slice(0, 5).map((e, i) => (
                <Link to={`/pays/${e.code}`} key={e.code}>
                  <i className={`series-${i % 6}`} />
                  <span>{findCountry(e.code)?.name}</span>
                  <strong>{e.share} %</strong>
                </Link>
              ))}
            </div>
          </div>
        </section>
        <section>
          <SectionTitle title="Une offre de plus en plus concentrée" />
          <p className="section-subtitle">Part des deux premiers exportateurs · 2015–2024</p>
          <div className="concentration-chart">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={c.concentration}
                margin={{ left: -20, right: 16, top: 25, bottom: 0 }}
              >
                <XAxis
                  dataKey="year"
                  tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tickFormatter={(v) => `${v} %`}
                  domain={["dataMin - 5", "dataMax + 5"]}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(v) => `${v} %`}
                  contentStyle={{
                    background: "var(--popover)",
                    borderColor: "var(--border)",
                    borderRadius: 6,
                  }}
                />
                <Area
                  dataKey="value"
                  name="Concentration"
                  type="monotone"
                  stroke="var(--teal)"
                  fill="var(--teal-soft)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
      <section className="analysis-section">
        <div>
          <p className="eyebrow">LECTURE GÉOPOLITIQUE</p>
          <h2>Une dépendance à surveiller</h2>
          <span className="analysis-badge">ANALYSE ILLUSTRATIVE</span>
        </div>
        <div className="analysis-copy">
          <p>
            Le marché du {c.name.toLowerCase()} se caractérise par une forte interdépendance entre
            zones de production et centres de consommation.{" "}
            {findCountry(c.exporters[0]?.code ?? "")?.name} et{" "}
            {findCountry(c.exporters[1]?.code ?? "")?.name} représentent ensemble {top} % des
            exportations mondiales dans ce scénario. Cette concentration expose les acheteurs aux
            décisions commerciales et aux aléas locaux de quelques acteurs clés.{" "}
            <sup>
              <a href="#source-1">[1]</a>
            </sup>
          </p>
          <p>
            Les épisodes climatiques extrêmes peuvent modifier les perspectives de récolte et
            provoquer une transmission rapide aux prix internationaux. Avec une exposition
            climatique estimée à {c.components[2]} sur 100, la filière doit composer avec des
            calendriers agricoles incertains et des coûts logistiques volatils. La diversification
            des origines constitue un levier de résilience.{" "}
            <sup>
              <a href="#source-2">[2]</a>
            </sup>
          </p>
          <p>
            Pour les pays importateurs, la sécurité d’approvisionnement dépend autant des relations
            diplomatiques que de la disponibilité physique des volumes. Les quotas, taxes et
            restrictions d’exportation peuvent déplacer les flux vers de nouveaux partenaires, au
            prix d’une dépendance accrue aux intermédiaires et aux corridors maritimes.{" "}
            <sup>
              <a href="#source-3">[3]</a>
            </sup>
          </p>
          <div className="source-list">
            <span id="source-1">[1] Source visée : FAOSTAT · production et commerce agricole.</span>
            <span id="source-2">
              [2] Source visée : Banque mondiale · prix et indicateurs climatiques.
            </span>
            <span id="source-3">
              [3] Sources visées : UN Comtrade / CEPII BACI · flux bilatéraux.
            </span>
          </div>
        </div>
      </section>
      <section className="mt-8">
        <SectionTitle title="Pays clés de la filière" />
        <div className="key-countries">
          {c.exporters.slice(0, 4).map((e) => (
            <Link key={e.code} to={`/pays/${e.code}`}>
              <span className="text-2xl">{findCountry(e.code)?.flag}</span>
              <div>
                <strong>{findCountry(e.code)?.name}</strong>
                <small>{e.share} % des exportations</small>
              </div>
              <ArrowUpRight className="ml-auto size-4" />
            </Link>
          ))}
        </div>
      </section>
      <section className="alerts-section">
        <SectionTitle title="Alertes liées à cette matière" />
        <AlertList items={data.alerts.filter((a) => a.commodities.includes(id))} />
      </section>
      <section className="mt-7">
        <SectionTitle title="Les quatre dimensions du risque" />
        <div className="component-grid">
          {componentNames.map((name, i) => (
            <div key={name}>
              <span>{name}</span>
              <strong>
                {c.components[i]}
                <small> / 100</small>
              </strong>
              <div className="component-track">
                <i className={`component-${i}`} style={{ width: `${c.components[i]}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
