import { task } from "@trigger.dev/sdk";

// Smoke-test task from scaffold — keep until real tasks land
export const helloScraper = task({
  id: "hello-scraper",
  run: async () => {
    console.log("scraper online");
    return { status: "ok" };
  },
});

// Public API
export * from "./brands/BrandAdapter.js";
export * from "./brands/registry.js";
export * from "./fetch/Fetcher.js";
export * from "./fetch/HttpFetcher.js";
export * from "./fetch/BrowserFetcher.js";
export * from "./fetch/proxy.js";
export * from "./state/StateBuffer.js";
export * from "./ingest/trpcClient.js";

// Spike: fetcher bake test (INF-1360)
export { bakeTestFetchers } from "./spikes/fetcher-bake-test/index.js";
