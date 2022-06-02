import clsx from "clsx";
import React from "react";
import { Rect } from "src/utils/rect";

export type HighlightProps = {
  rects: Rect[];
  opacity: "low" | "medium" | "high";
  color: string;
};

export const Highlight: React.FC<HighlightProps> = ({
  rects,
  opacity,
  color,
}) => {
  return (
    <>
      {rects.map(({ left, top, width, height }, i) => (
        <div
          // using index as a key is is not generally good, but
          // the order of the rects shouldn't change??
          key={i}
          className={clsx(
            `pointer-events-none absolute z-10`,
            opacity === "low" && "opacity-30",
            opacity === "medium" && "opacity-50",
            opacity === "high" && "opacity-70"
          )}
          style={{ top, left, width, height, background: color }}
        ></div>
      ))}
    </>
  );
};
