// Initial default URL matching active Cloudflare tunnel
let currentApiUrl =
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  'https://cricket-queen-maintain-bennett.trycloudflare.com';

const REMOTE_GATEWAY_CONFIG_URL =
  'https://raw.githubusercontent.com/syedibadurrab9-dev/CapitalLoop.Mobile/main/gateway.json';

/**
 * Returns the currently active backend API Base URL.
 */
export const getApiBaseUrl = (): string => {
  return currentApiUrl;
};

/**
 * Allows dynamic manual or runtime override of the API gateway.
 */
export const setApiBaseUrl = (newUrl: string): void => {
  if (newUrl && newUrl.trim().startsWith('http')) {
    currentApiUrl = newUrl.trim().replace(/\/+$/, '');
    console.log('[GATEWAY] Active API Base URL updated to:', currentApiUrl);
  }
};

/**
 * Fetches the latest published Cloudflare gateway from GitHub raw config.
 * Guarantees that tunnel domain rotations immediately propagate to all installed apps.
 */
export const syncRemoteGatewayUrl = async (): Promise<string> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(`${REMOTE_GATEWAY_CONFIG_URL}?_t=${Date.now()}`, {
      signal: controller.signal,
      headers: {
        'Cache-Control': 'no-cache',
      },
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.apiUrl) {
        setApiBaseUrl(data.apiUrl);
        return currentApiUrl;
      }
    }
  } catch (err) {
    console.log('[GATEWAY] Remote sync skipped, continuing with:', currentApiUrl);
  }
  return currentApiUrl;
};
