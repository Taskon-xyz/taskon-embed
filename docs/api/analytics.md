# Conversion Analytics

The TaskOn Embed SDK provides optional conversion analytics tracking. **Only use this feature if you need TaskOn conversion rate analysis.** Call `trackVisit()` on page load for conversion tracking - this is unrelated to login success.

## trackVisit()

Track page visits for TaskOn conversion analytics (optional feature).

```typescript
trackVisit(loginType?: AuthType, account?: string): Promise<boolean>
```

### Parameters

- `loginType?: AuthType` - Optional authentication type ("Email" or "WalletAddress")
- `account?: string` - Optional user account (email address or wallet address)

### Returns

- `Promise<boolean>` - Returns `true` if tracking was successful, `false` otherwise

### Examples

#### Track Page Visits (Optional)

Only use if you need TaskOn conversion rate analysis:

```typescript
import { trackVisit } from "@taskon/embed";

// Only if you need conversion analytics:
// For anonymous users (call on page load)
await trackVisit();

// For known users (call on page load with user info)
await trackVisit("Email", "user@example.com");
await trackVisit("WalletAddress", "0x1234567890abcdef...");

// Note: This is optional and only for conversion tracking
```

#### Integration Example

```typescript
import { TaskOnEmbed, trackVisit } from "@taskon/embed";

// Optional: Track page visit for conversion analytics
// Only use if you need conversion rate analysis
// await trackVisit(); // For anonymous users
// or
// await trackVisit('Email', 'user@example.com'); // For known users

const embed = new TaskOnEmbed({
  baseUrl: "https://yourdomain.com",
  containerElement: "#taskon-container",
});

await embed.init();

// Handle authentication requirement (separate from analytics)
embed.on("loginRequired", async () => {
  const email = "user@example.com";

  await embed.login({
    type: "Email",
    account: email,
    signature: await getSignature(email),
    timestamp: Date.now(),
  });
});
```

## Session Management

The analytics system automatically manages user sessions:

- **Session ID**: A unique identifier is generated and stored in `localStorage` as `taskon_session_id`
- **Session Persistence**: Sessions persist across page reloads and browser sessions
- **Automatic Generation**: If no session ID exists, one is automatically created

### Session ID Format

```
sess_[random16chars]_[timestamp]
```

Example: `sess_8k2n9p4q7r3s6t1u_1a2b3c4d`

## API Endpoint

The tracking function sends data to:

```
https://white-label-api-stage.taskon.xyz/whiteLabel/v1/pageVisitCount
```

### Request Headers

- `Content-Type: application/json`
- `session-id: [generated-session-id]`

### Request Body

```typescript
{
  sns_id_or_address?: string;  // User account (optional)
  login_type?: AuthType;       // Authentication type (optional)
}
```

## Error Handling

The tracking function includes built-in error handling:

```typescript
try {
  const success = await trackVisit("Email", "user@example.com");
  if (success) {
    console.log("Visit tracked successfully");
  } else {
    console.log("Visit tracking failed");
  }
} catch (error) {
  console.error("Tracking error:", error);
}
```

## Best Practices

### 1. Use Only When Needed

```typescript
// Only use trackVisit if you need TaskOn conversion analytics
// await trackVisit(); // For anonymous users
// await trackVisit('Email', userEmail); // For known users

// Note: This is an optional feature for conversion rate analysis
// Do NOT call trackVisit on login success or user actions
```

### 2. Handle Errors Gracefully

```typescript
const trackUserVisit = async (type: AuthType, account: string) => {
  try {
    await trackVisit(type, account);
  } catch (error) {
    // Don't break user experience if tracking fails
    console.warn("Analytics tracking failed:", error);
  }
};
```

### 3. Respect User Privacy

The tracking system is designed with privacy in mind:

- Only tracks data you explicitly provide
- No automatic collection of sensitive information
- Session IDs are generated locally and can be cleared by users

## Integration Examples

### React Hook

```typescript
import { useEffect } from "react";
import { trackVisit } from "@taskon/embed";

export const useAnalytics = (user?: { type: AuthType; account: string }) => {
  useEffect(() => {
    if (user) {
      trackVisit(user.type, user.account);
    } else {
      trackVisit();
    }
  }, [user]);
};
```

### Vue Composable

```typescript
import { watch } from "vue";
import { trackVisit } from "@taskon/embed";

export const useAnalytics = (
  user: Ref<{ type: AuthType; account: string } | null>
) => {
  watch(
    user,
    newUser => {
      if (newUser) {
        trackVisit(newUser.type, newUser.account);
      } else {
        trackVisit();
      }
    },
    { immediate: true }
  );
};
```
