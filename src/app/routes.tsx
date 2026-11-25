import type { QueryClient } from "@tanstack/react-query";
import type { RouteObject } from "react-router";

import { PageSkeleton } from "@/components/agrigeo/common";
import { dashboardQuery } from "@/lib/api";
import { CommodityPage } from "@/pages/CommodityPage";
import { CountryPage } from "@/pages/CountryPage";
import { FlowsPage } from "@/pages/FlowsPage";
import { HomePage } from "@/pages/HomePage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { RisksPage } from "@/pages/RisksPage";
import { RootLayout } from "./RootLayout";
import { RouteError } from "./RouteError";

/** Définition des routes (séparée du routeur pour pouvoir la tester sans navigateur). */
export function appRoutes(queryClient: QueryClient): RouteObject[] {
  return [
    {
      path: "/",
      Component: RootLayout,
      // Le jeu de données est chargé une fois pour toute l'application (API, avec repli embarqué).
      loader: () => queryClient.ensureQueryData(dashboardQuery),
      HydrateFallback: PageSkeleton,
      ErrorBoundary: RouteError,
      children: [
        {
          // Les erreurs de page s'affichent dans la mise en page, sans perdre la navigation.
          ErrorBoundary: RouteError,
          children: [
            { index: true, Component: HomePage },
            { path: "flux", Component: FlowsPage },
            { path: "risques", Component: RisksPage },
            { path: "matiere/:id", Component: CommodityPage },
            { path: "pays/:code", Component: CountryPage },
            { path: "*", Component: NotFoundPage },
          ],
        },
      ],
    },
  ];
}
