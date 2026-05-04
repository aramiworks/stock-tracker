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

  type AlertFeed {
    items: [Alert!]!
    nextCursor: ID
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
    catalog(productLine: String, search: String, activeOnly: Boolean): [WatchableUnit!]!

    """
    Get a single catalog item by ID
    """
    catalogItem(id: ID!): WatchableUnit

    """
    List the current user's watches
    """
    watches: [Watch!]!

    """
    List alerts for the current user
    """
    alerts(unreadOnly: Boolean, cursor: ID, limit: Int): AlertFeed!

    """
    Count of unread alerts
    """
    unreadAlertCount: Int!
  }

  extend type Mutation {
    createWatch(input: CreateWatchInput!): Watch!
    updateWatch(input: UpdateWatchInput!): Watch!
    deleteWatch(id: ID!): Boolean!
    markAlertRead(id: ID!): Boolean!
  }
`;
