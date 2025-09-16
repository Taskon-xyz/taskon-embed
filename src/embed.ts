import { EventEmitter } from "eventemitter3";
import { connect, Connection, RemoteProxy, WindowMessenger } from "penpal";
import {
  AuthType,
  LoginParams,
  LogoutOptions,
  PenpalChildMethods,
  PenpalParentMethods,
  SnsType,
  TaskOnEmbedConfig,
  TaskOnEmbedEvents,
} from "./types";

/**
 * TaskOn Embed SDK for integrating TaskOn tasks into third-party websites
 *
 * @example
 * ```typescript
 * const embed = new TaskOnEmbed({
 *   baseUrl: 'https://yourtaskondomain.com',
 *   containerElement: '#taskon-container'
 * });
 *
 * embed.on('loginRequired', () => {
 *   // Handle login request
 * });
 *
 * await embed.login({
 *   type: 'email',
 *   account: 'user@example.com',
 *   signature: serverSignature,
 * });
 * ```
 */
export class TaskOnEmbed extends EventEmitter<TaskOnEmbedEvents> {
  private config: TaskOnEmbedConfig;
  private iframe: HTMLIFrameElement | null = null;
  private container: HTMLElement | null = null;
  private penpal: RemoteProxy<PenpalChildMethods> | null = null;
  private penpalConnection: Connection<PenpalChildMethods> | null = null;
  private connectedProvider: any = null;
  private connectedAddress: string = "";
  public initialized: boolean = false;
  private _currentRoute: string = "";
  private availableProviders: Record<string, any> = {};
  private eventListeners: Map<string, Map<string, (...args: any[]) => void>> =
    new Map();
  private walletWatcher: number | null = null;

  /**
   * Creates a new TaskOn embed instance.
   *
   * @param config - Configuration options for the embed
   */
  constructor(config: TaskOnEmbedConfig) {
    super();
    this.config = { ...config };
  }

  /**
   * Initialize the embed iframe.
   */
  public async init(): Promise<void> {
    this.renderIframe();
    await this.initPenpal();
    await this.initWalletProviders();
    this.initialized = true;
  }

  /**
   * Request login with email or EVM wallet. Can be called when already logged in to switch accounts.
   * Duplicate login with same account will be ignored.
   *
   * @param request - Login request parameters
   *
   * @example
   * ```typescript
   * // Check if authorization is needed
   * const needsAuth = !(await embed.isAuthorized('Email', 'user@example.com'));
   *
   * if (needsAuth) {
   *   // First time login - signature required
   *   const { signature, timestamp } = await getServerSignature('user@example.com');
   *   await embed.login({
   *     type: 'Email',
   *     account: 'user@example.com',
   *     signature,
   *     timestamp
   *   });
   * } else {
   *   // Already authorized - no signature needed
   *   await embed.login({
   *     type: 'Email',
   *     account: 'user@example.com'
   *   });
   * }
   *
   * // Cross-account login (switch from userA to userB)
   * await embed.login({
   *   type: 'Email',
   *   account: 'userB@example.com',
   *   signature: userBSignature,  // Required if userB not authorized
   *   timestamp: userBTimestamp
   * });
   * ```
   */
  public async login(request: LoginParams): Promise<void> {
    if (!this.penpal) {
      throw new Error("Not initialized, please call .init() first");
    }
    if (request.type === "WalletAddress") {
      if (!request.provider) {
        throw new Error(
          "The eip1193 compatible provider is required when login type is WalletAddress"
        );
      }
      this.connectedAddress = request.account;
      this.connectedProvider = request.provider || null;
    } else {
      this.connectedAddress = "";
      this.connectedProvider = null;
    }

    return this.penpal.login({
      type: request.type,
      account: request.account,
      signature: request.signature,
      timestamp: request.timestamp,
      username: request.username,
    });
  }

  /**
   * Request logout from current session
   *
   * @param options - Logout options
   * @param options.clearAuth - Whether to clear authorization cache (default: false)
   *                             - false: Keep auth cache for quick re-login (recommended for account switching)
   *                             - true: Clear auth cache completely (use for security-sensitive logout)
   *
   * @example
   * ```typescript
   * // Standard logout - keeps auth cache for quick re-login (recommended)
   * await embed.logout();
   * // or explicitly
   * await embed.logout({ clearAuth: false });
   *
   * // Complete logout - clears all authorization (use sparingly)
   * await embed.logout({ clearAuth: true });
   * ```
   */
  public async logout(options: LogoutOptions = {}): Promise<void> {
    if (!this.penpal) {
      throw new Error("Not initialized, please call .init() first");
    }
    return this.penpal.logout({
      clearAuth: options.clearAuth ?? false,
    });
  }

