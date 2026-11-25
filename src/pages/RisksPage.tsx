import { PageMeta } from "@/components/agrigeo/PageMeta";
import { RisksView } from "@/components/agrigeo/RisksView";

export function RisksPage() {
  return (
    <>
      <PageMeta
        title="Prix et risques des matières premières — AgriGeo"
        description="Comparez cinq ans de prix, les dimensions du risque et les événements géopolitiques alimentaires."
      />
      <RisksView />
    </>
  );
}
