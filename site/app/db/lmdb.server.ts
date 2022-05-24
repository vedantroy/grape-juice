import lmdb from "lmdb";
import type { DB, PageId, Comment } from "./types.server";
import short from "short-uuid";

type LMDBConfig = {
  path: string;
};

type RawPage = {
  html: string;
  url: string;
  date: Date;
};

type RawComments = Array<Comment>;

const STRUCTURES_KEY = Symbol.for("structures");

export default class DBImpl implements DB {
  pages: lmdb.Database<RawPage>;
  comments: lmdb.Database<RawComments>;
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

  #getPageWithComments: DB["Page"]["getPageWithComments"] = (id) => {
    const page = this.pages.get(id);
    if (!page) return null;
    const comments = this.comments.get(id);
    return { ...page, comments: comments || [] };
  };

  #makeComment: DB["Page"]["makeComment"] = async (
    id,
    comment
  ): Promise<void> => {
    const date = new Date();

    await this.comments.transaction(() => {
      const created = this.comments.ifNoExists(id, () =>
        this.comments.put(id, [{ ...comment, date }])
      );

      if (!created) {
        // insert at the end
        this.comments.put(id, [
          // we know the comments exist since ifNoExist returned false
          // and we're in a transaction
          ...this.comments.get(id)!!,
          { ...comment, date },
        ]);
      }
    });
  };
}
