import { freeagentGet, refreshAccessToken } from './freeagent-client.js';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const TOKEN_FILE = resolve(process.cwd(), '.tokens.json');

interface StoredTokens {
  access_token: string;
  refresh_token: string;
}

/** Loads stored tokens from disk */
function loadTokens(): StoredTokens {
  if (!existsSync(TOKEN_FILE)) {
    throw new Error('No tokens found. Run "npm run auth" first to authorize.');
  }

  const raw = readFileSync(TOKEN_FILE, 'utf-8');
  return JSON.parse(raw) as StoredTokens;
}

/** Gets a valid access token, refreshing if needed */
async function getAccessToken(): Promise<string> {
  const tokens = loadTokens();

  try {
    // Test the current token by making a simple request
    await freeagentGet('/company', tokens.access_token);
    return tokens.access_token;
  } catch {
    // Token likely expired, try refreshing
    console.log('Access token expired, refreshing...');
    const newTokens = await refreshAccessToken(tokens.refresh_token);

    writeFileSync(TOKEN_FILE, JSON.stringify({
      access_token: newTokens.access_token,
      refresh_token: newTokens.refresh_token,
    }, null, 2));

    return newTokens.access_token;
  }
}

/** Fetches and displays company info */
async function fetchCompany(accessToken: string): Promise<void> {
  console.log('\n=== Company ===');
  const data = await freeagentGet<Record<string, unknown>>('/company', accessToken);
  console.log(JSON.stringify(data, null, 2));
}

/** Fetches and displays contacts */
async function fetchContacts(accessToken: string): Promise<void> {
  console.log('\n=== Contacts ===');
  const data = await freeagentGet<Record<string, unknown>>('/contacts', accessToken);
  console.log(JSON.stringify(data, null, 2));
}

/** Fetches and displays invoices */
async function fetchInvoices(accessToken: string): Promise<void> {
  console.log('\n=== Invoices ===');
  const data = await freeagentGet<Record<string, unknown>>('/invoices', accessToken);
  console.log(JSON.stringify(data, null, 2));
}

/** Fetches and displays expenses */
async function fetchExpenses(accessToken: string): Promise<void> {
  console.log('\n=== Expenses ===');
  const data = await freeagentGet<Record<string, unknown>>('/expenses', accessToken);
  console.log(JSON.stringify(data, null, 2));
}

/** Fetches and displays bank accounts */
async function fetchBankAccounts(accessToken: string): Promise<void> {
  console.log('\n=== Bank Accounts ===');
  const data = await freeagentGet<Record<string, unknown>>('/bank_accounts', accessToken);
  console.log(JSON.stringify(data, null, 2));
}

/** Fetches and displays projects */
async function fetchProjects(accessToken: string): Promise<void> {
  console.log('\n=== Projects ===');
  const data = await freeagentGet<Record<string, unknown>>('/projects', accessToken);
  console.log(JSON.stringify(data, null, 2));
}

/** Main entry point — fetches all data from FreeAgent */
async function main(): Promise<void> {
  console.log('Connecting to FreeAgent...\n');

  const accessToken = await getAccessToken();
  console.log('Authenticated successfully!\n');

  await fetchCompany(accessToken);
  await fetchContacts(accessToken);
  await fetchInvoices(accessToken);
  await fetchExpenses(accessToken);
  await fetchBankAccounts(accessToken);
  await fetchProjects(accessToken);

  console.log('\nDone!');
}

main().catch((error) => {
  console.error('Error:', error.message);
  process.exit(1);
});
