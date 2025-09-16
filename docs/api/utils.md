# Utility Functions

The TaskOn Embed SDK provides utility functions for server-side operations and signature generation.

## Node.js Utilities

For server-side signature generation, import from the Node.js specific entry point:

```typescript
import { signMessage } from "@taskon/embed/node";
```

### signMessage()

Generate cryptographic signatures for user authentication on the server side.

```typescript
signMessage(
  clientId: string,
  type: "Email" | "evm",
  account: string,
  privateKey: string
): {
  signature: string;
  timestamp: number;
}
```

#### Parameters

- `clientId: string` - Your TaskOn client identifier
- `type: "Email" | "evm"` - Authentication type
  - `"Email"` - For email-based authentication
  - `"evm"` - For EVM wallet address authentication
- `account: string` - User account (email address or wallet address)
- `privateKey: string` - Base64-encoded RSA private key

#### Returns

An object containing:

- `signature: string` - Base64-encoded RSA-SHA256 signature
- `timestamp: number` - Unix timestamp when signature was created

#### Example

```typescript
import { signMessage } from "@taskon/embed/node";

// Email authentication signature
const emailAuth = signMessage(
  "your-client-id",
  "Email",
  "user@example.com",
  process.env.TASKON_PRIVATE_KEY
);

console.log(emailAuth);
// {
//   signature: "base64-encoded-signature...",
//   timestamp: 1703123456789
// }

// Wallet authentication signature
const walletAuth = signMessage(
  "your-client-id",
  "evm",
  "0x1234567890abcdef...",
  process.env.TASKON_PRIVATE_KEY
);
```

## Server Implementation Examples

### Express.js API Endpoint

```typescript
import express from "express";
import { signMessage } from "@taskon/embed/node";

const app = express();
app.use(express.json());

app.post("/api/auth/sign", (req, res) => {
  try {
    const { account, type } = req.body;

    if (!account || !type) {
      return res.status(400).json({ error: "Missing account or type" });
    }

    const clientId = process.env.TASKON_CLIENT_ID!;
    const privateKey = process.env.TASKON_PRIVATE_KEY!;

    const { signature, timestamp } = signMessage(
      clientId,
      type,
      account,
      privateKey
    );

    res.json({ signature, timestamp });
  } catch (error) {
    console.error("Signature generation failed:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(3000);
```

### Next.js API Route

```typescript
// pages/api/auth/sign.ts
import { NextApiRequest, NextApiResponse } from "next";
import { signMessage } from "@taskon/embed/node";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { account, type } = req.body;

    const clientId = process.env.TASKON_CLIENT_ID!;
    const privateKey = process.env.TASKON_PRIVATE_KEY!;

    const result = signMessage(clientId, type, account, privateKey);

    res.status(200).json(result);
  } catch (error) {
    console.error("Signature generation failed:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
```

### Serverless Function (Vercel)

```typescript
// api/auth/sign.ts
import { VercelRequest, VercelResponse } from "@vercel/node";
import { signMessage } from "@taskon/embed/node";

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { account, type } = req.body;

  try {
    const result = signMessage(
      process.env.TASKON_CLIENT_ID!,
      type,
      account,
      process.env.TASKON_PRIVATE_KEY!
    );

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: "Signature generation failed" });
  }
}
```

## Signature Algorithm

The signature generation uses the following algorithm:

1. **Message Formation**: `${type}|${account}|${clientId}|${timestamp}`
2. **Signing**: RSA-SHA256 signature using PKCS#1 format
3. **Encoding**: Base64 encoding of the signature

### Example Message

For email authentication:

```
Email|user@example.com|your-client-id|1703123456789
```

For wallet authentication:

```
evm|0x1234567890abcdef...|your-client-id|1703123456789
```

## Security Considerations

### Private Key Management

- **Never expose private keys** in client-side code
- Store private keys securely using environment variables
- Use different keys for development and production
- Rotate keys regularly

### Signature Validation

The TaskOn service validates signatures by:

1. Reconstructing the message using provided parameters
2. Verifying the RSA-SHA256 signature
3. Checking timestamp validity (typically within 5 minutes)

### Best Practices

```typescript
// ✅ Good - Server-side signature generation
app.post("/api/auth/sign", (req, res) => {
  const { account, type } = req.body;

  // Validate input
  if (!account || !["Email", "evm"].includes(type)) {
    return res.status(400).json({ error: "Invalid parameters" });
  }

  // Rate limiting
  if (rateLimitExceeded(req.ip)) {
    return res.status(429).json({ error: "Too many requests" });
  }

  const result = signMessage(clientId, type, account, privateKey);
  res.json(result);
});

// ❌ Bad - Client-side signature (security risk)
// Never do this - private keys must stay on server
const signature = signMessage(clientId, type, account, privateKey);
```

## Error Handling

```typescript
import { signMessage } from "@taskon/embed/node";

try {
  const result = signMessage(clientId, type, account, privateKey);
  console.log("Signature generated:", result);
} catch (error) {
  if (error.message.includes("Invalid private key")) {
    console.error("Private key format is invalid");
  } else if (error.message.includes("Invalid parameters")) {
    console.error("Missing or invalid parameters");
  } else {
    console.error("Unexpected error:", error);
  }
}
```

## Testing

### Unit Test Example

```typescript
import { signMessage } from "@taskon/embed/node";

describe("signMessage", () => {
  const clientId = "test-client-id";
  const privateKey = "base64-encoded-test-key";

  it("should generate valid signature for email", () => {
    const result = signMessage(
      clientId,
      "Email",
      "test@example.com",
      privateKey
    );

    expect(result).toHaveProperty("signature");
    expect(result).toHaveProperty("timestamp");
    expect(typeof result.signature).toBe("string");
    expect(typeof result.timestamp).toBe("number");
  });

  it("should generate different signatures for different accounts", () => {
    const result1 = signMessage(
      clientId,
      "Email",
      "user1@example.com",
      privateKey
    );
    const result2 = signMessage(
      clientId,
      "Email",
      "user2@example.com",
      privateKey
    );

    expect(result1.signature).not.toBe(result2.signature);
  });
});
```
