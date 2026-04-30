/**
 * Maps a tRPC procedure path to EFCV tags for Sentry.
 *
 * Backend procedures are organised as `{experience}.{flow?}.{container?}`
 * (e.g. `auth.signIn.startGmailOauth`, or just `auth.me` when the router has
 * no flow level). Missing segments come back as `undefined`.
 */

export type EfcvTags = {
  experience?: string;
  flow?: string;
  container?: string;
};

export function getEfcvFromTrpcPath(path: string): EfcvTags {
  const [experience, flow, container] = path.split(".");
  return { experience, flow, container };
}
