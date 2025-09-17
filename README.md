# TaskOn Embed SDK

A TypeScript SDK for embedding TaskOn widgets into your website with iframe integration and seamless authentication.

## Features

- 🎯 **Easy Integration**: Simple iframe-based embedding
- 🔐 **Multiple Auth Methods**: Support for email and EVM wallet authentication
- 📊 **Analytics Tracking**: Built-in visit tracking with session management
- 🔧 **TypeScript**: Full type safety and IntelliSense support
- ⚡ **Lightweight**: Minimal bundle size with tree-shaking support
- 🔄 **Event-driven**: Built-in EventEmitter for handling iframe communication
- 🔗 **OAuth Support**: Built-in OAuth integration for social logins
- 🎨 **White-label Ready**: Perfect for custom branding and domain integration

## Installation

```bash
npm install @taskon/embed
```

## Quick Start

### Basic Setup

```typescript
import { TaskOnEmbed, trackVisit } from "@taskon/embed";

// Optional: Track page visits for TaskOn conversion analytics
// Only use if you need conversion rate analysis
await trackVisit(); // For anonymous users
// or
await trackVisit("Email", "user@example.com"); // For known users

// Initialize the embed widget
const embed = new TaskOnEmbed({
  baseUrl: "https://taskon.xyz", // or your white-label domain
  containerElement: "#taskon-container", // CSS selector or HTMLElement
  width: "100%", // optional
  height: "100%", // optional
});

// Initialize the iframe
await embed.init();

// Set up event listeners
embed.on("loginRequired", () => {
  // Triggered when iframe requires user authentication
  // Implement your login flow here
  console.log("User needs to log in");
});

embed.on("routeChanged", fullPath => {
  // Triggered when iframe internal route changes
  // Sync with your external URL routing if needed
  console.log("Route changed:", fullPath);
  // Example: window.history.replaceState(null, '', `/embed${fullPath}`);
});
```

### Email Authentication

```typescript
// Check if user has valid authorization cache
const isAuthorized = await embed.isAuthorized("Email", "user@example.com");

if (!isAuthorized) {
  // Generate signature using your backend
  const { signature, timestamp } =
    await generateServerSignature("user@example.com");
  // First time login - signature required
  await embed.login({
    type: "Email",
    account: "user@example.com",
    signature,
    timestamp,
  });
} else {
  // User has valid auth cache - no signature needed
  await embed.login({
    type: "Email",
    account: "user@example.com",
  });
}
```

### EVM Wallet Authentication

````typescript
async function connectWallet() {
  if (typeof window.ethereum !== "undefined") {
    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const address = accounts[0];

      // Check if wallet has valid authorization cache
      const isAuthorized = await embed.isAuthorized("WalletAddress", address);

      if (!isAuthorized) {
        // Generate signature using your backend
        const { signature, timestamp } = await generateServerSignature(address);

        // First time login - signature required
        await embed.login({
          type: "WalletAddress",
          account: address,
          signature,
          timestamp,
          provider: window.ethereum, // Required for wallet operations
        });
      } else {
        // Has valid auth cache - no signature needed
        await embed.login({
          type: "WalletAddress",
          account: address,
          provider: window.ethereum,
        });
      }

      console.log("Wallet login successful!");
    } catch (error) {
      console.error("Wallet connection failed:", error);
    }
  }
}

## API Reference

### TaskOnEmbed

Main class for embedding TaskOn widgets.

#### Constructor

```typescript
new TaskOnEmbed(config: TaskOnEmbedConfig)
````

#### Configuration Options

```typescript
interface TaskOnEmbedConfig {
  baseUrl: string; // TaskOn service URL (required)
  containerElement: string | HTMLElement; // Container for the iframe (required)
  width?: string | number; // Width of the iframe (optional)
  height?: string | number; // Height of the iframe (optional)
  oauthToolUrl?: string; // OAuth tool URL for social logins (optional)
}
```

#### Methods

```typescript
// Initialization
init(): Promise<void> // Initialize the iframe

// Authentication
login(request: LoginParams): Promise<void> // Login with email or EVM wallet (supports cross-account switching)
logout(options?: LogoutOptions): Promise<void> // Logout with optional auth cache control
isAuthorized(authType: AuthType, account: string): Promise<boolean> // Check authorization status

// Navigation
setRoute(fullPath: string): Promise<void> // Set iframe internal route
get currentRoute(): string // Get current iframe route

// UI Management
updateSize(width?: string | number, height?: string | number): void // Update iframe size
destroy(): void // Destroy the instance and clean up resources
```

#### Event Handling

The SDK extends EventEmitter and supports these events:

```typescript
// Login required event - triggered when iframe needs user authentication
embed.on("loginRequired", () => {
  console.log("User authentication required");
  // Implement your login flow:
  // 1. Show login modal/form
  // 2. Get user credentials
  // 3. Call embed.login() with proper signature
});

// Route changed event - triggered when iframe internal route changes
embed.on("routeChanged", (fullPath: string) => {
  console.log("Internal route changed to:", fullPath);
  // Optional: Sync with external URL routing
  // window.history.replaceState(null, '', `/embed${fullPath}`);
});

// Task completed event - triggered when user completes a task
embed.on("taskCompleted", data => {
  console.log("Task completed:", data);
  // data contains: { taskId, taskName, templateId, rewards[] }

  // Display rewards (if any)
  if (data.rewards.length > 0) {
    data.rewards.forEach(reward => {
      console.log(`You earned: ${reward.rewardDescription}`);
    });
  } else {
    console.log("Task completed without rewards");
  }

  // Optional: Track completion or update application state
  // analytics.track('task_completed', data);
});
```

#### Types

```typescript
type AuthType = "Email" | "WalletAddress";

interface LoginParams {
  type: AuthType;
  account: string; // Email address or EVM address
  signature?: string; // Optional when user is authorized (isAuthorized = true)
  timestamp?: number; // Timestamp for signature validation
  username?: string; // Default username for new users
  provider?: any; // EIP-1193 compatible provider (required for WalletAddress)
}

interface LogoutOptions {
  clearAuth?: boolean; // Whether to clear authorization cache (default: false)
  // false: Keep auth cache for quick re-login (recommended)
  // true: Complete logout, clear all auth cache
}

interface AuthUser {
  id: string;
  type: AuthType;
  account: string;
  signature?: string;
  timestamp?: number;
}
```

### Analytics Functions

```typescript
// Track page visits for TaskOn conversion analytics (optional)
// Only use if you need conversion rate analysis
trackVisit(loginType?: AuthType, account?: string): Promise<boolean>

// Usage examples (only if you need conversion analytics):
// For anonymous users (call on page load)
await trackVisit();

// For known users (call on page load with user info)
await trackVisit("Email", "user@example.com");
await trackVisit("WalletAddress", "0x1234...");
```

### Node.js Utilities

```typescript
// Server-side signature generation (Node.js only)
import { signMessage } from "@taskon/embed/node";

const { signature, timestamp } = signMessage(
  clientId,
  "Email", // or "evm" for wallet addresses
  account,
  privateKey
);
```

## TypeScript Support

The SDK is written in TypeScript and provides full type definitions:

```typescript
import type {
  TaskOnEmbedConfig,
  LoginParams,
  AuthType,
  AuthUser,
  TaskOnEmbedEvents,
} from "@taskon/embed";
```

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## License

MIT License

## Support

For questions and support, please contact [support@taskon.xyz](mailto:support@taskon.xyz)
