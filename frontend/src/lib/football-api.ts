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

type FootballErrorDetails = {
  endpoint?: string;
  providerStatus?: number;
  providerErrors?: string;
};

export class FootballApiRequestError extends Error {
  public readonly endpoint?: string;
  public readonly providerStatus?: number;
  public readonly providerErrors?: string;

  constructor(
    message: string,
    public readonly status: number = 502,
    details: FootballErrorDetails = {},
  ) {
    super(message);
    this.name = "FootballApiRequestError";

    this.endpoint = details.endpoint;
    this.providerStatus = details.providerStatus;
    this.providerErrors = details.providerErrors;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Returns the request path and query parameters without exposing headers
 * or credentials such as the API key.
 */
function getSafeEndpoint(input: RequestInfo | URL): string {
  try {
    let requestUrl: URL;

    if (typeof input === "string") {
      requestUrl = new URL(input);
    } else if (input instanceof URL) {
      requestUrl = input;
    } else {
      requestUrl = new URL(input.url);
    }

    return `${requestUrl.pathname}${requestUrl.search}`;
  } catch {
    return "unknown endpoint";
  }
}

function formatProviderErrors(errors: unknown): string {
  try {
    const formatted =
      typeof errors === "string"
        ? errors
        : JSON.stringify(errors);

    return (formatted || "No provider error details supplied").slice(0, 1200);
  } catch {
    return "Provider error details could not be serialized";
  }
}

export async function fetchFootballApi(
  input: RequestInfo | URL,
  init: FootballFetchInit = {},
  timeoutMs = 10_000,
): Promise<Response> {
  const signal = init.signal ?? AbortSignal.timeout(timeoutMs);

  return fetch(input, {
    ...init,
    signal,
  });
}

export function hasFootballApiErrors(errors: unknown): boolean {
  if (!errors) return false;

  if (Array.isArray(errors)) {
    return errors.length > 0;
  }

  if (isRecord(errors)) {
    return Object.keys(errors).length > 0;
  }

  return Boolean(errors);
}

/**
 * Fetches and validates the common API-Football response envelope.
 * Detailed provider errors are logged server-side only.
 */
export async function fetchFootballApiData<T>(
  input: RequestInfo | URL,
  apiKey: string,
  init: FootballFetchInit = {},
): Promise<{ response: T[]; results?: number }> {
  const endpoint = getSafeEndpoint(input);

  const headers = new Headers(init.headers);
  headers.set("x-apisports-key", apiKey);

  let response: Response;

  try {
    response = await fetchFootballApi(input, {
      ...init,
      headers,
    });
  } catch (error) {
    console.error("[API-Football] Network request failed:", {
      endpoint,
      error: error instanceof Error ? error.message : String(error),
    });

    throw new FootballApiRequestError(
      "Unable to connect to the football data provider.",
      502,
      { endpoint },
    );
  }

  let payload: unknown;

  try {
    payload = await response.json();
  } catch {
    console.error("[API-Football] Invalid JSON response:", {
      endpoint,
      providerStatus: response.status,
    });

    throw new FootballApiRequestError(
      "The football provider returned invalid JSON.",
      502,
      {
        endpoint,
        providerStatus: response.status,
      },
    );
  }

  if (!isRecord(payload)) {
    console.error("[API-Football] Unexpected response format:", {
      endpoint,
      providerStatus: response.status,
    });

    throw new FootballApiRequestError(
      "The football provider returned an unexpected response.",
      502,
      {
        endpoint,
        providerStatus: response.status,
      },
    );
  }

  const providerPayload = payload as ProviderPayload;
  const hasErrors = hasFootballApiErrors(providerPayload.errors);

  if (!response.ok || hasErrors) {
    const providerErrors = formatProviderErrors(providerPayload.errors);

    console.error("[API-Football] Provider rejected request:", {
      endpoint,
      providerStatus: response.status,
      providerErrors,
    });

    const errorText = providerErrors.toLowerCase();
    const quotaExhausted =
      /request limit for the day|daily request limit|daily quota|reached.*quota/.test(errorText);
    const status = response.status === 429 || quotaExhausted ? 429 : 502;

    throw new FootballApiRequestError(
      "The football provider request failed.",
      status,
      {
        endpoint,
        providerStatus: response.status,
        providerErrors,
      },
    );
  }

  if (!Array.isArray(providerPayload.response)) {
    console.error("[API-Football] Missing response array:", {
      endpoint,
      providerStatus: response.status,
      providerResults: providerPayload.results,
    });

    throw new FootballApiRequestError(
      "The football provider returned an unexpected response.",
      502,
      {
        endpoint,
        providerStatus: response.status,
      },
    );
  }

  return {
    response: providerPayload.response as T[],
    results:
      typeof providerPayload.results === "number"
        ? providerPayload.results
        : undefined,
  };
}