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
    title: Analytics
    details: Built-in visit tracking and task completion statistics to help business decisions
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

// Optional: conversion analytics. If you need conversion stats,
// call this on every visit to your own pages; otherwise, you can skip it.
trackVisit({
  client_id: "your-client-id",
  sns_type: "email",
  sns_id: "user@example.com",
});

// Initialize
const embed = new TaskOnEmbed({
  clientId: "your-client-id",
  baseUrl: "https://yourtaskondomain.com",
  containerElement: "#taskon-container",
});

// get signature from your server
const { signature, timestamp } = getSignature();

await embed.login({
  type: "email",
  value: "user@example.com",
  signature,
  timestamp,
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
