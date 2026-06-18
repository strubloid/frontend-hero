import { describe, expect, it, vi, beforeEach } from "vitest";

// Mock next-auth/jwt BEFORE importing the proxy
const mockGetToken = vi.fn();
vi.mock("next-auth/jwt", () => ({
  getToken: (...args: unknown[]) => mockGetToken(...args),
}));

// Mock next/server
vi.mock("next/server", () => {
  class NextResponseMock {
    readonly url: string;
    readonly status: number;
    readonly internalBody: unknown;

    constructor(body: unknown, init?: { status?: number; url?: string }) {
      this.internalBody = body;
      this.status = init?.status ?? 200;
      this.url = init?.url ?? "";
    }

    static next() {
      return new NextResponseMock(null, { status: 200 }) as unknown as Response;
    }

    static redirect(url: string | URL) {
      return new NextResponseMock(null, {
        status: 307,
        url: typeof url === "string" ? url : url.toString(),
      }) as unknown as Response;
    }
  }

  class NextURLMock {
    readonly href: string;
    readonly pathname: string;
    readonly searchParams: URLSearchParams;

    constructor(url: string) {
      this.href = url;
      // Extract pathname from various URL formats
      const match = url.match(/https?:\/\/[^/]+(\/[^?]*)/);
      this.pathname = match ? match[1] : url;
      this.searchParams = new URLSearchParams(
        url.includes("?") ? url.split("?")[1] : "",
      );
    }

    toString() {
      return this.href;
    }
  }

  return {
    NextResponse: NextResponseMock,
    NextRequest: class NextRequestMock {
      readonly nextUrl: InstanceType<typeof NextURLMock>;
      readonly url: string;

      constructor(url: string) {
        this.url = url;
        this.nextUrl = new NextURLMock(url);
      }
    },
  };
});

// Now import the proxy (mocks are in place)
import middleware from "@/proxy";

describe("proxy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: unauthenticated
    mockGetToken.mockResolvedValue(null);
  });

  describe("protected routes", () => {
    it.each(["/play", "/play/mission/123", "/profile", "/boss-encounter", "/world-map"])(
      "redirects unauthenticated user from %s to /login",
      async (path) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const req = new (await import("next/server")).NextRequest(
          `http://localhost:3000${path}`,
        ) as any;
        const res = await middleware(req);

        expect(res).toBeDefined();
        // NextResponse.redirect returns 307
        expect((res as any).status).toBe(307);
        expect((res as any).url).toContain("/login");
        expect((res as any).url).toContain(encodeURIComponent(path));
      },
    );

    it.each(["/play", "/profile", "/world-map"])(
      "allows authenticated user through %s",
      async (path) => {
        mockGetToken.mockResolvedValue({ sub: "test-user-id", name: "Test" });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const req = new (await import("next/server")).NextRequest(
          `http://localhost:3000${path}`,
        ) as any;
        const res = await middleware(req);

        expect(res).toBeDefined();
        expect((res as any).status).toBe(200);
      },
    );
  });

  describe("auth pages", () => {
    it("redirects authenticated user from /login to /play", async () => {
      mockGetToken.mockResolvedValue({ sub: "test-user-id" });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const req = new (await import("next/server")).NextRequest(
        "http://localhost:3000/login",
      ) as any;
      const res = await middleware(req);

      expect((res as any).status).toBe(307);
      expect((res as any).url).toContain("/play");
    });

    it("redirects authenticated user from /register to /play", async () => {
      mockGetToken.mockResolvedValue({ sub: "test-user-id" });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const req = new (await import("next/server")).NextRequest(
        "http://localhost:3000/register",
      ) as any;
      const res = await middleware(req);

      expect((res as any).status).toBe(307);
      expect((res as any).url).toContain("/play");
    });

    it("allows unauthenticated user through /login", async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const req = new (await import("next/server")).NextRequest(
        "http://localhost:3000/login",
      ) as any;
      const res = await middleware(req);

      expect((res as any).status).toBe(200);
    });

    it("allows unauthenticated user through /register", async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const req = new (await import("next/server")).NextRequest(
        "http://localhost:3000/register",
      ) as any;
      const res = await middleware(req);

      expect((res as any).status).toBe(200);
    });
  });

  describe("public routes", () => {
    it("allows all users through /", async () => {
      // Authenticated
      mockGetToken.mockResolvedValue({ sub: "test" });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const req = new (await import("next/server")).NextRequest(
        "http://localhost:3000/",
      ) as any;
      const res = await middleware(req);
      expect((res as any).status).toBe(200);
    });

    it("allows unauthenticated users through /", async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const req = new (await import("next/server")).NextRequest(
        "http://localhost:3000/",
      ) as any;
      const res = await middleware(req);
      expect((res as any).status).toBe(200);
    });
  });

  describe("getToken secret", () => {
    it("passes AUTH_SECRET to getToken", async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const req = new (await import("next/server")).NextRequest(
        "http://localhost:3000/play",
      ) as any;
      await middleware(req);

      expect(mockGetToken).toHaveBeenCalledWith(
        expect.objectContaining({ secret: process.env.AUTH_SECRET }),
      );
    });
  });
});
