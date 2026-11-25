import { Outlet, ScrollRestoration } from "react-router";

import { AppShell } from "@/components/agrigeo/AppShell";

export function RootLayout() {
  return (
    <AppShell>
      <Outlet />
      <ScrollRestoration />
    </AppShell>
  );
}
