import { z } from "zod";
import { ActionFunction } from "@remix-run/node";
import DB from "~/db/index.server";

const Schema = z.object({
  text: z.string(),
  url: z.string(),
});

export const action: ActionFunction = async ({ request }) => {
  const json = await request.json();
  const { text, url } = Schema.parse(json);
};
