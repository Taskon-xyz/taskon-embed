/**
 * Configuration options for TaskOn embed instance
 */
export interface TaskOnEmbedConfig {
  /** Client ID provided by TaskOn for authentication */
  clientId: string;
  /** Base URL of the TaskOn service */
  baseUrl: string;
  /** CSS selector string or HTMLElement where the embed should be rendered */
  containerElement: string | HTMLElement;
  /** Width of the embed iframe (CSS units or pixel number) */
  width?: string | number;
  /** Height of the embed iframe (CSS units or pixel number) */
  height?: string | number;
}

/** Supported login types */
export type LoginType = "email" | "evm";

/**
 * Login request parameters
 */
export interface LoginRequest {
  /** Type of login credential */
  type: LoginType;
  /** The credential value (email addresns or EVM address) */
  value: string;
  /** Server-generated signature for authentication (signs value + timestamp), optional when the user is logged in(getIsLoggedIn is true) */
  signature?: string;
}

/**
 * User authentication information
 */
export interface AuthUser {
  /** Unique user identifier */
  id: string;
  /** Type of authentication used */
  type: LoginType;
  /** User credential value */
  value: string;
  /** Optional signature for authentication */
  signature?: string;
  /** Optional timestamp when signature was created */
  timestamp?: number;
}

/**
 * Event handlers for TaskOn embed instance
 */
export interface TaskOnEmbedEvents {
  /** Fired when iframe requests user login */
  loginRequired: (data: { type?: LoginType }) => void;
  taskCompleted: (task: any, taskOnUserId: number) => void;
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
   * Logout with email or EVM address
   * @param loginType - Login type, if not provided, all accounts will be logged out
   * @param value - Login value, if not provided, all accounts will be logged out
   * @returns Promise that resolves when logout is successful
   */
  logout(loginType?: LoginType, value?: string): Promise<void>;
  /**
   * Get if the user is logged in
   * @returns Promise that resolves to true if logged in
   */
  getIsLoggedIn(loginType: LoginType, value: string): boolean;
};

export type PenpalParentMethods = {
  /**

   */
  requestLogin(): Promise<void>;
};
