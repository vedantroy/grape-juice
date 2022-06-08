import { PostId } from "@site/db/types.server";
import invariant from "tiny-invariant";

declare global {
  var __INJECTED_POST_ID: PostId;
  var __INJECTED_WEBSOCKET_CHANNEL_URL: string;
  var __INJECTED_CURSOR_CHAT_URL: string;
  var __INJECTED_HOST_URL: string;
}

export const CHANNEL = import.meta.env.DEV ? "test" : window.__INJECTED_POST_ID;
export const WEBSOCKET_URL = import.meta.env.DEV
  ? "ws://localhost:9001/test"
  : window.__INJECTED_WEBSOCKET_CHANNEL_URL;
export const CURSOR_CHAT_URL = import.meta.env.DEV
  ? "ws://localhost:9002"
  : window.__INJECTED_CURSOR_CHAT_URL;
export const HOST_URL = import.meta.env.DEV
  ? "http://localhost:3000"
  : window.__INJECTED_HOST_URL;

invariant(CHANNEL, "CHANNEL is not defined");
invariant(WEBSOCKET_URL, "WEBSOCKET_URL is not defined");
invariant(CURSOR_CHAT_URL, "CURSOR_CHAT_URL is not defined");
invariant(HOST_URL, "HOST_URL is not defined");
