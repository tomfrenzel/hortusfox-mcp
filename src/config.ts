/**
 * Configuration loaded from environment variables.
 *
 * HORTUSFOX_URL       Base URL of the HortusFox instance, e.g. https://garden.example.com
 * HORTUSFOX_API_TOKEN API key generated in the HortusFox admin panel (Admin > API)
 * HORTUSFOX_TIMEOUT   Optional request timeout in milliseconds (default: 30000)
 * HORTUSFOX_UPLOAD_DIR Optional directory files may be uploaded from. Unset,
 *                     the upload tools refuse every path.
 * HORTUSFOX_MAX_UPLOAD_MB Optional upload size ceiling in MiB (default: 25)
 */
export interface HortusFoxConfig {
  baseUrl: string;
  token: string;
  timeoutMs: number;
  uploadDir?: string;
  maxUploadBytes: number;
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

  const uploadDir = process.env.HORTUSFOX_UPLOAD_DIR?.trim() || undefined;

  let maxUploadBytes = 25 * 1024 * 1024;
  const rawMax = process.env.HORTUSFOX_MAX_UPLOAD_MB?.trim();
  if (rawMax) {
    const parsed = Number.parseInt(rawMax, 10);
    if (Number.isFinite(parsed) && parsed > 0) {
      maxUploadBytes = parsed * 1024 * 1024;
    }
  }

  return { baseUrl, token, timeoutMs, uploadDir, maxUploadBytes };
}
