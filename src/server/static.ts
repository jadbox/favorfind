import path from "path";
import { existsSync } from "fs";

export const serveAssetPrefix = async (req: Request): Promise<Response> => {
  const url = new URL(req.url);
  const filePath = path.join(process.cwd(), "dist", url.pathname);
  if (existsSync(filePath)) return new Response(Bun.file(filePath));
  return new Response("Not Found", { status: 404 });
};

export const serveFrontendCss = async (): Promise<Response> => {
  const filePath = path.join(process.cwd(), "dist", "frontend.css");
  if (existsSync(filePath)) return new Response(Bun.file(filePath));
  return new Response("Not Found", { status: 404 });
};
