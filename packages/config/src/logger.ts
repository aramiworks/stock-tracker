import pino from "pino";

interface LoggerOptions {
  service: string;
  env?: string;
  betterStackToken?: string;
  betterStackIngestHost?: string;
}

export const createLogger = ({
  service,
  env,
  betterStackToken,
  betterStackIngestHost,
}: LoggerOptions) => {
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

  if (betterStackToken) {
    const resolvedEndpoint = betterStackIngestHost
      ? /^https?:\/\//.test(betterStackIngestHost)
        ? betterStackIngestHost
        : `https://${betterStackIngestHost}`
      : "https://in.logs.betterstack.com";

    return pino(
      { level: "info", base: { service } },
      pino.transport({
        target: "@logtail/pino",
        options: {
          sourceToken: betterStackToken,
          options: {
            endpoint: resolvedEndpoint,
          },
        },
      }),
    );
  }

  return pino(
    { level: "info", base: { service } },
    pino.destination({ sync: true }),
  );
};

export type Logger = ReturnType<typeof createLogger>;