  /**
   * Check if the specified account has valid authorization cache
   * If true, login() can be called without signature/timestamp
   *
   * @param authType - Authentication type ('Email' | 'WalletAddress')
   * @param account - Account identifier (email address or wallet address)
   * @returns Promise<boolean> - true if account has valid authorization cache
   *
   * @example
   * ```typescript
   * const isAuthorized = await embed.isAuthorized('Email', 'user@example.com');
   * if (isAuthorized) {
   *   // No signature needed
   *   await embed.login({ type: 'Email', account: 'user@example.com' });
   * } else {
   *   // Signature required
   *   const { signature, timestamp } = await getServerSignature('user@example.com');
   *   await embed.login({ type: 'Email', account: 'user@example.com', signature, timestamp });
   * }
   * ```
   */
  public async isAuthorized(
    authType: AuthType,
    account: string
  ): Promise<boolean> {
    if (!this.penpal) {
      throw new Error("Not initialized, please call .init() first");
    }

    return this.penpal.isAuthorized(authType, account);
  }

  /**
   * Set iframe internal route
   *
   * @param fullPath - Target route path
   *
   * @example
   * ```typescript
   * // Navigate to a specific path
   * await embed.setRoute('/profile');
   * ```
   */
  public async setRoute(fullPath: string): Promise<void> {
    if (!this.penpal) {
      throw new Error("Not initialized, please call .init() first");
    }
    return this.penpal.setRoute(fullPath);
  }

  /**
   * Get current iframe route
   */
  public get currentRoute(): string {
    return this._currentRoute;
  }

  /**
   * Updates the size of the embed iframe
   *
   * @param width - New width (string or number in pixels)
   * @param height - New height (string or number in pixels)
   *
   * @throws {Error} If the embed is not initialized properly
   *
   * @example
   * ```typescript
   * // Set specific pixel dimensions
   * embed.updateSize(800, 600);
   *
   * // Use CSS units
   * embed.updateSize('100%', '500px');
   * ```
   */
  public updateSize(width?: string | number, height?: string | number): void {
    if (!this.iframe) {
      throw new Error("TaskOn embed not initialized properly");
    }

    if (width !== undefined) {
      this.iframe.style.width = this.resolveSize(
        width,
        this.iframe.style.width
      );
    }

    if (height !== undefined) {
      this.iframe.style.height = this.resolveSize(
        height,
        this.iframe.style.height
      );
    }
  }

  /**
   * Destroys the embed instance and cleans up all resources
   *
   * @example
   * ```typescript
   * embed.destroy();
   * ```
   */
  public destroy(): void {
    if (this.iframe && this.container) {
      this.container.removeChild(this.iframe);
    }
    this.iframe = null;
    this.container = null;
    this.penpalConnection?.destroy();
    this.penpalConnection = null;
    this.penpal = null;
    this.initialized = false;
    this._currentRoute = "";
    this.availableProviders = {};
    this.eventListeners.clear();

    // Clear wallet watcher
    if (this.walletWatcher) {
      clearInterval(this.walletWatcher);
      this.walletWatcher = null;
    }
  }

  /**
   * Initialize wallet providers by detecting available wallets and creating proxies
   */
  private async initWalletProviders(): Promise<void> {
    // Initial detection of wallet providers
    this.availableProviders = this.detectWalletProviders();

    // Send the provider information to iframe for setup
    await this.notifyIframeOfProviders();

    // Start watching for dynamically injected providers
    this.startWalletProviderWatcher();
  }

  /**
   * Start watching for dynamically injected wallet providers
   */
  private startWalletProviderWatcher(): void {
    // Check for new providers every 3 seconds
    this.walletWatcher = setInterval(async () => {
      const currentProviders = this.detectWalletProviders();
      const currentProviderKeys = Object.keys(currentProviders);
      const existingProviderKeys = Object.keys(this.availableProviders);

      // Check for new providers
      const newProviders = currentProviderKeys.filter(
        key => !existingProviderKeys.includes(key)
      );

      if (newProviders.length > 0) {
        console.log("New wallet providers detected:", newProviders);

        // Add new providers to our collection
        for (const key of newProviders) {
          if (currentProviders[key]) {
            this.availableProviders[key] = currentProviders[key];
          }
        }

        // Notify iframe about all providers (including new ones)
        await this.notifyIframeOfProviders();
      }
    }, 3000) as unknown as number;
  }

