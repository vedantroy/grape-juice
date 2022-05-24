import env from "getenv.ts";

const MODE = env.string("NODE_ENV", "development");
const IS_PRODUCTION = MODE === "production";
const IS_DEV = MODE === "development";

const HOST_URL = env.string("HOST", "http://localhost:3000");

export { IS_DEV, IS_PRODUCTION, HOST_URL };
