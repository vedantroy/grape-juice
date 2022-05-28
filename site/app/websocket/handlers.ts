import type { WebSocket } from "../lib/uws";
import { pack } from "msgpackr";
import { Codes } from "./protocol";

// From UWS docs:
// * Ironically, JavaScript strings are the least performant of all options, to pass or receive to/from C++.
// * This because we expect UTF-8, which is packed in 8-byte chars. JavaScript strings are UTF-16 internally meaning extra copies and reinterpretation are required.
// *
// * That's why all events pass data by ArrayBuffer and not JavaScript strings, as they allow zero-copy data passing.
const stringToBuffer = (s: string) => Buffer.from(s);

export function republishMessage(
  ws: WebSocket,
  postId: string,
  bytes: ArrayBuffer
) {
  // This is purely for readability
  const opts = {
    chan: stringToBuffer(`/post/${postId}`),
    bytes,
    isBinary: true,
    compress: false,
  };
  ws.publish(opts.chan, opts.bytes, opts.isBinary, opts.compress);
}

export function handleSubscribe(ws: WebSocket, postId: string) {
  const opts = {
    msg: pack({ kind: Codes.Subscribed }),
    isBinary: true,
    compress: false,
  };
  ws.subscribe(stringToBuffer(`/post/${postId}`));
  ws.send(opts.msg, opts.isBinary, opts.compress);
}
