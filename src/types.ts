/**
 * Common types shared between browser and Node.js environments
 * LoginType is in login-types.ts
 */

import { LoginType } from "./login-types";

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

export interface LoginParams {
  /** Type of login credential */
  type: LoginType;
  /** Account (email addresns or EVM address) */
  account: string;
  /** Server-generated signature for authentication, optional when the user is logged in(getIsLoggedIn is true) */
  signature?: string;
  /**
   * Timestamp for signature, optional when the user is logged in(getIsLoggedIn is true)
   */
  timestamp?: number;
  /**
   * Default username for new user(optional)
   */
  username?: string;
  /**
   * Ethereum eip1193 compatible provider, needed when type is evm
   */
  provider?: any;
}

/**
 * Login request parameters
 */
export interface LoginRequest {
  type: LoginType;
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
  type: LoginType;
  /** User account */
  account: string;
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
  loginRequired: () => void;
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
   * @param account - Login account, if not provided, all accounts will be logged out
   * @returns Promise that resolves when logout is successful
   */
  logout(loginType?: LoginType, account?: string): Promise<void>;
  /**
   * Get if the user is logged in
   * @returns Promise that resolves to true if logged in
   */
  getIsLoggedIn(loginType: LoginType, account: string): boolean;
};

export type SnsType =
  | "twitter"
  | "discord"
  | "telegram"
  | "reddit"
  | "youtube"
  | "fsl";

export type PenpalParentMethods = {
  /**
   * Request parent to login
   */
  requestLogin(): Promise<void>;
  /**
   * Request parent to oauth
   * @param snsType - OAuth provider name
   * @param state - Unique identifier for the request
   */
  requestOauth(snsType: SnsType, state: string): void;
  /**
   * evm登录时，请求签名验证
   */
  requestSignVerify(hexMessage: string): Promise<string>;
};
