// step 1: find the rightmost "anchor" point to align stuff
// step 2: each element gets its pref y
// step 3: sort by pref y
// step 4: render algo:
// for each set of overlapping elements
//  - place the 1st comment box at its pref y
//  - place the 2nd comment box at its pref y
//    - place the first comment box at its pref y
//

import { HighlightId } from "@site/db/types.server";
import {
  PermanentHighlight,
  PermanentHighlighterProps,
} from "./permanentHighlighter";

export default function ({ highlights }: PermanentHighlighterProps) {
  const leftCoord = getLeftCoord(highlights);
  const idealCoords = getIdealCoords(highlights);
  const actualCoords = getActualCoor(highlights);

  return (
    <div>
      {highlights.map((h) => (
        <div></div>
      ))}
    </div>
  );

  // coords of all elements -> max(X)
  // sort by preferred Y
  // for elem:
  //  if preffered Y not occupied, place @ preffered Y
  //  shift up previous elements, place @ preffered Y
  //  shift(elems)
  //
}
