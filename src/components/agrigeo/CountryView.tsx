import { Link } from "react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowUpRight, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { dashboardQuery } from "@/lib/api";
import { findCountry, formatNumber, tradeValue } from "@/data/agrigeo";
import { CommodityIcon, EmptyState, RiskBadge, SectionTitle } from "./common";
import { AlertList } from "./AlertList";
export function CountryView({ code }: { code: string }) {
  const { data } = useSuspenseQuery(dashboardQuery);
  const country = findCountry(code);
  if (!country) return <EmptyState text="Ce pays n’est pas renseigné dans le prototype." />;
  const exports = data.commodities.filter((c) => c.exporters.some((e) => e.code === code));
  const imports = data.commodities.filter((c) => c.importers.some((e) => e.code === code));
  const role = exports.length >= imports.length ? "Exportateur majeur" : "Importateur majeur";
  const relevant = data.commodities.filter((c) =>
    [...c.exporters, ...c.importers].some((e) => e.code === code),
  );
  const partners = new Map<string, number>();
  for (const c of relevant) {
    const list = c.exporters.some((e) => e.code === code) ? c.importers : c.exporters;
    list.forEach((p) => {
      if (p.code !== code) partners.set(p.code, (partners.get(p.code) ?? 0) + p.share);
    });
  }
  const sortedPartners = [...partners.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
  const total = [...partners.values()].reduce((s, v) => s + v, 0);
  return (
    <>
      <Button asChild variant="ghost" size="sm" className="back-link">
        <Link to="/flux">
          <ArrowLeft />
          Carte des flux
        </Link>
      </Button>
      <div className="page-heading">
        <div>
          <p className="eyebrow">FICHE PAYS</p>
          <h1 className="flex items-center gap-4">
            <span className="country-flag">{country.flag}</span>
            {country.name}
          </h1>
          <p className="page-subtitle">
            {role} · {relevant.length} filières alimentaires suivies
          </p>
        </div>
        <span className="data-chip">{role}</span>
      </div>
      <div className="country-overview">
        <div>
          <p className="eyebrow">VULNÉRABILITÉ ALIMENTAIRE</p>
          {country.vulnerability === null ? (
            <div className="vulnerability-value">
              n.d.
              <small>indice non calculé</small>
            </div>
          ) : (
            <div className="vulnerability-value">
              {country.vulnerability}
              <small>/ 100</small>
              <RiskBadge score={country.vulnerability} />
            </div>
          )}
          <p className="text-sm text-muted-foreground">
            Dépendance aux importations et exposition aux ruptures d’approvisionnement.
          </p>
          <div className="vulnerability-track">
            <span style={{ width: `${country.vulnerability ?? 0}%` }} />
          </div>
        </div>
        <div className="country-commodities">
          <p className="eyebrow mb-4">MATIÈRES CONCERNÉES</p>
          <div className="flex flex-wrap gap-2">
            {relevant.map((c) => (
              <Button asChild variant="outline" key={c.id}>
                <Link to={`/matiere/${c.id}`}>
                  <CommodityIcon icon={c.icon} />
                  {c.name}
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </div>
      <div className="country-trade-grid">
        {(["export", "import"] as const).map((mode) => (
          <section key={mode}>
            <SectionTitle
              title={mode === "export" ? "Ce que le pays exporte" : "Ce que le pays importe"}
            />
            {!(mode === "export" ? exports : imports).length ? (
              <EmptyState text="Aucune filière majeure renseignée." />
            ) : (
              <div className="table-scroll">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Matière</th>
                      <th>Part mondiale</th>
                      <th>Valeur</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(mode === "export" ? exports : imports).map((c) => {
                      const v = tradeValue(c, code, mode, 2024);
                      return (
                        <tr key={c.id}>
                          <td>
                            <Link className="country-name" to={`/matiere/${c.id}`}>
                              <CommodityIcon icon={c.icon} />
                              {c.name}
                            </Link>
                          </td>
                          <td>{formatNumber(v.share, 1)} %</td>
                          <td>{formatNumber(v.value / 1e6, 1)} M USD</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        ))}
      </div>
      <section className="mt-8">
        <SectionTitle title="Principaux partenaires commerciaux" />
        <p className="section-subtitle mb-3">
          Répartition indicative, toutes filières suivies confondues.
        </p>
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Partenaire</th>
                <th>Part des échanges</th>
                <th>Relation</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {sortedPartners.map(([partner, share]) => (
                <tr key={partner}>
                  <td>
                    <Link className="country-name" to={`/pays/${partner}`}>
                      {findCountry(partner)?.flag} {findCountry(partner)?.name}
                    </Link>
                  </td>
                  <td>{formatNumber((share / total) * 100, 1)} %</td>
                  <td className="text-muted-foreground">Partenaire commercial majeur</td>
                  <td>
                    <ArrowUpRight className="size-4 text-muted-foreground" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="analysis-section">
        <div>
          <p className="eyebrow">LECTURE GÉOPOLITIQUE</p>
          <h2>Entre ouverture et résilience</h2>
          <span className="analysis-badge">ANALYSE ILLUSTRATIVE</span>
        </div>
        <div className="analysis-copy">
          <p>
            {country.name} occupe une position de {role.toLowerCase()} dans les filières
            alimentaires suivies. Son intégration au commerce international lui permet d’accéder à
            des débouchés diversifiés, tout en l’exposant aux variations des prix et aux décisions
            de ses partenaires.
          </p>
          {country.vulnerability !== null && (
            <p>
              Avec un indice de vulnérabilité de {country.vulnerability} sur 100, le pays présente
              une exposition{" "}
              {country.vulnerability >= 65
                ? "importante"
                : country.vulnerability >= 35
                  ? "modérée"
                  : "limitée"}{" "}
              aux ruptures d’approvisionnement. Les capacités de stockage, la diversification des
              partenaires et la production nationale sont les principaux leviers de sécurité
              alimentaire.
            </p>
          )}
          <p>
            Dans ce scénario, les échanges de{" "}
            {relevant
              .slice(0, 3)
              .map((c) => c.name.toLowerCase())
              .join(", ")}{" "}
            jouent un rôle structurant. Une modification des conditions logistiques ou des
            politiques commerciales pourrait redistribuer les flux et affecter la balance
            alimentaire du pays.
          </p>
        </div>
      </section>
      <section className="alerts-section">
        <SectionTitle title={`Alertes concernant ${country.name}`} />
        <AlertList items={data.alerts.filter((a) => a.code === code)} />
      </section>
    </>
  );
}
