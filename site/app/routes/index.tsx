import { Link, useLoaderData } from "@remix-run/react";
import { FiExternalLink } from "react-icons/fi";
import { LoaderFunction, json } from "@remix-run/node";
import { parseISO, format } from "date-fns";
import DB from "~/db/index.server";
import { Col, Row } from "~/components/layout";
import tw from "~/components/tw-styled";
import clsx from "clsx";

type Pages = Array<{
  key: string;
  url: string;
  title: string;
  date: string;
}>;

export const loader: LoaderFunction = async () => {
  const pages = await DB.Page.getPages();
  const mostRecentFirst = pages.sort(
    (a, b) => a.date.getUTCSeconds() - b.date.getUTCSeconds()
  );
  return json<Pages>(
    mostRecentFirst.map((p) => ({ ...p, date: p.date.toISOString() }))
  );
};

const Subtitle = tw.div(
  `font-semibold text-white text-lg md:text-2xl whitespace-nowrap`
);

const UseCaseLink = ({
  to,
  children,
}: {
  to: string;
  children: React.ReactNode;
}) => (
  <Link
    to={to}
    className="font-normal whitespace-nowrap text-sm md:text-xl bg-gray-800 rounded-full px-4 py-2 md:px-8 md:py-4"
  >
    {children}
  </Link>
);

// With divider
//        <div
//          className="self-stretch box-border bg-gray-400 invisible md:visible md:mt-12 mx-16"
//          style={{ height: 2 }}
//        ></div>
//        <div className="font-semibold text-white self-center md:self-auto text-2xl md:text-4xl p-8 md:p-16 md:pt-12">
//          Latest Posts
//        </div>

// w-40
const WIDTH_POST_CARD = "10rem";

const COLORS = {
  A: "bg-rose-500",
  B: "bg-rose-700",
  C: "bg-orange-500",
  D: "bg-orange-700",
  E: "bg-amber-500",
  F: "bg-amber-700",
  G: "bg-yellow-500",
  H: "bg-yellow-700",
  I: "bg-lime-500",
  J: "bg-lime-700",
  K: "bg-green-500",
  L: "bg-green-700",
  M: "bg-emerald-500",
  N: "bg-emerald-700",
  O: "bg-teal-500",
  P: "bg-teal-700",
  Q: "bg-cyan-500",
  R: "bg-cyan-700",
  S: "bg-sky-500",
  T: "bg-sky-700",
  U: "bg-blue-500",
  V: "bg-blue-700",
  W: "bg-indigo-500",
  X: "bg-indigo-700",
  Y: "bg-violet-500",
  Z: "bg-violet-700",
};

const PostCard = ({
  title,
  url,
  date,
  id,
}: {
  title: string;
  url: string;
  id: string;
  date: string;
}) => (
  <div
    className="h-52 flex flex-col rounded-lg shadow shadow-gray-800"
    style={{ width: WIDTH_POST_CARD }}
  >
    <Link to={`/p/${id}`}>
      <div
        className={clsx(
          "h-36 rounded-t-lg flex flex-col justify-center items-center",
          //@ts-expect-error - Typescript doesn't know the result is always an uppercase letter
          COLORS[title.trim().charAt(0).toUpperCase()]
        )}
      >
        <div className="text-8xl text-white font-bold">
          {title.trim().charAt(0).toUpperCase()}
        </div>
      </div>
    </Link>
    <div className="px-2 pt-1 flex flex-col justify-center flex-1 rounded-b-lg bg-gray-500">
      {/* TODO: Check if this is going to be confusing UX */}
      <Row className="items-center">
        <div className="pr-2 text-white text-ellipsis whitespace-nowrap overflow-hidden font-semibold">
          {title}
        </div>
        <a href={url} target="_blank">
          <FiExternalLink color="white" className="opacity-75" size={16} />
        </a>
      </Row>
      <div className="text-xs font-semibold text-white opacity-75">
        {format(parseISO(date), "MMM d, yyyy")}
      </div>
    </div>
  </div>
);

export default function Index() {
  const data = useLoaderData<Pages>();

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex flex-col lg:flex-row bg-gray-600 items-center lg:items-start justify-start">
        <div className="p-8 md:p-16 lg:pt-28 mr-auto lg:mr-0">
          <div className="font-bold text-white text-4xl md:text-7xl">
            Socratic
          </div>
          <Col className="mt-2 md:mt-5 md:gap-1">
            <Subtitle>
              The <span className="text-cyan-300">annotation</span> layer for
              the web
            </Subtitle>
            <Subtitle>
              Discuss any page
              <span className="text-cyan-300"> in real time</span>
            </Subtitle>
            <Link
              to="/upload"
              className="flex flex-col items-center justify-center bg-cyan-500 text-center font-semibold text-white w-fit mt-4 text-base px-8 py-1 rounded md:text-lg md:rounded-lg md:px-16 md:py-2"
            >
              Start
            </Link>
          </Col>
        </div>
        <img
          className="max-w-[75vw] lg:mt-16 lg:mx-auto"
          src="/demo.f95a4fa7.gif"
        ></img>
      </div>
      <div className="flex flex-row flex-wrap gap-4 justify-center font-semibold pt-8 md:pt-16 text-white bg-gray-600 w-full text-center">
        <UseCaseLink to="/p/7bK7BCTtXqFgoaLYg3oBWs">Comment Code</UseCaseLink>
        <UseCaseLink to="/p/fP7aj1hgSeYkyknqYV1sgc">
          Highlight Articles
        </UseCaseLink>
        <UseCaseLink to="/p/oWFLyaLc6Y2KgSgGh3anFT">Annotate Books</UseCaseLink>
      </div>
      <div className="flex-1 bg-gray-600 flex flex-col">
        <div className="font-semibold text-white self-center md:self-auto text-2xl md:text-4xl p-8 md:p-16 md:pb-8">
          Latest Posts
        </div>
        <div
          className="px-8 md:px-16 gap-8 flex flex-col items-center md:grid"
          style={{
            gridTemplateColumns: `repeat(auto-fill, ${WIDTH_POST_CARD})`,
          }}
        >
          {data.map((p) => (
            <PostCard
              date={p.date}
              id={p.key}
              key={p.key}
              url={p.url}
              title={p.title}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
