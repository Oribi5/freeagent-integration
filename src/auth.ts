import { buildAuthUrl, exchangeCodeForTokens } from './freeagent-client.js';
import { writeFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import * as readline from 'readline';

const TOKEN_FILE = resolve(process.cwd(), '.tokens.json');

/** Prompts the user for input via stdin */
function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

/** Saves tokens to a local file */
function saveTokens(tokens: { access_token: string; refresh_token: string }): void {
  writeFileSync(TOKEN_FILE, JSON.stringify(tokens, null, 2));
  console.log(`Tokens saved to ${TOKEN_FILE}`);
}

/** Runs the OAuth2 authorization flow */
async function main(): Promise<void> {
  const authUrl = buildAuthUrl();

  console.log('\n=== FreeAgent OAuth2 Authorization ===\n');
  console.log('1. Open this URL in your browser:\n');
  console.log(authUrl);
  console.log('\n2. Authorize the application');
  console.log('3. Copy the authorization code from the redirect URL\n');

  const code = await prompt('Paste the authorization code here: ');

  if (!code) {
    console.error('No code provided. Exiting.');
    process.exit(1);
  }

  console.log('\nExchanging code for tokens...');
  const tokens = await exchangeCodeForTokens(code);

  saveTokens(tokens);

  console.log('\nAuthorization complete! You can now run: npm run dev');
}

main().catch((error) => {
  console.error('Authorization failed:', error);
  process.exit(1);
});
