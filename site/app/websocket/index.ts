import { pack, unpack } from "msgpackr";
import invariant from "tiny-invariant";
// Seems like tsx does not respect import maps
import uWS from "../lib/uws";
import zod, { z } from "zod";

const Codes = {
  Subscribe: 0,
  ActiveHighlight: 1,
  CursorPosition: 2,
  // Never received, only sent to client
  Subscribed: 2,
} as const;

const Subscribe = zod.object({
  kind: z.literal(Codes.Subscribe),
  postId: z.string(),
});

const ActiveHighlight = zod.object({
  kind: z.literal(Codes.ActiveHighlight),
  postId: z.string(),
  // TODO: In the future, this can be nested message pack
  // data that is serialized to binary
  bin: z.any(),
});

const CursorPosition = zod.object({
  kind: z.literal(Codes.CursorPosition),
  postId: z.string(),
  // See comment in `ActiveHighlight`
  bin: z.any(),
});

const Schema = zod.union([Subscribe, ActiveHighlight, CursorPosition]);

const PORT = 9001;

// From UWS docs:
// * Ironically, JavaScript strings are the least performant of all options, to pass or receive to/from C++.
// * This because we expect UTF-8, which is packed in 8-byte chars. JavaScript strings are UTF-16 internally meaning extra copies and reinterpretation are required.
// *
// * That's why all events pass data by ArrayBuffer and not JavaScript strings, as they allow zero-copy data passing.
const stringToBuffer = (s: string) => Buffer.from(s);

const app = uWS.App({}).ws("/*", {
  message: (ws, bytes, isBinary) => {
    invariant(isBinary, "Websocket messages must be binary");
    const unpacked = unpack(Buffer.from(bytes));
    const msg = Schema.parse(unpacked);
    const { postId } = msg;
    if (
      msg.kind === Codes.ActiveHighlight ||
      msg.kind === Codes.CursorPosition
    ) {
      // This is purely for readability
      const opts = {
        chan: stringToBuffer(`/post/${postId}`),
        bytes,
        isBinary: true,
        compress: false,
      };
      ws.publish(opts.chan, opts.bytes, opts.isBinary, opts.compress);
    } else if (msg.kind === Codes.Subscribe) {
      ws.subscribe(stringToBuffer(`/post/${postId}`));
      const opts = {
        msg: pack({ kind: Codes.Subscribed }),
        isBinary: true,
        compress: false,
      };
      ws.send(opts.msg, opts.isBinary, opts.compress);
    }
  },
});

let listening = false;
export default function initWebSocketOnce() {
  if (!listening) listening = true;
  else return;
  app.listen(9000, (token) => {
    console.log("Token:", token);
    if (token) {
      console.log(`Listening to port ${PORT}`);
    } else {
      throw new Error(`Failed to listen to port ${PORT}`);
    }
  });
}
