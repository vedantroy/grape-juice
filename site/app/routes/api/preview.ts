import { LoaderFunction, json } from "@remix-run/node";
// We can't use web-fetch because of bugs:
// https://github.com/remix-run/remix/pull/3404
import axios from "axios";

import rewriter from "~/services/HTMLRewriter";

export type PreviewResponse = { error: string } | { html: string };

const FETCH_TIMEOUT_MS = 3000;

export const loader: LoaderFunction = async ({ request }) => {
  const urlToFetch = new URL(request.url).searchParams.get("url");
  if (urlToFetch === null) {
    throw new Response("No url provided", { status: 400 });
  }

  let responseHTML: string;
  let status: number;
  let statusText: string;
  try {
    const response = await axios.get(urlToFetch, {
      timeout: FETCH_TIMEOUT_MS,
      transformResponse: (x) => x,
      validateStatus: () => true,
    });
    responseHTML = response.data;
    status = response.status;
    statusText = response.statusText;
  } catch (e: any) {
    if (e.code === "ECONNABORTED") {
      return json(
        {
          error: `Connection to: ${urlToFetch} failed\nRequest exceeded time limit of ${FETCH_TIMEOUT_MS}ms`,
        },
        { status: 400 }
      );
    }

    return json(
      { error: `Connection to: ${urlToFetch} failed` },
      { status: 400 }
    );
  }

  if (status !== 200) {
    return json(
      {
        error: `Page returned: ${status} with message "${statusText}"`,
      },
      { status: 400 }
    );
  }

  try {
    const html = rewriter.makeLinksAbsolute(responseHTML, {
      originUrl: urlToFetch,
    });
    return json({ html }, { status: 200 });
  } catch (e) {
    return json(
      {
        error: `Fetched HTML, but failed to parse\nPlease report to developer`,
      },
      { status: 500 }
    );
  }
};
