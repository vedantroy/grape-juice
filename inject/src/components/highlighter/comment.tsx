import clsx from "clsx";
import React, { useEffect } from "react";
import useResizeObserver from "use-resize-observer";

type CommentProps = {
  x: number;
  y: number;
  visible: boolean;
  onHeightChanged: (height: number) => void;
};

const DEFAULT_HEIGHT = -1;

export default function ({ x, y, visible, onHeightChanged }: CommentProps) {
  const { ref, height = DEFAULT_HEIGHT } = useResizeObserver<HTMLDivElement>();

  useEffect(() => {
    if (height === DEFAULT_HEIGHT) return;
    onHeightChanged(height);
  }, [height]);

  return (
    <div
      ref={ref}
      id="comment-test"
      className={clsx(
        "absolute z-50 bg-black h-5 w-5",
        !visible && "invisible"
      )}
      style={{ top: y, left: x }}
    >
      Hello!
    </div>
  );
}
