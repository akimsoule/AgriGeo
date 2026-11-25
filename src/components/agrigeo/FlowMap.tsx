import { useEffect, useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
  useMapContext,
  Marker,
} from "react-simple-maps";
import type { GeoJsonObject } from "geojson";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Minus, Plus, RotateCcw, X, Globe2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  countries,
  findCountry,
  formatNumber,
  tradeValue,
  type Commodity,
  type Country,
} from "@/data/agrigeo";
import { EmptyState } from "./common";
export function CountryPanel({
  country,
  commodity,
  year,
  close,
}: {
  country: Country;
  commodity: Commodity;
  year: number;
  close: () => void;
}) {
  const exports = tradeValue(commodity, country.code, "export", year);
  const imports = tradeValue(commodity, country.code, "import", year);
  const partners = (
    exports.share > imports.share ? commodity.importers : commodity.exporters
  ).slice(0, 3);
  return (
    <aside className="country-panel">
      <div className="flex items-center justify-between">
        <span className="eyebrow">Fiche d’échanges · {year}</span>
        <Button size="icon" variant="ghost" onClick={close} aria-label="Fermer le détail pays">
          <X />
        </Button>
      </div>
      <h3>
        <span>{country.flag}</span> {country.name}
      </h3>
      <p className="text-sm text-muted-foreground mt-1 mb-6">{commodity.name}</p>
      <div className="country-stat">
        <span>Exportations</span>
        <strong>{formatNumber(exports.value / 1e6, 1)} M USD</strong>
        <small>{formatNumber(exports.share, 1)} % des échanges mondiaux</small>
      </div>
      <div className="country-stat">
        <span>Importations</span>
        <strong>{formatNumber(imports.value / 1e6, 1)} M USD</strong>
        <small>{formatNumber(imports.share, 1)} % des échanges mondiaux</small>
      </div>
      <p className="eyebrow mt-5 mb-3">Principaux partenaires</p>
      {partners.map((p) => (
        <div className="partner-row" key={p.code}>
          <span>
            {findCountry(p.code)?.flag} {findCountry(p.code)?.name}
          </span>
          <span>{p.share} %</span>
        </div>
      ))}
      <Button asChild className="w-full mt-6">
        <Link to="/pays/$code" params={{ code: country.code }}>
          Voir la fiche pays <ArrowRight />
        </Link>
      </Button>
    </aside>
  );
}
function FlowArcs({ commodity }: { commodity: Commodity }) {
  const { projection } = useMapContext();
  const flows =
    commodity.flows?.slice(0, 10).map((f) => ({ from: f.from, to: f.to, weight: f.value })) ??
    commodity.exporters
      .flatMap((e) =>
        commodity.importers
          .filter((i) => i.code !== e.code)
          .map((i) => ({ from: e.code, to: i.code, weight: e.share * i.share })),
      )
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 10);
  return (
    <g className="flow-arcs">
      {flows.map((f, i) => {
        const from = findCountry(f.from);
        const to = findCountry(f.to);
        if (!from?.coordinates || !to?.coordinates) return null;
        const a = projection(from.coordinates);
        const b = projection(to.coordinates);
        if (!a || !b) return null;
        const midX = (a[0] + b[0]) / 2;
        const midY = (a[1] + b[1]) / 2 - Math.min(100, Math.abs(a[0] - b[0]) * 0.18);
        return (
          <path
            key={`${f.from}-${f.to}`}
            d={`M${a[0]},${a[1]} Q${midX},${midY} ${b[0]},${b[1]}`}
            fill="none"
            stroke="var(--flow)"
            strokeWidth={i < 3 ? 1.7 : 0.9}
            opacity={i < 3 ? 0.8 : 0.38}
            markerEnd="url(#flow-arrow)"
          />
        );
      })}
    </g>
  );
}
export function FlowMap({
  commodity,
  year = 2024,
  mode = "export",
  compact = false,
  flows = true,
}: {
  commodity: Commodity;
  year?: number;
  mode?: "export" | "import";
  compact?: boolean;
  flows?: boolean;
}) {
  const [geo, setGeo] = useState<GeoJsonObject | null>(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [hover, setHover] = useState<Country | null>(null);
  const [selected, setSelected] = useState<Country | null>(null);
  const [position, setPosition] = useState<{ coordinates: [number, number]; zoom: number }>({
    coordinates: [8, 5],
    zoom: 1,
  });
  useEffect(() => {
    const controller = new AbortController();
    setError(false);
    fetch("/data/world.geo.json", { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error("map");
        return r.json();
      })
      .then((d: GeoJsonObject) => setGeo(d))
      .catch((e) => {
        if (e.name !== "AbortError") setError(true);
      });
    return () => controller.abort();
  }, [attempt]);
  const shares = mode === "export" ? commodity.exporters : commodity.importers;
  return (
    <div className={`flow-map ${compact ? "map-compact" : ""}`}>
      {error ? (
        <div className="empty-state">
          <Globe2 />
          <p>La carte n’a pas pu être chargée.</p>
          <Button variant="outline" onClick={() => setAttempt((a) => a + 1)}>
            Réessayer
          </Button>
        </div>
      ) : !geo ? (
        <div className="map-loading">
          <Globe2 className="size-8" />
          <span>Chargement de la carte…</span>
        </div>
      ) : (
        <ComposableMap
          width={860}
          height={440}
          projection="geoNaturalEarth1"
          projectionConfig={{ scale: 155 }}
          aria-label={`Carte mondiale des ${mode === "export" ? "exportations" : "importations"} de ${commodity.name}`}
        >
          <defs>
            <marker
              id="flow-arrow"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="5"
              markerHeight="5"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--flow)" />
            </marker>
          </defs>
          <ZoomableGroup
            center={position.coordinates}
            zoom={position.zoom}
            minZoom={1}
            maxZoom={5}
            onMoveEnd={(p) =>
              setPosition({
                coordinates: p.coordinates ?? position.coordinates,
                zoom: p.zoom ?? position.zoom,
              })
            }
            filterZoomEvent={(e) => !compact || e.type !== "wheel"}
          >
            <Geographies geography={geo}>
              {({ geographies }) =>
                geographies
                  .filter((g) => g.id !== "010")
                  .map((g) => {
                    const country = countries.find(
                      (c) => c.numeric === String(g.id).padStart(3, "0"),
                    );
                    const share = country
                      ? tradeValue(commodity, country.code, mode, year).share
                      : 0;
                    const band =
                      share >= 25 ? 4 : share >= 10 ? 3 : share >= 5 ? 2 : share > 0 ? 1 : 0;
                    return (
                      <Geography
                        key={g.rsmKey}
                        geography={g}
                        className={`map-country map-band-${band} ${selected?.code === country?.code && country ? "map-selected" : ""}`}
                        tabIndex={country ? 0 : -1}
                        role={country ? "button" : undefined}
                        aria-label={country ? `Voir ${country.name}` : undefined}
                        onMouseEnter={() => setHover(country ?? null)}
                        onMouseLeave={() => setHover(null)}
                        onFocus={() => setHover(country ?? null)}
                        onBlur={() => setHover(null)}
                        onClick={() => country && setSelected(country)}
                        onKeyDown={(e) => {
                          if (country && (e.key === "Enter" || e.key === " ")) {
                            e.preventDefault();
                            setSelected(country);
                          }
                        }}
                      />
                    );
                  })
              }
            </Geographies>
            {flows && <FlowArcs commodity={commodity} />}{" "}
            {shares.slice(0, 3).map((s) => {
              const c = findCountry(s.code);
              return c?.coordinates ? (
                <Marker key={s.code} coordinates={c.coordinates}>
                  <circle r={3.5} className="map-dot" />
                </Marker>
              ) : null;
            })}
          </ZoomableGroup>
        </ComposableMap>
      )}
      {hover && !selected && (
        <div className="map-tooltip">
          <strong>
            {hover.flag} {hover.name}
          </strong>
          <span>
            Exportations :{" "}
            {formatNumber(tradeValue(commodity, hover.code, "export", year).share, 1)} % ·
            Importations :{" "}
            {formatNumber(tradeValue(commodity, hover.code, "import", year).share, 1)} %
          </span>
          <span>
            Partenaires :{" "}
            {(shares.some((s) => s.code === hover.code) ? commodity.importers : commodity.exporters)
              .slice(0, 3)
              .map((s) => findCountry(s.code)?.name)
              .join(", ")}
          </span>
        </div>
      )}
      <div className="map-controls">
        <Button
          size="icon"
          variant="outline"
          title="Zoom avant"
          aria-label="Zoom avant"
          onClick={() => setPosition((p) => ({ ...p, zoom: Math.min(5, p.zoom * 1.3) }))}
        >
          <Plus />
        </Button>
        <Button
          size="icon"
          variant="outline"
          title="Zoom arrière"
          aria-label="Zoom arrière"
          onClick={() => setPosition((p) => ({ ...p, zoom: Math.max(1, p.zoom / 1.3) }))}
        >
          <Minus />
        </Button>
        <Button
          size="icon"
          variant="outline"
          title="Recentrer"
          aria-label="Recentrer la carte"
          onClick={() => setPosition({ coordinates: [8, 5], zoom: 1 })}
        >
          <RotateCcw />
        </Button>
      </div>
      <div className="map-legend">
        <span>Part mondiale</span>
        <div className="legend-scale">
          {[0, 1, 2, 3, 4].map((i) => (
            <i key={i} className={`map-band-${i}`} />
          ))}
        </div>
        <div className="flex justify-between text-[10px]">
          <span>0 %</span>
          <span>≥ 25 %</span>
        </div>
      </div>
      <div className="map-credit">Natural Earth · Données illustratives</div>
      {selected && (
        <CountryPanel
          country={selected}
          commodity={commodity}
          year={year}
          close={() => setSelected(null)}
        />
      )}
    </div>
  );
}
