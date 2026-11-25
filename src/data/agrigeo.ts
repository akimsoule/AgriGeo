export type Country = {
  code: string;
  numeric: string;
  name: string;
  flag: string;
  coordinates: [number, number];
  vulnerability: number;
};
export const countries: Country[] = [
  ["CI", "384", "Côte d’Ivoire", "🇨🇮", -5, 7.5, 34],
  ["GH", "288", "Ghana", "🇬🇭", -1, 7.9, 42],
  ["BR", "076", "Brésil", "🇧🇷", -51, -12, 18],
  ["ID", "360", "Indonésie", "🇮🇩", 118, -3, 31],
  ["EC", "218", "Équateur", "🇪🇨", -78, -1, 29],
  ["CM", "120", "Cameroun", "🇨🇲", 12, 6, 45],
  ["NG", "566", "Nigeria", "🇳🇬", 8, 9, 58],
  ["PE", "604", "Pérou", "🇵🇪", -75, -10, 37],
  ["US", "840", "États-Unis", "🇺🇸", -100, 39, 16],
  ["DE", "276", "Allemagne", "🇩🇪", 10, 51, 35],
  ["NL", "528", "Pays-Bas", "🇳🇱", 5, 52, 48],
  ["FR", "250", "France", "🇫🇷", 2, 47, 22],
  ["CN", "156", "Chine", "🇨🇳", 105, 35, 39],
  ["IN", "356", "Inde", "🇮🇳", 79, 22, 26],
  ["RU", "643", "Russie", "🇷🇺", 90, 60, 21],
  ["UA", "804", "Ukraine", "🇺🇦", 32, 49, 46],
  ["AR", "032", "Argentine", "🇦🇷", -64, -35, 19],
  ["AU", "036", "Australie", "🇦🇺", 134, -25, 14],
  ["CA", "124", "Canada", "🇨🇦", -110, 57, 17],
  ["MY", "458", "Malaisie", "🇲🇾", 102, 4, 53],
  ["TH", "764", "Thaïlande", "🇹🇭", 101, 15, 20],
  ["VN", "704", "Vietnam", "🇻🇳", 106, 17, 24],
  ["CO", "170", "Colombie", "🇨🇴", -73, 4, 36],
  ["ET", "231", "Éthiopie", "🇪🇹", 40, 9, 68],
  ["TR", "792", "Turquie", "🇹🇷", 35, 39, 47],
  ["EG", "818", "Égypte", "🇪🇬", 30, 27, 76],
  ["IT", "380", "Italie", "🇮🇹", 12, 43, 49],
  ["JP", "392", "Japon", "🇯🇵", 138, 37, 72],
  ["ES", "724", "Espagne", "🇪🇸", -4, 40, 41],
  ["PK", "586", "Pakistan", "🇵🇰", 69, 30, 44],
  ["BE", "056", "Belgique", "🇧🇪", 4, 50.5, 51],
  ["GB", "826", "Royaume-Uni", "🇬🇧", -2, 54, 55],
  ["BD", "050", "Bangladesh", "🇧🇩", 90, 24, 64],
  ["SA", "682", "Arabie saoudite", "🇸🇦", 45, 24, 83],
].map(([code, numeric, name, flag, lon, lat, vulnerability]) => ({
  code: String(code),
  numeric: String(numeric),
  name: String(name),
  flag: String(flag),
  coordinates: [Number(lon), Number(lat)],
  vulnerability: Number(vulnerability),
}));
export type Share = { code: string; share: number };
export type Commodity = {
  id: string;
  name: string;
  icon: string;
  risk: number;
  change: number;
  price: number;
  unit: string;
  components: [number, number, number, number];
  exporters: Share[];
  importers: Share[];
  prices: { date: string; value: number }[];
  concentration: { year: number; value: number }[];
};
type Seed = [
  string,
  string,
  string,
  number,
  number,
  number,
  [number, number, number, number],
  string[],
  number[],
  string[],
  number[],
];
const seeds: Seed[] = [
  [
    "cacao",
    "Cacao",
    "bean",
    87,
    42.8,
    7840,
    [95, 88, 86, 79],
    ["CI", "GH", "EC", "CM", "NG", "ID", "BR", "PE"],
    [44, 26, 7, 5, 4, 3, 2, 2],
    ["NL", "DE", "US", "BE", "MY", "FR", "ID", "ES"],
    [21, 15, 12, 9, 8, 6, 5, 4],
  ],
  [
    "cafe",
    "Café",
    "coffee",
    74,
    18.6,
    4320,
    [78, 80, 82, 56],
    ["BR", "VN", "CO", "ID", "ET", "IN", "PE", "GH"],
    [34, 19, 9, 6, 5, 4, 3, 2],
    ["US", "DE", "IT", "JP", "BE", "FR", "ES", "CA"],
    [22, 16, 9, 7, 6, 5, 4, 3],
  ],
  [
    "sucre",
    "Sucre",
    "cubes",
    58,
    -6.2,
    462,
    [72, 59, 64, 37],
    ["BR", "IN", "TH", "AU", "FR", "DE", "PK", "MY"],
    [43, 14, 10, 6, 4, 3, 2, 2],
    ["CN", "ID", "US", "BD", "MY", "SA", "EG", "JP"],
    [15, 12, 9, 7, 5, 4, 4, 3],
  ],
  [
    "huile-palme",
    "Huile de palme",
    "droplet",
    79,
    9.4,
    1025,
    [96, 65, 83, 72],
    ["ID", "MY", "TH", "CO", "NG", "GH", "EC", "BR"],
    [58, 29, 3, 2, 1.5, 1, 1, 1],
    ["IN", "CN", "PK", "NL", "ES", "EG", "BD", "US"],
    [24, 17, 8, 6, 5, 4, 4, 3],
  ],
  [
    "huile-tournesol",
    "Huile de tournesol",
    "flower",
    82,
    12.1,
    1180,
    [91, 72, 69, 96],
    ["UA", "RU", "AR", "TR", "FR", "ES", "BR", "IN"],
    [39, 31, 8, 5, 3, 2, 1, 1],
    ["IN", "CN", "TR", "ES", "NL", "IT", "EG", "FR"],
    [19, 14, 11, 8, 7, 6, 5, 4],
  ],
  [
    "ble",
    "Blé",
    "wheat",
    68,
    -3.8,
    242,
    [63, 62, 71, 76],
    ["RU", "AU", "CA", "US", "FR", "UA", "AR", "DE"],
    [22, 14, 13, 12, 10, 8, 6, 4],
    ["EG", "ID", "TR", "CN", "IT", "BD", "NG", "JP"],
    [13, 10, 8, 7, 6, 5, 4, 4],
  ],
  [
    "mais",
    "Maïs",
    "wheat",
    54,
    -8.5,
    198,
    [65, 48, 62, 41],
    ["US", "BR", "AR", "UA", "FR", "RU", "CA", "IN"],
    [29, 25, 17, 11, 4, 3, 2, 2],
    ["CN", "JP", "EG", "ES", "VN", "MY", "NL", "IT"],
    [18, 12, 8, 7, 6, 5, 4, 4],
  ],
  [
    "riz",
    "Riz",
    "sprout",
    65,
    6.7,
    586,
    [73, 52, 68, 67],
    ["IN", "TH", "VN", "PK", "US", "CN", "BR", "AU"],
    [35, 18, 16, 8, 5, 3, 2, 1],
    ["CN", "ID", "NG", "SA", "CI", "FR", "US", "MY"],
    [12, 10, 8, 6, 5, 4, 3, 3],
  ],
  [
    "soja",
    "Soja",
    "sprout",
    61,
    -5.3,
    418,
    [87, 49, 65, 43],
    ["BR", "US", "AR", "CA", "UA", "RU", "IN", "AU"],
    [52, 29, 5, 3, 2, 2, 1, 1],
    ["CN", "NL", "DE", "ES", "TH", "EG", "JP", "ID"],
    [61, 5, 4, 4, 3, 3, 2, 2],
  ],
];
export function makePriceSeries(price: number, change: number, phase: number) {
  const priorYear = price / (1 + change / 100);
  return Array.from({ length: 60 }, (_, i) => {
    const value = i <= 47
      ? priorYear * (0.72 + i / 47 * 0.28 + Math.sin((i - 47) * 0.48 + phase) * 0.06 * (47 - i) / 47)
      : priorYear + (price - priorYear) * (i - 47) / 12 + Math.sin((i - 47) / 12 * Math.PI) * price * 0.025;
    return { date: `${2020 + Math.floor(i / 12)}-${String(i % 12 + 1).padStart(2, '0')}-01`, value: Math.round(value * 100) / 100 };
  });
}
export const commodities: Commodity[] = seeds.map(
  ([id, name, icon, risk, change, price, components, exp, shares, imp, importShares], index) => ({
    id,
    name,
    icon,
    risk,
    change,
    price,
    unit: "USD / tonne",
    components,
    exporters: exp.map((code, i) => ({ code, share: shares[i] ?? 0 })),
    importers: imp.map((code, i) => ({ code, share: importShares[i] ?? 0 })),
    prices: makePriceSeries(price, change, index),
    concentration: Array.from({ length: 10 }, (_, i) => ({
      year: 2015 + i,
      value: Math.round((shares[0] ?? 0) + (shares[1] ?? 0) - 8 + i * 0.9),
    })),
  }),
);
export type Severity = "Élevée" | "Modérée" | "Faible";
export type Alert = {
  id: string;
  date: string;
  code: string;
  commodities: string[];
  type: string;
  severity: Severity;
  title: string;
  detail: string;
};
export const alerts: Alert[] = [
  {
    id: "1",
    date: "2024-12-18",
    code: "CI",
    commodities: ["cacao"],
    type: "Sécheresse",
    severity: "Élevée",
    title: "La récolte de cacao sous pression",
    detail:
      "Un déficit de précipitations de 28 % fragilise la prochaine campagne et accentue la tension sur l’offre mondiale.",
  },
  {
    id: "2",
    date: "2024-12-16",
    code: "UA",
    commodities: ["ble", "huile-tournesol"],
    type: "Conflit",
    severity: "Élevée",
    title: "Perturbations des corridors de la mer Noire",
    detail:
      "Les délais de transport augmentent sur les corridors céréaliers, avec un impact sur les coûts d’assurance.",
  },
  {
    id: "3",
    date: "2024-12-14",
    code: "IN",
    commodities: ["riz", "sucre"],
    type: "Restriction d’export",
    severity: "Modérée",
    title: "Maintien des quotas sur le riz",
    detail:
      "Les quotas d’exportation sont prolongés pour soutenir la disponibilité et les prix sur le marché intérieur.",
  },
  {
    id: "4",
    date: "2024-12-12",
    code: "BR",
    commodities: ["cafe", "soja"],
    type: "Sécheresse",
    severity: "Élevée",
    title: "Stress hydrique dans le sud-est brésilien",
    detail:
      "Les faibles réserves d’eau menacent la floraison du café et retardent les semis de soja.",
  },
  {
    id: "5",
    date: "2024-12-10",
    code: "ID",
    commodities: ["huile-palme"],
    type: "Restriction d’export",
    severity: "Modérée",
    title: "Relèvement de la taxe à l’exportation",
    detail:
      "Une nouvelle taxe pourrait réduire la compétitivité de l’huile de palme à court terme.",
  },
  {
    id: "6",
    date: "2024-12-08",
    code: "RU",
    commodities: ["ble"],
    type: "Embargo",
    severity: "Élevée",
    title: "Nouvelles tensions sur les échanges céréaliers",
    detail:
      "Des restrictions commerciales ciblées fragilisent les approvisionnements de plusieurs marchés importateurs.",
  },
  {
    id: "7",
    date: "2024-12-05",
    code: "TH",
    commodities: ["riz"],
    type: "Sécheresse",
    severity: "Modérée",
    title: "Baisse des réserves d’irrigation",
    detail:
      "Une campagne plus sèche réduit les perspectives de production de riz dans les plaines centrales.",
  },
  {
    id: "8",
    date: "2024-12-02",
    code: "AR",
    commodities: ["mais", "soja"],
    type: "Restriction d’export",
    severity: "Faible",
    title: "Révision des procédures douanières",
    detail:
      "Les nouvelles procédures rallongent temporairement les délais de dédouanement dans les ports agricoles.",
  },
];
export const findCountry = (code: string) => countries.find((c) => c.code === code);
export const findCommodity = (id: string) => commodities.find((c) => c.id === id);
export const formatNumber = (n: number, digits = 0) =>
  new Intl.NumberFormat("fr-FR", { maximumFractionDigits: digits }).format(n);
export const formatDate = (date: string) =>
  new Intl.DateTimeFormat("fr-FR", { timeZone: "UTC" }).format(new Date(date));
export const componentNames = [
  "Concentration de l’offre",
  "Volatilité des prix",
  "Risque climatique",
  "Risque politique",
];
export function tradeValue(
  commodity: Commodity,
  code: string,
  mode: "export" | "import",
  year: number,
) {
  const share =
    (mode === "export" ? commodity.exporters : commodity.importers).find((s) => s.code === code)
      ?.share ?? 0;
  return {
    share: Math.round(share * (1 + (year - 2024) * 0.008) * 10) / 10,
    value: share * commodity.price * 720 * (0.7 + (year - 2015) * 0.033),
  };
}
