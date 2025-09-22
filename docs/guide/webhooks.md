# Reward Distribution Webhook Service

TaskOn provides a secure webhook service to notify project parties when user rewards have been distributed. This service ensures that your application can respond promptly to completed tasks and reward distributions with proper authentication and user context.

## Overview

When a user receives a reward after task completion, TaskOn will make an authenticated HTTP POST request to your configured webhook endpoint to notify your project of the reward distribution. This allows you to update your internal systems, trigger additional workflows, or provide personalized user notifications.

**Important Notes:**

- The webhook is only triggered when users actually receive rewards
- Some tasks may not immediately distribute rewards upon submission (e.g., Proof of Work tasks requiring manual review)
- All webhook requests include proper authentication headers and user information
- TaskOn will retry failed requests up to 3 times, so ensure your endpoint handles idempotent requests

## Webhook Configuration

Project parties must provide a webhook endpoint URL that can receive reward distribution notifications. TaskOn will make HTTP POST requests to this endpoint when rewards are distributed.

## Authentication

All webhook requests are authenticated using API keys and HMAC signatures to ensure security and data integrity.

### Authentication Headers

TaskOn includes the following authentication headers in webhook requests:

- `X-API-Key`: Your unique API key identifier
- `X-Signature`: HMAC-SHA256 signature for request verification

### Signature Verification

The signature is generated using HMAC-SHA256 with your secret key and a payload containing `user_id` and `timestamp`:

```json
{
  "user_id": 11111,
  "timestamp": 1758251308
}
```

### Authentication Implementation Examples

**Important Note**: For signature verification to work correctly across different implementations, it's crucial that both TaskOn and your project use identical JSON serialization formats. The signature is generated using a JSON payload with `user_id` and `timestamp` fields in alphabetical order without extra spaces.

#### Go Implementation (Server Side)

**Signature Generation (TaskOn Implementation):**

```go
package main

import (
    "crypto/hmac"
    "crypto/sha256"
    "encoding/hex"
    "encoding/json"
    "fmt"
)

func main() {
    secretKey := "your-secret-key"
    h := hmac.New(sha256.New, []byte(secretKey))

    // Create payload with fixed key order to match Node.js JSON.stringify
    payload := map[string]interface{}{
        "user_id":   11111,
        "timestamp": 1758251308,
    }

    // Use consistent JSON formatting (no spaces, sorted keys)
    data, err := json.Marshal(payload)
    if err != nil {
        return
    }
    h.Write(data)
    signature := hex.EncodeToString(h.Sum(nil))
    fmt.Println("X-Signature:", signature)
}
```

**Signature Verification (Project Side):**

```go
func WebhookHandler(w http.ResponseWriter, r *http.Request) {
    apiKey := r.Header.Get("X-API-Key")
    signature := r.Header.Get("X-Signature")
    expectedApiKey := "your-expected-api-key"
    secretKey := "your-secret-key"

    // Verify API key
    if apiKey != expectedApiKey {
        http.Error(w, "Invalid API key", http.StatusUnauthorized)
        return
    }

    // Read request body
    body, err := io.ReadAll(r.Body)
    if err != nil {
        http.Error(w, "Invalid payload", http.StatusBadRequest)
        return
    }
    defer r.Body.Close()

    // Parse payload to extract user_id and timestamp
    var payload map[string]interface{}
    if err := json.Unmarshal(body, &payload); err != nil {
        http.Error(w, "Invalid JSON", http.StatusBadRequest)
        return
    }

    // Create signature payload with consistent key order
    signaturePayload := map[string]interface{}{
        "user_id":   payload["user_id"],
        "timestamp": payload["timestamp"],
    }

    // Generate expected signature with consistent JSON formatting
    h := hmac.New(sha256.New, []byte(secretKey))
    signatureData, err := json.Marshal(signaturePayload)
    if err != nil {
        http.Error(w, "JSON marshal error", http.StatusInternalServerError)
        return
    }
    h.Write(signatureData)
    expectedSignature := hex.EncodeToString(h.Sum(nil))

    // Verify signature
    if signature != expectedSignature {
        http.Error(w, "Invalid signature", http.StatusUnauthorized)
        return
    }

    // Process webhook payload
    // ... your business logic here ...

    // Return success response
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(http.StatusOK)
    json.NewEncoder(w).Encode(map[string]interface{}{
        "result": true,
        "error":  nil,
    })
}
```

