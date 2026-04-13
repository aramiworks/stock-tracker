/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from "@graphql-typed-document-node/core";
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
export type MakeEmpty<
  T extends { [key: string]: unknown },
  K extends keyof T,
> = { [_ in K]?: never };
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never;
    };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
};

export type Account = {
  __typename?: "Account";
  createdAt: Scalars["String"]["output"];
  id: Scalars["ID"]["output"];
  notes?: Maybe<Scalars["String"]["output"]>;
  purchases: Array<Purchase>;
  saName?: Maybe<Scalars["String"]["output"]>;
  storeName: Scalars["String"]["output"];
};

export enum AccountSortBy {
  CreatedAt = "created_at",
  StoreName = "store_name",
}

export type AmountRangeInput = {
  max?: InputMaybe<Scalars["Float"]["input"]>;
  min?: InputMaybe<Scalars["Float"]["input"]>;
};

export type CreateAccountInput = {
  notes?: InputMaybe<Scalars["String"]["input"]>;
  saName?: InputMaybe<Scalars["String"]["input"]>;
  storeName: Scalars["String"]["input"];
};

export type CreatePurchaseInput = {
  accountId: Scalars["ID"]["input"];
  amount: Scalars["Float"]["input"];
  currency?: InputMaybe<Scalars["String"]["input"]>;
  itemCategory?: InputMaybe<Scalars["String"]["input"]>;
  itemName: Scalars["String"]["input"];
  notes?: InputMaybe<Scalars["String"]["input"]>;
  purchaseDate: Scalars["String"]["input"];
  storeLocation?: InputMaybe<Scalars["String"]["input"]>;
};

export type DashboardSummary = {
  __typename?: "DashboardSummary";
  totalAccounts: Scalars["Int"]["output"];
  totalPurchases: Scalars["Int"]["output"];
  totalSpent: Scalars["Float"]["output"];
};

export type DateRangeInput = {
  from?: InputMaybe<Scalars["String"]["input"]>;
  to?: InputMaybe<Scalars["String"]["input"]>;
};

export type Mutation = {
  __typename?: "Mutation";
  createAccount: Account;
  createPurchase: Purchase;
  deleteAccount: Scalars["Boolean"]["output"];
  deletePurchase: Scalars["Boolean"]["output"];
  updateAccount: Account;
  updatePurchase: Purchase;
};

export type MutationCreateAccountArgs = {
  input: CreateAccountInput;
};

export type MutationCreatePurchaseArgs = {
  input: CreatePurchaseInput;
};

export type MutationDeleteAccountArgs = {
  id: Scalars["ID"]["input"];
};

export type MutationDeletePurchaseArgs = {
  id: Scalars["ID"]["input"];
};

export type MutationUpdateAccountArgs = {
  input: UpdateAccountInput;
};

export type MutationUpdatePurchaseArgs = {
  input: UpdatePurchaseInput;
};

export type Purchase = {
  __typename?: "Purchase";
  amount: Scalars["Float"]["output"];
  createdAt: Scalars["String"]["output"];
  currency: Scalars["String"]["output"];
  id: Scalars["ID"]["output"];
  itemCategory?: Maybe<Scalars["String"]["output"]>;
  itemName: Scalars["String"]["output"];
  notes?: Maybe<Scalars["String"]["output"]>;
  purchaseDate: Scalars["String"]["output"];
  storeLocation?: Maybe<Scalars["String"]["output"]>;
};

export type Query = {
  __typename?: "Query";
  /** Get a single account by ID */
  account?: Maybe<Account>;
  /** List all accounts for the current user */
  accounts: Array<Account>;
  /** Dashboard overview for the current user */
  dashboard: DashboardSummary;
  /** Current authenticated user */
  me?: Maybe<User>;
  /** Purchase history with optional filtering */
  purchases: Array<Purchase>;
};

export type QueryAccountArgs = {
  id: Scalars["ID"]["input"];
};

export type QueryAccountsArgs = {
  search?: InputMaybe<Scalars["String"]["input"]>;
  sortBy?: InputMaybe<AccountSortBy>;
  sortOrder?: InputMaybe<SortOrder>;
};

export type QueryPurchasesArgs = {
  accountId?: InputMaybe<Scalars["ID"]["input"]>;
  amountRange?: InputMaybe<AmountRangeInput>;
  dateRange?: InputMaybe<DateRangeInput>;
  itemCategory?: InputMaybe<Scalars["String"]["input"]>;
  search?: InputMaybe<Scalars["String"]["input"]>;
  sortOrder?: InputMaybe<SortOrder>;
};

export enum SortOrder {
  Asc = "asc",
  Desc = "desc",
}

export type UpdateAccountInput = {
  id: Scalars["ID"]["input"];
  notes?: InputMaybe<Scalars["String"]["input"]>;
  saName?: InputMaybe<Scalars["String"]["input"]>;
  storeName?: InputMaybe<Scalars["String"]["input"]>;
};

