import { createFileRoute } from '@tanstack/react-router';
import { dashboardQuery } from '@/lib/api';
import { RisksView } from '@/components/agrigeo/RisksView';
import { PageError, PageSkeleton } from '@/components/agrigeo/common';
export const Route = createFileRoute('/risques')({
  loader:({context})=>context.queryClient.ensureQueryData(dashboardQuery),
  head:()=>({meta:[{title:'Prix et risques des matières premières — AgriGeo'},{name:'description',content:'Comparez cinq ans de prix, les dimensions du risque et les événements géopolitiques alimentaires.'},{property:'og:title',content:'Prix et risques — AgriGeo'},{property:'og:description',content:'Les prix alimentaires en perspective avec les risques géopolitiques.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]}),
  component:RisksView,pendingComponent:PageSkeleton,errorComponent:PageError,
});