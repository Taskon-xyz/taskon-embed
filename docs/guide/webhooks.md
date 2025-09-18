# Task Completion Webhook Service

TaskOn provides a webhook service to notify project parties when user rewards have been distributed. This service ensures that your application can respond promptly to completed tasks and reward distributions.

## Overview

When a user receives a reward after task completion, TaskOn will call your configured webhook endpoint to notify your project of the reward distribution. This allows you to update your internal systems, trigger additional workflows, or provide user notifications.

**Important Note**: The webhook is only triggered when users actually receive rewards. Some tasks may not immediately distribute rewards upon submission - for example, Proof of Work (PoW) tasks and other tasks requiring manual review will only trigger the webhook after approval and reward distribution.

## Webhook Configuration

Project parties must provide a webhook endpoint URL that can receive reward distribution notifications. TaskOn will make HTTP POST requests to this endpoint when rewards are distributed.

## Retry Policy

- **Retry Attempts**: If the webhook call fails, TaskOn will retry up to **3 times**
- **Idempotency**: Please ensure your webhook endpoint handles idempotent requests properly, as the same notification may be sent multiple times due to retries

## Webhook Payload

The webhook payload varies depending on the reward type configured for the task. You can import the TypeScript interface from the SDK:

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
  "token_network": "bsc"
}
```

**Field Descriptions:**

- `task_id`: Unique identifier of the completed task
- `reward_type`: Always "Token" for token rewards
- `reward_amount`: The numeric amount of tokens distributed
- `token_contract`: Contract address of the distributed token
- `token_symbol`: Symbol of the distributed token
- `token_network`: The blockchain network where the token was distributed

### Points Rewards

When the task reward is configured as points, the webhook payload includes the following fields:

```json
{
  "task_id": 222222,
  "reward_type": "GTCPoints",
  "reward_amount": "100",
  "point_name": "PointNameA"
}
```

**Field Descriptions:**

- `task_id`: Unique identifier of the completed task
- `reward_type`: Always "GTCPoints" for points rewards
- `reward_amount`: The numeric amount of points distributed
- `point_name`: The name of the point system used

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

## Example Implementation

Here's an example webhook endpoint implementation:

```javascript
// Express.js example
app.post("/webhook/task-completion", (req, res) => {
  try {
    const {
      task_id,
      reward_type,
      reward_amount,
      token_contract,
      token_symbol,
      token_network,
      point_name,
    } = req.body;

    // Process the webhook data
    console.log("Task completion received:", {
      task_id,
      reward_type,
      reward_amount,
      token_contract,
      token_symbol,
      token_network,
      point_name,
    });

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

## Testing

You can test your webhook endpoint using the following curl commands:

### Testing Token Reward Webhook

```bash
curl --location 'https://your-api-domain.com/webhook/task-completion' \
--header 'Content-Type: application/json' \
--data '{
    "task_id": 111111,
    "reward_type": "Token",
    "reward_amount": "0.1",
    "token_contract": "0x0000...",
    "token_symbol": "USDT",
    "token_network": "bsc"
}'
```

### Testing Points Reward Webhook

```bash
curl --location 'https://your-api-domain.com/webhook/task-completion' \
--header 'Content-Type: application/json' \
--data '{
    "task_id": 222222,
    "reward_type": "GTCPoints",
    "reward_amount": "100",
    "point_name": "PointNameA"
}'
```

## Best Practices

1. **Idempotency**: Implement proper idempotency handling since TaskOn may retry failed webhook calls
2. **Timeout Handling**: Ensure your webhook endpoint responds within a reasonable timeframe (recommended: under 30 seconds)
3. **Error Logging**: Log all webhook requests and responses for debugging and monitoring
4. **Graceful Error Handling**: Return appropriate HTTP status codes and error messages

## Troubleshooting

### Common Issues

1. **Webhook Not Received**: Verify your endpoint URL is accessible and returns the expected response format
2. **Multiple Notifications**: This is expected behavior due to retry logic - ensure your implementation handles duplicate notifications gracefully
3. **Timeout Errors**: Optimize your webhook processing to respond quickly, moving heavy processing to background jobs if needed

### Support

If you encounter issues with webhook integration, please contact TaskOn support with:

- Your webhook endpoint URL
- Sample request/response logs
- Error messages or unexpected behavior descriptions
