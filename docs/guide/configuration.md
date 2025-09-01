# Configuration

TaskOn Embed SDK provides simple configuration options focused on core functionality implementation.

## Configuration Interface

```typescript
interface TaskOnEmbedConfig {
  client_id: string; // Your TaskOn client ID (required)
  parentElement: string | HTMLElement; // Container element
  baseUrl?: string; // TaskOn platform URL
  allowSwitchNetwork?: boolean; // Allow network switching
  onConnect?: () => void; // Wallet connection callback
  onVerifyTaskSuccess?: (taskId: number, taskData?: any) => void; // Task completion callback
}
```

## Required Configuration

### client_id

Your TaskOn application client ID, obtained from [TaskOn Developer Console](https://taskon.xyz/developer).

```typescript
const taskOnEmbed = new TaskOnEmbed({
  client_id: "your-client-id", // Required
  parentElement: "#container",
});
```

### parentElement

Specify the container element for embedding TaskOn iframe, can be a CSS selector string or HTMLElement object.

```typescript
// Using CSS selector
const taskOnEmbed = new TaskOnEmbed({
  client_id: "your-client-id",
  parentElement: "#taskon-container", // Recommended
});

// Using DOM element
const container = document.getElementById("taskon-container");
const taskOnEmbed = new TaskOnEmbed({
  client_id: "your-client-id",
  parentElement: container,
});
```

## Optional Configuration

### baseUrl

Specify TaskOn platform URL, defaults to production environment.

```typescript
const taskOnEmbed = new TaskOnEmbed({
  client_id: "your-client-id",
  parentElement: "#container",
  baseUrl: "https://staging.taskon.xyz", // Staging environment
});
```

### allowSwitchNetwork

Whether to allow TaskOn to actively request network switching, defaults to `false`.

```typescript
const taskOnEmbed = new TaskOnEmbed({
  client_id: "your-client-id",
  parentElement: "#container",
  allowSwitchNetwork: true, // Allow network switching
});
```

## Event Callbacks

### onConnect

Triggered when user requests wallet connection inside TaskOn.

```typescript
const taskOnEmbed = new TaskOnEmbed({
  client_id: "your-client-id",
  parentElement: "#container",
  onConnect: () => {
    console.log("User requests wallet connection");
    // Handle wallet connection logic here
    connectWallet();
  },
});

async function connectWallet() {
  // Your wallet connection code
}
```

### onVerifyTaskSuccess

Triggered when user successfully completes task verification.

```typescript
const taskOnEmbed = new TaskOnEmbed({
  client_id: "your-client-id",
  parentElement: "#container",
  onVerifyTaskSuccess: (taskId, taskData) => {
    console.log(`Task ${taskId} completed!`);

    // Send custom analytics event
    analytics.track("task_completed", {
      task_id: taskId,
      points: taskData?.points,
    });

    // Show celebration animation
    showCelebration();
  },
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
import { TaskOnEmbed, trackVisit } from "@taskon/embed";

// Initialize configuration
const taskOnEmbed = new TaskOnEmbed({
  // Required configuration
  client_id: "your-client-id",
  parentElement: "#taskon-container",

  // Optional configuration
  baseUrl: "https://taskon.xyz",
  allowSwitchNetwork: true,

  // Event callbacks
  onConnect: () => {
    console.log("Wallet connection requested");
  },

  onVerifyTaskSuccess: (taskId, taskData) => {
    console.log(`Task ${taskId} verification successful`, taskData);

    // Send notification
    showNotification(`Congratulations on completing task ${taskId}!`);

    // Update user points
    updateUserPoints(taskData?.points);
  },
});
```

## Configuration Validation

SDK automatically validates configuration parameters and throws appropriate errors if configuration is incorrect:

```typescript
try {
  const taskOnEmbed = new TaskOnEmbed({
    client_id: "", // Empty client_id
    parentElement: "#non-existent", // Non-existent element
  });
} catch (error) {
  console.error("Configuration error:", error.message);
}
```

## Next Steps

After configuration is complete, learn how to perform [user authentication](/guide/authentication).
