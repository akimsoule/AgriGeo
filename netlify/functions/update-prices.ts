import { getStore } from "@netlify/blobs";
import type { Config } from "@netlify/functions";

import { fetchPricesFile, isPricesFile } from "../../shared/pink-sheet";

/** Chaque mois : télécharge le Pink Sheet, le valide et le publie dans Netlify Blobs (sans redéploiement). */
export default async () => {
  const prices = await fetchPricesFile(process.env["PINK_SHEET_URL"]);
  if (!isPricesFile(prices)) throw new Error("Prix invalides : publication annulée.");
  await getStore("agrigeo").setJSON("prices.json", prices);
  console.log(`Prix mis à jour : dernier mois ${prices.meta?.lastMonth} (${prices.meta?.fileUrl})`);
};

// Le Pink Sheet paraît en début de mois : exécution le 5 à 06:17 UTC.
export const config: Config = { schedule: "17 6 5 * *" };
