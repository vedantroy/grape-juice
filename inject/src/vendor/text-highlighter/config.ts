/**
 * Attribute added by default to every highlight.
 * @type {string}
 */
export const DATA_ATTR = "data-highlighted";

/**
 * Attribute used to group highlight wrappers.
 * @type {string}
 */
export const TIMESTAMP_ATTR = "data-timestamp";
export const START_OFFSET_ATTR = "data-start-offset";
export const LENGTH_ATTR = "data-length";

/**
 * Don't highlight content of these tags.
 * @type {string[]}
 */
export const IGNORE_TAGS = [
  "SCRIPT",
  "STYLE",
  "SELECT",
  "OPTION",
  "BUTTON",
  "OBJECT",
  "APPLET",
  "VIDEO",
  "AUDIO",
  "CANVAS",
  "EMBED",
  "PARAM",
  "METER",
  "PROGRESS",
];
