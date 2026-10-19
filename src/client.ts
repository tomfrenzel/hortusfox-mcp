import { readFile, realpath, stat } from 'node:fs/promises';
import { basename, sep } from 'node:path';
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
    const body = new URLSearchParams();
    body.set('token', this.config.token);
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null) {
        continue;
      }
      body.set(key, encodeValue(value));
    }

    return this.send(endpoint, () => ({
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
      body: body.toString(),
    }));
  }

  /**
   * Upload a local file as `multipart/form-data`, under the form field the
   * endpoint reads from `$_FILES` (e.g. `attachment` or `photo`), alongside the
   * token and the other parameters.
   *
   * Only files inside HORTUSFOX_UPLOAD_DIR may be sent. The path is resolved
   * with realpath first, so neither `..` nor a symlink can reach outside it:
   * an agent must not be able to ship ~/.ssh or a .env to the server.
   */
  async requestMultipart(
    endpoint: string,
    params: Params,
    file: { field: string; path: string }
  ): Promise<HortusFoxResponse> {
    const resolved = await this.resolveUpload(endpoint, file.path);
    const data = await readFile(resolved);

    return this.send(endpoint, () => {
      // Rebuilt per attempt: a FormData body is consumed by fetch.
      const form = new FormData();
      form.set('token', this.config.token);
      for (const [key, value] of Object.entries(params)) {
        if (value === undefined || value === null) {
          continue;
        }
        form.set(key, encodeValue(value));
      }
      form.set(file.field, new Blob([data]), basename(resolved));
      return { headers: { Accept: 'application/json' }, body: form };
    });
  }

  private async resolveUpload(endpoint: string, path: string): Promise<string> {
    const dir = this.config.uploadDir;
    if (!dir) {
      throw new HortusFoxError(
        'Uploads are disabled: set HORTUSFOX_UPLOAD_DIR to the directory files may be sent from.',
        endpoint
      );
    }

    let root: string;
    let target: string;
    try {
      root = await realpath(dir);
      target = await realpath(path);
    } catch (err) {
      throw new HortusFoxError(
        `Cannot resolve upload path: ${err instanceof Error ? err.message : String(err)}`,
        endpoint
      );
    }

    if (!target.startsWith(root + sep)) {
      throw new HortusFoxError(
        `Refusing to upload ${path}: it is not inside HORTUSFOX_UPLOAD_DIR.`,
        endpoint
      );
    }

    const info = await stat(target);
    if (!info.isFile()) {
      throw new HortusFoxError(`Refusing to upload ${path}: not a regular file.`, endpoint);
    }
    if (info.size > this.config.maxUploadBytes) {
      throw new HortusFoxError(
        `Refusing to upload ${path}: ${info.size} bytes exceeds the ${this.config.maxUploadBytes}-byte ceiling (HORTUSFOX_MAX_UPLOAD_MB).`,
        endpoint
      );
    }

    return target;
  }

  /**
   * POST to an API endpoint (path relative to `/api`) and interpret the
   * HortusFox response. `buildInit` is called once per attempt.
   */
  private async send(
    endpoint: string,
    buildInit: () => { headers: Record<string, string>; body: string | FormData }
  ): Promise<HortusFoxResponse> {
    const normalized = endpoint.replace(/^\/+/, '');
    const url = `${this.config.baseUrl}/api/${normalized}`;

    const maxAttempts = 3;
    let lastError: unknown;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), this.config.timeoutMs);

      try {
        const res = await fetch(url, {
          method: 'POST',
          ...buildInit(),
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

function encodeValue(value: string | number | boolean): string {
  return typeof value === 'boolean' ? (value ? '1' : '0') : String(value);
}

function safeParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}