  /**
   * Detect available wallet providers in the current window
   */
  private detectWalletProviders(): Record<string, any> {
    const providers: Record<string, any> = {};

    // Check for EVM wallet providers only
    if ((window as any).ethereum) {
      providers.ethereum = (window as any).ethereum;
    }

    if ((window as any).okxwallet) {
      providers.okxwallet = (window as any).okxwallet;
    }

    if ((window as any).onto) {
      providers.onto = (window as any).onto;
    }

    if ((window as any).bitkeep?.ethereum) {
      providers["bitkeep.ethereum"] = (window as any).bitkeep.ethereum;
    }

    return providers;
  }

  /**
   * Notify iframe about available wallet providers via postMessage
   */
  private async notifyIframeOfProviders(): Promise<void> {
    if (!this.iframe?.contentWindow || !this.penpal) return;

    try {
      // Wait a bit for iframe to be fully loaded
      await new Promise(resolve => setTimeout(resolve, 100));

      // Send provider keys to iframe so it can set up proxy objects
      const providerKeys = Object.keys(this.availableProviders);
      console.log("Notifying iframe of available providers:", providerKeys);

      // The iframe will receive this and set up window objects accordingly
      // This avoids cross-origin issues with direct window manipulation
      if (this.penpal.setupWalletProviders) {
        await this.penpal.setupWalletProviders(providerKeys);
      }
    } catch (error) {
      console.warn("Failed to notify iframe of providers:", error);
    }
  }

  /**
   * Renders the TaskOn iframe into the specified container
   * Called automatically during construction
   */
  private renderIframe(): void {
    const container = this.resolveContainer();
    if (!container) {
      throw new Error("Container element not found");
    }
    this.container = container;
    this.iframe = this.createIframe();
    container.appendChild(this.iframe);
  }

  private resolveContainer(): HTMLElement | null {
    if (typeof this.config.containerElement === "string") {
      return document.querySelector(this.config.containerElement);
    }
    return this.config.containerElement;
  }

  private createIframe(): HTMLIFrameElement {
    const iframe = document.createElement("iframe");

    // Check if there's a saved route to restore (after OAuth return)
    const savedRoute = localStorage.getItem("taskon_saved_route");
    if (savedRoute) {
      // Handle potential duplicate slashes
      const baseUrl = this.config.baseUrl.endsWith("/")
        ? this.config.baseUrl.slice(0, -1)
        : this.config.baseUrl;
      const routePath = savedRoute.startsWith("/")
        ? savedRoute
        : "/" + savedRoute;
      const fullUrl = baseUrl + routePath;

      const urlWithRoute = new URL(fullUrl);
      urlWithRoute.searchParams.set("origin", window.location.origin);
      iframe.src = urlWithRoute.toString();

      // Clean up saved route
      localStorage.removeItem("taskon_saved_route");
    } else {
      const url = new URL(this.config.baseUrl);
      url.searchParams.set("origin", window.location.origin);
      iframe.src = url.toString();
    }

    iframe.style.width = this.resolveSize(this.config.width, "100%");
    iframe.style.height = this.resolveSize(this.config.height, "100%");
    iframe.style.border = "none";
    iframe.allow = "clipboard-write";

    // Add sandbox attributes to allow popups
    // This enables links to open in new tabs/windows from within the iframe
    iframe.sandbox.add(
      "allow-scripts", // Allow JavaScript execution
      "allow-same-origin", // Allow same-origin access
      "allow-forms", // Allow form submission
      "allow-popups", // Allow opening new windows
      "allow-popups-to-escape-sandbox", // New windows are not sandboxed
      "allow-storage-access-by-user-activation", // Allow storage access
      "allow-modals" // Allow alert/confirm/prompt
    );

    return iframe;
  }

  private resolveSize(
    size: string | number | undefined,
    defaultSize: string
  ): string {
    if (typeof size === "number") {
      return `${size}px`;
    }
    return size || defaultSize;
  }

