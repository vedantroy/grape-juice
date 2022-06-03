import { Brand } from "ts-brand";

export type PageId = Brand<string, "PageId">;

// key = PageId
export type Page = {
  html: string;
  url: string;
  title: string;
  date: Date;
  highlights: Record<HighlightId, Highlight>;
};

export type UserId = Brand<string, "UserId">;

export type HighlightId = Brand<string, "HighlightId">;
export type Highlight = {
  id: HighlightId;
  userId: UserId;
  range: string;
  containerSelector: string;
  replies: Reply[];
};

export type ReplyId = Brand<string, "ReplyId">;
export type Reply = {
  userId: UserId;
  id: ReplyId;
  date: Date;
  text: string;
};

type MaybePromise<T> = T | Promise<T>;

export interface DB {
  Page: {
    slugToPageId(slug: string): PageId;
    makePage(args: Pick<Page, "html" | "url" | "title">): MaybePromise<PageId>;
    // Used by Remix for initial page load (embed highlights in)
    getPageWithHighlightsAndReplies(id: PageId): MaybePromise<Page | null>;
    getPageHighlightsAndReplies(
      id: PageId
    ): MaybePromise<Record<HighlightId, Highlight>>;
    makeHighlight(
      id: PageId,
      highlight: {
        userId: UserId;
        range: string;
        containerSelector: string;
        initialReply: string;
      }
    ): MaybePromise<Highlight>;
    makeHighlightReply(
      id: PageId,
      reply: {
        userId: UserId;
        highlightId: HighlightId;
        text: string;
      }
      // returns null if there was no highlight with the given id
    ): MaybePromise<Reply[] | null>;
  };
}
