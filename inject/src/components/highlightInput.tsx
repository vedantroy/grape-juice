import tw from "@site/components/tw-styled";
import React from "react";
import TextAreaAutosize from "react-textarea-autosize";

const Card = tw.div(`
  font-sans
  absolute
  shadow
  rounded
  bg-white
  w-60
  p-4
  rounded-lg
`);

interface HighlightInputProps {
  x: number;
  y: number;
}

const ELEM_ID_COMPOSER = "composer";

export default function ({ x, y }: HighlightInputProps) {
  return (
    <Card
      onMouseDown={(e) => {
        //@ts-expect-error e.target could be any HTML element (I think??)
        // so Typescript doesn't know how to type this
        const elemId = e.target.getAttribute("data-elem-id");

        e.stopPropagation();

        const clickedUIComponent = elemId === ELEM_ID_COMPOSER;
        if (!clickedUIComponent) {
          e.preventDefault();
        }
      }}
      style={{ zIndex: 9999, top: y, left: x }}
    >
      <TextAreaAutosize
        data-elem-id={ELEM_ID_COMPOSER}
        style={{ resize: "none" }}
        className="w-full"
      />
    </Card>
  );
}
