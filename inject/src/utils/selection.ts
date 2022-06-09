import type { Rangee } from "rangee";
import { makeRelativeToDocument } from "./rect";

export function getNonEmptyRangeWithText(): {
  range: Range;
  text: string;
} | null {
  const selection = document.getSelection();
  // TODO: Not sure `selectedText` is every actually empty
  const selectedText = selection?.toString() || "";
  if (selection && selection.rangeCount > 0 && selectedText.length > 0) {
    const range = selection.getRangeAt(0);
    return range.collapsed ? null : { range, text: selectedText };
  } else return null;
}

// TODO: bug:
// In Firefox, a valid range will sometimes be serialized as
// QAA=, which is invalid.
function tryToSerializeRange(
  rangee: Rangee,
  range: Range | null
): { serialized: string } | null {
  if (!range) return null;
  try {
    const serialized = rangee.serializeAtomic(range);
    try {
      // Make sure the range can be round-tripped
      // TODO: Verify this fixes a bug
      rangee.deserializeAtomic(serialized);
    } catch (e) {
      return null;
    }
    return { serialized };
  } catch (e) {
    return null;
  }
}

export type Selection = {
  x: number;
  y: number;
  serializedRange: string;
  container: HTMLElement;
  errorTooLong?: boolean;
};

const MAX_SELECTION_LEN = 300;

export function getSelectionUpdate(rangeSerializer: Rangee): null | Selection {
  const rangeWithText = getNonEmptyRangeWithText();
  if (!rangeWithText) return null;

  const { range, text } = rangeWithText;
  if (text.length > MAX_SELECTION_LEN) {
    // If we don't do this, we can crash the browser
    // Because the serialization process blocks the main thread
    // This is useful for when the entire document gets accidentally selected
    return {
      x: 0,
      y: 0,
      serializedRange: "",
      container: null as any,
      errorTooLong: true,
    };
  }

  const rangeAndSerializedRange = tryToSerializeRange(rangeSerializer, range);
  if (!rangeAndSerializedRange) return null;

  const { serialized } = rangeAndSerializedRange;
  const rects = range.getClientRects();
  const lastRect = rects[rects.length - 1];

  const { commonAncestorContainer: c } = range;
  const commonAncestorNotTextNode =
    c.nodeType === Node.TEXT_NODE ? c.parentElement : c;
  if (
    // TODO: These checks might be disallowing valid ranges
    !commonAncestorNotTextNode ||
    !(commonAncestorNotTextNode instanceof HTMLElement)
  ) {
    return null;
  }

  const transformed = makeRelativeToDocument(lastRect);
  return {
    x: transformed.left + transformed.width,
    y: transformed.top,
    serializedRange: serialized,
    container: commonAncestorNotTextNode,
  };
}
