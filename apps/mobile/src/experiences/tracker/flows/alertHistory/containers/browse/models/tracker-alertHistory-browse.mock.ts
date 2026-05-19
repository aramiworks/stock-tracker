import type { AlertHistoryEvent } from "./tracker-alertHistory-browse.type";

/**
 * Storybook + offline fixture for the Shengsho-style alert-history browse list.
 *
 * Until INF-1479 lands the protected `alertHistory` GraphQL query, the
 * controller resolves directly against this mock. The fixture is retained for
 * Storybook stories + view-layer unit tests once the backend wires up. IDs are
 * deterministic UUID-shaped strings so React keys remain stable across hot
 * reloads and snapshot diffs.
 *
 * Includes both event kinds (`restocked` + `soldOut`) per the design hand-off
 * (Figma 623:1129) so the row's left-indicator-bar variant is exercised.
 */
export const ALERT_HISTORY_MOCK: AlertHistoryEvent[] = [
  {
    id: "ah-bolide-27-restock-1",
    watchableUnitId: "11111111-1111-1111-1111-000000000001",
    brand: "Hermès",
    productLine: "Bolide",
    modelName: "Bolide 27",
    kind: "restocked",
    detectedAt: "2026-05-19T09:14:00.000Z",
  },
  {
    id: "ah-bolide-31-soldout-1",
    watchableUnitId: "11111111-1111-1111-1111-000000000002",
    brand: "Hermès",
    productLine: "Bolide",
    modelName: "Bolide 31",
    kind: "soldOut",
    detectedAt: "2026-05-18T22:03:00.000Z",
  },
  {
    id: "ah-constance-18-restock-1",
    watchableUnitId: "11111111-1111-1111-1111-000000000010",
    brand: "Hermès",
    productLine: "Constance",
    modelName: "Constance 18",
    kind: "restocked",
    detectedAt: "2026-05-17T11:42:00.000Z",
  },
  {
    id: "ah-tank-must-large-soldout-1",
    watchableUnitId: "22222222-2222-2222-2222-000000000001",
    brand: "Cartier",
    productLine: "Tank Must",
    modelName: "Tank Must Large Steel",
    kind: "soldOut",
    detectedAt: "2026-05-15T08:19:00.000Z",
  },
  {
    id: "ah-tank-must-large-restock-1",
    watchableUnitId: "22222222-2222-2222-2222-000000000001",
    brand: "Cartier",
    productLine: "Tank Must",
    modelName: "Tank Must Large Steel",
    kind: "restocked",
    detectedAt: "2026-05-12T14:30:00.000Z",
  },
];
