import { Brand } from "ts-brand";

export type PageId = Brand<string, "PageId">;
// key = PageId
export type Page = {
  html: string;
  url: string;
  date: Date;
  comments: Comment[];
};

// just store the entire array -- it's easier
export type UserId = Brand<string, "UserId">;
export type Comment = {
  userId: string;
  text: string;
  date: Date;
};

export interface DB {
  Page: {
    slugToPageId(slug: string): PageId;
    makePage(args: Pick<Page, "html" | "url">): Promise<PageId>;
    getPageWithComments(id: PageId): Promise<Page | null> | Page | null;
    makeComment(
      id: PageId,
      comment: { userId: UserId; text: string }
    ): Promise<void>;
  };
}
