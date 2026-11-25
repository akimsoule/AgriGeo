import { Dashboard } from "@/components/agrigeo/Dashboard";
import { PageMeta } from "@/components/agrigeo/PageMeta";

export function HomePage() {
  return (
    <>
      <PageMeta
        title="AgriGeo — Vue d’ensemble"
        description="Explorez les dépendances alimentaires mondiales, les matières premières suivies et les alertes géopolitiques."
      />
      <Dashboard />
    </>
  );
}
