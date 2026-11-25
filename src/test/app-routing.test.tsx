import { QueryClient } from "@tanstack/react-query";
import { matchRoutes } from "react-router";
import { describe, expect, it } from "vitest";

import { appRoutes } from "@/app/routes";

// On teste uniquement la correspondance des routes : sans exécuter les loaders ni rendre de page.
describe("App routing", () => {
  const routes = appRoutes(new QueryClient());
  const leaf = (path: string) => matchRoutes(routes, path)?.at(-1)?.route;

  it.each(["/", "/flux", "/risques", "/matiere/cacao", "/pays/CI"])("matches %s", (path) => {
    const route = leaf(path);
    expect(route).toBeDefined();
    expect(route?.path).not.toBe("*");
  });

  it("falls back to the not-found page for unknown paths", () => {
    expect(leaf("/inconnu")?.path).toBe("*");
  });

  it("exposes route params for commodities and countries", () => {
    expect(matchRoutes(routes, "/matiere/cacao")?.at(-1)?.params).toEqual({ id: "cacao" });
    expect(matchRoutes(routes, "/pays/CI")?.at(-1)?.params).toEqual({ code: "CI" });
  });
});
