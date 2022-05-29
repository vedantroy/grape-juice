// TODOS:
// - Ranges are stored super inefficiently
// - No support for incremental updates, we always send the entire range

import React from "react";
import { createRoot } from "react-dom/client";

// TODO: I patched this package to work
// but the fact that I had to patch it means I should vet
// it for proper behavior (is it as recent as what the Github source)
// https://github.com/LukasRada/rangee
import { Rangee } from "rangee";
import FingerprintJS from "@fingerprintjs/fingerprintjs";

// NPM version doesn't work with Vite
import { getRange } from "./utils/dom";
import OverlayApp, { OVERLAY_LOADED } from "./components/overlayApp";

const OVERLAY_TIMER = "overlay-load-timer";
console.time(OVERLAY_TIMER);

function injectReactApp(app: React.ReactElement, suffix: string) {
  const RAND_UUID = "537e51e0-1389-4382-af6b-f8a95f1ed6a6";
  const CONTAINER_ID = `${RAND_UUID}-${suffix}`;

  const div = document.createElement("div");
  div.id = CONTAINER_ID;
  document.body.appendChild(div);
  createRoot(div).render(app);
}

function addSelectionChangeListener() {
  const rangee = new Rangee({ document });
  function tryToSerializeRange(
    range: Range | null
  ): { range: Range; serialized: string } | null {
    if (!range) return null;
    try {
      return { range, serialized: rangee.serializeAtomic(range) };
    } catch (e) {
      return null;
    }
  }

  document.addEventListener("selectionchange", () => {
    const rangeAndSerializedRange = tryToSerializeRange(getRange());
    if (!rangeAndSerializedRange) {
      window.setSelection!!(null);
    } else {
      const { range, serialized } = rangeAndSerializedRange;
      const rects = range.getClientRects();
      const lastRect = rects[rects.length - 1];
      window.setSelection!!({
        x: lastRect.right + 20,
        y: lastRect.top,
        serializedRange: serialized,
      });
    }
  });
}

async function setUserId() {
  // We don't have any auth, so this is how we do things like
  // "anonymous badger" -- it feels very transparent to the user
  // (they will see they are an anonymous badger between page visits)
  const fingerPrint = await FingerprintJS.load();
  const { visitorId } = await fingerPrint.get();
  window.setUserId!!(visitorId);
}

async function overlayLoaded() {
  console.timeEnd(OVERLAY_TIMER);

  addSelectionChangeListener();
  setUserId();
}

window.addEventListener(OVERLAY_LOADED, overlayLoaded);
injectReactApp(<OverlayApp />, "overlay");
