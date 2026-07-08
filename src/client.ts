import { setTimeout as delay } from 'node:timers/promises';
import type { HortusFoxConfig } from './config.js';

/**
 * Value types accepted as request parameters. Undefined/null values are omitted.
 */
export type ParamValue = string | number | boolean | null | undefined;
export type Params = Record<string, ParamValue>;

/**
 * Shape of a HortusFox API JSON response. The API always returns a `code`
 * field; success is 200, errors carry a `msg`. Additional payload keys
 * (data, list, plant, item, etc.) vary per endpoint.
 */
export interface HortusFoxResponse {
  code: number;
  msg?: string;
  [key: string]: unknown;
}

export class HortusFoxError extends Error {
  public readonly code?: number;
  public readonly endpoint: string;
  public readonly response?: unknown;

  constructor(message: string, endpoint: string, code?: number, response?: unknown) {
    super(message);
    this.name = 'HortusFoxError';
    this.endpoint = endpoint;
    this.code = code;
    this.response = response;
  }
}

/**
 * Thin HTTP client for the HortusFox REST API.
 *
 * All endpoints are reached under `<baseUrl>/api/...` and authenticated via an
 * API token. Parameters (and the token) are sent as an
 * `application/x-www-form-urlencoded` POST body, which the Asatru framework
 * merges into the request argument bag regardless of the declared route method.
 */
export class HortusFoxClient {
  private readonly config: HortusFoxConfig;

  constructor(config: HortusFoxConfig) {
    this.config = config;
  }

  /**
   * Perform a request against an API endpoint (path relative to `/api`, e.g.
   * `plants/list`). Returns the parsed JSON payload on success or throws a
   * HortusFoxError describing the failure.
   */
  async request(endpoint: string, params: Params = {}): Promise<HortusFoxResponse> {
    const normalized = endpoint.replace(/^\/+/, '');
    const url = `${this.config.baseUrl}/api/${normalized}`;

    const body = new URLSearchParams();
    body.set('token', this.config.token);
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null) {
        continue;
      }
      body.set(key, typeof value === 'boolean' ? (value ? '1' : '0') : String(value));
    }

    const maxAttempts = 3;
    let lastError: unknown;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), this.config.timeoutMs);

      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Accept: 'application/json',
          },
          body: body.toString(),
          signal: controller.signal,
        });

        const text = await res.text();

        if (res.status === 403) {
          throw new HortusFoxError(
            'Authentication failed (HTTP 403): the API token was rejected. Check HORTUSFOX_API_TOKEN and that the key is enabled in the HortusFox admin panel.',
            endpoint,
            403,
            safeParse(text)
          );
        }

        if (!res.ok) {
          throw new HortusFoxError(
            `Unexpected HTTP status ${res.status} from HortusFox for ${endpoint}.`,
            endpoint,
            res.status,
            safeParse(text) ?? text.slice(0, 500)
          );
        }

        const json = safeParse(text) as HortusFoxResponse | undefined;
        if (!json || typeof json !== 'object') {
          throw new HortusFoxError(
            `HortusFox returned a non-JSON response for ${endpoint}.`,
            endpoint,
            res.status,
            text.slice(0, 500)
          );
        }

        if (typeof json.code === 'number' && json.code !== 200) {
          throw new HortusFoxError(
            `HortusFox API error for ${endpoint} (code ${json.code}): ${json.msg ?? 'unknown error'}`,
            endpoint,
            json.code,
            json
          );
        }

        return json;
      } catch (err) {
        lastError = err;

        // Do not retry deterministic API/auth errors.
        if (err instanceof HortusFoxError) {
          throw err;
        }

        const isAbort = err instanceof Error && err.name === 'AbortError';
        if (attempt < maxAttempts) {
          await delay(250 * attempt);
          continue;
        }

        const reason = isAbort
          ? `request timed out after ${this.config.timeoutMs}ms`
          : err instanceof Error
            ? err.message
            : String(err);
        throw new HortusFoxError(
          `Failed to reach HortusFox for ${endpoint}: ${reason}`,
          endpoint,
          undefined,
          undefined
        );
      } finally {
        clearTimeout(timer);
      }
    }

    // Unreachable, but keeps the type checker satisfied.
    throw lastError instanceof Error
      ? lastError
      : new HortusFoxError('Unknown request failure', endpoint);
  }
}

function safeParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}
