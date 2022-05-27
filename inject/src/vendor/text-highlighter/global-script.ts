// Core JavaScript polyfills for ES latest features in IE11.
import "core-js/stable";
import "regenerator-runtime/runtime";

import TextHighlighter from "./text-highlighter";
import { findNodesAndOffsets } from "./utils/highlights";

/**
 * Expose the TextHighlighter class globally to be
 * used in demos and to be injected directly into html files.
 */
global.TextHighlighter = TextHighlighter;

/**
 * Expose the public utility function, findNodesAndOffsets globally to
 * be used in demos and to be injected directly into html files.
 */
global.findNodesAndOffsets = findNodesAndOffsets;

/**
 * Load the jquery plugin globally expecting jQuery and TextHighlighter to be globally
 * avaiable, this means this library doesn't need a hard requirement of jQuery.
 */
import "./jquery-plugin";
