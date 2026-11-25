/**
 * Assemblage du jeu de données servi par /api/dashboard.
 * Les prix viennent du stockage (Netlify Blobs, mis à jour par la fonction planifiée) s'ils sont
 * valides et plus récents que ceux embarqués au dernier déploiement ; sinon on sert l'embarqué.
 */
import { buildDataset, type Dataset } from "../src/data/agrigeo";
import type { FlowsFile } from "../src/data/flows-types";
import generatedFlows from "../src/data/generated/flows.json";
import generatedPrices from "../src/data/generated/prices.json";
import type { PricesFile } from "../src/data/prices-types";
import { isPricesFile } from "./pink-sheet";

export type DashboardResult = { dataset: Dataset; pricesFrom: "store" | "bundle" };

export async function loadDashboard(
  readStoredPrices: () => Promise<unknown>,
): Promise<DashboardResult> {
  const bundledPrices = generatedPrices as unknown as PricesFile;
  const flows = generatedFlows as unknown as FlowsFile;
  let prices = bundledPrices;
  let pricesFrom: DashboardResult["pricesFrom"] = "bundle";
  try {
    const stored = await readStoredPrices();
    if (isPricesFile(stored) && stored.meta!.lastMonth > (bundledPrices.meta?.lastMonth ?? "")) {
      prices = stored;
      pricesFrom = "store";
    }
  } catch (error) {
    // Stockage indisponible (ex. exécution locale hors Netlify) : on garde le jeu embarqué.
    console.warn("Prix stockés illisibles, jeu embarqué utilisé :", error);
  }
  return { dataset: buildDataset({ prices, flows }), pricesFrom };
}
