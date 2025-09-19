# Language Switching

TaskOn Embed SDK supports multiple languages and provides both initial language configuration and dynamic language switching capabilities.

## Supported Languages

- `en` - English (default)
- `ko` - Korean (한국어)
- `ja` - Japanese (日本語)
- `ru` - Russian (Русский)
- `es` - Spanish (Español)

## Initial Language Setup

Set the initial language when creating the embed instance:

```typescript
import { TaskOnEmbed } from "@taskon/embed";

const embed = new TaskOnEmbed({
  baseUrl: "https://taskon.xyz",
  containerElement: "#taskon-container",
  language: "ko", // Start with Korean
});

await embed.init();
```

## Dynamic Language Switching

Change the language after initialization using the `setLanguage()` method:

```typescript
// Switch to Japanese
await embed.setLanguage("ja");

// Switch to Spanish
await embed.setLanguage("es");

// Unsupported languages fallback to English
await embed.setLanguage("fr"); // Falls back to "en"
```

## Language Switcher Example

Basic language switching implementation:

```typescript
// Initialize with default language
const embed = new TaskOnEmbed({
  baseUrl: "https://taskon.xyz",
  containerElement: "#taskon-container",
  language: "en",
});

await embed.init();

// Language switching function
const switchLanguage = async (language: string) => {
  try {
    await embed.setLanguage(language);
    console.log(`Language switched to: ${language}`);

    // Optional: Store user preference
    localStorage.setItem("preferred-language", language);
  } catch (error) {
    console.error("Failed to switch language:", error);
  }
};

// Usage examples
await switchLanguage("ko"); // Switch to Korean
await switchLanguage("ja"); // Switch to Japanese
```

## React Integration

Basic React integration with language switching:

```tsx
import React, { useState, useEffect, useRef } from "react";
import { TaskOnEmbed } from "@taskon/embed";

const TaskOnEmbedComponent: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const embedRef = useRef<TaskOnEmbed | null>(null);
  const [currentLanguage, setCurrentLanguage] = useState("en");

  useEffect(() => {
    if (!containerRef.current) return;

    const embed = new TaskOnEmbed({
      baseUrl: "https://taskon.xyz",
      containerElement: containerRef.current,
      language: currentLanguage,
    });

    embed.init().then(() => {
      embedRef.current = embed;
    });

    return () => {
      embed.destroy();
    };
  }, [currentLanguage]);

  const changeLanguage = async (language: string) => {
    if (embedRef.current) {
      await embedRef.current.setLanguage(language);
    }
    setCurrentLanguage(language);
  };

  return (
    <div>
      <button onClick={() => changeLanguage("ko")}>한국어</button>
      <button onClick={() => changeLanguage("ja")}>日本語</button>
      <div ref={containerRef} style={{ width: "100%", height: "600px" }} />
    </div>
  );
};
```

## Vue Integration

Basic Vue integration with language switching:

```vue
<template>
  <div>
    <button @click="changeLanguage('ko')">한국어</button>
    <button @click="changeLanguage('ja')">日本語</button>
    <div ref="containerRef" class="taskon-container"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from "vue";
import { TaskOnEmbed } from "@taskon/embed";

const containerRef = ref<HTMLDivElement>();
const embedRef = ref<TaskOnEmbed | null>(null);
const currentLanguage = ref("en");

const initializeEmbed = async () => {
  if (!containerRef.value) return;

  const embed = new TaskOnEmbed({
    baseUrl: "https://taskon.xyz",
    containerElement: containerRef.value,
    language: currentLanguage.value,
  });

  await embed.init();
  embedRef.value = embed;
};

const changeLanguage = async (language: string) => {
  if (embedRef.value) {
    await embedRef.value.setLanguage(language);
  }
  currentLanguage.value = language;
};

onMounted(initializeEmbed);
onUnmounted(() => embedRef.value?.destroy());
</script>

<style scoped>
.taskon-container {
  width: 100%;
  height: 600px;
  border: 1px solid #eee;
  border-radius: 8px;
}
</style>
```

## Next Steps

- Learn about [Authentication](/guide/authentication) to handle user login
- Explore [Configuration](/guide/configuration) for other customization options
- Check the [API Reference](/api/taskon-embed) for complete method documentation
