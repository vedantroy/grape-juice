// TODOS:
// - Ranges are stored super inefficiently
// - No support for incremental updates, we always send the entire range

// NPM version doesn't work with Vite
import { getRange, htmlToElement } from "./utils/dom";
import { Rangee } from "./vendor/rangee";
import ReactDOM from "react-dom";
import invariant from "tiny-invariant";
import HighlightApp, { setCoordsIfLoaded } from "./components/highlightApp";
import React from "react";

// Step 1:
// [x] Show the save button next to the range
// Figure out how data layer will work

const RAND_UUID = "537e51e0-1389-4382-af6b-f8a95f1ed6a6";
const HIGHLIGHT_BUTTON_CONTAINER_ID = `${RAND_UUID}-highlight-button-container`;
document.body.appendChild(
  htmlToElement(`<div id="${HIGHLIGHT_BUTTON_CONTAINER_ID}"></div>`)
);

const highlightButton = document.getElementById(HIGHLIGHT_BUTTON_CONTAINER_ID);
invariant(
  highlightButton,
  `Could not find element with id: ${HIGHLIGHT_BUTTON_CONTAINER_ID}`
);

ReactDOM.render(<HighlightApp />, highlightButton);

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
