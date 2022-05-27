//import "./style.css";

// Don't use NPM b/c the official package has no type definitions
// We vendor it & rename all the files to Typescript to get some
// rudimentary type definitions
import TextHighlighter from "./vendor/text-highlighter";
import dom from "./vendor/text-highlighter/utils/dom";

import short from "short-uuid";
import fingerprint from "@fingerprintjs/fingerprintjs";
import Alpine from "alpinejs";
import { htmlToElement } from "./dom_utils";
import { testClass } from "./styles";

// MVP cut:
// - No security protections. None.
// Generate all UUIDs on the client side
// Yes. This means clients can fake tons of identical UUIDs & overwrite
// other people's data.

type Highlight = [html: string, text: string, a: number, b: number];
type HighlighterOptions = {
  preprocessDescriptors?: (
    range: Range,
    descriptors: Highlight[],
    timestamp: number
  ) => {
    meta: {
      cancel?: boolean;
      // This is set in the example in the README
      // but I don't think it's used for anything ...
      id: string;
    };
    descriptors: Highlight[];
  };
};

const RAND_PREFIX_UUID = "5c050568-04b0-4f62-8b7d-8d84c837f9c3";
const RAND_PREFIX = `x-${RAND_PREFIX_UUID}-`;
const HIGHLIGHT_BUTTON = "highlight-button";

async function go() {
  const fp = await fingerprint.load({ monitoring: false });
  const {
    visitorId,
    // unused b/c we'll always use the fingerprint
    confidence: { score },
  } = await fp.get();

  Alpine.prefix(RAND_PREFIX);
  Alpine.store(HIGHLIGHT_BUTTON, {
    render: false,
    x: -1,
    y: -1,
    showAt(x: number, y: number) {
      this.x = x;
      this.y = y;
      this.render = true;
    },
    hide() {
      this.render = false;
    },
  } as any);
  Alpine.start();

  // Always store the current highlight
  // Source of truth = current active range
  // Always store that, when we click a button -- we highlight the last known source of truth
  // We don't show the button if the range is empty (prevents highlighting stale source of truth)

  const ROOT_ELEMENT = document.body;

  let lastKnownRange: Range | null = null;

  document.addEventListener("selectionchange", () => {
    const range = dom(ROOT_ELEMENT).getRange();
    // TODO: Can a range ever be empty?
    lastKnownRange = range || null;
    if (lastKnownRange) {
      // Show the highlight button
      const rect = lastKnownRange.getBoundingClientRect();
    } else {
    }
  });

  const options: HighlighterOptions = {
    // where in the life cycle is this being called?
    // after a button click
    preprocessDescriptors(range, descriptors, timestamp) {
      const uuid = short.generate();
      const descriptorsWithIds = descriptors.map<Highlight>((descriptor) => {
        const [wrapper, ...rest] = descriptor;
        return [
          wrapper
            .replace('class="highlighted"', `class="highlighted ${uuid}"`)
            .replace("", ""),
          ...rest,
        ];
      });
      return { meta: { id: uuid }, descriptors: descriptorsWithIds };
    },
  };
  const highlighter = new TextHighlighter(document.body, options);
}

document.body.appendChild(
  htmlToElement(`
  <div class="${testClass}">
    <button ${RAND_PREFIX}show="3">Highlight</button>
  </div>
`)
);

go();
