import { z } from "zod";

export const envSchema = z.object({
  PORT: z.string().default("4000"),
  DATABASE_URL: z.string(),
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string(),
  SUPABASE_SERVICE_ROLE_KEY: z.string(),
  SUPABASE_JWKS_URL: z.string().url().optional(),
  APOLLO_KEY: z.string().optional(),
  TRIGGER_DEV_API_KEY: z.string().optional(),
  WEBHOOK_URL: z.string().optional(),
  NODE_ENV: z
    .enum(["development", "staging", "production", "test"])
    .default("development"),
});

export const env = envSchema.parse(process.env);
