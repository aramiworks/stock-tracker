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
  production: {
    railwayEnvName: "production",
    imageTag: "latest",
    nodeEnv: "production",
    dopplerConfig: "master",
  },
};

export const SERVICES: ServiceDef[] = [
  {
    name: "api",
    image: "ghcr.io/aramiworks/stock-tracker-api",
    port: 4000,
    healthcheckPath: "/health",
    startCommand: "npm run start",
    envVars: ["DATABASE_URL"],
  },
  {
    name: "subgraph-tracker",
    image: "ghcr.io/aramiworks/stock-tracker-subgraph-tracker",
    port: 4001,
    // No healthcheckPath — Apollo Server startStandaloneServer has no /health endpoint
    startCommand: "npm run start",
    envVars: ["DATABASE_URL", "TRPC_SERVICE_URL"],
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
