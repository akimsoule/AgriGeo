import { createFileRoute } from '@tanstack/react-router';
import { dashboardQuery } from '@/lib/api';
import { findCommodity } from '@/data/agrigeo';
import { CommodityView } from '@/components/agrigeo/CommodityView';
import { PageError, PageSkeleton } from '@/components/agrigeo/common';
export const Route = createFileRoute('/matiere/$id')({
  loader:({context})=>context.queryClient.ensureQueryData(dashboardQuery),
  head:({params})=>{const name=findCommodity(params.id)?.name??'Matière non renseignée';return {meta:[{title:`${name} : prix, échanges et risques — AgriGeo`},{name:'description',content:`Analyse illustrative de la filière ${name.toLowerCase()} : prix, concentration, exportateurs et risques géopolitiques.`},{property:'og:title',content:`${name} — AgriGeo`},{property:'og:description',content:`Les dépendances et les équilibres de la filière ${name.toLowerCase()}.`},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]};},
  component:MatterPage,pendingComponent:PageSkeleton,errorComponent:PageError,
});
function MatterPage(){const {id}=Route.useParams();return <CommodityView key={id} id={id}/>;}