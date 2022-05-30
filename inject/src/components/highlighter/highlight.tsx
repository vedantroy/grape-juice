import clsx from "clsx";
import React from "react";

type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type HighlightProps = {
  rects: Rect[];
  opacity: "low" | "medium" | "high";
};

export const Highlight: React.FC<HighlightProps> = ({ rects, opacity }) => {
  return (
    <>
      {rects.map(({ x, y, width, height }, i) => (
        <div
          // using index as a key is is not generally good, but
          // the order of the rects shouldn't change??
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
