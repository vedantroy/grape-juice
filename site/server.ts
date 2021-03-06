import path from "path";
import express from "express";
import compression from "compression";
import morgan from "morgan";
import cors from "cors";
import { createRequestHandler } from "@remix-run/express";
import { initWebSocketOnce } from "./app/websocket";
import {
  createMetronomeGetLoadContext,
  registerMetronome,
} from "@metronome-sh/express";

const BUILD_DIR = path.join(process.cwd(), "build");

const app = express();

app.use(compression());

// http://expressjs.com/en/advanced/best-practice-security.html#at-a-minimum-disable-x-powered-by-header
app.disable("x-powered-by");

// Remix fingerprints its assets so we can cache forever.
app.use(
  "/build",
  express.static("public/build", { immutable: true, maxAge: "1y" })
);

// TODO: Should I just enable cors on everything?
// Then I can remove the CORs code in the app
app.use("/utils/*", [cors()]);

// Everything else (like favicon.ico) is cached for an hour. You may want to be
// more aggressive with this caching.
app.use(express.static("public", { maxAge: "1h" }));

app.use(morgan("tiny"));

const buildWithMetronome = registerMetronome(require(BUILD_DIR));
const metronomeGetLoadContext =
  createMetronomeGetLoadContext(buildWithMetronome);

app.all(
  "*",
  process.env.NODE_ENV === "development"
    ? (req, res, next) => {
        purgeRequireCache();

        return createRequestHandler({
          build: buildWithMetronome,
          mode: process.env.NODE_ENV,
          getLoadContext: metronomeGetLoadContext,
        })(req, res, next);
      }
    : createRequestHandler({
        build: buildWithMetronome,
        mode: process.env.NODE_ENV,
        getLoadContext: metronomeGetLoadContext,
      })
);
const port = 3000;

app.listen(port, () => {
  console.log(`Express server listening on port ${port}`);
});

initWebSocketOnce();

function purgeRequireCache() {
  // purge require cache on requests for "server side HMR" this won't let
  // you have in-memory objects between requests in development,
  // alternatively you can set up nodemon/pm2-dev to restart the server on
  // file changes, but then you'll have to reconnect to databases/etc on each
  // change. We prefer the DX of this, so we've included it for you by default
  for (let key in require.cache) {
    if (key.startsWith(BUILD_DIR)) {
      delete require.cache[key];
    }
  }
}

// Satisfy VsCode warnings
export {};
