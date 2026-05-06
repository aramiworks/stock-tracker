export const PROJECT_NAME = "stock-tracker";

export interface ServiceDef {
  name: string;
  image: string;
  port: number;
  healthcheckPath?: string;
  startCommand?: string;
  envVars: string[];
}

export interface EnvironmentConfig {
  railwayEnvName: string;
  imageTag: string;
  nodeEnv: string;
  dopplerConfig: string;
}

export const ENVIRONMENTS: Record<string, EnvironmentConfig> = {
  develop: {
    railwayEnvName: "develop",
    imageTag: "develop",
    nodeEnv: "development",
    dopplerConfig: "develop",
  },
  stage: {
    railwayEnvName: "stage",
    imageTag: "stage",
    nodeEnv: "staging",
    dopplerConfig: "stage",
  },
  master: {
    railwayEnvName: "master",
    imageTag: "master",
    nodeEnv: "production",
    dopplerConfig: "master",
  },
};

export const SERVICES: ServiceDef[] = [
  {
    name: "auth-service",
    image: "ghcr.io/aramiworks/stock-tracker-auth-service",
    port: 4030,
    healthcheckPath: "/health",
    startCommand: "npm run start",
    envVars: [
      "DATABASE_URL",
      "SUPABASE_URL",
      "SUPABASE_ANON_KEY",
      "SUPABASE_SERVICE_ROLE_KEY",
    ],
  },
  {
    name: "tracker-service",
    image: "ghcr.io/aramiworks/stock-tracker-tracker-service",
    port: 4020,
    healthcheckPath: "/health",
    startCommand: "npm run start",
    envVars: [
      "DATABASE_URL",
      "SUPABASE_URL",
      "SUPABASE_ANON_KEY",
      "SUPABASE_SERVICE_ROLE_KEY",
    ],
  },
  {
    name: "subgraph-auth",
    image: "ghcr.io/aramiworks/stock-tracker-subgraph-auth",
    port: 4002,
    // No healthcheckPath — Apollo Server startStandaloneServer has no /health endpoint
    startCommand: "npm run start",
    envVars: ["TRPC_AUTH_SERVICE_URL"],
  },
  {
    name: "subgraph-tracker",
    image: "ghcr.io/aramiworks/stock-tracker-subgraph-tracker",
    port: 4001,
    // No healthcheckPath — Apollo Server startStandaloneServer has no /health endpoint
    startCommand: "npm run start",
    envVars: ["TRPC_TRACKER_SERVICE_URL"],
  },
  {
    name: "router",
    image: "ghcr.io/aramiworks/stock-tracker-router",
    port: 4002,
    // No healthcheckPath or startCommand — uses Dockerfile CMD (Apollo Router binary)
    envVars: [
      "SUPABASE_JWKS_URL",
      "ALLOWED_ORIGINS",
      "APOLLO_KEY",
      "APOLLO_GRAPH_REF",
    ],
  },
];
