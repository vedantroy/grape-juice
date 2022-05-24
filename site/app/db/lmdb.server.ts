import lmdb, { open } from "lmdb";
import type { DB, PageId } from "./types.server";
import { MAXIMUM_KEY } from "ordered-binary";
import short from "short-uuid";

type LMDBConfig = {
  path: string;
};

type RawPage = {
  html: string;
  title: string;
  url: string;
  date: Date;
};

type RawComment = {
  userId: string;
  text: string;
  date: Date;
};

const STRUCTURES_KEY = Symbol.for("structures");

export default class DBImpl implements DB {
  pages: lmdb.Database<RawPage, string>;
  comments: lmdb.Database<RawComment, [string, string]>;
  Page: DB["Page"];
  translator: short.Translator;

  constructor({ path }: LMDBConfig) {
    const root = open(path, { sharedStructuresKey: STRUCTURES_KEY });
    this.pages = root.openDB({
      name: "Page",
      sharedStructuresKey: STRUCTURES_KEY,
    });
    this.comments = root.openDB({
      name: "Comment",
      sharedStructuresKey: STRUCTURES_KEY,
    });
    this.Page = {
      makePage: this.#makePage,
      makeComment: this.#makeComment,
      getPageWithComments: this.#getPageWithComments,
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

  #getPageWithComments: DB["Page"]["getPageWithComments"] = (postId) => {
    const page = this.pages.get(postId);
    if (!page) return null;

    const comments = [
      ...this.comments
        .getRange({ start: postId, end: [postId, MAXIMUM_KEY] })
        .map((x) => x.value),
    ];

    return { ...page, comments: comments };
  };

  #makeComment: DB["Page"]["makeComment"] = async (
    postId,
    comment
  ): Promise<void> => {
    const date = new Date();
    const commentId = short.generate();
    await this.comments.put([postId, commentId], { ...comment, date });
  };
}
