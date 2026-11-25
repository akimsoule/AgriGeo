export type FlowParty = {
  /** Code pays ISO 3166-1 alpha-2. */
  code: string;
  /** Valeur en USD courants. */
  value: number;
  /** Quantité en tonnes (null si absente de BACI). */
  tonnes: number | null;
  /** Part du total mondial en valeur, en %. */
  share: number;
};
export type YearFlows = {
  worldValue: number;
  worldTonnes: number;
  exporters: FlowParty[];
  importers: FlowParty[];
  /** Plus gros flux bilatéraux (valeur en USD courants). */
  flows: { from: string; to: string; value: number }[];
};
export type FlowsFile = {
  meta: {
    source: string;
    sourceUrl: string;
    hsRevision: string;
    version: string;
    licence: string;
    retrievedAt: string;
    firstYear: number;
    lastYear: number;
    unit: string;
    hsCodes: Record<string, string[]>;
  } | null;
  /** Pays présents dans les données, avec numéro ISO numérique et centroïde (si connu). */
  countries: Record<
    string,
    { numeric: string; name: string; coordinates: [number, number] | null }
  >;
  commodities: Record<string, { years: Record<string, YearFlows> }>;
};
