import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { TrackerWatchlistDetailViews } from "./views";
import type {
  WatchlistDetailPayload,
  DetailDropEvent,
  DetailSku,
} from "./models/tracker-watchlist-detail.type";

/**
 * Container-level Storybook entry for the watchlist detail screen.
 *
 * Two canonical shapes:
 *   - HermesSingleSku   → single SKU + full history
 *   - CartierMultiSku   → 3 SKUs + history with both restock + sold-out events
 *
 * Both stamps the views composer directly with fixed payloads — bypasses the
 * live Apollo client so Chromatic captures stable snapshots.
 *
 * Figma:
 *   - HermesSingleSku   https://www.figma.com/design/MSJ05A0BXBDTO0powtUMg3?node-id=846-2
 *   - CartierMultiSku   https://www.figma.com/design/MSJ05A0BXBDTO0powtUMg3?node-id=846-57
 */
const HERMES_BOLIDE: WatchlistDetailPayload = {
  entry: {
    id: "wl-bolide-27",
    watchableUnitId: "11111111-1111-1111-1111-000000000001",
    brand: "Hermès",
    productLine: "Bolide",
    modelName: "Bolide 27",
    state: "in_stock",
    lastRestockedAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
  },
  skus: [
    {
      id: "sku-bolide-27-togo-gold",
      referenceCode: null,
      descriptor: "토고 · 골드 금장",
      state: "in_stock",
    },
  ],
  dropEvents: [
    {
      id: "drop-1",
      kind: "restocked",
      skuDescriptor: "토고 · 골드 금장",
      occurredAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    },
    {
      id: "drop-2",
      kind: "out_of_stock",
      skuDescriptor: "토고 · 골드 금장",
      occurredAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "drop-3",
      kind: "restocked",
      skuDescriptor: "토고 · 골드 금장",
      occurredAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ],
};

const CARTIER_TANK_SKUS: DetailSku[] = [
  {
    id: "sku-tm-large-steel-leather",
    referenceCode: "WSTA0042",
    descriptor: "스틸 케이스 · 브라운 가죽",
    state: "in_stock",
  },
  {
    id: "sku-tm-large-steel-black",
    referenceCode: "WSTA0043",
    descriptor: "스틸 케이스 · 블랙 가죽",
    state: "out_of_stock",
  },
  {
    id: "sku-tm-large-steel-bracelet",
    referenceCode: "WSTA0029",
    descriptor: "스틸 케이스 · 스틸 브레이슬릿",
    state: "in_stock",
  },
];

const CARTIER_TANK_DROPS: DetailDropEvent[] = [
  {
    id: "tank-drop-1",
    kind: "restocked",
    skuDescriptor: "스틸 케이스 · 브라운 가죽",
    occurredAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "tank-drop-2",
    kind: "out_of_stock",
    skuDescriptor: "스틸 케이스 · 블랙 가죽",
    occurredAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "tank-drop-3",
    kind: "restocked",
    skuDescriptor: "스틸 케이스 · 스틸 브레이슬릿",
    occurredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "tank-drop-4",
    kind: "out_of_stock",
    skuDescriptor: "스틸 케이스 · 브라운 가죽",
    occurredAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const CARTIER_TANK_MUST: WatchlistDetailPayload = {
  entry: {
    id: "wl-tank-must-large-steel",
    watchableUnitId: "22222222-2222-2222-2222-000000000001",
    brand: "Cartier",
    productLine: "Tank Must",
    modelName: "Tank Must Large Steel",
    state: "in_stock",
    lastRestockedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  skus: CARTIER_TANK_SKUS,
  dropEvents: CARTIER_TANK_DROPS,
};

const meta: Meta<typeof TrackerWatchlistDetailViews> = {
  title: "tracker/watchlist/detail",
  component: TrackerWatchlistDetailViews,
  parameters: { layout: "fullscreen" },
};

export default meta;
type Story = StoryObj<typeof TrackerWatchlistDetailViews>;

export const HermesSingleSku: Story = {
  args: { screenState: "default", payload: HERMES_BOLIDE },
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/MSJ05A0BXBDTO0powtUMg3?node-id=846-2",
    },
  },
};

export const CartierMultiSku: Story = {
  args: { screenState: "default", payload: CARTIER_TANK_MUST },
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/MSJ05A0BXBDTO0powtUMg3?node-id=846-57",
    },
  },
};
