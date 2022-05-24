import lmdb from "lmdb";
import type { DB, PageId } from "./types.server";
import { MAXIMUM_KEY } from "ordered-binary";
import short from "short-uuid";

type LMDBConfig = {
  path: string;
};

type RawPage = {
  html: string;
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
  pages: lmdb.Database<RawPage>;
  comments: lmdb.Database<RawComment>;
  Page: DB["Page"];
  translator: short.Translator;

  constructor({ path }: LMDBConfig) {
    const root = lmdb.open(path, { sharedStructuresKey: STRUCTURES_KEY });
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

  #makePage: DB["Page"]["makePage"] = async ({ html, url }) => {
    const id = this.translator.new().toString();
    await this.pages.put(id, { html, url, date: new Date() });
    return id as PageId;
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
