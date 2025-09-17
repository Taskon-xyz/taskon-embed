/**
 * Common types shared between browser and Node.js environments
 */

/** Supported authentication types */
export type AuthType = "Email" | "WalletAddress";

/**
 * Configuration options for TaskOn embed instance
 */
export interface TaskOnEmbedConfig {
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
}

export interface LoginParams {
  /** Type of login credential */
  type: AuthType;
  /** Account (email address or EVM address) */
  account: string;
  /** Server-generated signature for authentication, optional when the user is authorized(isAuthorized is true) */
  signature?: string;
  /**
   * Timestamp for signature, optional when the user is authorized(isAuthorized is true)
   */
  timestamp?: number;
  /**
   * Default username for new user(optional)
   */
  username?: string;
  /**
   * Ethereum eip1193 compatible provider, needed when type is WalletAddress
   */
  provider?: any;
}

/**
 * Logout options
 */
export interface LogoutOptions {
  /**
   * Whether to clear authorization cache (default: false)
   * - false: Only logout current session, keep auth cache for quick re-login (recommended)
   * - true: Complete logout, clear all authorization cache
   */
  clearAuth?: boolean;
}

/**
 * Login request parameters
 */
export interface LoginRequest {
  type: AuthType;
  account: string;
  signature?: string;
  timestamp?: number;
  username?: string;
}

/**
 * User authentication information
 */
export interface AuthUser {
  /** Unique user identifier */
  id: string;
  /** Type of authentication used */
  type: AuthType;
  /** User account */
  account: string;
  /** Optional signature for authentication */
  signature?: string;
  /** Optional timestamp when signature was created */
  timestamp?: number;
}

/**
 * Task reward information
 */
export interface TaskReward {
  /** Type of reward */
  rewardType: "Token" | "GTCPoints";
  /** Amount of reward */
  rewardAmount: string;
  /** Name of points/token (optional) */
  pointName?: string;
  /** Human readable reward description (e.g., "100 XPoints", "100 USDT") */
  rewardDescription: string;
  /** Token contract address (if applicable) */
  tokenAddress?: string;
  /** Blockchain network (if applicable) */
  tokenNetwork?: string;
}

/**
 * Task completion event data
 */
export interface TaskCompletedData {
  /** Task identifier */
  taskId: string;
  /** Task name/title */
  taskName: string;
  /** Task template identifier */
  templateId: string;
  /**
   * The rewards of the task.
   * Note: For tasks requiring review (e.g., PoW tasks), the rewards may not be granted yet
   */
  rewards: TaskReward[];
}

/**
 * Event handlers for TaskOn embed instance
 */
export interface TaskOnEmbedEvents {
  /** Fired when iframe requests user login */
  loginRequired: () => void;
  /** Fired when iframe route changes */
  routeChanged: (fullPath: string) => void;
  /** Fired when user completes a task */
  taskCompleted: (data: TaskCompletedData) => void;
}

/**
 * penpal methods of child iframe
 */

export type PenpalChildMethods = {
  /**
   * Login with email or EVM address
   * @param request - Login request
   * @returns Promise that resolves when login is successful
   */
  login(request: LoginRequest): Promise<void>;
  /**
   * Logout current user session
   * @param options - Logout options
   * @returns Promise that resolves when logout is successful
   */
  logout(options?: LogoutOptions): Promise<void>;
  /**
   * Check if specified account has valid authorization cache
   * @param authType - Authentication type
   * @param account - Account identifier
   * @returns Promise that resolves to true if account has valid authorization
   */
  isAuthorized(authType: AuthType, account: string): Promise<boolean>;
  /**
   * Set iframe internal route
   * @param fullPath - Target route path
   */
  setRoute(fullPath: string): Promise<void>;
  /**
   * Setup wallet providers in iframe
   * @param providerKeys - Array of available provider keys
   */
  setupWalletProviders(providerKeys: string[]): Promise<void>;
  /**
   * Handle wallet events from parent window
   * @param providerKey - Provider key that emitted the event
   * @param eventName - Name of the event
   * @param listenerId - ID of the listener
   * @param args - Event arguments
   */
  onWalletEvent(
    providerKey: string,
    eventName: string,
    listenerId: string,
    ...args: any[]
  ): Promise<void>;
};

export type SnsType = "twitter" | "discord" | "telegram" | "reddit";

/**
 * EVM Provider proxy methods for wallet operations
 */
export interface ProviderProxyMethods {
  /**
   * Request wallet operation (eth_requestAccounts, personal_sign, etc.)
   */
  request(args: { method: string; params?: any[] }): Promise<any>;
  /**
   * Add event listener for provider events (accountsChanged, chainChanged, etc.)
   */
  on(eventName: string, listener: (...args: any[]) => void): void;
  /**
   * Remove event listener
   */
  removeListener(eventName: string, listener: (...args: any[]) => void): void;
  /**
   * Check if connected
   */
  isConnected?(): boolean;
}

/**
 * Available wallet providers detected in parent window
 */
export interface WalletProviders {
  ethereum?: ProviderProxyMethods;
  okxwallet?: ProviderProxyMethods;
  onto?: ProviderProxyMethods;
  bitkeep?: { ethereum?: ProviderProxyMethods };
  [key: string]: any;
}

export type PenpalParentMethods = {
  /**
   * Request parent to login
   */
  requestLogin(): Promise<void>;
  /**
   * Notify parent when task is completed
   */
  onTaskCompleted(data: TaskCompletedData): void;
  /**
   * Request parent to oauth
   * @param snsType - OAuth provider name
   * @param state - Unique identifier for the request
   */
  requestOauth(snsType: SnsType, state: string): void;
  /**
   * Request signature verification for EVM login
   */
  requestSignVerify(hexMessage: string): Promise<string>;
  /**
   * Notify parent when iframe route changes
   */
  onRouteChange(fullPath: string): void;
  /**
   * Request wallet provider operation
   */
  requestWalletProvider(
    providerKey: string,
    method: string,
    params?: any[]
  ): Promise<any>;
  /**
   * Subscribe to wallet provider events
   */
  subscribeWalletEvents(
    providerKey: string,
    eventName: string,
    listenerId: string
  ): Promise<void>;
  /**
   * Unsubscribe from wallet provider events
   */
  unsubscribeWalletEvents(
    providerKey: string,
    eventName: string,
    listenerId: string
  ): Promise<void>;
};
