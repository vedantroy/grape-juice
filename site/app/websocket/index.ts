import { unpack } from "msgpackr";
import invariant from "tiny-invariant";
// Seems like tsx does not respect import maps
import uWS from "../lib/uws";
import {
  handleCreateHighlight,
  handleSubscribe,
  republishMessage,
} from "./handlers";
import { Message, Codes } from "./protocol";

const PORT = 9001;

const app = uWS.App({}).ws("/*", {
  message: (ws, bytes, isBinary) => {
    invariant(isBinary, "Websocket messages must be binary");
    const unpacked = unpack(Buffer.from(bytes));
    const msg = Message.parse(unpacked);
    //console.log("AFTER PARSE")
    //console.log(bytes);

    if (msg.kind === Codes.Selection || msg.kind === Codes.ClearSelection) {
      const { postId } = msg;
      republishMessage(app, postId, bytes);
      //echoMessage(ws, postId, bytes);
    } else if (msg.kind === Codes.Subscribe) {
      const { postId } = msg;
      handleSubscribe(ws, postId);
    } else if (msg.kind === Codes.CreateHighlight) {
      //console.log("INSIDE MESSAGE")
      //console.log(bytes)
      handleCreateHighlight(app, bytes, msg);
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
