import { describe, it, expect } from "vitest";
import {
  getCorsHeaders,
  createCorsResponse,
  handleCorsPreflight,
  jsonResponse,
} from "../src/lib/cors";

describe("CORS utility", () => {
  describe("getCorsHeaders", () => {
    it("returns headers for allowed origin randify.pro", () => {
      const headers = getCorsHeaders("https://randify.pro");
      expect(headers["Access-Control-Allow-Origin"]).toBe("https://randify.pro");
      expect(headers["Access-Control-Allow-Methods"]).toBe("GET, POST, PUT, DELETE, OPTIONS");
      expect(headers["Access-Control-Allow-Headers"]).toBe("Content-Type, Authorization");
      expect(headers["Access-Control-Allow-Credentials"]).toBe("true");
      expect(headers["Vary"]).toBe("Origin");
    });

    it("returns headers for allowed origin dm.randify.pro", () => {
      const headers = getCorsHeaders("https://dm.randify.pro");
      expect(headers["Access-Control-Allow-Origin"]).toBe("https://dm.randify.pro");
    });

    it("returns headers for allowed origin localhost:4321", () => {
      const headers = getCorsHeaders("http://localhost:4321");
      expect(headers["Access-Control-Allow-Origin"]).toBe("http://localhost:4321");
    });

    it("returns empty origin for disallowed host", () => {
      const headers = getCorsHeaders("https://evil.com");
      expect(headers["Access-Control-Allow-Origin"]).toBe("");
    });

    it("returns empty origin for null origin", () => {
      const headers = getCorsHeaders(null);
      expect(headers["Access-Control-Allow-Origin"]).toBe("");
    });

    it("returns empty origin for invalid URL", () => {
      const headers = getCorsHeaders("not-a-url");
      expect(headers["Access-Control-Allow-Origin"]).toBe("");
    });
  });

  describe("handleCorsPreflight", () => {
    it("returns 204 with CORS headers for allowed origin", () => {
      const response = handleCorsPreflight("https://randify.pro");
      expect(response.status).toBe(204);
      expect(response.headers.get("Access-Control-Allow-Origin")).toBe("https://randify.pro");
      expect(response.headers.get("Access-Control-Allow-Methods")).toBe("GET, POST, PUT, DELETE, OPTIONS");
      expect(response.headers.get("Access-Control-Allow-Credentials")).toBe("true");
    });

    it("returns 204 even for disallowed origin", () => {
      const response = handleCorsPreflight("https://evil.com");
      expect(response.status).toBe(204);
      expect(response.headers.get("Access-Control-Allow-Origin")).toBe("");
    });
  });

  describe("createCorsResponse", () => {
    it("wraps a response with CORS headers", () => {
      const response = createCorsResponse("hello", 200, "https://dm.randify.pro", {
        "Content-Type": "text/plain",
      });
      expect(response.status).toBe(200);
      expect(response.headers.get("Access-Control-Allow-Origin")).toBe("https://dm.randify.pro");
      expect(response.headers.get("Content-Type")).toBe("text/plain");
    });
  });

  describe("jsonResponse", () => {
    it("serializes data and sets JSON content type", async () => {
      const response = jsonResponse({ ok: true }, 200, "http://localhost:4321");
      expect(response.status).toBe(200);
      expect(response.headers.get("Content-Type")).toBe("application/json");
      expect(response.headers.get("Access-Control-Allow-Origin")).toBe("http://localhost:4321");
      const body = await response.json();
      expect(body).toEqual({ ok: true });
    });
  });
});

function mockRequest(url: string, origin: string, method = "GET") {
  return {
    url,
    method,
    headers: {
      get(name: string) {
        if (name.toLowerCase() === "origin") return origin;
        return null;
      },
    },
  } as unknown as Request;
}

describe("DM API health route", () => {
  it("GET returns 200 with CORS headers", async () => {
    const { GET } = await import("../src/pages/api/dm/health");
    const request = mockRequest("https://dm.randify.pro/api/dm/health", "https://randify.pro");
    const response = await GET!({ request, url: new URL(request.url), ...({} as any) });
    expect(response.status).toBe(200);
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe("https://randify.pro");
    const body = await response.json();
    expect(body.status).toBe("ok");
    expect(body.dm).toBe(true);
  });

  it("OPTIONS returns 204 with CORS headers", async () => {
    const { OPTIONS } = await import("../src/pages/api/dm/health");
    const request = mockRequest("https://dm.randify.pro/api/dm/health", "https://dm.randify.pro", "OPTIONS");
    const response = await OPTIONS!({ request, url: new URL(request.url), ...({} as any) });
    expect(response.status).toBe(204);
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe("https://dm.randify.pro");
  });
});
