import { createFileRoute } from "@tanstack/react-router";
import { dashboardQuery } from "@/lib/api";
import { FlowsView } from "@/components/agrigeo/FlowsView";
import { PageError, PageSkeleton } from "@/components/agrigeo/common";
export const Route = createFileRoute("/flux")({
  loader: ({ context }) => context.queryClient.ensureQueryData(dashboardQuery),
  head: () => ({
    meta: [
      { title: "Carte des flux alimentaires — AgriGeo" },
      {
        name: "description",
        content:
          "Cartographiez les exportations et importations de neuf matières premières entre 2015 et 2024.",
      },
      { property: "og:title", content: "Carte des flux alimentaires — AgriGeo" },
      {
        property: "og:description",
        content: "Une carte interactive des dépendances commerciales alimentaires.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FlowsView,
  pendingComponent: PageSkeleton,
  errorComponent: PageError,
});
