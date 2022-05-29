import type { Rangee } from "rangee";

export function getNonEmptyRange(): Range | null {
  const selection = document.getSelection();
  // TODO: Not sure `selectedText` is every actually empty
  const selectedText = selection?.toString() || "";
  if (selection && selection.rangeCount > 0 && selectedText.length > 0) {
    const range = selection.getRangeAt(0);
    return range.collapsed ? null : range;
  } else return null;
}

function tryToSerializeRange(
  rangee: Rangee,
  range: Range | null
): { range: Range; serialized: string } | null {
  if (!range) return null;
  try {
    return { range, serialized: rangee.serializeAtomic(range) };
  } catch (e) {
    return null;
  }
}

export type Selection = { x: number; y: number; serializedRange: string };
export function getSelectionUpdate(rangeSerializer: Rangee): null | Selection {
  const rangeAndSerializedRange = tryToSerializeRange(
    rangeSerializer,
    getNonEmptyRange()
  );
  if (!rangeAndSerializedRange) return null;

  const { range, serialized } = rangeAndSerializedRange;
  const rects = range.getClientRects();
  const lastRect = rects[rects.length - 1];
  const highlightButtonOffset = 20;
  return {
    x: lastRect.right + highlightButtonOffset,
    y: lastRect.top,
    serializedRange: serialized,
  };
}
