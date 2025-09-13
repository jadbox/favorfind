import React from "react";
import { renderToReadableStream } from "react-dom/server";

type DocumentProps = {
  title?: string;
  stylesHref?: string;
  faviconHref?: string;
  appleTouchIconHref?: string;
  content?: React.ReactNode;
  extraHeaders?: Record<string, string>;
};

export async function renderDocument({
  title = "Medeligo Cancer Research",
  stylesHref = "/frontend.css",
  faviconHref = "/assets/images/Logo-2-scaled.png",
  appleTouchIconHref = "/assets/images/Logo-2-scaled.png",
  content,
  extraHeaders,
}: DocumentProps) {
  const Html = (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        {faviconHref ? (
          <link rel="icon" type="image/png" href={faviconHref} />
        ) : null}
        {appleTouchIconHref ? (
          <link rel="apple-touch-icon" href={appleTouchIconHref} />
        ) : null}
        <title>{title}</title>
        {stylesHref ? <link rel="stylesheet" href={stylesHref} /> : null}
      </head>
      <body>
        <div id="root">{content}</div>
      </body>
    </html>
  );

  const stream = await renderToReadableStream(Html);
  const headers: Record<string, string> = {
    "Content-Type": "text/html; charset=utf-8",
    ...(extraHeaders || {}),
  };
  return new Response(stream, { headers });
}

// --------- Simple server-only components (no client JS) ---------

import { HomePage } from "./pages/HomePage";
import { ResultsPage } from "./pages/ResultsPage";
import LibraryPage from "./pages/LibraryPage";

export { HomePage, ResultsPage, LibraryPage };
