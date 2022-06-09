import { PostId } from "@site/db/types.server";
import invariant from "tiny-invariant";

// If you want to run against the prod server locally
window.__INJECTED_POST_ID = "foo" as PostId;
window.__INJECTED_WEBSOCKET_CHANNEL_URL = "wss://webhighlighter.com:9001";
window.__INJECTED_CURSOR_CHAT_URL = "wss://webhighlighter.com:9002";
window.__INJECTED_HOST_URL = "https://webhighlighter.com";

// const DEV = import.meta.env.DEV;
const DEV = false;

declare global {
  var __INJECTED_POST_ID: PostId;
  var __INJECTED_WEBSOCKET_CHANNEL_URL: string;
  var __INJECTED_CURSOR_CHAT_URL: string;
  var __INJECTED_HOST_URL: string;
  var __DEBUG_LOG: boolean;
}

export const CHANNEL = DEV ? "test" : window.__INJECTED_POST_ID;
export const WEBSOCKET_URL = DEV
  ? "ws://localhost:9001/test"
  : window.__INJECTED_WEBSOCKET_CHANNEL_URL;
export const CURSOR_CHAT_URL = DEV
  ? "ws://localhost:9002"
  : window.__INJECTED_CURSOR_CHAT_URL;
export const HOST_URL = DEV
  ? "http://localhost:3000"
  : window.__INJECTED_HOST_URL;

invariant(CHANNEL, "CHANNEL is not defined");
invariant(WEBSOCKET_URL, "WEBSOCKET_URL is not defined");
invariant(CURSOR_CHAT_URL, "CURSOR_CHAT_URL is not defined");
invariant(HOST_URL, "HOST_URL is not defined");

export function isDebugMode() {
  return window.__DEBUG_LOG;
}
