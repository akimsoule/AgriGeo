import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen } from "@testing-library/react";
import { createMemoryRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { appRoutes } from "@/app/routes";

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

beforeEach(() => {
  vi.stubGlobal("ResizeObserver", ResizeObserverStub);
  vi.spyOn(console, "warn").mockImplementation(() => {});
  // API absente (404) : l'application doit retomber sur le jeu embarqué. Le fond de carte est vide.
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL) =>
      String(input).includes("world.geo.json")
        ? Response.json({ type: "FeatureCollection", features: [] })
        : new Response("not found", { status: 404 }),
    ),
  );
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

function renderAt(path: string) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const router = createMemoryRouter(appRoutes(queryClient), { initialEntries: [path] });
  render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
}

describe("App rendering (API unavailable → embedded dataset)", () => {
  it("renders the overview inside the application shell", async () => {
    renderAt("/");
    expect((await screen.findAllByText(/Carte des flux/)).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Cacao/).length).toBeGreaterThan(0);
  });

  it("renders a commodity page from the route parameter", async () => {
    renderAt("/matiere/cacao");
    expect((await screen.findAllByText(/Cacao/)).length).toBeGreaterThan(0);
    expect(document.title).toContain("Cacao");
  });

  it("renders a country page from the route parameter", async () => {
    renderAt("/pays/CI");
    expect((await screen.findAllByText(/Côte d’Ivoire/)).length).toBeGreaterThan(0);
  });

  it("renders the risks page and the not-found page", async () => {
    renderAt("/risques");
    expect((await screen.findAllByText(/Prix et risques/)).length).toBeGreaterThan(0);
    cleanup();
    renderAt("/inconnu");
    expect(await screen.findByText("Page introuvable")).toBeInTheDocument();
  });
});
