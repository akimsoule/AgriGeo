import { queryOptions } from "@tanstack/react-query";
import { commodities, countries, alerts } from "@/data/agrigeo";
export async function getCommodities() {
  return commodities;
}
export async function getCountries() {
  return countries;
}
export async function getAlerts() {
  return alerts;
}
export async function getDashboard() {
  const [commodities, countries, alerts] = await Promise.all([
    getCommodities(),
    getCountries(),
    getAlerts(),
  ]);
  return { commodities, countries, alerts };
}
export const dashboardQuery = queryOptions({
  queryKey: ["agrigeo", "dashboard"],
  queryFn: getDashboard,
  staleTime: Infinity,
});
