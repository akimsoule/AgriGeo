import { FlowsView } from "@/components/agrigeo/FlowsView";
import { PageMeta } from "@/components/agrigeo/PageMeta";

export function FlowsPage() {
  return (
    <>
      <PageMeta
        title="Carte des flux alimentaires — AgriGeo"
        description="Cartographiez les exportations et importations des matières premières suivies entre 2015 et 2024."
      />
      <FlowsView />
    </>
  );
}
