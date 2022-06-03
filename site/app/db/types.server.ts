import { Brand } from "ts-brand";

export type PageId = Brand<string, "PageId">;
export type HighlightsWithReplies = Record<
  HighlightId,
  Highlight & { replies: Reply[] }
>;
// key = PageId
export type Page = {
  html: string;
  url: string;
  title: string;
  date: Date;
  highlights: HighlightsWithReplies;
};

// just store the entire array -- it's easier
export type UserId = Brand<string, "UserId">;

export type HighlightId = Brand<string, "HighlightId">;
export type Highlight = {
  // This field is an artifact from when we stored highlights as an array
  // not gonna remove it for now (but DO NOT USE IT!)
  id: HighlightId;
  userId: UserId;
  // currently not displayed in the UI
  date: Date;
  range: string;
  containerSelector: string;
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
    ): MaybePromise<HighlightsWithReplies>;
    makeHighlight(
      id: PageId,
      highlight: { userId: UserId; range: string; containerSelector: string }
    ): MaybePromise<HighlightId>;
    makeHighlightReply(
      id: PageId,
      reply: {
        userId: UserId;
        highlightId: HighlightId;
        text: string;
      }
    ): MaybePromise<void>;
  };
}
