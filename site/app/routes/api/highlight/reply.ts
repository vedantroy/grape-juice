import { ActionFunction } from "@remix-run/node";
import db from "~/db/index.server";
import { HighlightId, PageId, UserId } from "~/db/types.server";
import { ALLOW_CORS_HEADERS, CORSPreflightLoader } from "~/helpers/cors";
import { ReplyCreatedPayload } from "~/websocket/protocol";

export const action: ActionFunction = async ({ request }) => {
  const {
    postId,
    highlightId,
    reply: { userId, text },
  } = ReplyCreatedPayload.parse(await request.json());
  await db.Page.makeHighlightReply(postId as PageId, {
    userId: userId as UserId,
    text,
    highlightId: highlightId as HighlightId,
  });
  return new Response("", {
    headers: {
      ...ALLOW_CORS_HEADERS,
    },
  });
};

export const loader = CORSPreflightLoader;
