import { GraphQLClient, gql } from "graphql-request";

const RAILWAY_API = "https://backboard.railway.com/graphql/v2";

export function createClient(token: string): GraphQLClient {
  return new GraphQLClient(RAILWAY_API, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

// --- Projects ---

interface ProjectNode {
  id: string;
  name: string;
}

export async function listProjects(
  client: GraphQLClient,
): Promise<ProjectNode[]> {
  const data = await client.request<{
    projects: { edges: { node: ProjectNode }[] };
  }>(gql`
    query {
      projects {
        edges {
          node {
            id
            name
          }
        }
      }
    }
  `);
  return data.projects.edges.map((e) => e.node);
}

export async function createProject(
  client: GraphQLClient,
  name: string,
  defaultEnvironmentName = "production",
): Promise<ProjectNode> {
  const data = await client.request<{ projectCreate: ProjectNode }>(
    gql`
      mutation projectCreate($input: ProjectCreateInput!) {
        projectCreate(input: $input) {
          id
          name
        }
      }
    `,
    { input: { name, defaultEnvironmentName } },
  );
  return data.projectCreate;
}

export async function getOrCreateProject(
  client: GraphQLClient,
  name: string,
): Promise<ProjectNode> {
  const projects = await listProjects(client);
  const existing = projects.find((p) => p.name === name);
  if (existing) {
    console.log(`  Project "${name}" exists (${existing.id})`);
    return existing;
  }
  const created = await createProject(client, name);
  console.log(`  Project "${name}" created (${created.id})`);
  return created;
}

// --- Environments ---

interface EnvironmentNode {
  id: string;
  name: string;
}

export async function listEnvironments(
  client: GraphQLClient,
  projectId: string,
): Promise<EnvironmentNode[]> {
  const data = await client.request<{
    environments: { edges: { node: EnvironmentNode }[] };
  }>(
    gql`
      query environments($projectId: String!) {
        environments(projectId: $projectId) {
          edges {
            node {
              id
              name
            }
          }
        }
      }
    `,
    { projectId },
  );
  return data.environments.edges.map((e) => e.node);
}

export async function createEnvironment(
  client: GraphQLClient,
  projectId: string,
  name: string,
): Promise<EnvironmentNode> {
  const data = await client.request<{ environmentCreate: EnvironmentNode }>(
    gql`
      mutation environmentCreate($input: EnvironmentCreateInput!) {
        environmentCreate(input: $input) {
          id
          name
        }
      }
    `,
    { input: { projectId, name } },
  );
  return data.environmentCreate;
}

export async function getOrCreateEnvironment(
  client: GraphQLClient,
  projectId: string,
  name: string,
): Promise<EnvironmentNode> {
  const envs = await listEnvironments(client, projectId);
  const existing = envs.find((e) => e.name === name);
  if (existing) {
    console.log(`  Environment "${name}" exists (${existing.id})`);
    return existing;
  }
  const created = await createEnvironment(client, projectId, name);
  console.log(`  Environment "${name}" created (${created.id})`);
  return created;
}

// --- Services ---

interface ServiceNode {
  id: string;
  name: string;
}

export async function listServices(
  client: GraphQLClient,
  projectId: string,
): Promise<ServiceNode[]> {
  const data = await client.request<{
    project: { services: { edges: { node: ServiceNode }[] } };
  }>(
    gql`
      query project($id: String!) {
        project(id: $id) {
          services {
            edges {
              node {
                id
                name
              }
            }
          }
        }
      }
    `,
    { id: projectId },
  );
  return data.project.services.edges.map((e) => e.node);
}

export async function createService(
  client: GraphQLClient,
  projectId: string,
  name: string,
  image: string,
): Promise<ServiceNode> {
  const data = await client.request<{ serviceCreate: ServiceNode }>(
    gql`
      mutation serviceCreate($input: ServiceCreateInput!) {
        serviceCreate(input: $input) {
          id
          name
        }
      }
    `,
    { input: { projectId, name, source: { image } } },
  );
  return data.serviceCreate;
}

export async function getOrCreateService(
  client: GraphQLClient,
  projectId: string,
  name: string,
  image: string,
): Promise<ServiceNode> {
  const services = await listServices(client, projectId);
  const existing = services.find((s) => s.name === name);
  if (existing) {
    console.log(`  Service "${name}" exists (${existing.id})`);
    return existing;
  }
  const created = await createService(client, projectId, name, image);
  console.log(`  Service "${name}" created (${created.id})`);
  return created;
}

// --- Service configuration ---

export async function updateServiceInstance(
  client: GraphQLClient,
  serviceId: string,
  environmentId: string,
  input: Record<string, unknown>,
): Promise<void> {
  await client.request(
    gql`
      mutation serviceInstanceUpdate(
        $serviceId: String!
        $environmentId: String!
        $input: ServiceInstanceUpdateInput!
      ) {
        serviceInstanceUpdate(
          serviceId: $serviceId
          environmentId: $environmentId
          input: $input
        )
      }
    `,
    { serviceId, environmentId, input },
  );
}

// --- Variables ---

export async function upsertVariable(
  client: GraphQLClient,
  projectId: string,
  environmentId: string,
  serviceId: string,
  name: string,
  value: string,
): Promise<void> {
  await client.request(
    gql`
      mutation variableUpsert($input: VariableUpsertInput!) {
        variableUpsert(input: $input)
      }
    `,
    { input: { projectId, environmentId, serviceId, name, value } },
  );
}

// --- Domains ---

export async function createServiceDomain(
  client: GraphQLClient,
  serviceId: string,
  environmentId: string,
  targetPort: number,
): Promise<string> {
  const data = await client.request<{
    serviceDomainCreate: { domain: string };
  }>(
    gql`
      mutation serviceDomainCreate($input: ServiceDomainCreateInput!) {
        serviceDomainCreate(input: $input) {
          domain
        }
      }
    `,
    { input: { serviceId, environmentId, targetPort } },
  );
  return data.serviceDomainCreate.domain;
}
