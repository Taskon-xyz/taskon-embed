# Authentication

TaskOn Embed SDK supports two primary authentication methods: Email and EVM wallet. All login requests are made via `embed.login(request)`.

## Email Authentication

Email login is the simplest flow and fits most Web2 users.

### Basic Usage

```typescript
await embed.login({
  type: "email",
  value: "user@example.com",
  signature: serverSignature, // signed by your backend with project secret: value + timestamp
  timestamp: Date.now(),
});
```

### Complete Example

```typescript
async function loginWithEmail(email: string) {
  const timestamp = Date.now();
  const signature = await fetch("/api/auth/sign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ value: email, timestamp }),
  }).then(r => r.text());

  await embed.login({
    type: "email",
    value: email,
    signature,
    timestamp,
  });
}
```

## EVM Wallet Authentication

Best for Web3 users, identity is verified via cryptographic signature.

### Basic Flow

1. Get the wallet address (via site wallet integration or your own module)
2. Ask your backend to generate a signature for `value + timestamp`
3. Call `embed.login({ type: "evm", value, signature, timestamp })`

### Complete Example

```typescript
async function loginWithWallet(address: string) {
  const timestamp = Date.now();
  const signature = await fetch("/api/auth/sign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ value: address, timestamp }),
  }).then(r => r.text());

  await embed.login({
    type: "evm",
    value: address,
    signature,
    timestamp,
  });
}
```

### Advanced Wallet Integration

```typescript
embed.on("walletRequest", request => {
  // Execute site wallet signing/transaction logic based on request.type
  // The SDK will internally send results back to the iframe
});
```

## Session Management

### Check Login Status

```typescript
if (embed.getIsLoggedIn()) {
  console.log("User is logged in");
} else {
  console.log("User is not logged in");
}
```

### Auto Re-login

```typescript
// Optionally cache the latest login value/signature (mind security and expiration)
localStorage.setItem("taskon_last_login_value", "user@example.com");
```

## Logout

```typescript
embed.logout();
```

## Best Practices

### 1) Graceful Error Handling

```typescript
embed.on("error", err => {
  console.error("TaskOnEmbed error:", err.message);
});
```

### 2) Loading State Management

```typescript
// Implement loading indicators and error toasts based on your UI needs
```

### 3) UX Improvements

```typescript
// Prompt users to install a wallet or guide them through authorization when needed
```
