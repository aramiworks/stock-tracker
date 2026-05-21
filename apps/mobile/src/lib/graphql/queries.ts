import { gql } from "@apollo/client";
import { graphql } from "./generated/gql";

export const ME_QUERY = gql`
  query Me {
    me {
      id
      email
      createdAt
    }
  }
`;

export const DASHBOARD_QUERY = graphql(`
  query Dashboard {
    dashboard {
      totalAccounts
      totalPurchases
      totalSpent
    }
    accounts {
      id
      storeName
      saName
      purchases {
        id
        amount
      }
    }
  }
`);

export const ACCOUNTS_QUERY = graphql(`
  query Accounts(
    $sortBy: AccountSortBy
    $sortOrder: SortOrder
    $search: String
  ) {
    accounts(sortBy: $sortBy, sortOrder: $sortOrder, search: $search) {
      id
      storeName
      saName
      notes
      createdAt
      purchases {
        id
        itemName
        amount
        purchaseDate
      }
    }
  }
`);

export const ACCOUNT_QUERY = graphql(`
  query Account($id: ID!) {
    account(id: $id) {
      id
      storeName
      saName
      notes
      createdAt
      purchases {
        id
        itemName
        itemCategory
        amount
        currency
        purchaseDate
        storeLocation
        notes
        createdAt
      }
    }
  }
`);

/**
 * Anonymous-readable catalog grouped by (brand, productLine). Backed by the
 * tracker subgraph `Query.catalogList` (INF-1393), which proxies to tRPC
 * `catalog.list` in apps/services/tracker. No JWT required at the router.
 *
 * Uses raw `gql` (not `graphql(...)`) because the codegen pipeline has pre-existing
 * drift against the pivoted GraphQL schema (legacy account/purchase ops in
 * `*.graphql` SDL). Typed via a hand-written interface in the consumer.
 */
export const CATALOG_LIST_QUERY = gql`
  query CatalogList {
    catalogList {
      brand
      productLine
      units {
        id
        brand
        productLine
        modelName
      }
    }
  }
`;

/**
 * Watchlist list — protected query landed by INF-1415 on the tracker subgraph.
 * Returns groups keyed by (brand, productLine). Mirrors `CATALOG_LIST_QUERY`'s
 * use of raw `gql` rather than `graphql(...)` because the mobile codegen pipeline
 * has pre-existing drift against the pivoted GraphQL schema.
 */
export const WATCHLIST_LIST_QUERY = gql`
  query WatchlistList {
    watchlist {
      brand
      productLine
      entries {
        id
        watchableUnitId
        brand
        productLine
        modelName
        state
        lastRestockedAt
      }
    }
  }
`;

/**
 * Watchlist detail — protected query landed by INF-1415 on the tracker subgraph.
 * Returns the watchlist entry, every SKU under the watchable unit with its
 * latest in-stock signal, and recent drop events. Throws on the server when
 * the user does not have a unit-level watch on this watchable_unit_id.
 */
export const WATCHLIST_DETAIL_QUERY = gql`
  query WatchlistDetail($watchableUnitId: ID!) {
    watchlistDetail(watchableUnitId: $watchableUnitId) {
      entry {
        id
        watchableUnitId
        brand
        productLine
        modelName
        state
        lastRestockedAt
      }
      skus {
        id
        color
        leather
        hardware
        size
        referenceCode
        inStock
        lastChecked
      }
      dropEvents {
        id
        skuId
        sourceUrl
        detectedAt
      }
    }
  }
`;

/**
 * Alert history — protected query landed by INF-1479 on the tracker subgraph.
 * Returns a cursor-paginated page of past drop events ordered newest-first by
 * `detectedAt`. The server only emits `kind: "restocked"` today (the row UI
 * already handles a forward-compat `soldOut` variant per INF-1483). Mirrors
 * `WATCHLIST_LIST_QUERY`'s use of raw `gql` rather than `graphql(...)` because
 * the mobile codegen pipeline has pre-existing drift against the pivoted
 * GraphQL schema.
 */
export const ALERT_HISTORY_QUERY = gql`
  query AlertHistory($limit: Int, $cursor: String) {
    alertHistory(limit: $limit, cursor: $cursor) {
      events {
        id
        brand
        productLine
        modelName
        skuDescriptor
        kind
        detectedAt
      }
      nextCursor
    }
  }
`;

export const PURCHASES_QUERY = graphql(`
  query Purchases(
    $accountId: ID
    $sortOrder: SortOrder
    $dateRange: DateRangeInput
    $itemCategory: String
    $search: String
  ) {
    purchases(
      accountId: $accountId
      sortOrder: $sortOrder
      dateRange: $dateRange
      itemCategory: $itemCategory
      search: $search
    ) {
      id
      itemName
      itemCategory
      amount
      currency
      purchaseDate
      storeLocation
      notes
      createdAt
    }
  }
`);
