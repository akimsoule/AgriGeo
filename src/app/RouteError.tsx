import { useRevalidator, useRouteError } from "react-router";

import { PageError } from "@/components/agrigeo/common";

export function RouteError() {
  const error = useRouteError();
  const { revalidate } = useRevalidator();
  console.error(error);
  return <PageError reset={revalidate} />;
}
