# Getting Started

This guide helps you integrate the TaskOn Embed SDK in 5 minutes.

## Prerequisites

Before starting, ensure you have:

1. **TaskOn Community**: Create a community on TaskOn platform
2. **TaskOn Embed Credentials**:
   - `client_id` - Your TaskOn embed client identifier
   - `private_key` - RSA private key for signature generation
3. **Domain Setup**: Prepare a domain that resolves to TaskOn (for white-label mode)

> Contact TaskOn support to obtain your embed credentials and set up domain resolution.

## Step 1: Install

::: code-group

```bash [npm]
npm install @taskon/embed
```

```bash [yarn]
yarn add @taskon/embed
```

```bash [pnpm]
pnpm add @taskon/embed
```

:::

## Step 2: Prepare a container

Place a container element in your HTML:

```html
<div id="taskon-container" style="width: 100%; height: 100%;"></div>
```

## Step 3: Initialize the SDK

```typescript
import { TaskOnEmbed } from "@taskon/embed";

const embed = new TaskOnEmbed({
  baseUrl: "https://yourdomain.com", // Your domain that resolves to TaskOn
  containerElement: "#taskon-container",
});

await embed.init();

// Clean up when no longer needed
// embed.destroy(); // Removes iframe and cleans up all resources
```

## Step 4: Trigger TaskOn Login

When users login to your own system, proactively trigger TaskOn authentication:

### Email Login

Frontend:

```typescript
// When user logs into your system with email
async function loginToTaskOn(userEmail: string) {
  const isAuthorized = await embed.isAuthorized("Email", userEmail);

  if (!isAuthorized) {
    // Generate signature on your server using your private_key
    const { signature, timestamp } = await getServerSignature(userEmail);

    await embed.login({
      type: "Email",
      account: userEmail,
      signature,
      timestamp,
    });
  } else {
    await embed.login({
      type: "Email",
      account: userEmail,
    });
  }
}
```

### EVM Wallet Login

Frontend:

```typescript
// When user connects wallet to your system
async function loginToTaskOnWithWallet(address: string, provider: any) {
  const isAuthorized = await embed.isAuthorized("WalletAddress", address);

  if (!isAuthorized) {
    // Generate signature on your server using your private_key
    const { signature, timestamp } = await getServerSignature(address);

    await embed.login({
      type: "WalletAddress",
      account: address,
      signature,
      timestamp,
      provider, // Required for wallet operations
    });
  } else {
    await embed.login({
      type: "WalletAddress",
      account: address,
      provider,
    });
  }
}

// Logout from TaskOn
async function logoutFromTaskOn() {
  await embed.logout();
}
```

## Backend (Node.js)

Generate signatures for both email and wallet authentication:

```typescript
import { signMessage } from "@taskon/embed/node";

// Generate signature for email or wallet authentication
function getServerSignature(account: string, type: "Email" | "evm") {
  const clientId = process.env.TASKON_CLIENT_ID!;
  const privateKey = process.env.TASKON_PRIVATE_KEY!; // Base64 encoded RSA private key

  return signMessage(clientId, type, account, privateKey);
}

// Example Express.js endpoint
app.post("/api/taskon/sign", async (req, res) => {
  const { account, type } = req.body; // type: 'Email' or 'evm'

  // Verify user is authenticated in your system
  if (!isUserAuthenticated(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const result = signMessage(
      process.env.TASKON_CLIENT_ID!,
      type === "Email" ? "Email" : "evm",
      account,
      process.env.TASKON_PRIVATE_KEY!
    );

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Signature generation failed" });
  }
});
```

## Step 5: Optional - Track Conversion Analytics

Only if you need TaskOn conversion rate analysis:

```typescript
import { trackVisit } from "@taskon/embed";

// Call on page load for conversion tracking
await trackVisit(); // For anonymous users
// or
await trackVisit("Email", "user@example.com"); // For known users
```

## Step 6: Listen to Events

Handle authentication requirements and route changes:

```typescript
// Handle authentication requirement from iframe
embed.on("loginRequired", () => {
  console.log("TaskOn requires user authentication");
  // Trigger your login flow and call embed.login()
});

// Handle iframe route changes (optional)
embed.on("routeChanged", fullPath => {
  console.log("TaskOn route changed to:", fullPath);
  // Optional: Sync with your external URL
  // window.history.replaceState(null, '', `/taskon${fullPath}`);
});
```

## Next Steps

- [Configuration Options](/guide/configuration)
- [Authentication Guide](/guide/authentication)
- [API Reference](/api/)
- [Live Demo](https://github.com/Taskon-xyz/whitelabel-demo-rainbowkit) - Working code examples

## Need Help?

- Check the FAQ or troubleshooting
- Open a ticket or a [GitHub Issue](https://github.com/Taskon-xyz/taskon-embed/issues)
