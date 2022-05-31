import type { WebSocket } from "../lib/uws";
import { pack } from "msgpackr";
import type uws from "../lib/uws";
import {
  Codes,
  CreateHighlightMessage,
  HighlightCreatedMessage,
  SubscribedMessage,
} from "./protocol";
import logger from "../services/logger";
import db from "../db/index.server";
import { PageId, UserId } from "../db/types.server";

function getPostChannel(postId: string): string {
  return `/post/${postId}`;
}

const VALIDATE_OUTGOING_MESSAGES = true;

export function publishMessage(
  app: uws.TemplatedApp,
  postId: string,
  bytes: ArrayBuffer
) {
  // This is purely for readability
  const opts = {
    chan: getPostChannel(postId),
    bytes,
    isBinary: true,
    compress: false,
  };
  logger.info(
    `Republishing to ${opts.chan} with ${app.numSubscribers(
      opts.chan
    )} subscribers`
  );
  app.publish(opts.chan, opts.bytes, opts.isBinary, opts.compress);
}

export async function handleCreateHighlight(
  app: uws.TemplatedApp,
  msg: CreateHighlightMessage
) {
  const { userId, range, postId, containerSelector } = msg;
  logger.info(`Highlight for ${postId} by ${userId}`);
  const id = await db.Page.makeHighlight(postId as PageId, {
    userId: userId as UserId,
    range,
    containerSelector,
  });

  const newMsg: HighlightCreatedMessage = {
    ...msg,
    kind: Codes.HighlightCreated,
    id,
  };

  if (VALIDATE_OUTGOING_MESSAGES) {
    HighlightCreatedMessage.parse(newMsg);
  }

  await publishMessage(app, postId, pack(newMsg));
}

export async function handleSubscribe(ws: WebSocket, postId: PageId) {
  const highlights = await db.Page.getPageHighlightsAndReplies(postId);
  if (!highlights) return null;

  const msg: SubscribedMessage = {
    kind: Codes.Subscribed,
    highlights,
  };

  if (VALIDATE_OUTGOING_MESSAGES) {
    SubscribedMessage.parse(msg);
  }

  const opts = {
    msg: pack(msg),
    isBinary: true,
    compress: false,
  };
  const channel = getPostChannel(postId);
  logger.info(`Subscribing to ${channel}`);
  ws.subscribe(channel);
  ws.send(opts.msg, opts.isBinary, opts.compress);
}
