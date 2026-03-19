import 'dotenv/config';

interface FreeAgentTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

interface FreeAgentConfig {
  clientId: string;
  clientSecret: string;
  baseUrl: string;
  redirectUri: string;
}

/** Loads FreeAgent configuration from environment variables */
function loadConfig(): FreeAgentConfig {
  const clientId = process.env.FREEAGENT_CLIENT_ID;
  const clientSecret = process.env.FREEAGENT_CLIENT_SECRET;
  const baseUrl = process.env.FREEAGENT_BASE_URL;
  const redirectUri = process.env.FREEAGENT_REDIRECT_URI;

  if (!clientId || !clientSecret || !baseUrl || !redirectUri) {
    throw new Error('Missing required FreeAgent environment variables. Check your .env file.');
  }

  return { clientId, clientSecret, baseUrl, redirectUri };
}

/** Exchanges an authorization code for access and refresh tokens */
async function exchangeCodeForTokens(code: string): Promise<FreeAgentTokens> {
  const config = loadConfig();

  const response = await fetch('https://api.freeagent.com/v2/token_endpoint', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: config.redirectUri,
      client_id: config.clientId,
      client_secret: config.clientSecret,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Token exchange failed: ${response.status} ${error}`);
  }

  return response.json() as Promise<FreeAgentTokens>;
}

/** Refreshes an expired access token using a refresh token */
async function refreshAccessToken(refreshToken: string): Promise<FreeAgentTokens> {
  const config = loadConfig();

  const response = await fetch('https://api.freeagent.com/v2/token_endpoint', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: config.clientId,
      client_secret: config.clientSecret,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Token refresh failed: ${response.status} ${error}`);
  }

  return response.json() as Promise<FreeAgentTokens>;
}

/** Makes an authenticated GET request to the FreeAgent API */
async function freeagentGet<T>(endpoint: string, accessToken: string): Promise<T> {
  const config = loadConfig();
  const url = `${config.baseUrl}${endpoint}`;

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'User-Agent': 'Oribi5-FreeAgent-Client/1.0',
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`FreeAgent API error: ${response.status} ${error}`);
  }

  return response.json() as Promise<T>;
}

/** Builds the OAuth2 authorization URL */
function buildAuthUrl(): string {
  const config = loadConfig();

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
  });

  return `https://api.freeagent.com/v2/approve_app?${params.toString()}`;
}

export {
  loadConfig,
  exchangeCodeForTokens,
  refreshAccessToken,
  freeagentGet,
  buildAuthUrl,
};

export type { FreeAgentTokens, FreeAgentConfig };
