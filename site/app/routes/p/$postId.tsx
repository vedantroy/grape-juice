import DB from "~/db/index.server";
import { ActionFunction, json, LoaderFunction } from "@remix-run/node";
import { getParam } from "~/helpers/params";
import { PageId } from "~/db/types.server";

export const loader: LoaderFunction = async ({ request, params }) => {
  const postId = getParam(params, "postId") as PageId;
  const r = await DB.Page.getPageWithComments(postId);
  return json(r);
};