export type UpdatePurchaseInput = {
  amount?: InputMaybe<Scalars["Float"]["input"]>;
  currency?: InputMaybe<Scalars["String"]["input"]>;
  id: Scalars["ID"]["input"];
  itemCategory?: InputMaybe<Scalars["String"]["input"]>;
  itemName?: InputMaybe<Scalars["String"]["input"]>;
  notes?: InputMaybe<Scalars["String"]["input"]>;
  purchaseDate?: InputMaybe<Scalars["String"]["input"]>;
  storeLocation?: InputMaybe<Scalars["String"]["input"]>;
};

export type User = {
  __typename?: "User";
  createdAt: Scalars["String"]["output"];
  displayName?: Maybe<Scalars["String"]["output"]>;
  email: Scalars["String"]["output"];
  id: Scalars["ID"]["output"];
};

export type UpdateAccountMutationVariables = Exact<{
  input: UpdateAccountInput;
}>;

export type UpdateAccountMutation = {
  __typename?: "Mutation";
  updateAccount: {
    __typename?: "Account";
    id: string;
    storeName: string;
    saName?: string | null;
    notes?: string | null;
    createdAt: string;
  };
};

export type DeleteAccountMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
}>;

export type DeleteAccountMutation = {
  __typename?: "Mutation";
  deleteAccount: boolean;
};

export type CreatePurchaseMutationVariables = Exact<{
  input: CreatePurchaseInput;
}>;

export type CreatePurchaseMutation = {
  __typename?: "Mutation";
  createPurchase: {
    __typename?: "Purchase";
    id: string;
    itemName: string;
    itemCategory?: string | null;
    amount: number;
    currency: string;
    purchaseDate: string;
    storeLocation?: string | null;
    notes?: string | null;
    createdAt: string;
  };
};

export type UpdatePurchaseMutationVariables = Exact<{
  input: UpdatePurchaseInput;
}>;

export type UpdatePurchaseMutation = {
  __typename?: "Mutation";
  updatePurchase: {
    __typename?: "Purchase";
    id: string;
    itemName: string;
    itemCategory?: string | null;
    amount: number;
    currency: string;
    purchaseDate: string;
    storeLocation?: string | null;
    notes?: string | null;
    createdAt: string;
  };
};

export type DeletePurchaseMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
}>;

export type DeletePurchaseMutation = {
  __typename?: "Mutation";
  deletePurchase: boolean;
};

export type CreateAccountMutationVariables = Exact<{
  input: CreateAccountInput;
}>;

export type CreateAccountMutation = {
  __typename?: "Mutation";
  createAccount: {
    __typename?: "Account";
    id: string;
    storeName: string;
    saName?: string | null;
    notes?: string | null;
    createdAt: string;
  };
};

export type DashboardQueryVariables = Exact<{ [key: string]: never }>;

export type DashboardQuery = {
  __typename?: "Query";
  dashboard: {
    __typename?: "DashboardSummary";
    totalAccounts: number;
    totalPurchases: number;
    totalSpent: number;
  };
  accounts: Array<{
    __typename?: "Account";
    id: string;
    storeName: string;
    saName?: string | null;
    purchases: Array<{ __typename?: "Purchase"; id: string; amount: number }>;
  }>;
};

export type AccountsQueryVariables = Exact<{
  sortBy?: InputMaybe<AccountSortBy>;
  sortOrder?: InputMaybe<SortOrder>;
  search?: InputMaybe<Scalars["String"]["input"]>;
}>;

export type AccountsQuery = {
  __typename?: "Query";
  accounts: Array<{
    __typename?: "Account";
    id: string;
    storeName: string;
    saName?: string | null;
    notes?: string | null;
    createdAt: string;
    purchases: Array<{
      __typename?: "Purchase";
      id: string;
      itemName: string;
      amount: number;
      purchaseDate: string;
    }>;
  }>;
};

export type AccountQueryVariables = Exact<{
  id: Scalars["ID"]["input"];
}>;

export type AccountQuery = {
  __typename?: "Query";
  account?: {
    __typename?: "Account";
    id: string;
    storeName: string;
    saName?: string | null;
    notes?: string | null;
    createdAt: string;
    purchases: Array<{
      __typename?: "Purchase";
      id: string;
      itemName: string;
      itemCategory?: string | null;
      amount: number;
      currency: string;
      purchaseDate: string;
      storeLocation?: string | null;
      notes?: string | null;
      createdAt: string;
    }>;
  } | null;
};

export type PurchasesQueryVariables = Exact<{
  accountId?: InputMaybe<Scalars["ID"]["input"]>;
  sortOrder?: InputMaybe<SortOrder>;
  dateRange?: InputMaybe<DateRangeInput>;
  itemCategory?: InputMaybe<Scalars["String"]["input"]>;
  search?: InputMaybe<Scalars["String"]["input"]>;
}>;

export type PurchasesQuery = {
  __typename?: "Query";
  purchases: Array<{
    __typename?: "Purchase";
    id: string;
    itemName: string;
    itemCategory?: string | null;
    amount: number;
    currency: string;
    purchaseDate: string;
    storeLocation?: string | null;
    notes?: string | null;
    createdAt: string;
  }>;
};

