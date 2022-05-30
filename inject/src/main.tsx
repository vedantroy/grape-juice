import React from "react";
import { createRoot } from "react-dom/client";
import OverlayApp from "./components/overlayApp";
import { htmlToElement } from "./utils/dom";
import CursorChat from "./vendor/cursor-chat";

function injectReactApp(app: React.ReactElement, suffix: string) {
  const RAND_UUID = "537e51e0-1389-4382-af6b-f8a95f1ed6a6";
  const CONTAINER_ID = `${RAND_UUID}-${suffix}`;

  const div = document.createElement("div");
  div.id = CONTAINER_ID;
  document.body.appendChild(div);
  createRoot(div).render(app);
}

injectReactApp(<OverlayApp />, "overlay");

document.body.appendChild(
  htmlToElement(`
<div id="cursor-chat-layer">
  <input type="text" id="cursor-chat-box">
</div>`)
);

new CursorChat("ws://localhost:1234", "");
