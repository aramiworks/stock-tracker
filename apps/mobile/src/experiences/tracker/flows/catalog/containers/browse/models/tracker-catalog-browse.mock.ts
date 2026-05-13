import type { CatalogGroup } from "./tracker-catalog-browse.type";

/**
 * Storybook + unit-test fixture for the catalog browse screen.
 *
 * Mirrors the seeded catalog in `packages/prisma/prisma/seed-catalog.ts`:
 * - 12 Hermès product lines (NO Birkin/Kelly): Bolide, Constance, 24/24,
 *   Della Cavalleria, Evelyne, Garden Party, Halzan, Herbag, In-the-Loop,
 *   Lindy, Picotin, Roulis
 * - 1 Cartier product line: Tank Must (4 SKUs)
 *
 * IDs are deterministic UUIDs so React keys stay stable across hot reloads
 * and snapshot/Maestro test runs.
 *
 * Runtime data now comes from the tRPC `catalog.list` query via the tracker
 * subgraph (INF-1393); this fixture stays for offline storybook rendering and
 * for controller/view unit tests that don't want to spin up an Apollo client.
 */
export const CATALOG_MOCK_GROUPS: CatalogGroup[] = [
  {
    brand: "Hermès",
    productLine: "Bolide",
    units: [
      {
        id: "11111111-1111-1111-1111-000000000001",
        brand: "Hermès",
        productLine: "Bolide",
        modelName: "Bolide 27",
      },
      {
        id: "11111111-1111-1111-1111-000000000002",
        brand: "Hermès",
        productLine: "Bolide",
        modelName: "Bolide 31",
      },
      {
        id: "11111111-1111-1111-1111-000000000003",
        brand: "Hermès",
        productLine: "Bolide",
        modelName: "Bolide 35",
      },
    ],
  },
  {
    brand: "Hermès",
    productLine: "Constance",
    units: [
      {
        id: "11111111-1111-1111-1111-000000000010",
        brand: "Hermès",
        productLine: "Constance",
        modelName: "Constance 18",
      },
      {
        id: "11111111-1111-1111-1111-000000000011",
        brand: "Hermès",
        productLine: "Constance",
        modelName: "Constance 24",
      },
    ],
  },
  {
    brand: "Hermès",
    productLine: "24/24",
    units: [
      {
        id: "11111111-1111-1111-1111-000000000020",
        brand: "Hermès",
        productLine: "24/24",
        modelName: "24/24 21",
      },
      {
        id: "11111111-1111-1111-1111-000000000021",
        brand: "Hermès",
        productLine: "24/24",
        modelName: "24/24 29",
      },
    ],
  },
  {
    brand: "Hermès",
    productLine: "Della Cavalleria",
    units: [
      {
        id: "11111111-1111-1111-1111-000000000030",
        brand: "Hermès",
        productLine: "Della Cavalleria",
        modelName: "Della Cavalleria Mini",
      },
    ],
  },
  {
    brand: "Hermès",
    productLine: "Evelyne",
    units: [
      {
        id: "11111111-1111-1111-1111-000000000040",
        brand: "Hermès",
        productLine: "Evelyne",
        modelName: "Evelyne 16",
      },
      {
        id: "11111111-1111-1111-1111-000000000041",
        brand: "Hermès",
        productLine: "Evelyne",
        modelName: "Evelyne 29",
      },
      {
        id: "11111111-1111-1111-1111-000000000042",
        brand: "Hermès",
        productLine: "Evelyne",
        modelName: "Evelyne 33",
      },
    ],
  },
  {
    brand: "Hermès",
    productLine: "Garden Party",
    units: [
      {
        id: "11111111-1111-1111-1111-000000000050",
        brand: "Hermès",
        productLine: "Garden Party",
        modelName: "Garden Party 30",
      },
      {
        id: "11111111-1111-1111-1111-000000000051",
        brand: "Hermès",
        productLine: "Garden Party",
        modelName: "Garden Party 36",
      },
    ],
  },
  {
    brand: "Hermès",
    productLine: "Halzan",
    units: [
      {
        id: "11111111-1111-1111-1111-000000000060",
        brand: "Hermès",
        productLine: "Halzan",
        modelName: "Halzan 25",
      },
      {
        id: "11111111-1111-1111-1111-000000000061",
        brand: "Hermès",
        productLine: "Halzan",
        modelName: "Halzan 31",
      },
    ],
  },
  {
    brand: "Hermès",
    productLine: "Herbag",
    units: [
      {
        id: "11111111-1111-1111-1111-000000000070",
        brand: "Hermès",
        productLine: "Herbag",
        modelName: "Herbag Zip 31",
      },
      {
        id: "11111111-1111-1111-1111-000000000071",
        brand: "Hermès",
        productLine: "Herbag",
        modelName: "Herbag Zip 39",
      },
    ],
  },
  {
    brand: "Hermès",
    productLine: "In-the-Loop",
    units: [
      {
        id: "11111111-1111-1111-1111-000000000080",
        brand: "Hermès",
        productLine: "In-the-Loop",
        modelName: "In-the-Loop 18",
      },
      {
        id: "11111111-1111-1111-1111-000000000081",
        brand: "Hermès",
        productLine: "In-the-Loop",
        modelName: "In-the-Loop 23",
      },
    ],
  },
  {
    brand: "Hermès",
    productLine: "Lindy",
    units: [
      {
        id: "11111111-1111-1111-1111-000000000090",
        brand: "Hermès",
        productLine: "Lindy",
        modelName: "Lindy 26",
      },
      {
        id: "11111111-1111-1111-1111-000000000091",
        brand: "Hermès",
        productLine: "Lindy",
        modelName: "Lindy 30",
      },
      {
        id: "11111111-1111-1111-1111-000000000092",
        brand: "Hermès",
        productLine: "Lindy",
        modelName: "Mini Lindy",
      },
    ],
  },
  {
    brand: "Hermès",
    productLine: "Picotin",
    units: [
      {
        id: "11111111-1111-1111-1111-0000000000a0",
        brand: "Hermès",
        productLine: "Picotin",
        modelName: "Picotin 18",
      },
      {
        id: "11111111-1111-1111-1111-0000000000a1",
        brand: "Hermès",
        productLine: "Picotin",
        modelName: "Picotin 22",
      },
      {
        id: "11111111-1111-1111-1111-0000000000a2",
        brand: "Hermès",
        productLine: "Picotin",
        modelName: "Picotin 26",
      },
    ],
  },
  {
    brand: "Hermès",
    productLine: "Roulis",
    units: [
      {
        id: "11111111-1111-1111-1111-0000000000b0",
        brand: "Hermès",
        productLine: "Roulis",
        modelName: "Roulis 18",
      },
      {
        id: "11111111-1111-1111-1111-0000000000b1",
        brand: "Hermès",
        productLine: "Roulis",
        modelName: "Roulis 23",
      },
    ],
  },
  {
    brand: "Cartier",
    productLine: "Tank Must",
    units: [
      {
        id: "22222222-2222-2222-2222-000000000001",
        brand: "Cartier",
        productLine: "Tank Must",
        modelName: "Tank Must Large Steel",
      },
      {
        id: "22222222-2222-2222-2222-000000000002",
        brand: "Cartier",
        productLine: "Tank Must",
        modelName: "Tank Must Small Steel",
      },
      {
        id: "22222222-2222-2222-2222-000000000003",
        brand: "Cartier",
        productLine: "Tank Must",
        modelName: "Tank Must Small Leather",
      },
      {
        id: "22222222-2222-2222-2222-000000000004",
        brand: "Cartier",
        productLine: "Tank Must",
        modelName: "Tank Must Large Leather",
      },
    ],
  },
];
