# API Reference

The TaskOn Embed SDK provides a concise yet powerful API to integrate TaskOn into your application with ease.

## Core Class

### TaskOnEmbed

The main embed component class responsible for managing the iframe and user interactions.

```typescript
import { TaskOnEmbed } from "@taskon/embed";

const embed = new TaskOnEmbed(config);
```

[View detailed docs →](/api/taskon-embed)

## Utility Functions

### trackVisit()

Track user visits for conversion analytics.

```typescript
import { trackVisit } from "@taskon/embed";

await trackVisit({
  client_id: "your-client-id",
  sns_type: "email",
  sns_id: "user@example.com",
});
```

[View Analytics API →](/api/analytics)

### Validation Helpers

Input validation helper functions.

```typescript
import { isValidEmail, isValidEthAddress } from "@taskon/embed";

const emailValid = isValidEmail("user@example.com");
const addressValid = isValidEthAddress("0x...");
```

[View Utility Helpers →](/api/utils)

## Type Definitions

The SDK ships with complete TypeScript type definitions:

```typescript
import type { TaskOnEmbedConfig, UserSession, SnsType } from "@taskon/embed";
```

[View Type Definitions →](/api/types)

## Error Handling

The SDK provides a complete error handling mechanism:

```typescript
import {
  TaskOnEmbedError,
  isTaskOnEmbedError,
  ERROR_CODES,
} from "@taskon/embed";

try {
  await embed.login(credentials);
} catch (error) {
  if (isTaskOnEmbedError(error)) {
    console.log("Error code:", error.code);
  }
}
```

[View Error Handling →](/api/errors)

## Quick Navigation

| Feature | API                      | Description              |
| ------- | ------------------------ | ------------------------ |
| Init    | `new TaskOnEmbed()`      | Create an embed instance |
| Login   | `embed.login()`          | User authentication      |
| Logout  | `embed.logout()`         | User logout              |
| Session | `embed.getUserSession()` | Get user session         |
| Track   | `trackVisit()`           | Visit analytics          |

## Examples

### Basic Usage

```typescript
import { TaskOnEmbed, trackVisit } from "@taskon/embed";

// Create instance
const embed = new TaskOnEmbed({
  client_id: "your-client-id",
  parentElement: "#container",
  onVerifyTaskSuccess: taskId => {
    console.log(`Task ${taskId} completed`);
  },
});

// User login
await embed.login({
  sns_type: "email",
  sns_id: "user@example.com",
});

// Get user session
const session = embed.getUserSession();
console.log("Logged in:", session.isLoggedIn);
```

### Error Handling

```typescript
import { isTaskOnEmbedError, ERROR_CODES } from "@taskon/embed";

try {
  await embed.login(credentials);
} catch (error) {
  if (isTaskOnEmbedError(error)) {
    switch (error.code) {
      case ERROR_CODES.INVALID_EMAIL:
        showError("Invalid email format");
        break;
      case ERROR_CODES.IFRAME_NOT_READY:
        showError("The component isn't ready yet. Please retry later.");
        break;
      default:
        showError(error.message);
    }
  }
}
```

## Version

Docs version: `v0.1.0`

See the [CHANGELOG](https://github.com/taskon/embed-sdk/blob/main/CHANGELOG.md) for updates.