  private async initPenpal(): Promise<void> {
    if (!this.iframe?.contentWindow) {
      throw new Error("Iframe not found");
    }
    const messenger = new WindowMessenger({
      remoteWindow: this.iframe.contentWindow,
      allowedOrigins: [this.config.baseUrl],
    });

    const methods: PenpalParentMethods = {
      requestLogin: async () => {
        this.emit("loginRequired");
      },
      requestOauth: (snsType, state) => {
        const pathMap: Record<SnsType, string> = {
          twitter: "/twitter",
          discord: "/discord",
          telegram: "/telegram",
          reddit: "/reddit",
        };
        if (!pathMap[snsType]) {
          throw new Error(`Invalid sns type: ${snsType}`);
        }

        // Save current route state for OAuth return restoration
        if (this._currentRoute) {
          localStorage.setItem("taskon_saved_route", this._currentRoute);
        }

        // open new tab of the oauth center
        // todo test oauthToolUrl
        const oauthToolUrl =
          this.config.oauthToolUrl || "https://stage.generalauthservice.com";
        const url = new URL(`${oauthToolUrl}${pathMap[snsType]}`);
        url.searchParams.set("state", state);
        url.searchParams.set("from", window.location.href);
        // Navigate to OAuth page
        window.location.href = url.toString();
      },
      onRouteChange: (fullPath: string) => {
        this._currentRoute = fullPath;
        this.emit("routeChanged", fullPath);
      },
      requestSignVerify: async hexMessage => {
        if (!this.connectedProvider) {
          throw new Error("Provider not found");
        }
        if (!this.connectedAddress) {
          throw new Error("No connected address");
        }
        return this.connectedProvider.request({
          method: "personal_sign",
          params: [hexMessage, this.connectedAddress],
        });
      },
      requestWalletProvider: async (
        providerKey: string,
        method: string,
        params?: any[]
      ) => {
        const originalProvider = this.getOriginalProvider(providerKey);
        if (!originalProvider) {
          throw new Error(`Provider ${providerKey} not found`);
        }

        // Handle the request using the original provider
        return originalProvider.request({ method, params });
      },
      subscribeWalletEvents: async (
        providerKey: string,
        eventName: string,
        listenerId: string
      ) => {
        const originalProvider = this.getOriginalProvider(providerKey);
        if (!originalProvider || !originalProvider.on) {
          return;
        }

        // Create event handler that forwards events to iframe
        const handler = (...args: any[]) => {
          // Forward the event to iframe through penpal
          if (this.penpal && this.penpal.onWalletEvent) {
            this.penpal
              .onWalletEvent(providerKey, eventName, listenerId, ...args)
              .catch((error: any) => {
                console.warn(
                  `Failed to forward wallet event ${eventName}:`,
                  error
                );
              });
          }
        };

        // Store the handler for cleanup
        if (!this.eventListeners.has(`${providerKey}:handlers`)) {
          this.eventListeners.set(`${providerKey}:handlers`, new Map());
        }
        const handlerMap = this.eventListeners.get(`${providerKey}:handlers`)!;
        handlerMap.set(`${eventName}:${listenerId}`, handler);

        // Subscribe to the original provider event
        originalProvider.on(eventName, handler);
      },
      unsubscribeWalletEvents: async (
        providerKey: string,
        eventName: string,
        listenerId: string
      ) => {
        const originalProvider = this.getOriginalProvider(providerKey);
        const handlerMap = this.eventListeners.get(`${providerKey}:handlers`);

        if (originalProvider && originalProvider.removeListener && handlerMap) {
          const handler = handlerMap.get(`${eventName}:${listenerId}`);
          if (handler) {
            originalProvider.removeListener(eventName, handler);
            handlerMap.delete(`${eventName}:${listenerId}`);
          }
        }
      },
    };

    this.penpalConnection = connect<PenpalChildMethods>({
      messenger,
      methods,
    });
    // wait for handshake
    this.penpal = await this.penpalConnection.promise;
  }

  /**
   * Get the original provider from window object
   */
  private getOriginalProvider(providerKey: string): any {
    const win = window as any;

    // Handle nested providers like bitkeep.ethereum
    if (providerKey.includes(".")) {
      const keys = providerKey.split(".");
      let provider = win;
      for (const key of keys) {
        provider = provider?.[key];
        if (!provider) return null;
      }
      return provider;
    }

    // Handle direct providers
    return win[providerKey];
  }
}
