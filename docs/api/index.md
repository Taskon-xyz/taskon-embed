# API Reference

The TaskOn Embed SDK provides a comprehensive API to integrate TaskOn into your application with ease.

## Core Class

### TaskOnEmbed

The main embed component class responsible for managing the iframe and user interactions.

```typescript
import { TaskOnEmbed } from "@taskon/embed";

const embed = new TaskOnEmbed({
  baseUrl: "https://yourdomain.com",
  containerElement: "#taskon-container",
  oauthToolUrl: "https://generalauthservice.com", // optional
});

// Initialize
await embed.init();

// Login
await embed.login({
  type: "Email",
  account: "user@example.com",
  signature: serverSignature,
  timestamp: Date.now(),
});

// Check login status
const isLoggedIn = await embed.getIsLoggedIn("Email", "user@example.com");

// Logout
await embed.logout();

// Clean up
embed.destroy();
```

[View detailed docs →](/api/taskon-embed)

## Analytics Function

### trackVisit()

Optional conversion analytics tracking (only use if needed).

```typescript
import { trackVisit } from "@taskon/embed";

// Only if you need TaskOn conversion rate analysis
await trackVisit(); // For anonymous users
// or
await trackVisit("Email", "user@example.com"); // For known users
```

[View Analytics API →](/api/analytics)

## Node.js Utilities

### signMessage()

Server-side signature generation for authentication.

```typescript
import { signMessage } from "@taskon/embed/node";

const { signature, timestamp } = signMessage(
  clientId,
  "Email", // or "evm" for wallet addresses
  account,
  privateKey
);
```

[View Server Utilities →](/api/utils)

## Type Definitions

The SDK ships with complete TypeScript type definitions:

```typescript
import type {
  TaskOnEmbedConfig,
  LoginParams,
  AuthType,
  AuthUser,
  TaskOnEmbedEvents,
} from "@taskon/embed";
```

[View Type Definitions →](/api/types)

## Event Handling

The SDK extends EventEmitter for iframe communication:

```typescript
// Listen for authentication requirements
embed.on("loginRequired", () => {
  console.log("User authentication required");
  // Trigger your login flow
});

// Listen for route changes
embed.on("routeChanged", fullPath => {
  console.log("Route changed to:", fullPath);
  // Optional: Sync with external URL
});
```

## Quick Navigation

| Feature        | API                                   | Description                       |
| -------------- | ------------------------------------- | --------------------------------- |
| **Initialize** | `new TaskOnEmbed(config)`             | Create embed instance             |
|                | `embed.init()`                        | Initialize iframe                 |
| **Auth**       | `embed.login(params)`                 | User authentication               |
|                | `embed.logout()`                      | User logout                       |
|                | `embed.getIsLoggedIn(type, account)`  | Check login status                |
| **Navigation** | `embed.setRoute(path)`                | Set internal route                |
|                | `embed.currentRoute`                  | Get current route                 |
| **Management** | `embed.updateSize(width, height)`     | Update iframe size                |
|                | `embed.destroy()`                     | Clean up resources                |
| **Events**     | `embed.on('loginRequired', handler)`  | Listen for auth requirements      |
|                | `embed.on('routeChanged', handler)`   | Listen for route changes          |
| **Analytics**  | `trackVisit(type?, account?)`         | Conversion tracking (optional)    |
| **Server**     | `signMessage(id, type, account, key)` | Generate authentication signature |

## Complete Example

```typescript
import { TaskOnEmbed, trackVisit } from "@taskon/embed";

// Optional: Track page visit for conversion analytics
// await trackVisit(); // For anonymous users

// Create instance
const embed = new TaskOnEmbed({
  baseUrl: "https://yourdomain.com",
  containerElement: "#taskon-container",
  oauthToolUrl: "https://generalauthservice.com", // optional
});

// Initialize
await embed.init();

// Set up event listeners
embed.on("loginRequired", async () => {
  // Trigger your login flow when TaskOn requires authentication
  console.log("Authentication required");
});

embed.on("routeChanged", fullPath => {
  console.log("Route changed to:", fullPath);
  // Optional: Sync with your external URL
});

// Login when user authenticates in your system
const email = "user@example.com";
const isLoggedIn = await embed.getIsLoggedIn("Email", email);

if (!isLoggedIn) {
  // Get signature from your server
  const { signature, timestamp } = await getServerSignature(email);

  await embed.login({
    type: "Email",
    account: email,
    signature,
    timestamp,
  });
}

// Logout when needed
// await embed.logout();

// Clean up when component unmounts
// embed.destroy();
```

## Learn More

- [Getting Started Guide](/guide/getting-started) - Complete integration walkthrough
- [Authentication Guide](/guide/authentication) - Authentication implementation details
- [Configuration Options](/guide/configuration) - All configuration options
- [Examples](/examples/) - Working code examples
