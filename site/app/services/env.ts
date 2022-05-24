import env from "getenv.ts";

const MODE = env.string("NODE_ENV", "development");
const IS_PRODUCTION = MODE === "production";
const IS_DEV = MODE === "development";

export { IS_DEV, IS_PRODUCTION };
