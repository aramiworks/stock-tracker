import pino from "pino";

interface LoggerOptions {
  service: string;
  env?: string;
}

export const createLogger = ({ service, env }: LoggerOptions) => {
  const resolvedEnv = env ?? process.env["NODE_ENV"];
  const isDev = resolvedEnv === "development";
  const isTest = resolvedEnv === "test";

  if (isTest) {
    return pino({ level: "silent", base: { service } });
  }

  if (isDev) {
    return pino({
      level: "debug",
      transport: { target: "pino-pretty", options: { colorize: true } },
      base: { service },
    });
  }

  return pino(
    { level: "info", base: { service } },
    pino.destination({ sync: true }),
  );
};

export type Logger = ReturnType<typeof createLogger>;
