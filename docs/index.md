---
layout: home

hero:
  name: "TaskOn Embed SDK"
  text: "White-label TaskOn Service SDK"
  tagline: Simple and fast integration of TaskOn into your website
  image:
    src: /logo-large.svg
    alt: TaskOn Embed
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: View Examples
      link: /examples/

features:
  - icon: 🎯
    title: Easy Integration
    details: iframe-based embedding approach, integration in just a few lines of code
  - icon: 🔐
    title: Multiple Authentication
    details: Support for both email and EVM wallet authentication to meet different user needs
  - icon: 📊
    title: Conversion Analytics
    details: Optional visit tracking for conversion rate analysis (only use if needed)
  - icon: 🔧
    title: TypeScript
    details: Complete type definitions and documentation for the best developer experience
  - icon: ⚡
    title: Lightweight & Fast
    details: Only 4.36KB after compression, does not affect page loading performance
  - icon: 🛡️
    title: Secure & Reliable
    details: Secure cross-domain communication and comprehensive error handling mechanisms
---

## Quick Preview

```typescript
import { TaskOnEmbed, trackVisit } from "@taskon/embed";

// Optional: Track page visits for TaskOn conversion analytics
// Only use if you need conversion rate analysis
await trackVisit(); // For anonymous users
// or
await trackVisit("Email", "user@example.com"); // For known users

// Initialize
const embed = new TaskOnEmbed({
  baseUrl: "https://yourtaskondomain.com",
  containerElement: "#taskon-container",
  oauthToolUrl: "https://generalauthservice.com", // optional
});

// Initialize the iframe
await embed.init();

// Handle login requirement
embed.on("loginRequired", async () => {
  // Get signature from your server
  const { signature, timestamp } = await getSignature();

  await embed.login({
    type: "Email",
    account: "user@example.com",
    signature,
    timestamp,
  });
});

// Handle route changes
embed.on("routeChanged", fullPath => {
  // Sync internal route with external URL if needed
  console.log("Route changed:", fullPath);
});

// Logout
embed.logout();

// Remove the iframe and all status.
embed.destroy();
```

## Why Choose TaskOn Embed SDK?

- **🚀 Quick Deployment** - No complex configuration, integration completed in minutes
- **🎨 Seamless Integration** - Adapts to parent container size, perfectly fits into your design
- **📱 Cross-platform Support** - Supports all modern browsers and mobile devices
- **🔄 Real-time Sync** - Automatically syncs login status and task completion status
- **📈 Business Growth** - Improve user engagement and retention through task system

## Get Started Now

<div class="vp-doc">

[Install SDK](/guide/installation){ .vp-button .vp-button-brand }
[View Examples](/examples/){ .vp-button }

</div>
