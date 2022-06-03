import { ActionFunction } from "@remix-run/node";
import { ALLOW_CORS_HEADERS, CORSPreflightLoader } from "~/helpers/cors";
import { getApp } from "~/websocket";
import { handleCreateHighlightReply } from "~/websocket/handlers";
import { ReplyCreatedPayload } from "~/websocket/protocol";

// TODO: There are some weird build shenanigans going on here.
// (I need to copy the .node file to the build folder)

export const action: ActionFunction = async ({ request }) => {
  const msg = ReplyCreatedPayload.parse(await request.json());
  const bytes = await handleCreateHighlightReply(getApp(), msg);
  if (!bytes) {
    return new Response("No highlight found", {
      headers: ALLOW_CORS_HEADERS,
      status: 404,
    });
  }

  return new Response(bytes, {
    headers: {
      ...ALLOW_CORS_HEADERS,
      "Content-Type": "application/octet-stream",
    },
  });
};

export const loader = CORSPreflightLoader;
