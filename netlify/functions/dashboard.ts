import { getStore } from "@netlify/blobs";
import type { Config } from "@netlify/functions";

import { loadDashboard } from "../../shared/dashboard";

export default async () => {
  const { dataset, pricesFrom } = await loadDashboard(() =>
    getStore("agrigeo").get("prices.json", { type: "json" }),
  );
  return Response.json(dataset, {
    headers: {
      // Les prix changent une fois par mois : cache court navigateur, plus long côté CDN.
      "cache-control": "public, max-age=300",
      "netlify-cdn-cache-control": "public, s-maxage=3600, stale-while-revalidate=86400",
      "x-agrigeo-prices": pricesFrom,
    },
  });
};

export const config: Config = { path: "/api/dashboard" };
