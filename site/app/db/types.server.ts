import { Brand } from "ts-brand";

export type PageId = Brand<string, "PageId">;
// key = PageId
export type Page = {
  html: string;
  url: string;
  title: string;
  date: Date;
  highlights: Array<Highlight & { replies: Reply[] }>;
};

// just store the entire array -- it's easier
export type UserId = Brand<string, "UserId">;

export type HighlightId = Brand<string, "HighlightId">;
export type Highlight = {
  id: HighlightId;
  userId: UserId;
  // currently not displayed in the UI
  date: Date;
  range: string;
};

export type Reply = {
  userId: UserId;
  date: Date;

  text: string;
};

export interface DB {
  Page: {
    slugToPageId(slug: string): PageId;
    makePage(args: Pick<Page, "html" | "url" | "title">): Promise<PageId>;
    getPageWithHighlightsAndReplies(
      id: PageId
    ): Promise<Page | null> | Page | null;
    makeHighlight(
      id: PageId,
      highlight: { userId: UserId; range: string }
    ): Promise<void>;
    makeHighlightReply(
      id: PageId,
      reply: {
        userId: UserId;
        highlightId: HighlightId;
        text: string;
      }
    ): Promise<void>;
  };
}
