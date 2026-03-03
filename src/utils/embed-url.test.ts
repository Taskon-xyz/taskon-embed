import { describe, expect, it } from "vitest";
import {
  appendCommonIframeParams,
  buildBaseUrlForRouteJoin,
  resolveBaseUrl,
} from "./embed-url";

describe("resolveBaseUrl", () => {
  it("accepts full https url and keeps origin", () => {
    const result = resolveBaseUrl("https://white-label-test.tooltaskon.xyz/");
    expect(result.origin).toBe("https://white-label-test.tooltaskon.xyz");
    expect(result.toString()).toBe("https://white-label-test.tooltaskon.xyz/");
  });

  it("auto prepends https for host-only input", () => {
    const result = resolveBaseUrl("taskon.xyz");
    expect(result.toString()).toBe("https://taskon.xyz/");
  });

  it("uses http for localhost input", () => {
    const result = resolveBaseUrl("localhost:5173");
    expect(result.toString()).toBe("http://localhost:5173/");
  });

  it("uses http for 127.0.0.1 input", () => {
    const result = resolveBaseUrl("127.0.0.1:3000");
    expect(result.toString()).toBe("http://127.0.0.1:3000/");
  });

  it("supports protocol-relative input", () => {
    const result = resolveBaseUrl("//taskon.xyz/path");
    expect(result.toString()).toBe("https://taskon.xyz/path");
  });

  it("trims surrounding spaces", () => {
    const result = resolveBaseUrl("  https://taskon.xyz  ");
    expect(result.toString()).toBe("https://taskon.xyz/");
  });

  it("throws when baseUrl is empty", () => {
    expect(() => resolveBaseUrl("   ")).toThrow("baseUrl is required");
  });

  it("throws when protocol is not http/https", () => {
    expect(() => resolveBaseUrl("ftp://taskon.xyz")).toThrow(
      'Invalid baseUrl protocol: "ftp:". Only http:// or https:// are supported.'
    );
  });
});

describe("buildBaseUrlForRouteJoin", () => {
  it("removes search and hash and trims trailing slash", () => {
    const input = new URL("https://taskon.xyz/abc/?foo=1#hash");
    const result = buildBaseUrlForRouteJoin(input);
    expect(result).toBe("https://taskon.xyz/abc");
  });

  it("keeps base path when no trailing slash", () => {
    const input = new URL("https://taskon.xyz/base");
    const result = buildBaseUrlForRouteJoin(input);
    expect(result).toBe("https://taskon.xyz/base");
  });
});

describe("appendCommonIframeParams", () => {
  it("appends all supported params", () => {
    const url = new URL("https://taskon.xyz");
    const result = appendCommonIframeParams(url, {
      origin: "http://localhost:5173",
      language: "en",
      taskInviteCode: "invite-123",
      tabsInclude: ["home", "quests"],
      tabsExclude: ["events"],
    });

    expect(result.searchParams.get("origin")).toBe("http://localhost:5173");
    expect(result.searchParams.get("lang")).toBe("en");
    expect(result.searchParams.get("invite_code")).toBe("invite-123");
    expect(result.searchParams.get("tabsInclude")).toBe('["home","quests"]');
    expect(result.searchParams.get("tabsExclude")).toBe('["events"]');
  });

  it("only appends origin when optional params are missing", () => {
    const url = new URL("https://taskon.xyz/path");
    const result = appendCommonIframeParams(url, {
      origin: "https://host.example.com",
    });

    expect(result.searchParams.get("origin")).toBe("https://host.example.com");
    expect(result.searchParams.get("lang")).toBeNull();
    expect(result.searchParams.get("invite_code")).toBeNull();
    expect(result.searchParams.get("tabsInclude")).toBeNull();
    expect(result.searchParams.get("tabsExclude")).toBeNull();
  });
});
