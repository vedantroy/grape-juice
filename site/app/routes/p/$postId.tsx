import { json, LoaderFunction } from "@remix-run/node";
import DB from "~/db/index.server";
import { notFound } from "remix-utils";
import { getParam } from "~/helpers/params";
import { PostId } from "~/db/types.server";
import rewriter from "~/services/HTMLRewriter";
import { SCRIPT_SRC } from "~/generated/injected_sources";
import { CURSOR_CHAT_URL, WEBSOCKET_URL } from "~/services/env";

export const loader: LoaderFunction = async ({ request, params }) => {
  const postId = getParam(params, "postId") as PostId;

  const page = await DB.Page.getPageWithHighlightsAndReplies(postId);
  if (!page) {
    throw notFound({ message: `Post with id: ${postId} not found` });
  }

  const { html } = page;

  const withOverlay = rewriter.injectOverlay(html, {
    scriptSrc: SCRIPT_SRC,
    cursorChatUrl: CURSOR_CHAT_URL,
    websocketRootUrl: WEBSOCKET_URL,
    postId,
  });

  return new Response(withOverlay, {
    headers: {
      "Content-Type": "text/html",
    },
  });
};
