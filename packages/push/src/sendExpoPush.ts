/**
 * Framework-agnostic Expo Push client. Zero Prisma/Nest deps and an injectable
 * `fetch` so both tracker-service (inline dispatch) and the scraper (retry
 * sweep) can import it. Returns ticket-level results only — it never touches the
 * database; the caller is responsible for stamping `alerts.sent_at` and
 * deactivating dead device tokens.
 */

export interface ExpoMessage {
  to: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

export interface ExpoTicketResult {
  token: string;
  ok: boolean;
  /** Expo ticket id (present on success) — used later for receipt polling. */
  id?: string;
  /** Ticket-level error code, e.g. "DeviceNotRegistered". */
  error?: string;
}

export interface SendExpoPushDeps {
  /** Injectable fetch for tests. Defaults to the global fetch. */
  fetch?: typeof globalThis.fetch;
  /** Override the Expo push endpoint (tests). */
  endpoint?: string;
  /** Optional Expo access token — enables "Bearer" push security in prod. */
  accessToken?: string;
}

/** Shape of a single ticket in the Expo push-send response `data` array. */
interface ExpoTicket {
  status: "ok" | "error";
  id?: string;
  message?: string;
  details?: { error?: string };
}

const DEFAULT_ENDPOINT = "https://exp.host/--/api/v2/push/send";

/** Expo accepts at most 100 messages per push-send request. */
const CHUNK_SIZE = 100;

/**
 * Send a batch of Expo push messages, chunked to {@link CHUNK_SIZE} per request.
 * Expo returns tickets in input order within a chunk, so `tickets[i]` maps back
 * to `messages[i]` — that alignment is how we recover which token each ticket
 * belongs to.
 *
 * v1 surfaces ticket-level `status:"error"` (mapping `details.error` such as
 * `"DeviceNotRegistered"` into {@link ExpoTicketResult.error}). Async receipt
 * polling (`getReceipts`) for delivery-time failures is deferred.
 */
export async function sendExpoPush(
  messages: ExpoMessage[],
  deps: SendExpoPushDeps = {},
): Promise<ExpoTicketResult[]> {
  const fetchImpl = deps.fetch ?? globalThis.fetch;
  const endpoint = deps.endpoint ?? DEFAULT_ENDPOINT;

  const results: ExpoTicketResult[] = [];
  for (let i = 0; i < messages.length; i += CHUNK_SIZE) {
    const chunk = messages.slice(i, i + CHUNK_SIZE);
    const chunkResults = await sendChunk(
      chunk,
      fetchImpl,
      endpoint,
      deps.accessToken,
    );
    results.push(...chunkResults);
  }

  // TODO: receipt polling — persist returned ticket ids and GET
  // /push/getReceipts to catch async DeviceNotRegistered after delivery.

  return results;
}

async function sendChunk(
  chunk: ExpoMessage[],
  fetchImpl: typeof globalThis.fetch,
  endpoint: string,
  accessToken: string | undefined,
): Promise<ExpoTicketResult[]> {
  const headers: Record<string, string> = {
    "content-type": "application/json",
    accept: "application/json",
  };
  if (accessToken) {
    headers["authorization"] = `Bearer ${accessToken}`;
  }

  let tickets: ExpoTicket[];
  try {
    const res = await fetchImpl(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(chunk),
    });
    if (!res.ok) {
      return chunk.map((m) => ({
        token: m.to,
        ok: false,
        error: `HTTP ${res.status}`,
      }));
    }
    const json = (await res.json()) as { data?: ExpoTicket[] };
    tickets = json.data ?? [];
  } catch {
    return chunk.map((m) => ({
      token: m.to,
      ok: false,
      error: "RequestFailed",
    }));
  }

  return chunk.map((m, idx) => {
    const ticket = tickets[idx];
    if (!ticket) {
      return { token: m.to, ok: false, error: "NoTicket" };
    }
    if (ticket.status === "ok") {
      return { token: m.to, ok: true, id: ticket.id };
    }
    return {
      token: m.to,
      ok: false,
      error: ticket.details?.error ?? ticket.message ?? "unknown",
    };
  });
}
