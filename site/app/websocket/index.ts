import { unpack } from "msgpackr";
import invariant from "tiny-invariant";
// Seems like tsx does not respect import maps
import uWS from "../lib/uws";
import { handleSubscribe, republishMessage } from "./handlers";
import { Message, Codes } from "./protocol";
import logger from "~/services/logger";

const PORT = 9001;

const app = uWS.App({}).ws("/*", {
  message: (ws, bytes, isBinary) => {
    invariant(isBinary, "Websocket messages must be binary");
    const unpacked = unpack(Buffer.from(bytes));
    const msg = Message.parse(unpacked);
    const { postId } = msg;

    if (
      msg.kind === Codes.ActiveHighlight ||
      msg.kind === Codes.CursorPosition
    ) {
      republishMessage(app, postId, bytes);
      //echoMessage(ws, postId, bytes);
    } else if (msg.kind === Codes.Subscribe) {
      handleSubscribe(ws, postId);
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
