import { execSync } from "node:child_process";
import {
  createClient,
  createServiceDomain,
  getOrCreateEnvironment,
  getOrCreateProject,
  getOrCreateService,
  updateServiceInstance,
  upsertVariable,
} from "./client.js";
import {
  ENVIRONMENTS,
  PROJECT_NAME,
  SERVICES,
  type EnvironmentConfig,
  type ServiceDef,
} from "./config.js";

const token = process.env["RAILWAY_API_TOKEN"];
if (!token) {
  console.error("RAILWAY_API_TOKEN is required");
  process.exit(1);
}

const ghcrPat = process.env["GHCR_PAT"];
const dopplerToken = process.env["DOPPLER_TOKEN"];

const envArg = process.argv[2];
if (!envArg || !ENVIRONMENTS[envArg]) {
  console.error(
    `Usage: tsx src/setup.ts <${Object.keys(ENVIRONMENTS).join("|")}>`,
  );
  process.exit(1);
}

const envConfig: EnvironmentConfig = ENVIRONMENTS[envArg]!;
const client = createClient(token);

function readDopplerSecrets(
  config: string,
  keys: string[],
): Record<string, string> {
  if (!dopplerToken) {
    console.log("  DOPPLER_TOKEN not set — skipping secret sync");
    return {};
  }

  const result: Record<string, string> = {};
  const missing: string[] = [];

  for (const key of keys) {
    try {
      const raw = execSync(
        `doppler secrets get ${key} --project ${PROJECT_NAME} --config ${config} --json`,
        {
          env: { ...process.env, DOPPLER_TOKEN: dopplerToken },
          stdio: ["pipe", "pipe", "pipe"],
        },
      ).toString();
      const parsed = JSON.parse(raw) as Record<string, { computed: string }>;
      if (parsed[key]) {
        result[key] = parsed[key].computed;
      }
    } catch {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    console.log(
      `  Warning: missing from Doppler ${config}: ${missing.join(", ")}`,
    );
  }

  return result;
}

async function setupService(
  projectId: string,
  environmentId: string,
  service: ServiceDef,
  config: EnvironmentConfig,
): Promise<void> {
  const imageWithTag = `${service.image}:${config.imageTag}`;
  const svc = await getOrCreateService(
    client,
    projectId,
    service.name,
    imageWithTag,
  );

  // Configure service instance (image source, credentials, start command)
  const baseConfig: Record<string, unknown> = {
    source: { image: imageWithTag },
    healthcheckPath: service.healthcheckPath ?? "",
  };

  // startCommand: set per service, or empty string to use Dockerfile CMD
  baseConfig.startCommand = service.startCommand ?? "";

  if (ghcrPat) {
    try {
      await updateServiceInstance(client, svc.id, environmentId, {
        ...baseConfig,
        registryCredentials: { username: "github", password: ghcrPat },
      });
      console.log(
        `  Configured ${service.name}: ${imageWithTag} (with GHCR creds)`,
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("Pro users")) {
        console.log(
          `  Registry credentials require Pro plan — retrying without`,
        );
        await updateServiceInstance(client, svc.id, environmentId, baseConfig);
        console.log(
          `  Configured ${service.name}: ${imageWithTag} (no creds — packages must be public)`,
        );
      } else {
        throw err;
      }
    }
  } else {
    await updateServiceInstance(client, svc.id, environmentId, baseConfig);
    console.log(`  Configured ${service.name}: ${imageWithTag}`);
  }

  // Set base environment variables
  const vars: Record<string, string> = {
    PORT: String(service.port),
    NODE_ENV: config.nodeEnv,
  };

  // Sync service-specific secrets from Doppler
  if (service.envVars.length > 0) {
    const secrets = readDopplerSecrets(config.dopplerConfig, service.envVars);
    Object.assign(vars, secrets);
  }

  for (const [name, value] of Object.entries(vars)) {
    await upsertVariable(client, projectId, environmentId, svc.id, name, value);
  }
  console.log(`  Set variables: ${Object.keys(vars).join(", ")}`);

  // Create Railway-generated domain for public access
  try {
    const domain = await createServiceDomain(
      client,
      svc.id,
      environmentId,
      service.port,
    );
    console.log(`  Domain: https://${domain}`);
  } catch {
    console.log(`  Domain already exists (skipping)`);
  }
}

async function main(): Promise<void> {
  console.log(`\nSetting up Railway: ${envArg}`);
  console.log("─".repeat(40));

  // 1. Get or create project
  console.log("\n1. Project");
  const project = await getOrCreateProject(client, PROJECT_NAME);

  // 2. Get or create environment
  console.log("\n2. Environment");
  const env = await getOrCreateEnvironment(
    client,
    project.id,
    envConfig.railwayEnvName,
  );

  // 3. Set up each service
  for (const service of SERVICES) {
    console.log(`\n3. Service: ${service.name}`);
    await setupService(project.id, env.id, service, envConfig);
  }

  console.log("\n─".repeat(40));
  console.log(`Done. Railway "${envArg}" environment is configured.`);
}

main().catch((err) => {
  console.error("Setup failed:", err);
  process.exit(1);
});
