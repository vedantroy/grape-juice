import type { Rangee } from "rangee";

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
};
export function getSelectionUpdate(rangeSerializer: Rangee): null | Selection {
  const rangeWithText = getNonEmptyRangeWithText();
  if (!rangeWithText) return null;

  const { range } = rangeWithText;
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
  )
    return null;

  return {
    x: lastRect.right,
    y: lastRect.top,
    serializedRange: serialized,
    container: commonAncestorNotTextNode,
  };
}
