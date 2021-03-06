import { json, LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import DB from "~/db/index.server";
import { notFound } from "remix-utils";
import { getParam } from "~/helpers/params";
import { PostId } from "~/db/types.server";
import rewriter from "~/services/HTMLRewriter";
import { CSS_SRC, SCRIPT_SRC } from "~/generated/injected_sources";
import { CURSOR_CHAT_URL, HOST_URL, WEBSOCKET_URL } from "~/services/env";

export const loader: LoaderFunction = async ({ params }) => {
  const postId = getParam(params, "postId") as PostId;

  const page = await DB.Page.getPageWithHighlightsAndReplies(postId);
  if (!page) {
    throw notFound({ message: `Post with id: ${postId} not found` });
  }

  const { html } = page;

  const withOverlay = rewriter.injectOverlay(html, {
    cssSrc: CSS_SRC,
    scriptSrc: SCRIPT_SRC,
    cursorChatUrl: CURSOR_CHAT_URL,
    websocketRootUrl: WEBSOCKET_URL,
    postId,
    hostUrl: HOST_URL,
  });

  return json({ html: withOverlay });

  // We can't just return HTML directly because
  // then `redirect` does not work
  // See: https://github.com/remix-run/remix/discussions/3405

  //return new Response(withOverlay, {
  //  headers: {
  //    "Content-Type": "text/html",
  //  },
  //});
};

export default function () {
  const { html } = useLoaderData<any>();
  return <iframe className="w-screen h-screen" srcDoc={html}></iframe>;
}
