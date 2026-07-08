/**
 * Configuration loaded from environment variables.
 *
 * HORTUSFOX_URL       Base URL of the HortusFox instance, e.g. https://garden.example.com
 * HORTUSFOX_API_TOKEN API key generated in the HortusFox admin panel (Admin > API)
 * HORTUSFOX_TIMEOUT   Optional request timeout in milliseconds (default: 30000)
 */
export interface HortusFoxConfig {
  baseUrl: string;
  token: string;
  timeoutMs: number;
}

export function loadConfig(): HortusFoxConfig {
  const rawUrl = process.env.HORTUSFOX_URL?.trim();
  const token = process.env.HORTUSFOX_API_TOKEN?.trim();

  if (!rawUrl) {
    throw new Error(
      'Missing required environment variable HORTUSFOX_URL (base URL of your HortusFox instance).'
    );
  }
  if (!token) {
    throw new Error(
      'Missing required environment variable HORTUSFOX_API_TOKEN (API key from the HortusFox admin panel).'
    );
  }

  // Normalise: strip trailing slashes so we can safely append paths.
  const baseUrl = rawUrl.replace(/\/+$/, '');

  let timeoutMs = 30000;
  const rawTimeout = process.env.HORTUSFOX_TIMEOUT?.trim();
  if (rawTimeout) {
    const parsed = Number.parseInt(rawTimeout, 10);
    if (Number.isFinite(parsed) && parsed > 0) {
      timeoutMs = parsed;
    }
  }

  return { baseUrl, token, timeoutMs };
}
