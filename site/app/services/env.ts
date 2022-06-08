import env from "getenv.ts";

const MODE = env.string("NODE_ENV", "development");
export const IS_PRODUCTION = MODE === "production";
export const IS_DEV = MODE === "development";

export const HOST_URL = env.string("HOST_URL");
export const CURSOR_CHAT_URL = env.string("CURSOR_CHAT_URL");
export const WEBSOCKET_URL = env.string("WEBSOCKET_URL");
export const LMDB_PATH = env.string("LMDB_PATH", "/tmp/dev.db");
