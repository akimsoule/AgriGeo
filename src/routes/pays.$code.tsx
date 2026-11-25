import { createFileRoute } from "@tanstack/react-router";
import { dashboardQuery } from "@/lib/api";
import { findCountry } from "@/data/agrigeo";
import { CountryView } from "@/components/agrigeo/CountryView";
import { PageError, PageSkeleton } from "@/components/agrigeo/common";
export const Route = createFileRoute("/pays/$code")({
  loader: ({ context }) => context.queryClient.ensureQueryData(dashboardQuery),
  head: ({ params }) => {
    const name = findCountry(params.code)?.name ?? "Pays non renseigné";
    return {
      meta: [
        { title: `${name} : dépendances alimentaires — AgriGeo` },
        {
          name: "description",
          content: `Profil alimentaire de ${name} : échanges, partenaires, matières premières et vulnérabilité.`,
        },
        { property: "og:title", content: `${name} — AgriGeo` },
        {
          property: "og:description",
          content: `Le rôle de ${name} dans les équilibres alimentaires internationaux.`,
        },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: CountryPage,
  pendingComponent: PageSkeleton,
  errorComponent: PageError,
});
function CountryPage() {
  const { code } = Route.useParams();
  return <CountryView key={code} code={code} />;
}
