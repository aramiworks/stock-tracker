import type { MockedResponse } from "@apollo/client/testing";
import type { DocumentNode } from "graphql";
import {
  DASHBOARD_QUERY,
  ACCOUNTS_QUERY,
  ACCOUNT_QUERY,
  PURCHASES_QUERY,
} from "../../graphql/queries";

const MOCK_ACCOUNTS = [
  {
    id: "acc-1",
    storeName: "청담 부티크",
    saName: "김서연 SA",
    notes: null,
    createdAt: "2024-01-15T00:00:00Z",
    purchases: [
      {
        id: "pur-1",
        itemName: "트리니티 링",
        itemCategory: "ring",
        amount: 3200000,
        currency: "KRW",
        purchaseDate: "2024-03-15T00:00:00Z",
        storeLocation: "청담",
        notes: null,
        createdAt: "2024-03-15T00:00:00Z",
      },
      {
        id: "pur-2",
        itemName: "러브 브레이슬릿",
        itemCategory: "bracelet",
        amount: 5000000,
        currency: "KRW",
        purchaseDate: "2024-01-10T00:00:00Z",
        storeLocation: "청담",
        notes: null,
        createdAt: "2024-01-10T00:00:00Z",
      },
      {
        id: "pur-3",
        itemName: "저스트 앵 끌루 링",
        itemCategory: "ring",
        amount: 4200000,
        currency: "KRW",
        purchaseDate: "2023-12-20T00:00:00Z",
        storeLocation: "청담",
        notes: null,
        createdAt: "2023-12-20T00:00:00Z",
      },
    ],
  },
  {
    id: "acc-2",
    storeName: "신세계 부티크",
    saName: "박지민 SA",
    notes: null,
    createdAt: "2024-02-01T00:00:00Z",
    purchases: [
      {
        id: "pur-4",
        itemName: "팬터 드 까르띠에 목걸이",
        itemCategory: "necklace",
        amount: 8500000,
        currency: "KRW",
        purchaseDate: "2023-11-05T00:00:00Z",
        storeLocation: "신세계",
        notes: null,
        createdAt: "2023-11-05T00:00:00Z",
      },
    ],
  },
  {
    id: "acc-3",
    storeName: "갤러리아 부티크",
    saName: "이수진 SA",
    notes: null,
    createdAt: "2024-03-01T00:00:00Z",
    purchases: [
      {
        id: "pur-5",
        itemName: "저스트 앵 끌루 링",
        itemCategory: "ring",
        amount: 4200000,
        currency: "KRW",
        purchaseDate: "2024-02-14T00:00:00Z",
        storeLocation: "갤러리아",
        notes: null,
        createdAt: "2024-02-14T00:00:00Z",
      },
    ],
  },
];

const ALL_PURCHASES = MOCK_ACCOUNTS.flatMap((acc) =>
  acc.purchases.map((p) => ({ ...p })),
).sort(
  (a, b) =>
    new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime(),
);

export const trackerMocks: MockedResponse[] = [
  {
    request: { query: DASHBOARD_QUERY as unknown as DocumentNode },
    result: {
      data: {
        dashboard: {
          totalAccounts: MOCK_ACCOUNTS.length,
          totalPurchases: ALL_PURCHASES.length,
          totalSpent: ALL_PURCHASES.reduce((sum, p) => sum + p.amount, 0),
        },
        accounts: MOCK_ACCOUNTS.map((acc) => ({
          id: acc.id,
          storeName: acc.storeName,
          saName: acc.saName,
          purchases: acc.purchases.map((p) => ({
            id: p.id,
            amount: p.amount,
          })),
        })),
      },
    },
  },
  {
    request: {
      query: ACCOUNTS_QUERY as unknown as DocumentNode,
      variables: {
        sortBy: "created_at",
        sortOrder: "desc",
        search: undefined,
      },
    },
    result: {
      data: {
        accounts: MOCK_ACCOUNTS,
      },
    },
  },
  {
    request: {
      query: ACCOUNT_QUERY as unknown as DocumentNode,
      variables: { id: "acc-1" },
    },
    result: {
      data: {
        account: MOCK_ACCOUNTS[0],
      },
    },
  },
  {
    request: { query: PURCHASES_QUERY as unknown as DocumentNode },
    result: {
      data: {
        purchases: ALL_PURCHASES,
      },
    },
  },
  {
    request: { query: PURCHASES_QUERY, variables: { accountId: "acc-1" } },
    result: {
      data: {
        purchases: MOCK_ACCOUNTS[0]!.purchases,
      },
    },
  },
];
