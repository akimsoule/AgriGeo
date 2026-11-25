import { useParams } from "react-router";

import { CountryView } from "@/components/agrigeo/CountryView";
import { PageMeta } from "@/components/agrigeo/PageMeta";
import { findCountry } from "@/data/agrigeo";

export function CountryPage() {
  const { code = "" } = useParams();
  const name = findCountry(code)?.name ?? "Pays non renseigné";
  return (
    <>
      <PageMeta
        title={`${name} : dépendances alimentaires — AgriGeo`}
        description={`Profil alimentaire de ${name} : échanges, partenaires, matières premières et vulnérabilité.`}
      />
      <CountryView key={code} code={code} />
    </>
  );
}
