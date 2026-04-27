import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { buildSubgraphSchema } from "@apollo/subgraph";
import { gql } from "graphql-tag";

export interface CapturedHeaders {
  "x-user-id"?: string;
  "x-user-role"?: string;
  "x-request-id"?: string;
  authorization?: string;
}

export interface MockSubgraphHandle {
  url: string;
  /** Headers seen on the most recent inbound HTTP request. */
  lastHeaders: CapturedHeaders;
  /** All header captures, in arrival order. */
  history: CapturedHeaders[];
  reset: () => void;
  close: () => Promise<void>;
}

const typeDefs = gql`
  extend schema
    @link(url: "https://specs.apollo.dev/federation/v2.5", import: ["@key"])

  type Query {
    """
    Returns the headers the subgraph saw on this request.
    Used to assert that the Apollo Router forwarded JWT-derived headers
    via the Rhai script (x-user-id, x-user-role) and propagated
    x-request-id / authorization per router.yaml.
    """
    testHeaders: TestHeaders!
    """
    A trivial scalar query for federation routing sanity.
    """
    testEcho(input: String!): String!
  }

  type TestHeaders {
    xUserId: String
    xUserRole: String
    xRequestId: String
    authorization: String
  }
`;

interface MockSubgraphContext {
  headers: CapturedHeaders;
}

const resolvers = {
  Query: {
    testHeaders: (
      _parent: unknown,
      _args: unknown,
      ctx: MockSubgraphContext,
    ) => ({
      xUserId: ctx.headers["x-user-id"] ?? null,
      xUserRole: ctx.headers["x-user-role"] ?? null,
      xRequestId: ctx.headers["x-request-id"] ?? null,
      authorization: ctx.headers["authorization"] ?? null,
    }),
    testEcho: (_parent: unknown, args: { input: string }) => args.input,
  },
};

/**
 * Starts a federated Apollo subgraph on the given port that captures the HTTP
 * headers it receives so tests can assert what the Apollo Router forwarded.
 *
 * The supergraph.yaml in apps/router/ pins the tracker subgraph to
 * http://localhost:4011, so callers should pass port=4011 to match the prod
 * routing URL when composing the supergraph against this mock.
 */
export async function startMockSubgraph(
  port: number,
): Promise<MockSubgraphHandle> {
  const history: CapturedHeaders[] = [];
  const handle: MockSubgraphHandle = {
    url: "",
    lastHeaders: {},
    history,
    reset: () => {
      history.length = 0;
      handle.lastHeaders = {};
    },
    close: async () => {},
  };

  const server = new ApolloServer<MockSubgraphContext>({
    schema: buildSubgraphSchema([{ typeDefs, resolvers }]),
  });

  const { url } = await startStandaloneServer(server, {
    listen: { host: "127.0.0.1", port },
    context: async ({ req }) => {
      const headers: CapturedHeaders = {
        "x-user-id": readHeader(req.headers["x-user-id"]),
        "x-user-role": readHeader(req.headers["x-user-role"]),
        "x-request-id": readHeader(req.headers["x-request-id"]),
        authorization: readHeader(req.headers["authorization"]),
      };
      handle.lastHeaders = headers;
      history.push(headers);
      return { headers };
    },
  });

  handle.url = url;
  handle.close = async () => {
    await server.stop();
  };

  return handle;
}

function readHeader(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}
