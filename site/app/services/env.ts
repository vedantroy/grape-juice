import env from "getenv.ts";

const MODE = env.string("NODE_ENV", "development");
const IS_PRODUCTION = MODE === "production";
const IS_DEV = MODE === "development";

const HOST_URL = env.string("HOST_URL");
export const CURSOR_CHAT_URL = env.string("CURSOR_CHAT_URL");
export const WEBSOCKET_URL = env.string("WEBSOCKET_URL");

export { IS_DEV, IS_PRODUCTION, HOST_URL };