#### Node.js Implementation (JavaScript)

```javascript
const crypto = require("crypto");
const express = require("express");

function verifyWebhookSignature(payload, signature, secretKey) {
  // Create signature payload with consistent key order (matches Go implementation)
  const signaturePayload = {
    user_id: payload.user_id,
    timestamp: payload.timestamp,
  };

  // Use consistent JSON formatting - JavaScript naturally sorts keys alphabetically
  const expectedSignature = crypto
    .createHmac("sha256", secretKey)
    .update(JSON.stringify(signaturePayload))
    .digest("hex");

  return signature === expectedSignature;
}

app.post("/webhook/reward-notification", express.json(), (req, res) => {
  const apiKey = req.headers["x-api-key"];
  const signature = req.headers["x-signature"];
  const expectedApiKey = process.env.EXPECTED_API_KEY;
  const secretKey = process.env.SECRET_KEY;

  // Verify API key
  if (apiKey !== expectedApiKey) {
    return res.status(401).json({
      result: false,
      error: "Invalid API key",
    });
  }

  // Verify signature
  if (!verifyWebhookSignature(req.body, signature, secretKey)) {
    return res.status(401).json({
      result: false,
      error: "Invalid signature",
    });
  }

  // Process webhook payload
  const {
    task_id,
    reward_type,
    reward_amount,
    user_id,
    evm_address,
    email,
    timestamp,
  } = req.body;

  console.log("Reward distributed:", {
    task_id,
    reward_type,
    reward_amount,
    user_id,
    email,
    timestamp,
  });

  // Your business logic here...

  res.json({
    result: true,
    error: null,
  });
});
```

## Retry Policy

- **Retry Attempts**: If the webhook call fails, TaskOn will retry up to **3 times**
- **Idempotency**: Please ensure your webhook endpoint handles idempotent requests properly, as the same notification may be sent multiple times due to retries
- **Authentication**: All retry attempts include the same authentication headers

## Webhook Payload

The webhook payload includes comprehensive information about the reward distribution and user context. The structure varies depending on the reward type configured for the task.

### Common Fields

All webhook payloads include the following user and context information:

- `user_id`: Unique identifier of the user who completed the task
- `evm_address`: Array of EVM wallet addresses associated with the user
- `email`: User's email address
- `timestamp`: Unix timestamp when the reward was distributed

You can import the TypeScript interface from the SDK:

```typescript
import { WebhookPayload } from "@taskon/embed";
```

