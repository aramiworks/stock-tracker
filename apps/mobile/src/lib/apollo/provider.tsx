import { memo, type ReactNode } from "react";
import { ApolloProvider } from "@apollo/client/react";
import { MockedProvider } from "@apollo/client/testing/react";
import { createApolloClient } from "./client";
import { trackerMocks } from "./mocks";

const USE_MOCKS = !process.env.EXPO_PUBLIC_GRAPHQL_URL;

export const apolloClient = createApolloClient();

type AppApolloProviderProps = {
  children: ReactNode;
};

export const AppApolloProvider = memo(
  ({ children }: AppApolloProviderProps) => {
    if (USE_MOCKS) {
      return <MockedProvider mocks={trackerMocks}>{children}</MockedProvider>;
    }

    return <ApolloProvider client={apolloClient}>{children}</ApolloProvider>;
  },
);

AppApolloProvider.displayName = "AppApolloProvider";
