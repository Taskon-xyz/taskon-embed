# Examples

Here are various usage examples of TaskOn Embed SDK to help you get started quickly and solve common problems.

## Basic Examples

### Simplest Integration

```html
<!DOCTYPE html>
<html>
  <head>
    <title>TaskOn Embed Demo</title>
  </head>
  <body>
    <div id="taskon-container" style="width: 100%; height: 600px;"></div>

    <script type="module">
      import { TaskOnEmbed } from "https://unpkg.com/@taskon/embed@latest/dist/embed.js";

      const embed = new TaskOnEmbed({
        client_id: "demo-client-123",
        parentElement: "#taskon-container",
      });
    </script>
  </body>
</html>
```

### Complete Example with Login

```html
<!DOCTYPE html>
<html>
  <head>
    <title>TaskOn Embed with Login</title>
    <style>
      .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px;
      }
      .controls {
        margin-bottom: 20px;
      }
      .controls button {
        margin-right: 10px;
        padding: 10px 20px;
      }
      #taskon-container {
        width: 100%;
        height: 600px;
        border: 1px solid #ddd;
        border-radius: 8px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>TaskOn Embed Demo</h1>

      <div class="controls">
        <input
          type="email"
          id="email"
          placeholder="Enter email"
          value="demo@example.com"
        />
        <button onclick="loginWithEmail()">Email Login</button>
        <button onclick="loginWithWallet()">Wallet Login</button>
        <button onclick="logout()">Logout</button>
      </div>

      <div id="status"></div>

      <div id="taskon-container"></div>
    </div>

    <script type="module">
      import {
        TaskOnEmbed,
        trackVisit,
      } from "https://unpkg.com/@taskon/embed@latest/dist/embed.js";

      let embed = null;

      // Initialize
      function init() {
        embed = new TaskOnEmbed({
          client_id: "demo-client-123",
          parentElement: "#taskon-container",
          allowSwitchNetwork: true,
          onConnect: () => {
            showStatus("Please connect your wallet", "info");
          },
          onVerifyTaskSuccess: (taskId, taskData) => {
            showStatus(`Congratulations! Task ${taskId} completed`, "success");
          },
        });

        // Wait for ready
        const checkReady = () => {
          if (embed.isReady()) {
            showStatus("TaskOn is ready", "success");
          } else {
            setTimeout(checkReady, 100);
          }
        };
        checkReady();
      }

      // Email login
      window.loginWithEmail = async () => {
        const email = document.getElementById("email").value;
        if (!email) {
          showStatus("Please enter email", "error");
          return;
        }

        try {
          await embed.login({
            sns_type: "email",
            sns_id: email,
          });
          showStatus("Email login successful", "success");

          // Track login
          trackVisit({
            client_id: "demo-client-123",
            sns_type: "email",
            sns_id: email,
          });
        } catch (error) {
          showStatus(`Login failed: ${error.message}`, "error");
        }
      };

      // Wallet login
      window.loginWithWallet = async () => {
        if (typeof window.ethereum === "undefined") {
          showStatus("Wallet not detected, please install MetaMask", "error");
          return;
        }

        try {
          // Connect wallet
          const accounts = await window.ethereum.request({
            method: "eth_requestAccounts",
          });
          const address = accounts[0];

          // Get chain ID
          const chainId = await window.ethereum.request({
            method: "eth_chainId",
          });

          // Sign
          const message = `Login to TaskOn at ${Date.now()}`;
          const signature = await window.ethereum.request({
            method: "personal_sign",
            params: [message, address],
          });

          // Login
          await embed.login({
            sns_type: "evm",
            sns_id: address,
            signature,
            message,
            chainId: parseInt(chainId, 16),
          });

          showStatus("Wallet login successful", "success");

          // Track login
          trackVisit({
            client_id: "demo-client-123",
            sns_type: "evm",
            sns_id: address,
          });
        } catch (error) {
          showStatus(`Wallet login failed: ${error.message}`, "error");
        }
      };

      // Logout
      window.logout = async () => {
        try {
          await embed.logout();
          showStatus("Logged out", "info");
        } catch (error) {
          showStatus(`Logout failed: ${error.message}`, "error");
        }
      };

      // Show status
      function showStatus(message, type = "info") {
        const status = document.getElementById("status");
        status.textContent = message;
        status.className = `status ${type}`;

        // Clear after 3 seconds
        setTimeout(() => {
          status.textContent = "";
          status.className = "";
        }, 3000);
      }

      // Initialize after page load
      init();
    </script>

    <style>
      .status {
        padding: 10px;
        margin: 10px 0;
        border-radius: 4px;
        font-weight: bold;
      }
      .status.success {
        background: #d4edda;
        color: #155724;
        border: 1px solid #c3e6cb;
      }
      .status.error {
        background: #f8d7da;
        color: #721c24;
        border: 1px solid #f5c6cb;
      }
      .status.info {
        background: #d1ecf1;
        color: #0c5460;
        border: 1px solid #bee5eb;
      }
    </style>
  </body>
</html>
```

