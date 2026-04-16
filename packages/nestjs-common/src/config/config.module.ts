import { Module } from "@nestjs/common";
import { ConfigModule as NestConfigModule } from "@nestjs/config";
import type { z } from "zod";
import { baseEnvSchema } from "./env.schema.js";

/**
 * Creates a ConfigModule that validates env vars with Zod at startup.
 * Services extend the base schema with their own vars:
 *
 *   AppConfigModule.forSchema(baseEnvSchema.extend({ SENTRY_DSN: z.string().optional() }))
 */
@Module({})
export class AppConfigModule {
  static forSchema(schema: z.ZodType = baseEnvSchema) {
    return NestConfigModule.forRoot({
      isGlobal: true,
      validate: (config: Record<string, unknown>) => schema.parse(config),
    });
  }
}
