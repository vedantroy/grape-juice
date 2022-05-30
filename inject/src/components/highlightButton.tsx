import tw from "@site/components/tw-styled";
import clsx from "clsx";
import React from "react";

const HighlightButton = tw.button(`
    absolute
    bg-blue-400
    hover:bg-blue-500
    text-white
    rounded
    font-semibold
    px-2
    py-1.5
    select-none
`);

type HighlightButtonProps = {
  disabled: boolean;
  x: number;
  y: number;
  children?: React.ReactNode;
};

export default function ({ disabled, x, y, children }: HighlightButtonProps) {
  return (
    <HighlightButton
      className={clsx(disabled && "bg-blue-300 hover:bg-blue-300 cursor-wait")}
      style={{ zIndex: 9999, top: y, left: x }}
    >
      {children}
    </HighlightButton>
  );
}
