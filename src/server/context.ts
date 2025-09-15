import { readUserDataCookie, serializeUserDataCookie } from "@/CookieUserData";

export type RequestContext = {
  req: Request;
  url: URL;
  user: ReturnType<typeof readUserDataCookie>;
  setUser: (next: ReturnType<typeof readUserDataCookie>) => string; // returns Set-Cookie header
  json: (data: unknown, init?: ResponseInit) => Response;
  redirect: (location: string, init?: ResponseInit) => Response;
};

export function createRequestContext(req: Request): RequestContext {
  const url = new URL(req.url);
  const user = readUserDataCookie(req.headers.get("cookie"));
  return {
    req,
    url,
    user,
    setUser(next) {
      return serializeUserDataCookie(next);
    },
    json(data, init) {
      return new Response(JSON.stringify(data), {
        headers: { "Content-Type": "application/json" },
        ...init,
      });
    },
    redirect(location, init) {
      return new Response(null, {
        status: 303,
        headers: { Location: location },
        ...init,
      });
    },
  };
}
