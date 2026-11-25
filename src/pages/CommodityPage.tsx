import { useParams } from "react-router";

import { CommodityView } from "@/components/agrigeo/CommodityView";
import { PageMeta } from "@/components/agrigeo/PageMeta";
import { findCommodity } from "@/data/agrigeo";

export function CommodityPage() {
  const { id = "" } = useParams();
  const name = findCommodity(id)?.name ?? "Matière non renseignée";
  return (
    <>
      <PageMeta
        title={`${name} : prix, échanges et risques — AgriGeo`}
        description={`Analyse de la filière ${name.toLowerCase()} : prix, concentration, exportateurs et risques géopolitiques.`}
      />
      <CommodityView key={id} id={id} />
    </>
  );
}
