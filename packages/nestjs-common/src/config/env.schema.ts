import { z } from "zod";

/**
 * Base env schema shared across all NestJS services.
 * Each service extends this with its own additional vars.
 */
export const baseEnvSchema = z.object({
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  NODE_ENV: z
    .enum(["development", "staging", "production", "test"])
    .default("development"),
  DATABASE_URL: z.string(),
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string(),
  SUPABASE_SERVICE_ROLE_KEY: z.string(),
  SUPABASE_JWKS_URL: z.string().url().optional(),
});

export type BaseEnv = z.infer<typeof baseEnvSchema>;
