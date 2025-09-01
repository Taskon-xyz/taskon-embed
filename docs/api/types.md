# Type Definitions

This document describes the public types of the latest `TaskOnEmbed`.

## TaskOnEmbedConfig

Configuration options for TaskOn embed instance.

```typescript
interface TaskOnEmbedConfig {
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
```

## LoginType

Supported login types.

```typescript
type LoginType = "email" | "evm";
```

## LoginRequest

Login request parameters.

```typescript
interface LoginRequest {
  /** Type of login credential */
  type: LoginType;
  /** The credential value (email address or EVM address) */
  value: string;
  /** Server-generated signature for authentication (optional when user is logged in) */
  signature?: string;
}
```

## AuthUser

User authentication information.

```typescript
interface AuthUser {
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
```

## TaskOnEmbedEvents

Event handlers for TaskOn embed instance.

```typescript
interface TaskOnEmbedEvents {
  /** Fired when iframe requests user login */
  loginRequired: (data: { type?: LoginType }) => void;
  /** Fired when a task is completed */
  taskCompleted: (task: any, taskOnUserId: number) => void;
}
```

## PenpalChildMethods

Penpal methods of child iframe (internal use).

```typescript
type PenpalChildMethods = {
  /** Login with email or EVM address */
  login(request: LoginRequest): Promise<void>;
  /** Logout with email or EVM address */
  logout(loginType?: LoginType, value?: string): Promise<void>;
  /** Get if the user is logged in */
  getIsLoggedIn(loginType: LoginType, value: string): boolean;
};
```

## PenpalParentMethods

Penpal methods of parent window (internal use).

```typescript
type PenpalParentMethods = {
  /** Request login from parent */
  requestLogin(): Promise<void>;
};
```
