import zod, { z } from "zod";

const Codes = {
  Subscribe: 0,
  Selection: 1,
  CursorPosition: 2,
  ClearSelection: 3,
  CreateHighlight: 4,

  // Never received, only sent to client
  Subscribed: 5,
  HighlightCreated: 6,
} as const;

export { Codes };

// Active Operations
// - change highlight
// - remove highlight
// Why not use CRDT?
// - With a CRDT I'll only need to transmit one type of update
//    (e.g a generic "CRDTChange" message)
// But I'll need to observe & integrate the changed data regardless

const SubscribedMessage = zod.object({
  kind: z.literal(Codes.Subscribed),
});

const SubscribeMessage = zod.object({
  kind: z.literal(Codes.Subscribe),
  postId: z.string(),
});
export type SubscribeMessage = zod.infer<typeof SubscribeMessage>;

const SelectionMessage = zod.object({
  kind: z.literal(Codes.Selection),
  postId: z.string(),
  userId: z.string(),
  range: z.string(),
});
export type SelectionMessage = zod.infer<typeof SelectionMessage>;

const ClearSelectionMessage = zod.object({
  kind: z.literal(Codes.ClearSelection),
  postId: z.string(),
  userId: z.string(),
});
export type ClearSelectionMessage = zod.infer<typeof ClearSelectionMessage>;

const CursorPositionMessage = zod.object({
  kind: z.literal(Codes.CursorPosition),
  postId: z.string(),
});
export type CursorPositionMessage = zod.infer<typeof CursorPositionMessage>;

export const CreateHighlightMessage = zod.object({
  kind: z.literal(Codes.CreateHighlight),
  postId: z.string(),
  userId: z.string(),
  range: z.string(),
});
export type CreateHighlightMessage = zod.infer<typeof CreateHighlightMessage>;

export const HighlightCreatedMessage = zod.object({
  kind: z.literal(Codes.HighlightCreated),
});
export type HighlightCreatedMessage = zod.infer<typeof HighlightCreatedMessage>;

export const Message = zod.union([
  SubscribeMessage,
  SubscribedMessage,
  SelectionMessage,
  ClearSelectionMessage,
  CursorPositionMessage,
  CreateHighlightMessage,
  HighlightCreatedMessage,
]);
export type Message = zod.infer<typeof Message>;
