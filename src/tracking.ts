import { AuthType } from "./types";

/**
 * Generate or retrieve session ID from localStorage
 */
function getSessionId(): string {
  const STORAGE_KEY = "taskon_session_id";
  let sessionId = localStorage.getItem(STORAGE_KEY);

  if (!sessionId) {
    // Generate a random session ID
    sessionId =
      "sess_" +
      Math.random().toString(36).substr(2, 16) +
      "_" +
      Date.now().toString(36);
    localStorage.setItem(STORAGE_KEY, sessionId);
  }

  return sessionId;
}

/**
 * Track page visit for TaskOn conversion analytics
 *
 * Only use this function if you need TaskOn conversion rate analysis.
 * Call on every page load to track user visits and engagement metrics.
 *
 * @param loginType - Authentication type (optional, for logged-in users)
 * @param account - User email or wallet address (optional, for logged-in users)
 *
 * @example
 * ```typescript
 * import { trackVisit } from '@taskon/embed'
 *
 * // For logged-in users (call on page load)
 * await trackVisit('Email', 'user@example.com');
 *
 * // For anonymous visits (call on page load)
 * await trackVisit();
 * ```
 */
export async function trackVisit(
  loginType?: AuthType,
  account?: string
): Promise<boolean> {
  // todo test api
  const url = `https://white-label-api-stage.taskon.xyz/whiteLabel/v1/pageVisitCount`;
  const sessionId = getSessionId();

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "session-id": sessionId,
      },
      body: JSON.stringify({
        sns_id_or_address: account,
        login_type: loginType,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.result ?? false;
  } catch (error) {
    console.error("Failed to track page visit:", error);
    return false;
  }
}
