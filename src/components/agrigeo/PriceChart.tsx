import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { alerts, commodities, findCommodity, formatDate, formatNumber, type Commodity } from "@/data/agrigeo";
export function PriceChart({
  items,
  period = 60,
  indexed = false,
  compact = false,
  events = false,
}: {
  items: Commodity[];
  period?: number;
  indexed?: boolean;
  compact?: boolean;
  events?: boolean;
}) {
  const first = items[0];
  if (!first) return <div className="empty-state">Sélectionnez au moins une matière.</div>;
  const series = first.prices.slice(-period).map((p, i) => {
    const row: Record<string, string | number> = { date: Date.parse(p.date) };
    items.forEach((c) => {
      const points = c.prices.slice(-period);
      const v = points[i]?.value ?? 0;
      row[c.id] = indexed ? Math.round((v / (points[0]?.value || 1)) * 100) : v;
    });
    return row;
  });
  const single = items.length === 1;
  const Chart = single ? AreaChart : LineChart;
  return (
    <div className={compact ? "chart-wrap chart-compact" : "chart-wrap"}>
      <ResponsiveContainer width="100%" height="100%">
        <Chart data={series} margin={{ top: 18, right: 12, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id={`price-fill-${first.id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.18} />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--border)" vertical={false} strokeDasharray="3 4" />
          <XAxis
            dataKey="date"
            type="number"
            scale="time"
            domain={[Number(series[0]?.['date'] ?? 0), Date.parse('2024-12-31')]}
            tickFormatter={(d) =>
              new Date(Number(d)).toLocaleDateString("fr-FR", {
                month: "short",
                year: "2-digit",
                timeZone: "UTC",
              })
            }
            minTickGap={60}
            tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(v) => formatNumber(Number(v))}
            tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            domain={["auto", "auto"]}
          />
          <Tooltip
            contentStyle={{
              background: "var(--popover)",
              border: "1px solid var(--border)",
              borderRadius: 6,
              color: "var(--foreground)",
            }}
            labelFormatter={(v) => formatDate(new Date(Number(v)).toISOString())}
            formatter={(v, name) => [
              `${formatNumber(Number(v))} ${indexed ? "" : "USD/t"}`,
              findCommodity(String(name))?.name ?? name,
            ]}
          />
          {events &&
            alerts
              .filter((a) => a.commodities.some((id) => items.some((c) => c.id === id)))
              .map((a) => (
                <ReferenceLine
                  key={a.id}
                  x={Date.parse(a.date)}
                  stroke="var(--warning)"
                  strokeDasharray="4 4"
                  label={({viewBox}) => {
                    if (!viewBox || !('x' in viewBox) || !('y' in viewBox)) return <g />;
                    return <g tabIndex={0} role="img" aria-label={`${formatDate(a.date)} : ${a.title}`}><title>{formatDate(a.date)} — {a.title} : {a.detail}</title><rect x={Number(viewBox.x)-5} y={Number(viewBox.y)} width={10} height={18} fill="var(--warning-soft)"/><text x={Number(viewBox.x)} y={Number(viewBox.y)+13} textAnchor="middle" fill="var(--warning)" fontSize={11}>!</text></g>;
                  }}
                />
              ))}
          {single ? (
            <Area
              type="monotone"
              dataKey={first.id}
              stroke="var(--primary)"
              fill={`url(#price-fill-${first.id})`}
              strokeWidth={2}
              animationDuration={650}
            />
          ) : (
            items.map((c) => (
              <Line
                key={c.id}
                type="monotone"
                dataKey={c.id}
                stroke={`var(--series-${commodities.findIndex(item=>item.id===c.id) % 6})`}
                dot={false}
                strokeWidth={2}
                animationDuration={650}
              />
            ))
          )}
        </Chart>
      </ResponsiveContainer>
    </div>
  );
}
