/**
 * Triggers a fresh Railway deploy for all services in a given environment.
 * Called from CI after Docker image push.
 *
 * Uses serviceInstanceDeploy (not deploymentRedeploy) to pick up the latest
 * service instance config instead of replaying old deployment snapshots.
 *
 * Usage: RAILWAY_API_TOKEN=xxx tsx src/redeploy.ts <develop|stage|production>
 */
import { gql } from "graphql-request";
import {
  createClient,
  listEnvironments,
  listProjects,
  listServices,
} from "./client.js";
import { ENVIRONMENTS, PROJECT_NAME, SERVICES } from "./config.js";

const token = process.env["RAILWAY_API_TOKEN"];
if (!token) {
  console.error("RAILWAY_API_TOKEN is required");
  process.exit(1);
}

const envArg = process.argv[2];
if (!envArg || !ENVIRONMENTS[envArg]) {
  console.error(
    `Usage: tsx src/redeploy.ts <${Object.keys(ENVIRONMENTS).join("|")}>`,
  );
  process.exit(1);
}

const envConfig = ENVIRONMENTS[envArg]!;
const client = createClient(token);

async function main(): Promise<void> {
  console.log(`Triggering deploy for: ${envArg}`);

  // Resolve project
  const projects = await listProjects(client);
  const project = projects.find((p) => p.name === PROJECT_NAME);
  if (!project) throw new Error(`Project "${PROJECT_NAME}" not found`);

  // Resolve environment
  const envs = await listEnvironments(client, project.id);
  const env = envs.find((e) => e.name === envConfig.railwayEnvName);
  if (!env)
    throw new Error(`Environment "${envConfig.railwayEnvName}" not found`);

  // Resolve services and deploy
  const services = await listServices(client, project.id);
  const serviceNames = SERVICES.map((s) => s.name);

  for (const svc of services) {
    if (!serviceNames.includes(svc.name)) continue;

    await client.request(
      gql`
        mutation serviceInstanceDeploy(
          $serviceId: String!
          $environmentId: String!
        ) {
          serviceInstanceDeploy(
            serviceId: $serviceId
            environmentId: $environmentId
          )
        }
      `,
      { serviceId: svc.id, environmentId: env.id },
    );
    console.log(`  ${svc.name}: deployed`);
  }

  console.log("Done.");
}

main().catch((err) => {
  console.error("Deploy failed:", err);
  process.exit(1);
});
