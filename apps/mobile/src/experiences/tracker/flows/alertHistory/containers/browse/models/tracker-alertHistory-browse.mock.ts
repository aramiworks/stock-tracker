import type { AlertHistoryEvent } from "./tracker-alertHistory-browse.type";

/**
 * Storybook + offline fixture for the Shengsho-style alert-history browse list.
 *
 * The controller resolves against the live `alertHistory` GraphQL query landed
 * by INF-1479 (see `tracker-alertHistory-browse.controllers.tsx`). This fixture
 * is retained for Storybook stories + view-layer unit tests that don't want to
 * spin up an Apollo client. IDs are deterministic UUID-shaped strings so React
 * keys remain stable across hot reloads and snapshot diffs.
 *
 * Includes both event kinds (`restocked` + `soldOut`) per the design hand-off
 * (Figma 623:1129) so the row's left-indicator-bar variant is exercised even
 * though the server only emits `restocked` until INF-1483 lands the soldOut
 * event source.
 */
export const ALERT_HISTORY_MOCK: AlertHistoryEvent[] = [
  {
    id: "ah-bolide-27-restock-1",
    brand: "Hermès",
    productLine: "Bolide",
    modelName: "Bolide 27",
    skuDescriptor: "Noir · Togo · Gold",
    kind: "restocked",
    detectedAt: "2026-05-19T09:14:00.000Z",
  },
  {
    id: "ah-bolide-31-soldout-1",
    brand: "Hermès",
    productLine: "Bolide",
    modelName: "Bolide 31",
    skuDescriptor: "Étoupe · Clemence · Palladium",
    kind: "soldOut",
    detectedAt: "2026-05-18T22:03:00.000Z",
  },
  {
    id: "ah-constance-18-restock-1",
    brand: "Hermès",
    productLine: "Constance",
    modelName: "Constance 18",
    skuDescriptor: null,
    kind: "restocked",
    detectedAt: "2026-05-17T11:42:00.000Z",
  },
  {
    id: "ah-tank-must-large-soldout-1",
    brand: "Cartier",
    productLine: "Tank Must",
    modelName: "Tank Must Large Steel",
    skuDescriptor: "Steel · Black Strap",
    kind: "soldOut",
    detectedAt: "2026-05-15T08:19:00.000Z",
  },
  {
    id: "ah-tank-must-large-restock-1",
    brand: "Cartier",
    productLine: "Tank Must",
    modelName: "Tank Must Large Steel",
    skuDescriptor: "Steel · Black Strap",
    kind: "restocked",
    detectedAt: "2026-05-12T14:30:00.000Z",
  },
];