## Framework Integration Examples

### React Component

[View React Integration Example →](/examples/react)

### Vue Component

[View Vue Integration Example →](/examples/vue)

## Authentication Examples

### Email Authentication

[View Email Login Example →](/examples/email-auth)

### Wallet Authentication

[View Wallet Login Example →](/examples/wallet-auth)

## Advanced Examples

### Error Handling

[View Error Handling Example →](/examples/error-handling)

### Custom Styling

```css
/* Custom container styling */
.taskon-embed-container {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 4px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.taskon-embed-container iframe {
  border-radius: 8px;
  background: white;
}

/* Responsive design */
@media (max-width: 768px) {
  .taskon-embed-container {
    height: 500px;
    margin: 10px;
  }
}
```

### Multi-instance Management

```javascript
class TaskOnManager {
  constructor() {
    this.instances = new Map();
  }

  createEmbed(id, config) {
    const embed = new TaskOnEmbed(config);
    this.instances.set(id, embed);
    return embed;
  }

  destroyEmbed(id) {
    const embed = this.instances.get(id);
    if (embed) {
      embed.destroy();
      this.instances.delete(id);
    }
  }

  destroyAll() {
    this.instances.forEach(embed => embed.destroy());
    this.instances.clear();
  }
}

// Usage
const manager = new TaskOnManager();

const embed1 = manager.createEmbed("main", {
  client_id: "client-1",
  parentElement: "#container-1",
});

const embed2 = manager.createEmbed("sidebar", {
  client_id: "client-2",
  parentElement: "#container-2",
});
```

## Debugging Tips

### Enable Debug Logs

```javascript
// Enable detailed logging in browser console
localStorage.setItem("TASKON_DEBUG", "true");

// Refresh page to see detailed debug information
location.reload();
```

### Monitor All Events

```javascript
const embed = new TaskOnEmbed({
  client_id: "your-client-id",
  parentElement: "#container",
  onConnect: () => console.log("🔗 Connect event"),
  onVerifyTaskSuccess: (taskId, data) => {
    console.log("✅ Task success:", { taskId, data });
  },
});

// Monitor login status changes
setInterval(() => {
  const session = embed.getUserSession();
  console.log("👤 User status:", session);
}, 5000);
```

## Performance Optimization

### Lazy Loading

```javascript
// Load TaskOn Embed only when needed
async function loadTaskOnEmbed() {
  const { TaskOnEmbed } = await import("@taskon/embed");
  return TaskOnEmbed;
}

// Load only on user interaction
document.getElementById("show-taskon").addEventListener("click", async () => {
  const TaskOnEmbed = await loadTaskOnEmbed();
  const embed = new TaskOnEmbed(config);
});
```

### Preloading

```html
<!-- Preload SDK -->
<link
  rel="modulepreload"
  href="https://unpkg.com/@taskon/embed@latest/dist/embed.js"
/>

<script type="module">
  // SDK loads quickly from cache
  import { TaskOnEmbed } from "@taskon/embed";
</script>
```

## Download Examples

You can download these examples to run locally:

- [Basic Example (basic.html)](./downloads/basic.html)
- [Complete Example (complete.html)](./downloads/complete.html)
- [React Example (react-example.zip)](./downloads/react-example.zip)
- [Vue Example (vue-example.zip)](./downloads/vue-example.zip)
