import { unpack } from "msgpackr";
import invariant from "tiny-invariant";
import { PageId } from "~/db/types.server";
// Seems like tsx does not respect import maps
import uWS from "../lib/uws";
import {
  handleCreateHighlight,
  handleSubscribe,
  publishMessage,
} from "./handlers";
import { Message, Codes } from "./protocol";

const PORT = 9001;

const app = uWS.App({}).ws("/*", {
  message: (ws, bytes, isBinary) => {
    invariant(isBinary, "Websocket messages must be binary");
    const unpacked = unpack(Buffer.from(bytes));
    const msg = Message.parse(unpacked);

    if (msg.kind === Codes.Selection || msg.kind === Codes.ClearSelection) {
      const { postId } = msg;
      publishMessage(app, postId, bytes);
    } else if (msg.kind === Codes.Subscribe) {
      const { postId } = msg;
      handleSubscribe(ws, postId as PageId);
    } else if (msg.kind === Codes.CreateHighlight) {
      handleCreateHighlight(app, msg);
    }
  },
});

let listening = false;
export default function initWebSocketOnce() {
  if (!listening) listening = true;
  else return;
  app.listen(PORT, (token) => {
    console.log("Token:", token);
    if (token) {
      console.log(`Listening to port ${PORT}`);
    } else {
      throw new Error(`Failed to listen to port ${PORT}`);
    }
  });
}
