import { createFileRoute } from "@tanstack/react-router";
import { dashboardQuery } from '@/lib/api';
import { Dashboard } from '@/components/agrigeo/Dashboard';
import { PageError, PageSkeleton } from '@/components/agrigeo/common';
export const Route = createFileRoute("/")({
  loader: ({context}) => context.queryClient.ensureQueryData(dashboardQuery),
  head: () => ({meta:[
    {title:'AgriGeo — Vue d’ensemble'},
    {name:'description',content:'Explorez les dépendances alimentaires mondiales, les neuf matières premières et les alertes géopolitiques du prototype AgriGeo.'},
    {property:'og:title',content:'AgriGeo — Vue d’ensemble'},
    {property:'og:description',content:'Les matières premières au cœur des équilibres alimentaires mondiaux.'},
    {property:'og:type',content:'website'},
    {name:'twitter:card',content:'summary_large_image'}
  ]}),
  component: Dashboard,
  pendingComponent: PageSkeleton,
  errorComponent: PageError,
});
