import type { WebSocket } from "../lib/uws";
import { pack } from "msgpackr";
import type uws from "../lib/uws";
import { Codes } from "./protocol";
import logger from "../services/logger";

//export function echoMessage(
//  ws: uws.WebSocket,
//  postId: string,
//  bytes: ArrayBuffer
//) {
//  // This is purely for readability
//  const opts = {
//    chan: `/post/${postId}`,
//    bytes,
//    isBinary: true,
//    compress: false,
//  };
//  logger.info(`Echoing message`);
//  ws.send(opts.bytes, opts.isBinary, opts.compress);
//}

export function republishMessage(
  app: uws.TemplatedApp,
  postId: string,
  bytes: ArrayBuffer
) {
  // This is purely for readability
  const opts = {
    chan: `/post/${postId}`,
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

export function handleSubscribe(ws: WebSocket, postId: string) {
  const opts = {
    msg: pack({ kind: Codes.Subscribed }),
    isBinary: true,
    compress: false,
  };
  const channel = `/post/${postId}`;
  logger.info(`Subscribing to ${channel}`);
  ws.subscribe(channel);
  ws.send(opts.msg, opts.isBinary, opts.compress);
}
