import env from "getenv.ts";

// Setting secrets in fly.io using
// cat .env | fly secrets import
// causes all the values to be surrounded in quotes
function trimQuotes(str: string): string {
  if (str[0] === '"' && str[str.length - 1] === '"') {
    return str.slice(1, -1);
  }
  return str;
}

const MODE = env.string("NODE_ENV", "development");
export const IS_PRODUCTION = MODE === "production";
export const IS_DEV = MODE === "development";

export const HOST_URL = trimQuotes(env.string("HOST_URL"));
export const CURSOR_CHAT_URL = trimQuotes(env.string("CURSOR_CHAT_URL"));
export const WEBSOCKET_URL = trimQuotes(env.string("WEBSOCKET_URL"));
export const LMDB_PATH = trimQuotes(
  env.string("LMDB_PATH", "/tmp/lmdb/dev.db")
);
