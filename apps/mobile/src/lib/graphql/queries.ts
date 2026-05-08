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
