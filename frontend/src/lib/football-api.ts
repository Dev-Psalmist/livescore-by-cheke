/** Shared safeguards and response handling for API-Football requests. */
type FootballFetchInit = RequestInit & {
  next?: {
    revalidate?: number | false;
    tags?: string[];
  };
};

type ProviderPayload = {
  errors?: unknown;
  results?: unknown;
  response?: unknown;
};

export class FootballApiRequestError extends Error {
  constructor(message: string, public readonly status: number = 502) {
    super(message);
    this.name = "FootballApiRequestError";
  }
}

export async function fetchFootballApi(
  input: RequestInfo | URL,
  init: FootballFetchInit = {},
  timeoutMs = 10_000,
): Promise<Response> {
  const signal = init.signal ?? AbortSignal.timeout(timeoutMs);
  return fetch(input, { ...init, signal });
}

export function hasFootballApiErrors(errors: unknown): boolean {
  if (!errors) return false;
  if (Array.isArray(errors)) return errors.length > 0;
  if (typeof errors === "object") return Object.keys(errors).length > 0;
  return Boolean(errors);
}

/**
 * Fetches and validates the common API-Football envelope.
 * Route handlers remain responsible for validating endpoint-specific records.
 */
export async function fetchFootballApiData<T>(
  input: RequestInfo | URL,
  apiKey: string,
  init: FootballFetchInit = {},
): Promise<{ response: T[]; results?: number }> {
  const response = await fetchFootballApi(input, {
    ...init,
    headers: {
      ...init.headers,
      "x-apisports-key": apiKey,
    },
  });

  let payload: ProviderPayload;
  try {
    payload = await response.json() as ProviderPayload;
  } catch {
    throw new FootballApiRequestError("The football provider returned invalid JSON.");
  }

  if (!response.ok || hasFootballApiErrors(payload?.errors)) {
    const status = response.status === 429 ? 429 : 502;
    throw new FootballApiRequestError("The football provider request failed.", status);
  }

  if (!Array.isArray(payload?.response)) {
    throw new FootballApiRequestError("The football provider returned an unexpected response.");
  }

  return {
    response: payload.response as T[],
    results: typeof payload.results === "number" ? payload.results : undefined,
  };
}
