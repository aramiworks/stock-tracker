/**
 * Required env vars for the post-deploy full-stack e2e suite.
 *
 * Resolved once at module load. Tests assert against the deployed develop
 * stack, so they fail fast if any of these are missing rather than producing
 * confusing downstream errors.
 */

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

export const env = {
  graphqlUrl: required("E2E_GRAPHQL_URL"),
  supabaseUrl: required("E2E_SUPABASE_URL"),
  supabaseAnonKey: required("E2E_SUPABASE_ANON_KEY"),
  supabaseServiceRoleKey: required("E2E_SUPABASE_SERVICE_ROLE_KEY"),
  userEmail: required("E2E_USER_EMAIL"),
  userPassword: required("E2E_USER_PASSWORD"),
};

// Reserved for Supabase Management API calls (e.g., admin user operations).
export const projectRef = new URL(env.supabaseUrl).hostname.split(".")[0];
