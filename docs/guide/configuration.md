# Configuration

TaskOn Embed SDK provides flexible configuration options for seamless integration.

## Configuration Interface

```typescript
interface TaskOnEmbedConfig {
  /** Base URL of the TaskOn service */
  baseUrl: string;
  /** CSS selector string or HTMLElement where the embed should be rendered */
  containerElement: string | HTMLElement;
  /** Width of the embed iframe (CSS units or pixel number) - default: '100%' */
  width?: string | number;
  /** Height of the embed iframe (CSS units or pixel number) - default: '100%' */
  height?: string | number;
  /** OAuth tool URL for handling OAuth in white-label mode (default: 'https://generalauthservice.com') */
  oauthToolUrl?: string;
  /** Language to use when loading the embed. Common values: 'en', 'ko', 'ru', 'es', 'ja' */
  language?: string;
}
```

## Required Configuration

### baseUrl

The base URL of your TaskOn service or white-label domain.

```typescript
const embed = new TaskOnEmbed({
  baseUrl: "https://taskon.xyz", // Production
  containerElement: "#container",
});

// Or for staging/custom domain
const embed = new TaskOnEmbed({
  baseUrl: "https://staging.taskon.xyz",
  containerElement: "#container",
});
```

### containerElement

Specify the container element for embedding TaskOn iframe, can be a CSS selector string or HTMLElement object.

```typescript
// Using CSS selector
const embed = new TaskOnEmbed({
  baseUrl: "https://taskon.xyz",
  containerElement: "#taskon-container", // Recommended
});

// Using DOM element
const container = document.getElementById("taskon-container");
const embed = new TaskOnEmbed({
  baseUrl: "https://taskon.xyz",
  containerElement: container,
});
```

## Optional Configuration

### width and height

Customize the iframe dimensions. Supports CSS units or pixel numbers.

```typescript
const embed = new TaskOnEmbed({
  baseUrl: "https://taskon.xyz",
  containerElement: "#container",
  width: "100%", // Default
  height: 600, // Pixel number
});

// Responsive sizing
const embed = new TaskOnEmbed({
  baseUrl: "https://taskon.xyz",
  containerElement: "#container",
  width: "100%",
  height: "70vh", // 70% of viewport height
});
```

### language

Set the initial language for the embed interface. TaskOn supports multiple languages including English, Korean, Japanese, Russian, and Spanish.

```typescript
const embed = new TaskOnEmbed({
  baseUrl: "https://taskon.xyz",
  containerElement: "#container",
  language: "ko", // Korean
});

// Common language codes
const embed = new TaskOnEmbed({
  baseUrl: "https://taskon.xyz",
  containerElement: "#container",
  language: "ja", // Japanese
});
```

**Supported Languages:**

- `en` - English (default)
- `ko` - Korean (한국어)
- `ja` - Japanese (日本語)
- `ru` - Russian (Русский)
- `es` - Spanish (Español)

### oauthToolUrl

For white-label deployments, specify a custom OAuth service URL.

```typescript
const embed = new TaskOnEmbed({
  baseUrl: "https://your-domain.com",
  containerElement: "#container",
  oauthToolUrl: "https://oauth.your-domain.com", // Custom OAuth service
});
```

## Event Handling

Events are handled using the `.on()` method after initialization. See the [API documentation](/api/taskon-embed) for available events.

```typescript
const embed = new TaskOnEmbed({
  baseUrl: "https://taskon.xyz",
  containerElement: "#container",
});

await embed.init();

// Handle login requests
embed.on("loginRequired", () => {
  console.log("User needs to login");
  // Implement your login flow
});

// Handle task completion
embed.on("taskCompleted", data => {
  console.log("Task completed:", data);
});
```

## Container Style Recommendations

For best display results, it's recommended to set appropriate styles for the container:

```css
#taskon-container {
  width: 100%;
  height: 600px; /* Recommended minimum height */
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

/* Responsive design */
@media (max-width: 768px) {
  #taskon-container {
    height: 500px;
  }
}
```

## Complete Configuration Example

```typescript
import { TaskOnEmbed } from "@taskon/embed";

// Initialize with full configuration
const embed = new TaskOnEmbed({
  // Required configuration
  baseUrl: "https://taskon.xyz",
  containerElement: "#taskon-container",

  // Optional configuration
  width: "100%",
  height: 600,
  language: "ko", // Korean interface
  oauthToolUrl: "https://oauth.taskon.xyz",
});

// Initialize the embed
await embed.init();

// Set up event listeners
embed.on("loginRequired", () => {
  console.log("Login required");
  // Handle user authentication
});

embed.on("taskCompleted", data => {
  console.log(`Task ${data.taskId} completed!`, data);

  // Send custom analytics
  analytics.track("task_completed", {
    task_id: data.taskId,
    task_name: data.taskName,
    rewards: data.rewards,
  });

  // Show celebration
  showCelebration();
});

embed.on("routeChanged", fullPath => {
  console.log("Route changed to:", fullPath);
  // Optional: sync with browser history
});
```

## Configuration Validation

SDK automatically validates configuration parameters and throws appropriate errors if configuration is incorrect:

```typescript
try {
  const embed = new TaskOnEmbed({
    baseUrl: "", // Empty baseUrl
    containerElement: "#non-existent", // Non-existent element
  });
} catch (error) {
  console.error("Configuration error:", error.message);
}
```

## Next Steps

After configuration is complete, learn how to perform [user authentication](/guide/authentication).
