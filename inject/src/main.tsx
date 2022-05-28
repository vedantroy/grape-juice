// TODOS:
// - Ranges are stored super inefficiently
// - No support for incremental updates, we always send the entire range

import React from "react";
import ReactDOM from "react-dom";

import { Rangee } from "rangee";

// NPM version doesn't work with Vite
//import { Rangee } from "./vendor/rangee";
import { getRange } from "./utils/dom";
import HighlightApp, { setCoordsIfLoaded } from "./components/highlightApp";
import OverlayApp from "./components/overlayApp";

// Step 1:
// [x] Show the save button next to the range
// Figure out how data layer will work

function injectReactApp(app: React.ReactElement, suffix: string) {
  const RAND_UUID = "537e51e0-1389-4382-af6b-f8a95f1ed6a6";
  const CONTAINER_ID = `${RAND_UUID}-${suffix}`;

  const div = document.createElement("div");
  div.id = CONTAINER_ID;
  document.body.appendChild(div);
  ReactDOM.render(app, div);
}

injectReactApp(<HighlightApp />, "highlight-button");
injectReactApp(<OverlayApp />, "overlay");

const rangee = new Rangee({ document });
document.addEventListener("selectionchange", () => {
  const range = getRange();
  if (range) {
    const rangeRepresentation = rangee.serializeAtomic(range);

    console.log(rangeRepresentation);
    console.log(rangee.deserializeAtomic(rangeRepresentation));

    const lastRect = [...range.getClientRects()].slice(-1)[0];

    setCoordsIfLoaded({ x: lastRect.right + 20, y: lastRect.top });
  } else {
    setCoordsIfLoaded(null);
  }
});
