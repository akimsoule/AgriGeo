export type PricePoint = { date: string; value: number };
export type PricesFile = {
  meta: {
    source: string;
    sourceUrl: string;
    fileUrl: string;
    licence: string;
    retrievedAt: string;
    lastMonth: string;
    unit: string;
  } | null;
  series: Record<string, { label: string; originalUnit: string; points: PricePoint[] }>;
};
