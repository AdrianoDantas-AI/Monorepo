import type { IncomingMessage } from "node:http";
import type { WebSession } from "./pages.js";

const parseSetCookieSessionId = (setCookieHeader: string | null): string | null => {
  if (!setCookieHeader) {
    return null;
  }

  const firstPart = setCookieHeader.split(";")[0] ?? "";
  const [cookieName, cookieValue] = firstPart.split("=");
  if (cookieName !== "cdg_session_id" || !cookieValue) {
    return null;
  }

  return cookieValue;
};

export const parseCookies = (headerValue: string | undefined): Record<string, string> => {
  if (!headerValue) {
    return {};
  }

  return headerValue
    .split(";")
    .map((part) => part.trim())
    .filter((part) => part.includes("="))
    .reduce<Record<string, string>>((acc, part) => {
      const [key, ...rest] = part.split("=");
      acc[key] = rest.join("=");
      return acc;
    }, {});
};

const readSessionPayload = async (
  apiBaseUrl: string,
  sessionId: string | null,
): Promise<{ data: WebSession | null } | null> => {
  try {
    const response = await fetch(`${apiBaseUrl}/api/v1/auth/session`, {
      headers: sessionId ? { "x-session-id": sessionId } : {},
    });
    if (!response.ok) {
      return null;
    }

    return (await response.json()) as { data: WebSession | null };
  } catch {
    return null;
  }
};

export const resolveSessionFromRequest = async (
  req: IncomingMessage,
  apiBaseUrl: string,
): Promise<WebSession | null> => {
  const cookies = parseCookies(req.headers.cookie);
  const sessionId = cookies.cdg_session_id ?? null;
  const payload = await readSessionPayload(apiBaseUrl, sessionId);
  return payload?.data ?? null;
};

const runGoogleLogin = async (apiBaseUrl: string): Promise<WebSession | null> => {
  try {
    const response = await fetch(`${apiBaseUrl}/api/v1/auth/google/callback?code=web-shell-login`);
    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as { data: WebSession };
    return payload.data ?? null;
  } catch {
    return null;
  }
};

const runMagicLogin = async (apiBaseUrl: string): Promise<WebSession | null> => {
  try {
    const response = await fetch(`${apiBaseUrl}/api/v1/auth/magic-link/verify`, {
      method: "POST",
      headers: { "content-type": "application/json; charset=utf-8" },
      body: JSON.stringify({ token: "preview_magic_token" }),
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as { data: WebSession };
    return payload.data ?? null;
  } catch {
    return null;
  }
};

export const runLoginProvider = async (
  provider: string | null,
  apiBaseUrl: string,
): Promise<WebSession | null> => {
  if (provider === "google") {
    return runGoogleLogin(apiBaseUrl);
  }

  if (provider === "magic") {
    return runMagicLogin(apiBaseUrl);
  }

  return null;
};

export const runLogout = async (apiBaseUrl: string): Promise<void> => {
  try {
    await fetch(`${apiBaseUrl}/api/v1/auth/logout`, {
      method: "POST",
      headers: { "content-type": "application/json; charset=utf-8" },
      body: JSON.stringify({ source: "web-shell" }),
    });
  } catch {
    // Keep logout resilient even if API is temporarily unavailable.
  }
};

export const extractSessionIdFromSetCookie = (setCookieHeader: string | null): string | null =>
  parseSetCookieSessionId(setCookieHeader);
