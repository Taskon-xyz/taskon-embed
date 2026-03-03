import { CommunityTabKey } from "../types";

interface AppendCommonIframeParamsOptions {
  origin: string;
  language?: string;
  taskInviteCode?: string | null;
  tabsInclude?: CommunityTabKey[];
  tabsExclude?: CommunityTabKey[];
}

export function resolveBaseUrl(baseUrl: string): URL {
  const trimmedBaseUrl = baseUrl.trim();

  if (!trimmedBaseUrl) {
    throw new Error("baseUrl is required");
  }

  const normalizedBaseUrl = normalizeBaseUrlInput(trimmedBaseUrl);

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(normalizedBaseUrl);
  } catch {
    throw new Error(
      `Invalid baseUrl: "${baseUrl}". Please provide a valid URL or hostname.`
    );
  }

  if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
    throw new Error(
      `Invalid baseUrl protocol: "${parsedUrl.protocol}". Only http:// or https:// are supported.`
    );
  }

  return parsedUrl;
}

export function buildBaseUrlForRouteJoin(embedBaseUrl: URL): string {
  const routeBaseUrl = new URL(embedBaseUrl.toString());
  routeBaseUrl.search = "";
  routeBaseUrl.hash = "";

  const routeBase = routeBaseUrl.toString();
  return routeBase.endsWith("/") ? routeBase.slice(0, -1) : routeBase;
}

export function appendCommonIframeParams(
  url: URL,
  options: AppendCommonIframeParamsOptions
): URL {
  url.searchParams.set("origin", options.origin);
  if (options.language) {
    url.searchParams.set("lang", options.language);
  }

  if (options.taskInviteCode) {
    url.searchParams.set("invite_code", options.taskInviteCode);
  }

  if (options.tabsInclude) {
    url.searchParams.set("tabsInclude", JSON.stringify(options.tabsInclude));
  }
  if (options.tabsExclude) {
    url.searchParams.set("tabsExclude", JSON.stringify(options.tabsExclude));
  }

  return url;
}

function normalizeBaseUrlInput(baseUrl: string): string {
  const hasProtocol = /^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(baseUrl);
  if (hasProtocol) {
    return baseUrl;
  }

  if (baseUrl.startsWith("//")) {
    return `https:${baseUrl}`;
  }

  const protocol = shouldUseHttpProtocol(baseUrl) ? "http" : "https";
  return `${protocol}://${baseUrl}`;
}

function shouldUseHttpProtocol(baseUrlWithoutProtocol: string): boolean {
  const hostCandidate =
    baseUrlWithoutProtocol.split("/")[0]?.toLowerCase() ?? "";

  return (
    hostCandidate.startsWith("localhost") ||
    hostCandidate.startsWith("127.0.0.1") ||
    hostCandidate.startsWith("[::1]") ||
    hostCandidate.startsWith("0.0.0.0")
  );
}
