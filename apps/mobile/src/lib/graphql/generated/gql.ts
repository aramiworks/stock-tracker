/* eslint-disable */
import * as types from "./graphql";
import { TypedDocumentNode as DocumentNode } from "@graphql-typed-document-node/core";

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
  "mutation UpdateAccount($input: UpdateAccountInput!) {\n  updateAccount(input: $input) {\n    id\n    storeName\n    saName\n    notes\n    createdAt\n  }\n}\n\nmutation DeleteAccount($id: ID!) {\n  deleteAccount(id: $id)\n}\n\nmutation CreatePurchase($input: CreatePurchaseInput!) {\n  createPurchase(input: $input) {\n    id\n    itemName\n    itemCategory\n    amount\n    currency\n    purchaseDate\n    storeLocation\n    notes\n    createdAt\n  }\n}\n\nmutation UpdatePurchase($input: UpdatePurchaseInput!) {\n  updatePurchase(input: $input) {\n    id\n    itemName\n    itemCategory\n    amount\n    currency\n    purchaseDate\n    storeLocation\n    notes\n    createdAt\n  }\n}\n\nmutation DeletePurchase($id: ID!) {\n  deletePurchase(id: $id)\n}": typeof types.UpdateAccountDocument;
  "mutation CreateAccount($input: CreateAccountInput!) {\n  createAccount(input: $input) {\n    id\n    storeName\n    saName\n    notes\n    createdAt\n  }\n}\n\nmutation DeleteAccount($id: ID!) {\n  deleteAccount(id: $id)\n}": typeof types.CreateAccountDocument;
  "mutation CreateAccount($input: CreateAccountInput!) {\n  createAccount(input: $input) {\n    id\n    storeName\n    saName\n    notes\n    createdAt\n  }\n}": typeof types.CreateAccountDocument;
  "mutation DeletePurchase($id: ID!) {\n  deletePurchase(id: $id)\n}": typeof types.DeletePurchaseDocument;
  "\n  query Dashboard {\n    dashboard {\n      totalAccounts\n      totalPurchases\n      totalSpent\n    }\n    accounts {\n      id\n      storeName\n      saName\n      purchases {\n        id\n        amount\n      }\n    }\n  }\n": typeof types.DashboardDocument;
  "\n  query Accounts(\n    $sortBy: AccountSortBy\n    $sortOrder: SortOrder\n    $search: String\n  ) {\n    accounts(sortBy: $sortBy, sortOrder: $sortOrder, search: $search) {\n      id\n      storeName\n      saName\n      notes\n      createdAt\n      purchases {\n        id\n        itemName\n        amount\n        purchaseDate\n      }\n    }\n  }\n": typeof types.AccountsDocument;
  "\n  query Account($id: ID!) {\n    account(id: $id) {\n      id\n      storeName\n      saName\n      notes\n      createdAt\n      purchases {\n        id\n        itemName\n        itemCategory\n        amount\n        currency\n        purchaseDate\n        storeLocation\n        notes\n        createdAt\n      }\n    }\n  }\n": typeof types.AccountDocument;
  "\n  query Purchases(\n    $accountId: ID\n    $sortOrder: SortOrder\n    $dateRange: DateRangeInput\n    $itemCategory: String\n    $search: String\n  ) {\n    purchases(\n      accountId: $accountId\n      sortOrder: $sortOrder\n      dateRange: $dateRange\n      itemCategory: $itemCategory\n      search: $search\n    ) {\n      id\n      itemName\n      itemCategory\n      amount\n      currency\n      purchaseDate\n      storeLocation\n      notes\n      createdAt\n    }\n  }\n": typeof types.PurchasesDocument;
};
const documents: Documents = {
  "mutation UpdateAccount($input: UpdateAccountInput!) {\n  updateAccount(input: $input) {\n    id\n    storeName\n    saName\n    notes\n    createdAt\n  }\n}\n\nmutation DeleteAccount($id: ID!) {\n  deleteAccount(id: $id)\n}\n\nmutation CreatePurchase($input: CreatePurchaseInput!) {\n  createPurchase(input: $input) {\n    id\n    itemName\n    itemCategory\n    amount\n    currency\n    purchaseDate\n    storeLocation\n    notes\n    createdAt\n  }\n}\n\nmutation UpdatePurchase($input: UpdatePurchaseInput!) {\n  updatePurchase(input: $input) {\n    id\n    itemName\n    itemCategory\n    amount\n    currency\n    purchaseDate\n    storeLocation\n    notes\n    createdAt\n  }\n}\n\nmutation DeletePurchase($id: ID!) {\n  deletePurchase(id: $id)\n}":
    types.UpdateAccountDocument,
  "mutation CreateAccount($input: CreateAccountInput!) {\n  createAccount(input: $input) {\n    id\n    storeName\n    saName\n    notes\n    createdAt\n  }\n}\n\nmutation DeleteAccount($id: ID!) {\n  deleteAccount(id: $id)\n}":
    types.CreateAccountDocument,
  "mutation CreateAccount($input: CreateAccountInput!) {\n  createAccount(input: $input) {\n    id\n    storeName\n    saName\n    notes\n    createdAt\n  }\n}":
    types.CreateAccountDocument,
  "mutation DeletePurchase($id: ID!) {\n  deletePurchase(id: $id)\n}":
    types.DeletePurchaseDocument,
  "\n  query Dashboard {\n    dashboard {\n      totalAccounts\n      totalPurchases\n      totalSpent\n    }\n    accounts {\n      id\n      storeName\n      saName\n      purchases {\n        id\n        amount\n      }\n    }\n  }\n":
    types.DashboardDocument,
  "\n  query Accounts(\n    $sortBy: AccountSortBy\n    $sortOrder: SortOrder\n    $search: String\n  ) {\n    accounts(sortBy: $sortBy, sortOrder: $sortOrder, search: $search) {\n      id\n      storeName\n      saName\n      notes\n      createdAt\n      purchases {\n        id\n        itemName\n        amount\n        purchaseDate\n      }\n    }\n  }\n":
    types.AccountsDocument,
  "\n  query Account($id: ID!) {\n    account(id: $id) {\n      id\n      storeName\n      saName\n      notes\n      createdAt\n      purchases {\n        id\n        itemName\n        itemCategory\n        amount\n        currency\n        purchaseDate\n        storeLocation\n        notes\n        createdAt\n      }\n    }\n  }\n":
    types.AccountDocument,
  "\n  query Purchases(\n    $accountId: ID\n    $sortOrder: SortOrder\n    $dateRange: DateRangeInput\n    $itemCategory: String\n    $search: String\n  ) {\n    purchases(\n      accountId: $accountId\n      sortOrder: $sortOrder\n      dateRange: $dateRange\n      itemCategory: $itemCategory\n      search: $search\n    ) {\n      id\n      itemName\n      itemCategory\n      amount\n      currency\n      purchaseDate\n      storeLocation\n      notes\n      createdAt\n    }\n  }\n":
    types.PurchasesDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "mutation UpdateAccount($input: UpdateAccountInput!) {\n  updateAccount(input: $input) {\n    id\n    storeName\n    saName\n    notes\n    createdAt\n  }\n}\n\nmutation DeleteAccount($id: ID!) {\n  deleteAccount(id: $id)\n}\n\nmutation CreatePurchase($input: CreatePurchaseInput!) {\n  createPurchase(input: $input) {\n    id\n    itemName\n    itemCategory\n    amount\n    currency\n    purchaseDate\n    storeLocation\n    notes\n    createdAt\n  }\n}\n\nmutation UpdatePurchase($input: UpdatePurchaseInput!) {\n  updatePurchase(input: $input) {\n    id\n    itemName\n    itemCategory\n    amount\n    currency\n    purchaseDate\n    storeLocation\n    notes\n    createdAt\n  }\n}\n\nmutation DeletePurchase($id: ID!) {\n  deletePurchase(id: $id)\n}",
): (typeof documents)["mutation UpdateAccount($input: UpdateAccountInput!) {\n  updateAccount(input: $input) {\n    id\n    storeName\n    saName\n    notes\n    createdAt\n  }\n}\n\nmutation DeleteAccount($id: ID!) {\n  deleteAccount(id: $id)\n}\n\nmutation CreatePurchase($input: CreatePurchaseInput!) {\n  createPurchase(input: $input) {\n    id\n    itemName\n    itemCategory\n    amount\n    currency\n    purchaseDate\n    storeLocation\n    notes\n    createdAt\n  }\n}\n\nmutation UpdatePurchase($input: UpdatePurchaseInput!) {\n  updatePurchase(input: $input) {\n    id\n    itemName\n    itemCategory\n    amount\n    currency\n    purchaseDate\n    storeLocation\n    notes\n    createdAt\n  }\n}\n\nmutation DeletePurchase($id: ID!) {\n  deletePurchase(id: $id)\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "mutation CreateAccount($input: CreateAccountInput!) {\n  createAccount(input: $input) {\n    id\n    storeName\n    saName\n    notes\n    createdAt\n  }\n}\n\nmutation DeleteAccount($id: ID!) {\n  deleteAccount(id: $id)\n}",
): (typeof documents)["mutation CreateAccount($input: CreateAccountInput!) {\n  createAccount(input: $input) {\n    id\n    storeName\n    saName\n    notes\n    createdAt\n  }\n}\n\nmutation DeleteAccount($id: ID!) {\n  deleteAccount(id: $id)\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "mutation CreateAccount($input: CreateAccountInput!) {\n  createAccount(input: $input) {\n    id\n    storeName\n    saName\n    notes\n    createdAt\n  }\n}",
): (typeof documents)["mutation CreateAccount($input: CreateAccountInput!) {\n  createAccount(input: $input) {\n    id\n    storeName\n    saName\n    notes\n    createdAt\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "mutation DeletePurchase($id: ID!) {\n  deletePurchase(id: $id)\n}",
): (typeof documents)["mutation DeletePurchase($id: ID!) {\n  deletePurchase(id: $id)\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "\n  query Dashboard {\n    dashboard {\n      totalAccounts\n      totalPurchases\n      totalSpent\n    }\n    accounts {\n      id\n      storeName\n      saName\n      purchases {\n        id\n        amount\n      }\n    }\n  }\n",
): (typeof documents)["\n  query Dashboard {\n    dashboard {\n      totalAccounts\n      totalPurchases\n      totalSpent\n    }\n    accounts {\n      id\n      storeName\n      saName\n      purchases {\n        id\n        amount\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "\n  query Accounts(\n    $sortBy: AccountSortBy\n    $sortOrder: SortOrder\n    $search: String\n  ) {\n    accounts(sortBy: $sortBy, sortOrder: $sortOrder, search: $search) {\n      id\n      storeName\n      saName\n      notes\n      createdAt\n      purchases {\n        id\n        itemName\n        amount\n        purchaseDate\n      }\n    }\n  }\n",
): (typeof documents)["\n  query Accounts(\n    $sortBy: AccountSortBy\n    $sortOrder: SortOrder\n    $search: String\n  ) {\n    accounts(sortBy: $sortBy, sortOrder: $sortOrder, search: $search) {\n      id\n      storeName\n      saName\n      notes\n      createdAt\n      purchases {\n        id\n        itemName\n        amount\n        purchaseDate\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "\n  query Account($id: ID!) {\n    account(id: $id) {\n      id\n      storeName\n      saName\n      notes\n      createdAt\n      purchases {\n        id\n        itemName\n        itemCategory\n        amount\n        currency\n        purchaseDate\n        storeLocation\n        notes\n        createdAt\n      }\n    }\n  }\n",
): (typeof documents)["\n  query Account($id: ID!) {\n    account(id: $id) {\n      id\n      storeName\n      saName\n      notes\n      createdAt\n      purchases {\n        id\n        itemName\n        itemCategory\n        amount\n        currency\n        purchaseDate\n        storeLocation\n        notes\n        createdAt\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "\n  query Purchases(\n    $accountId: ID\n    $sortOrder: SortOrder\n    $dateRange: DateRangeInput\n    $itemCategory: String\n    $search: String\n  ) {\n    purchases(\n      accountId: $accountId\n      sortOrder: $sortOrder\n      dateRange: $dateRange\n      itemCategory: $itemCategory\n      search: $search\n    ) {\n      id\n      itemName\n      itemCategory\n      amount\n      currency\n      purchaseDate\n      storeLocation\n      notes\n      createdAt\n    }\n  }\n",
): (typeof documents)["\n  query Purchases(\n    $accountId: ID\n    $sortOrder: SortOrder\n    $dateRange: DateRangeInput\n    $itemCategory: String\n    $search: String\n  ) {\n    purchases(\n      accountId: $accountId\n      sortOrder: $sortOrder\n      dateRange: $dateRange\n      itemCategory: $itemCategory\n      search: $search\n    ) {\n      id\n      itemName\n      itemCategory\n      amount\n      currency\n      purchaseDate\n      storeLocation\n      notes\n      createdAt\n    }\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> =
  TDocumentNode extends DocumentNode<infer TType, any> ? TType : never;
