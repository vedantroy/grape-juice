import lmdb, { open } from "lmdb";
import type {
  DB,
  HighlightId,
  PageId,
  Reply,
  ReplyId,
  UserId,
} from "./types.server";
import { MAXIMUM_KEY } from "ordered-binary";
import short from "short-uuid";
import _ from "lodash-es";

type LMDBConfig = {
  path: string;
};

type RawPage = {
  html: string;
  title: string;
  url: string;
  date: Date;
};

type RawHighlight = {
  containerSelector: string;
  userId: UserId;
  range: string;
  replies: Reply[];
};

const STRUCTURES_KEY = Symbol.for("structures");

export default class DBImpl implements DB {
  pages: lmdb.Database<RawPage, string>;
  highlights: lmdb.Database<RawHighlight, [string, string]>;
  Page: DB["Page"];
  translator: short.Translator;

  constructor({ path }: LMDBConfig) {
    const root = open(path, { sharedStructuresKey: STRUCTURES_KEY });
    this.pages = root.openDB({
      name: "Page",
      sharedStructuresKey: STRUCTURES_KEY,
    });
    this.highlights = root.openDB({
      name: "Highlight",
      sharedStructuresKey: STRUCTURES_KEY,
    });
    this.Page = {
      makePage: this.#makePage,
      makeHighlight: this.#makeHighlight,
      getPageWithHighlightsAndReplies: this.#getPageWithHighlightsAndReplies,
      getPageHighlightsAndReplies: this.#getPageHighlightsAndReplies,
      makeHighlightReply: this.#makeHighlightReply,
      // Store short UUIDs directly in the DB
      slugToPageId: (x) => x as PageId,
    };
    this.translator = short();
  }

  #makePage: DB["Page"]["makePage"] = async ({ html, url, title }) => {
    const postId = short.generate();
    await this.pages.put(postId, { html, url, title, date: new Date() });
    return postId as string as PageId;
  };

  #getPageWithHighlightsAndReplies: DB["Page"]["getPageWithHighlightsAndReplies"] =
    async (postId) => {
      const page = this.pages.get(postId);
      if (!page) return null;

      return {
        ...page,
        highlights: await this.#getPageHighlightsAndReplies(postId),
      };
    };

  #getPageHighlightsAndReplies: DB["Page"]["getPageHighlightsAndReplies"] =
    async (postId) => {
      type WithId = RawHighlight & { id: HighlightId };
      const highlights = _.fromPairs<WithId>([
        ...this.highlights
          .getRange({ start: postId, end: [postId, MAXIMUM_KEY] })
          .map<[HighlightId, WithId]>(({ value, key }) => [
            key[1] as HighlightId,
            { ...value, id: key[1] as HighlightId },
          ]),
      ]);
      return highlights;
    };

  #makeHighlight: DB["Page"]["makeHighlight"] = async (
    postId,
    { userId, range, containerSelector, initialReply }
  ) => {
    const date = new Date();
    const highlightId = short.generate().toString() as HighlightId;

    const replyId = short.uuid();

    const highlight = {
      userId,
      range,
      containerSelector,
      replies: [
        {
          id: replyId.toString() as ReplyId,
          text: initialReply,
          userId,
          date,
        },
      ],
    };

    await this.highlights.put([postId, highlightId], highlight);
    return { ...highlight, id: highlightId };
  };

  #makeHighlightReply: DB["Page"]["makeHighlightReply"] = async (
    postId,
    { userId, highlightId, text }
  ) => {
    const replies = await this.highlights.transaction(async () => {
      const highlight = this.highlights.get([postId, highlightId]);
      if (!highlight) return;

      const replies = [
        ...highlight.replies,
        {
          text,
          date: new Date(),
          userId,
          id: short.uuid().toString() as ReplyId,
        },
      ];

      const newHighlight = {
        ...highlight,
        replies,
      };
      await this.highlights.put([postId, highlightId], newHighlight);
      return replies;
    });
    return Array.isArray(replies) ? replies : null;
  };
}
