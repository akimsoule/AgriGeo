import { queryOptions } from "@tanstack/react-query";
import { bundledDataset, setDataset, type Dataset } from "@/data/agrigeo";

/** Vérification minimale de la forme reçue : en cas de doute, on garde le jeu embarqué. */
function isDataset(value: unknown): value is Dataset {
  const d = value as Partial<Dataset> | null;
  return (
    !!d &&
    Array.isArray(d.commodities) &&
    d.commodities.length > 0 &&
    d.commodities.every((c) => typeof c?.id === "string" && Array.isArray(c.prices)) &&
    Array.isArray(d.countries) &&
    Array.isArray(d.alerts)
  );
}

/**
 * Charge le jeu de données depuis l'API Netlify (/api/dashboard), qui applique les prix les plus
 * récents. Si l'API est absente (ex. `npm run dev` sans `netlify dev`) ou invalide, on retombe sur
 * le jeu embarqué. Le jeu retenu devient le jeu courant avant le rendu des pages.
 */
export async function getDashboard(): Promise<Dataset> {
  let dataset: Dataset = bundledDataset;
  try {
    const res = await fetch("/api/dashboard", { headers: { accept: "application/json" } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const body: unknown = await res.json();
    if (!isDataset(body)) throw new Error("réponse invalide");
    dataset = body;
  } catch (error) {
    console.warn("API indisponible, jeu de données embarqué utilisé :", error);
  }
  setDataset(dataset);
  return dataset;
}

export const dashboardQuery = queryOptions({
  queryKey: ["agrigeo", "dashboard"],
  queryFn: getDashboard,
  staleTime: Infinity,
});
