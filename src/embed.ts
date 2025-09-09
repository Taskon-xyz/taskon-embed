import { EventEmitter } from "eventemitter3";
import { connect, Connection, RemoteProxy, WindowMessenger } from "penpal";
import { LoginType } from "./login-types";
import {
  LoginParams,
  PenpalChildMethods,
  PenpalParentMethods,
  TaskOnEmbedConfig,
  TaskOnEmbedEvents,
} from "./types";

/**
 * TaskOn Embed SDK for integrating TaskOn tasks into third-party websites
 *
 * @example
 * ```typescript
 * const embed = new TaskOnEmbed({
 *   clientId: 'your-client-id',
 *   baseUrl: 'https://taskon.xyz',
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
    this.initialized = true;
  }

  /**
   * Request login with the email or evm wallet in iframe, listen loginSuccess event to get the login result
   *
   * @param request - Login request parameters
   *
   * @example
   * ```typescript
   * // Email login
   * await embed.login({
   *   type: 'email',
   *   account: 'user@example.com',
   *   signature: serverSignature,
   * });
   *
   * // EVM wallet login
   * await embed.login({
   *   type: 'evm',
   *   account: '0x1234...',
   *   signature: serverSignature,
   * });
   * ```
   */
  public async login(request: LoginParams): Promise<void> {
    if (!this.penpal) {
      throw new Error("Not initialized, please call .init() first");
    }
    if (request.type === "evm") {
      if (!request.provider) {
        throw new Error(
          "The eip1193 compatible provider is required when login type is evm"
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
   * Request logout
   *
   * @example
   * ```typescript
   * embed.logout();
   * ```
   */
  public async logout(): Promise<void> {
    if (!this.penpal) {
      throw new Error("Not initialized, please call .init() first");
    }
    return this.penpal.logout();
  }

  /**
   * Get if the user is logged in by iframe, if true, no need to set signature in login request
   */
  public async getIsLoggedIn(
    loginType: LoginType,
    account: string
  ): Promise<boolean> {
    if (!this.penpal) {
      throw new Error("Not initialized, please call .init() first");
    }
    return this.penpal.getIsLoggedIn(loginType, account);
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
    // Recover url after oauth
    const latestUrl = localStorage.getItem("taskon_oauth_latest_url");
    const url = new URL(latestUrl || this.config.baseUrl);
    localStorage.removeItem("taskon_oauth_latest_url");
    url.searchParams.set("client_id", this.config.clientId);

    iframe.src = url.toString();
    iframe.style.width = this.resolveSize(this.config.width, "100%");
    iframe.style.height = this.resolveSize(this.config.height, "600px");
    iframe.style.border = "none";
    iframe.allow = "clipboard-write";

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
        // open new tab of the oauth center
        const oauthToolUrl =
          this.config.oauthToolUrl || "https://generalauthservice.com";
        const url = new URL(oauthToolUrl);
        url.searchParams.set("type", snsType);
        url.searchParams.set("state", state);
        url.searchParams.set("from", window.location.href);
        localStorage.setItem(
          "taskon_oauth_latest_url",
          this.iframe?.src || this.config.baseUrl
        );
        // (新页面打开会拦截)
        window.location.href = url.toString();
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
    };

    this.penpalConnection = connect<PenpalChildMethods>({
      messenger,
      methods,
    });
    // wait for handshake
    this.penpal = await this.penpalConnection.promise;
  }
}
