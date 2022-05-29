import clsx from "clsx";
import * as _ from "lodash-es";
import React from "react";

export type HighlighterProps = {
  highlights: Record<string, Range[]>;
};

type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type HighlightProps = {
  rects: Rect[];
  opacity: "low" | "medium" | "high";
};

const Highlight: React.FC<HighlightProps> = ({ rects, opacity }) => {
  return (
    <>
      {rects.map(({ x, y, width, height }, i) => (
        <div
          // don't want the order to change ..
          key={i}
          className={clsx(
            `pointer-events-none absolute bg-sky-500 z-10`,
            opacity === "low" && "opacity-10",
            opacity === "medium" && "opacity-30",
            opacity === "high" && "opacity-50"
          )}
          style={{ top: y, left: x, width, height }}
        ></div>
      ))}
    </>
  );
};

export default function ActiveHighlighter({ highlights }: HighlighterProps) {
  const userIdToRects = _.toPairs(highlights).map<[string, DOMRect[]]>(
    ([userId, ranges]) => [userId, ranges.map((r) => r.getBoundingClientRect())]
  );

  return (
    <div className="inset-0 absolute w-0 h-0">
      {userIdToRects.map(([userId, rects]) => (
        <Highlight key={userId} rects={rects} opacity="low" />
      ))}
    </div>
  );
}
