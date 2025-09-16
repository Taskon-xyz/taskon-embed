# Authentication

TaskOn Embed SDK supports two primary authentication methods: Email and EVM wallet. All login requests are made via `embed.login(request)`.

## Overview

The SDK uses `AuthType` enum with two values:

- `"Email"` - Email-based authentication
- `"WalletAddress"` - EVM wallet address authentication

## Email Authentication

Email login is the simplest flow and fits most Web2 users.

### Basic Usage

```typescript
await embed.login({
  type: "Email",
  account: "user@example.com",
  signature: serverSignature, // signed by your backend with project secret
  timestamp: Date.now(),
});
```

### Complete Example

```typescript
import { trackVisit } from "@taskon/embed";

async function loginWithEmail(email: string) {
  const timestamp = Date.now();
  const { signature } = await fetch("/api/auth/sign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ account: email, timestamp }),
  }).then(r => r.json());

  await embed.login({
    type: "Email",
    account: email,
    signature,
    timestamp,
  });
}
```

## EVM Wallet Authentication

Best for Web3 users, identity is verified via cryptographic signature.

### Basic Flow

1. Get the wallet address (via site wallet integration or your own module)
2. Ask your backend to generate a signature for `account + timestamp`
3. Call `embed.login({ type: "WalletAddress", account, signature, timestamp, provider })`
4. The `provider` parameter is required for wallet operations (EIP-1193 compatible)

### Complete Example

```typescript
import { trackVisit } from "@taskon/embed";

async function loginWithWallet(address: string, provider: any) {
  const timestamp = Date.now();
  const { signature } = await fetch("/api/auth/sign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ account: address, timestamp }),
  }).then(r => r.json());

  await embed.login({
    type: "WalletAddress",
    account: address,
    signature,
    timestamp,
    provider, // EIP-1193 compatible provider (e.g., window.ethereum)
  });
}
```

### OAuth Integration

The SDK supports OAuth integration for social logins:

```typescript
const embed = new TaskOnEmbed({
  baseUrl: "https://yourtaskondomain.com",
  containerElement: "#taskon-container",
});

// The SDK automatically handles OAuth redirects for:
// - Twitter
// - Discord
// - Telegram
// - Reddit
```

## Session Management

### Check Authorization Status

```typescript
// Check if email account has valid authorization cache
const emailAuthorized = await embed.isAuthorized("Email", "user@example.com");

// Check if wallet has valid authorization cache
const walletAuthorized = await embed.isAuthorized("WalletAddress", "0x1234...");

if (emailAuthorized) {
  // No signature needed for email login
  await embed.login({ type: "Email", account: "user@example.com" });
} else {
  // Signature required for email login
  const { signature, timestamp } = await getServerSignature("user@example.com");
  await embed.login({
    type: "Email",
    account: "user@example.com",
    signature,
    timestamp,
  });
}
```

### Auto Re-login

```typescript
// Optionally cache the latest login account/signature (mind security and expiration)
localStorage.setItem("taskon_last_login_account", "user@example.com");
localStorage.setItem("taskon_last_login_type", "Email");
```

## Logout

```typescript
// Standard logout - keeps auth cache (recommended)
await embed.logout();

// Complete logout - clears all authorization cache (use sparingly)
await embed.logout({ clearAuth: true });

// Multi-account switching
await embed.logout(); // Keep current user's auth
await embed.login({
  type: "Email",
  account: "another@example.com",
  // No signature needed if this account was authorized before
});
```

## Best Practices

### 1) Graceful Error Handling

```typescript
try {
  await embed.login({
    type: "Email",
    account: "user@example.com",
    signature: "invalid-signature",
  });
} catch (error) {
  console.error("Login failed:", error.message);
  // Handle login failure
}
```

### 2) Loading State Management

```typescript
// Implement loading indicators and error toasts based on your UI needs
```

### 3) UX Improvements

```typescript
// Prompt users to install a wallet or guide them through authorization when needed
```
