import type { WebSocket } from "../lib/uws";
import { pack } from "msgpackr";
import type uws from "../lib/uws";
import { Codes, CreateHighlightMessage } from "./protocol";
import logger from "../services/logger";
import db from "../db/index.server";
import { PageId, UserId } from "../db/types.server";

function getPostChannel(postId: string): string {
  return `/post/${postId}`;
}

export function republishMessage(
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
  bytes: ArrayBuffer,
  msg: CreateHighlightMessage
) {
  const { userId, range, postId } = msg;
  logger.info(`Highlight for ${postId} by ${userId}`);
  await db.Page.makeHighlight(postId as PageId, {
    userId: userId as UserId,
    range,
  });
  //console.log("BEFORE REPUBLISH");
  //console.log(bytes);
  // See: https://stackoverflow.com/questions/72440207/why-is-my-array-buffer-suddenly-detaching
  // (For some reason the array buffer was becoming invalid at this point)
  // Workaround: repack the message
  await republishMessage(app, postId, pack(msg));
}

export function handleSubscribe(ws: WebSocket, postId: string) {
  const opts = {
    msg: pack({ kind: Codes.Subscribed }),
    isBinary: true,
    compress: false,
  };
  const channel = getPostChannel(postId);
  logger.info(`Subscribing to ${channel}`);
  ws.subscribe(channel);
  ws.send(opts.msg, opts.isBinary, opts.compress);
}