export const UpdateAccountDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "UpdateAccount" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "input" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "UpdateAccountInput" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "updateAccount" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "input" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "storeName" } },
                { kind: "Field", name: { kind: "Name", value: "saName" } },
                { kind: "Field", name: { kind: "Name", value: "notes" } },
                { kind: "Field", name: { kind: "Name", value: "createdAt" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  UpdateAccountMutation,
  UpdateAccountMutationVariables
>;
export const DeleteAccountDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "DeleteAccount" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "deleteAccount" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "id" },
                },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  DeleteAccountMutation,
  DeleteAccountMutationVariables
>;
export const CreatePurchaseDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "CreatePurchase" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "input" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "CreatePurchaseInput" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "createPurchase" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "input" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "itemName" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "itemCategory" },
                },
                { kind: "Field", name: { kind: "Name", value: "amount" } },
                { kind: "Field", name: { kind: "Name", value: "currency" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "purchaseDate" },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "storeLocation" },
                },
                { kind: "Field", name: { kind: "Name", value: "notes" } },
                { kind: "Field", name: { kind: "Name", value: "createdAt" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  CreatePurchaseMutation,
  CreatePurchaseMutationVariables
>;
export const UpdatePurchaseDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "UpdatePurchase" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "input" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "UpdatePurchaseInput" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "updatePurchase" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "input" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "itemName" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "itemCategory" },
                },
                { kind: "Field", name: { kind: "Name", value: "amount" } },
                { kind: "Field", name: { kind: "Name", value: "currency" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "purchaseDate" },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "storeLocation" },
                },
                { kind: "Field", name: { kind: "Name", value: "notes" } },
                { kind: "Field", name: { kind: "Name", value: "createdAt" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  UpdatePurchaseMutation,
  UpdatePurchaseMutationVariables
>;
export const DeletePurchaseDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "DeletePurchase" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "deletePurchase" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "id" },
                },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  DeletePurchaseMutation,
  DeletePurchaseMutationVariables
>;
export const CreateAccountDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "CreateAccount" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "input" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "CreateAccountInput" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "createAccount" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "input" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "storeName" } },
                { kind: "Field", name: { kind: "Name", value: "saName" } },
                { kind: "Field", name: { kind: "Name", value: "notes" } },
                { kind: "Field", name: { kind: "Name", value: "createdAt" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  CreateAccountMutation,
  CreateAccountMutationVariables
>;
export const DashboardDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "Dashboard" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "dashboard" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "totalAccounts" },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "totalPurchases" },
                },
                { kind: "Field", name: { kind: "Name", value: "totalSpent" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "accounts" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "storeName" } },
                { kind: "Field", name: { kind: "Name", value: "saName" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "purchases" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "amount" },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<DashboardQuery, DashboardQueryVariables>;
export const AccountsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "Accounts" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "sortBy" },
          },
          type: {
            kind: "NamedType",
            name: { kind: "Name", value: "AccountSortBy" },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "sortOrder" },
          },
          type: {
            kind: "NamedType",
            name: { kind: "Name", value: "SortOrder" },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "search" },
          },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "accounts" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "sortBy" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "sortBy" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "sortOrder" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "sortOrder" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "search" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "search" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "storeName" } },
                { kind: "Field", name: { kind: "Name", value: "saName" } },
                { kind: "Field", name: { kind: "Name", value: "notes" } },
                { kind: "Field", name: { kind: "Name", value: "createdAt" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "purchases" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "itemName" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "amount" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "purchaseDate" },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<AccountsQuery, AccountsQueryVariables>;
export const AccountDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "Account" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "account" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "id" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "storeName" } },
                { kind: "Field", name: { kind: "Name", value: "saName" } },
                { kind: "Field", name: { kind: "Name", value: "notes" } },
                { kind: "Field", name: { kind: "Name", value: "createdAt" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "purchases" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "itemName" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "itemCategory" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "amount" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "currency" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "purchaseDate" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "storeLocation" },
                      },
                      { kind: "Field", name: { kind: "Name", value: "notes" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "createdAt" },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<AccountQuery, AccountQueryVariables>;
export const PurchasesDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "Purchases" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "accountId" },
          },
          type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "sortOrder" },
          },
          type: {
            kind: "NamedType",
            name: { kind: "Name", value: "SortOrder" },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "dateRange" },
          },
          type: {
            kind: "NamedType",
            name: { kind: "Name", value: "DateRangeInput" },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "itemCategory" },
          },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "search" },
          },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "purchases" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "accountId" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "accountId" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "sortOrder" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "sortOrder" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "dateRange" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "dateRange" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "itemCategory" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "itemCategory" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "search" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "search" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "itemName" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "itemCategory" },
                },
                { kind: "Field", name: { kind: "Name", value: "amount" } },
                { kind: "Field", name: { kind: "Name", value: "currency" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "purchaseDate" },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "storeLocation" },
                },
                { kind: "Field", name: { kind: "Name", value: "notes" } },
                { kind: "Field", name: { kind: "Name", value: "createdAt" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<PurchasesQuery, PurchasesQueryVariables>;