For detailed type definitions, see [WebhookPayload](/api/types#webhookpayload).

### Token Rewards

When the task reward is configured as a token, the webhook payload includes the following fields:

```json
{
  "task_id": 111111,
  "reward_type": "Token",
  "reward_amount": "0.1",
  "token_contract": "0x0000...",
  "token_symbol": "USDT",
  "token_network": "bsc",
  "user_id": 11111,
  "evm_address": ["0xaaaaaaaaa", "0xbbbbbbbbb"],
  "email": "user@example.com",
  "timestamp": 1758251308
}
```

**Field Descriptions:**

- `task_id`: Unique identifier of the completed task
- `reward_type`: Always "Token" for token rewards
- `reward_amount`: The numeric amount of tokens distributed
- `token_contract`: Contract address of the distributed token
- `token_symbol`: Symbol of the distributed token
- `token_network`: The blockchain network where the token was distributed
- `user_id`: Unique identifier of the user who received the reward
- `evm_address`: Array of EVM wallet addresses associated with the user
- `email`: User's email address
- `timestamp`: Unix timestamp when the reward was distributed

### Points Rewards

When the task reward is configured as points, the webhook payload includes the following fields:

```json
{
  "task_id": 222222,
  "reward_type": "GTCPoints",
  "reward_amount": "100",
  "point_name": "PointNameA",
  "user_id": 11111,
  "evm_address": ["0xaaaaaaaaa", "0xbbbbbbbbb"],
  "email": "user@example.com",
  "timestamp": 1758251308
}
```

**Field Descriptions:**

- `task_id`: Unique identifier of the completed task
- `reward_type`: Always "GTCPoints" for points rewards
- `reward_amount`: The numeric amount of points distributed
- `point_name`: The name of the point system used
- `user_id`: Unique identifier of the user who received the reward
- `evm_address`: Array of EVM wallet addresses associated with the user
- `email`: User's email address
- `timestamp`: Unix timestamp when the reward was distributed

## Reward Types

The `reward_type` field can have the following values:

| Value       | Description                    |
| ----------- | ------------------------------ |
| `Token`     | Cryptocurrency or token reward |
| `GTCPoints` | Points-based reward system     |

## Expected Response

Your webhook endpoint should return a JSON response indicating successful processing:

```json
{
  "result": true,
  "error": null
}
```

**Response Fields:**

- `result`: Boolean indicating whether the webhook was processed successfully
- `error`: Should be `null` for successful processing, or contain error details if processing failed

## Complete Implementation Example

Here's a complete webhook endpoint implementation with authentication:

```javascript
const crypto = require("crypto");
const express = require("express");
const app = express();

app.use(express.json());

function verifyWebhookSignature(payload, signature, secretKey) {
  const signaturePayload = {
    user_id: payload.user_id,
    timestamp: payload.timestamp,
  };

  const expectedSignature = crypto
    .createHmac("sha256", secretKey)
    .update(JSON.stringify(signaturePayload))
    .digest("hex");

  return signature === expectedSignature;
}

app.post("/webhook/reward-notification", (req, res) => {
  try {
    const apiKey = req.headers["x-api-key"];
    const signature = req.headers["x-signature"];
    const expectedApiKey = process.env.EXPECTED_API_KEY;
    const secretKey = process.env.SECRET_KEY;

    // Verify API key
    if (apiKey !== expectedApiKey) {
      return res.status(401).json({
        result: false,
        error: "Invalid API key",
      });
    }

    // Verify signature
    if (!verifyWebhookSignature(req.body, signature, secretKey)) {
      return res.status(401).json({
        result: false,
        error: "Invalid signature",
      });
    }

    // Extract webhook data
    const {
      task_id,
      reward_type,
      reward_amount,
      token_contract,
      token_symbol,
      token_network,
      point_name,
      user_id,
      evm_address,
      email,
      timestamp,
    } = req.body;

    console.log("Reward notification received:", {
      task_id,
      reward_type,
      reward_amount,
      user_id,
      email,
      timestamp,
    });

    // Process the webhook based on reward type
    if (reward_type === "Token") {
      console.log(
        `User ${email} received ${reward_amount} ${token_symbol} tokens`
      );
      // Handle token reward logic
    } else if (reward_type === "GTCPoints") {
      console.log(
        `User ${email} received ${reward_amount} ${point_name} points`
      );
      // Handle points reward logic
    }

    // Update your internal systems here
    // ... your business logic ...

    // Return success response
    res.json({
      result: true,
      error: null,
    });
  } catch (error) {
    console.error("Webhook processing error:", error);
    res.status(500).json({
      result: false,
      error: error.message,
    });
  }
});
```

## Testing Your Webhook Endpoint

You can test your webhook endpoint using the following curl commands with proper authentication:

### Generate Test Signature

First, generate a test signature for your test payload:

```bash
# Example using Node.js to generate signature
node -e "
const crypto = require('crypto');
const secretKey = 'your-secret-key';
const payload = { user_id: 11111, timestamp: 1758251308 };
const signature = crypto.createHmac('sha256', secretKey)
  .update(JSON.stringify(payload))
  .digest('hex');
console.log('Test signature:', signature);
"
```

### Testing Token Reward Webhook

```bash
curl --location 'https://your-api-domain.com/webhook/reward-notification' \
--header 'Content-Type: application/json' \
--header 'X-API-Key: your-test-api-key' \
--header 'X-Signature: your-generated-signature' \
--data '{
    "task_id": 111111,
    "reward_type": "Token",
    "reward_amount": "0.1",
    "token_contract": "0x0000...",
    "token_symbol": "USDT",
    "token_network": "bsc",
    "user_id": 11111,
    "evm_address": ["0xaaaaaaaaa", "0xbbbbbbbbb"],
    "email": "test@example.com",
    "timestamp": 1758251308
}'
```

### Testing Points Reward Webhook

```bash
curl --location 'https://your-api-domain.com/webhook/reward-notification' \
--header 'Content-Type: application/json' \
--header 'X-API-Key: your-test-api-key' \
--header 'X-Signature: your-generated-signature' \
--data '{
    "task_id": 222222,
    "reward_type": "GTCPoints",
    "reward_amount": "100",
    "point_name": "PointNameA",
    "user_id": 11111,
    "evm_address": ["0xaaaaaaaaa", "0xbbbbbbbbb"],
    "email": "test@example.com",
    "timestamp": 1758251308
}'
```

### Testing Invalid Authentication

Test your authentication by sending requests with invalid credentials:

```bash
# Test with invalid API key
curl --location 'https://your-api-domain.com/webhook/reward-notification' \
--header 'Content-Type: application/json' \
--header 'X-API-Key: invalid-key' \
--header 'X-Signature: your-generated-signature' \
--data '{...}'

# Test with invalid signature
curl --location 'https://your-api-domain.com/webhook/reward-notification' \
--header 'Content-Type: application/json' \
--header 'X-API-Key: your-test-api-key' \
--header 'X-Signature: invalid-signature' \
--data '{...}'
```

## Security Best Practices

### Authentication Security

1. **API Key Storage**: Store your API keys and secret keys securely using environment variables or secure key management systems
2. **Signature Verification**: Always verify both API key and signature for every webhook request
3. **Timing Attack Prevention**: Use constant-time comparison for signature verification to prevent timing attacks

### Implementation Best Practices

1. **Idempotency**: Implement proper idempotency handling since TaskOn may retry failed webhook calls
2. **Timeout Handling**: Ensure your webhook endpoint responds within a reasonable timeframe (recommended: under 30 seconds)
3. **Error Logging**: Log all webhook requests and responses for debugging and monitoring
4. **Graceful Error Handling**: Return appropriate HTTP status codes and error messages
5. **User Privacy**: Handle user information (email, addresses) in compliance with privacy regulations
6. **Async Processing**: For complex operations, consider processing webhooks asynchronously to ensure quick response times

### Rate Limiting and Monitoring

1. **Rate Limiting**: Implement rate limiting to protect against potential abuse
2. **Monitoring**: Set up monitoring and alerting for webhook failures
3. **Logging**: Log authentication failures and successful webhook processing for audit purposes

## Troubleshooting

### Authentication Issues

1. **401 Unauthorized - Invalid API Key**:
   - Verify your API key matches the expected value
   - Check that the API key is being sent in the `X-API-Key` header
   - Ensure there are no extra spaces or characters in the API key

2. **401 Unauthorized - Invalid Signature**:
   - Verify your secret key is correct
   - Ensure signature generation uses the exact same payload structure: `{"user_id": <id>, "timestamp": <timestamp>}`
   - Check JSON serialization format (no extra spaces, consistent ordering)
   - Verify HMAC-SHA256 algorithm is being used correctly

3. **Missing Authentication Headers**:
   - Ensure both `X-API-Key` and `X-Signature` headers are present
   - Header names are case-sensitive

### Common Issues

1. **Webhook Not Received**:
   - Verify your endpoint URL is accessible and returns the expected response format
   - Check if authentication is properly implemented
   - Ensure your server accepts POST requests

2. **Multiple Notifications**:
   - This is expected behavior due to retry logic
   - Implement proper idempotency using task_id and timestamp
   - Handle duplicate notifications gracefully

3. **Timeout Errors**:
   - Optimize webhook processing to respond quickly (under 30 seconds)
   - Move heavy processing to background jobs
   - Return success response immediately after validation

4. **Signature Verification Fails**:
   - Double-check the JSON format used for signature generation
   - Verify the secret key is identical on both sides
   - Ensure consistent JSON serialization (use `JSON.stringify` without formatting)

### Debugging Tips

1. **Log Everything**: Log incoming headers, payload, and generated signatures for comparison
2. **Test Locally**: Use tools like ngrok to test webhooks locally during development
3. **Validate Signatures**: Create a separate endpoint to test signature generation and verification
4. **Check Timestamps**: Ensure timestamp values match between signature generation and verification

### Support

If you encounter issues with webhook integration, please contact TaskOn support with:

- Your webhook endpoint URL
- Sample request/response logs including headers
- Authentication configuration details (without exposing sensitive keys)
- Error messages or unexpected behavior descriptions
- Signature verification code samples
