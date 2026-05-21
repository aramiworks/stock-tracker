import { gql } from "graphql-tag";

export const trackerTypeDefs = gql`
  type WatchableUnit @key(fields: "id") {
    id: ID!
    brand: String!
    productLine: String!
    modelName: String!
    imageUrl: String
    active: Boolean!
    skus: [Sku!]!
  }

  type Sku @key(fields: "id") {
    id: ID!
    color: String!
    leather: String
    hardware: String
    size: String
    referenceCode: String
    imageUrl: String
    active: Boolean!
  }

  type Watch @key(fields: "id") {
    id: ID!
    watchableUnitId: ID!
    skuId: ID
    notifyPush: Boolean!
    notifyEmail: Boolean!
    active: Boolean!
    createdAt: String!
    watchableUnit: WatchableUnit!
    sku: Sku
  }

  type Alert {
    id: ID!
    watchId: ID!
    channel: String!
    sentAt: String
    readAt: String
    createdAt: String!
    dropEvent: DropEvent!
  }

  type DropEvent {
    id: ID!
    skuId: ID!
    sourceUrl: String
    detectedAt: String!
  }

  type DashboardSummary {
    activeWatches: Int!
    unreadAlerts: Int!
    recentDrops: Int!
  }

  type CatalogPage {
    items: [WatchableUnit!]!
    nextCursor: ID
  }

  """
  Minimal WatchableUnit shape returned by Query.catalogList — used for the
  Shengsho-style catalog browse UI which doesn't need SKUs or timestamps.
  """
  type CatalogListUnit {
    id: ID!
    brand: String!
    productLine: String!
    modelName: String!
  }

  """
  A group of catalog units sharing the same (brand, productLine).
  """
  type CatalogListGroup {
    brand: String!
    productLine: String!
    units: [CatalogListUnit!]!
  }

  type AlertFeed {
    items: [Alert!]!
    nextCursor: ID
  }

  """
  A single entry in the user's watchlist (one watchable_unit they're tracking).
  \`state\` is derived from per-SKU stock state; \`lastRestockedAt\` is the most
  recent drop_event across the unit's SKUs.
  """
  type WatchlistEntry {
    id: ID!
    watchableUnitId: ID!
    brand: String!
    productLine: String!
    modelName: String!
    imageUrl: String
    notifyPush: Boolean!
    notifyEmail: Boolean!
    createdAt: String!
    state: WatchlistState!
    lastRestockedAt: String
  }

  enum WatchlistState {
    in_stock
    out_of_stock
    unknown
  }

  """
  Group of watchlist entries sharing the same (brand, productLine).
  """
  type WatchlistGroup {
    brand: String!
    productLine: String!
    entries: [WatchlistEntry!]!
  }

  """
  Per-SKU view for the watchlist detail screen — includes the latest stock
  state when known so the UI can render per-variant availability.
  """
  type WatchlistDetailSku {
    id: ID!
    color: String!
    leather: String
    hardware: String
    size: String
    referenceCode: String
    imageUrl: String
    inStock: Boolean
    lastChecked: String
  }

  type WatchlistDetailDropEvent {
    id: ID!
    skuId: ID!
    sourceUrl: String
    detectedAt: String!
  }

  type WatchlistDetail {
    entry: WatchlistEntry!
    skus: [WatchlistDetailSku!]!
    dropEvents: [WatchlistDetailDropEvent!]!
  }

  type WatchlistRemoveResult {
    removed: Boolean!
  }

  """
  A single row in the user's alert history (INF-1479). One entry per past
  drop event that matches the user's watchlist. \`kind\` is one of
  "restocked" | "soldOut" — today the backend only emits "restocked"
  because \`drop_events\` has no kind discriminator; soldOut will land
  once we have a sold-out event source.
  """
  type AlertHistoryEvent {
    id: ID!
    brand: String!
    productLine: String!
    modelName: String!
    skuDescriptor: String
    kind: String!
    detectedAt: String!
  }

  """
  Cursor-paginated page of alert history events ordered by \`detectedAt\`
  DESC. \`nextCursor\` is the ISO timestamp of the last visible event, or
  null on the final page.
  """
  type AlertHistoryPage {
    events: [AlertHistoryEvent!]!
    nextCursor: String
  }

  input CreateWatchInput {
    watchableUnitId: ID!
    skuId: ID
    notifyPush: Boolean
    notifyEmail: Boolean
  }

  input UpdateWatchInput {
    id: ID!
    notifyPush: Boolean
    notifyEmail: Boolean
    active: Boolean
  }

  extend type Query {
    """
    Dashboard overview for the current user
    """
    dashboard: DashboardSummary!

    """
    Browse the product catalog
    """
    catalog(
      brand: String
      productLine: String
      search: String
      activeOnly: Boolean
      cursor: ID
      limit: Int
    ): CatalogPage!

    """
    Get a single catalog item by ID
    """
    catalogItem(id: ID!): WatchableUnit

    """
    Anonymous-readable catalog grouped by (brand, productLine). Used by the
    Shengsho-style catalog browse UI so users can browse before signing in.
    """
    catalogList: [CatalogListGroup!]!

    """
    List the current user's watches
    """
    watches: [Watch!]!

    """
    The current user's watchlist grouped by (brand, productLine). Each entry
    includes a derived stock \`state\` and the latest \`lastRestockedAt\`.
    """
    watchlist: [WatchlistGroup!]!

    """
    Detail view for a single watchlist entry — entry + per-SKU stock state +
    recent drop events for the unit. Throws if the user does not have a
    unit-level watch on this watchable_unit_id.
    """
    watchlistDetail(watchableUnitId: ID!): WatchlistDetail!

    """
    List alerts for the current user
    """
    alerts(unreadOnly: Boolean, cursor: ID, limit: Int): AlertFeed!

    """
    Count of unread alerts
    """
    unreadAlertCount: Int!

    """
    Paginated past drop events for the current user's watchlist, ordered
    most-recent first. Cursor is the ISO timestamp of the last visible
    event from the previous page.
    """
    alertHistory(limit: Int = 20, cursor: String): AlertHistoryPage!
  }

  extend type Mutation {
    createWatch(input: CreateWatchInput!): Watch!
    updateWatch(input: UpdateWatchInput!): Watch!
    deleteWatch(id: ID!): Boolean!
    markAlertRead(id: ID!): Boolean!

    """
    Add a watchable_unit to the current user's watchlist. Idempotent: re-adding
    an existing entry is a no-op (returns the existing entry).
    """
    watchlistAdd(watchableUnitId: ID!): WatchlistEntry!

    """
    Remove a watchable_unit from the current user's watchlist. Idempotent:
    returns { removed: false } if no entry existed.
    """
    watchlistRemove(watchableUnitId: ID!): WatchlistRemoveResult!
  }
`;
