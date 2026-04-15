import { Platform } from "react-native";
import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { supabase } from "../supabase";

const rawUrl = process.env.EXPO_PUBLIC_GRAPHQL_URL || "http://localhost:4002";
// Android emulator routes localhost to the host machine via 10.0.2.2
const ROUTER_URL =
  Platform.OS === "android" && __DEV__
    ? rawUrl.replace("localhost", "10.0.2.2")
    : rawUrl;

const httpLink = new HttpLink({ uri: ROUTER_URL });

const authLink = setContext(async (_, { headers }) => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return {
    headers: {
      ...headers,
      ...(session?.access_token && {
        authorization: `Bearer ${session.access_token}`,
      }),
    },
  };
});

export function createApolloClient() {
  return new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache(),
    defaultOptions: {
      watchQuery: {
        fetchPolicy: "cache-and-network",
      },
    },
  });
}
