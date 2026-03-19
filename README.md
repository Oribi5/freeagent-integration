# Oribi5 — FreeAgent API Integration

Fetches accounting data from [FreeAgent](https://www.freeagent.com/) for **Oribi Innovations Ltd**.

## Prerequisites

- Node.js 18+
- A FreeAgent account with an approved API application

## FreeAgent App Setup

If you need to recreate the FreeAgent API application:

1. Log in to FreeAgent at `https://ori005.freeagent.com`
2. Go to **Settings > API > Developer**
3. Register a new application:
   - **Homepage URL**: `http://localhost:3000` (or any URL — not validated)
   - **OAuth redirect URIs**: Add `https://developers.google.com/oauthplayground`
   - **Accountancy Practice API**: Leave disabled
   - **Who may use this app**: All users
4. Copy the **OAuth identifier** and **OAuth secret**

## Environment Setup

Create a `.env` file in the project root:

```
FREEAGENT_CLIENT_ID=<your-oauth-identifier>
FREEAGENT_CLIENT_SECRET=<your-oauth-secret>
FREEAGENT_BASE_URL=https://api.freeagent.com/v2
FREEAGENT_REDIRECT_URI=https://developers.google.com/oauthplayground
```

## Installation

```bash
npm install
```

## Authorization

Run the auth flow to get OAuth2 tokens:

```bash
npm run auth
```

1. Open the printed URL in your browser
2. Log in to FreeAgent and approve the app
3. You'll be redirected to the Google OAuth Playground — copy the `code` parameter from the URL
4. Paste the code into the terminal

Tokens are saved to `.tokens.json` (gitignored). If they expire, the app will auto-refresh them.

## Usage

```bash
npm run dev
```

Fetches: company info, contacts, invoices, expenses, bank accounts, and projects.
