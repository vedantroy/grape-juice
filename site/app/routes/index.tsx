import { Link } from "@remix-run/react";
import { Col } from "~/components/layout";
import tw from "~/components/tw-styled";

const Subtitle = tw.div(
  `font-semibold text-white text-lg md:text-2xl whitespace-nowrap`
);

export default function Index() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex flex-col lg:flex-row bg-gray-600 items-center lg:items-start justify-start">
        <div className="p-8 md:p-16 lg:pt-28 mr-auto lg:mr-0">
          <div className="font-bold text-white text-4xl md:text-7xl">
            Socratic
          </div>
          <Col className="mt-2 md:mt-5 md:gap-1">
            <Subtitle>The annotation layer for the web</Subtitle>
            <Subtitle>Discuss any page in real time</Subtitle>
          </Col>
        </div>
        <img className="max-w-[75vw]" src="/demo.gif"></img>
      </div>
      <div className="font-semibold md:text-2xl pt-8 lg:pt-0 text-white bg-gray-600 w-full text-center">
        <Link to="">Comment Code, </Link>
        <Link to="">Highlight Articles, </Link>
        <Link to="">Annotate Books</Link>
      </div>
      <div className="flex-1 bg-gray-600"></div>
    </div>
  );
}
