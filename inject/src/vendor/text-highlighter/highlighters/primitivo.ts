import {
  refineRangeBoundaries,
  retrieveHighlights,
  isElementHighlight,
  sortByDepth,
  haveSameColor,
  createWrapper,
} from "../utils/highlights";
import dom, { NODE_TYPE } from "../utils/dom";
import { IGNORE_TAGS, DATA_ATTR, TIMESTAMP_ATTR } from "../config";
import { unique } from "../utils/arrays";

/**
 * PrimitivoHighlighter that provides text highlighting functionality to dom elements
 * for simple use cases.
 *
 * @callback onAfterHighlightCallbackV1
 * @param {Range} range
 * @param {HTMLElement[]} highlights
 * @param {number} timestamp
 */
class PrimitivoHighlighter {
  /**
   * Creates a PrimitivoHighlighter instance for functionality specific to the original implementation.
   *
   * @param {HTMLElement} element - DOM element to which highlighted will be applied.
   * @param {object} [options] - additional options.
   * @param {string} options.color - highlight color.
   * @param {string} options.highlightedClass - class added to highlight, 'highlighted' by default.
   * @param {string} options.contextClass - class added to element to which highlighter is applied,
   *  'highlighter-context' by default.
   * @param {function} options.onRemoveHighlight - function called before highlight is removed. Highlight is
   *  passed as param. Function should return true if highlight should be removed, or false - to prevent removal.
   * @param {function} options.onBeforeHighlight - function called before highlight is created. Range object is
   *  passed as param. Function should return true to continue processing, or false - to prevent highlighting.
   * @param {onAfterHighlightCallbackV1} options.onAfterHighlight - function called after highlight is created. Array of created
   * wrappers is passed as param.
   * @class PrimitivoHighlighter
   */
  constructor(element, options) {
    this.el = element;
    this.options = options;
  }

  /**
   * Highlights range.
   * Wraps text of given range object in wrapper element.
   * @param {Range} range
   * @param {HTMLElement} wrapper
   * @returns {Array} - array of created highlights.
   * @memberof PrimitivoHighlighter
   */
  highlightRange(range, wrapper) {
    if (!range || range.collapsed) {
      return [];
    }

    let result = refineRangeBoundaries(range),
      startContainer = result.startContainer,
      endContainer = result.endContainer,
      goDeeper = result.goDeeper,
      done = false,
      node = startContainer,
      highlights = [],
      highlight,
      wrapperClone,
      nodeParent;

    do {
      if (goDeeper && node.nodeType === NODE_TYPE.TEXT_NODE) {
        if (IGNORE_TAGS.indexOf(node.parentNode.tagName) === -1 && node.nodeValue.trim() !== "") {
          wrapperClone = wrapper.cloneNode(true);
          wrapperClone.setAttribute(DATA_ATTR, true);
          nodeParent = node.parentNode;

          // highlight if a node is inside the el
          if (dom(this.el).contains(nodeParent) || nodeParent === this.el) {
            highlight = dom(node).wrap(wrapperClone);
            highlights.push(highlight);
          }
        }

        goDeeper = false;
      }
      if (node === endContainer && !(endContainer.hasChildNodes() && goDeeper)) {
        done = true;
      }

      if (node.tagName && IGNORE_TAGS.indexOf(node.tagName) > -1) {
        if (endContainer.parentNode === node) {
          done = true;
        }
        goDeeper = false;
      }
      if (goDeeper && node.hasChildNodes()) {
        node = node.firstChild;
      } else if (node.nextSibling) {
        node = node.nextSibling;
        goDeeper = true;
      } else {
        node = node.parentNode;
        goDeeper = false;
      }
    } while (!done);

    return highlights;
  }

  /**
   * Normalizes highlights. Ensures that highlighting is done with use of the smallest possible number of
   * wrapping HTML elements.
   * Flattens highlights structure and merges sibling highlights. Normalizes text nodes within highlights.
   * @param {Array} highlights - highlights to normalize.
   * @returns {Array} - array of normalized highlights. Order and number of returned highlights may be different than
   * input highlights.
   * @memberof PrimitivoHighlighter
   */
  normalizeHighlights(highlights) {
    var normalizedHighlights;

    this.flattenNestedHighlights(highlights);
    this.mergeSiblingHighlights(highlights);

    // omit removed nodes
    normalizedHighlights = highlights.filter(function(hl) {
      return hl.parentElement ? hl : null;
    });

    normalizedHighlights = unique(normalizedHighlights);
    normalizedHighlights.sort(function(a, b) {
      return a.offsetTop - b.offsetTop || a.offsetLeft - b.offsetLeft;
    });

    return normalizedHighlights;
  }

  /**
   * Flattens highlights structure.
   * Note: this method changes input highlights - their order and number after calling this method may change.
   * @param {Array} highlights - highlights to flatten.
   * @memberof PrimitivoHighlighter
   */
  flattenNestedHighlights(highlights) {
    let again,
      self = this;

    sortByDepth(highlights, true);

    function flattenOnce() {
      let again = false;

      highlights.forEach(function(hl, i) {
        let parent = hl.parentElement,
          parentPrev = parent.previousSibling,
          parentNext = parent.nextSibling;

        if (self.isHighlight(parent, DATA_ATTR)) {
          if (!haveSameColor(parent, hl)) {
            if (!hl.nextSibling) {
              if (!parentNext) {
                dom(hl).insertAfter(parent);
              } else {
                dom(hl).insertBefore(parentNext);
              }
              dom(hl).insertBefore(parentNext || parent);
              again = true;
            }

            if (!hl.previousSibling) {
              if (!parentPrev) {
                dom(hl).insertBefore(parent);
              } else {
                dom(hl).insertAfter(parentPrev);
              }
              dom(hl).insertAfter(parentPrev || parent);
              again = true;
            }

            if (
              hl.previousSibling &&
              hl.previousSibling.nodeType == 3 &&
              hl.nextSibling &&
              hl.nextSibling.nodeType == 3
            ) {
              let spanleft = self.el.ownerDocument.createElement("span");
              spanleft.style.backgroundColor = parent.style.backgroundColor;
              spanleft.className = parent.className;
              let timestamp = parent.attributes[TIMESTAMP_ATTR].nodeValue;
              spanleft.setAttribute(TIMESTAMP_ATTR, timestamp);
              spanleft.setAttribute(DATA_ATTR, true);

              let spanright = spanleft.cloneNode(true);

              dom(hl.previousSibling).wrap(spanleft);
              dom(hl.nextSibling).wrap(spanright);

              let nodes = Array.prototype.slice.call(parent.childNodes);
              nodes.forEach(function(node) {
                dom(node).insertBefore(node.parentNode);
              });
              again = true;
            }

            if (!parent.hasChildNodes()) {
              dom(parent).remove();
            }
          } else {
            parent.replaceChild(hl.firstChild, hl);
            highlights[i] = parent;
            again = true;
          }
        }
      });

      return again;
    }

    do {
      again = flattenOnce();
    } while (again);
  }

  /**
   * Merges sibling highlights and normalizes descendant text nodes.
   * Note: this method changes input highlights - their order and number after calling this method may change.
   * @param highlights
   * @memberof PrimitivoHighlighter
   */
  mergeSiblingHighlights(highlights) {
    var self = this;

    function shouldMerge(current, node) {
      return (
        node &&
        node.nodeType === NODE_TYPE.ELEMENT_NODE &&
        haveSameColor(current, node) &&
        self.isHighlight(node, DATA_ATTR)
      );
    }

    highlights.forEach(function(highlight) {
      var prev = highlight.previousSibling,
        next = highlight.nextSibling;

      if (shouldMerge(highlight, prev)) {
        dom(highlight).prepend(prev.childNodes);
        dom(prev).remove();
      }
      if (shouldMerge(highlight, next)) {
        dom(highlight).append(next.childNodes);
        dom(next).remove();
      }

      dom(highlight).normalizeTextNodes();
    });
  }

  /**
   * Highlights current range.
   * @param {boolean} keepRange - Don't remove range after highlighting. Default: false.
   * @memberof PrimitivoHighlighter
   */
  doHighlight(keepRange) {
    let range = dom(this.el).getRange(),
      wrapper,
      createdHighlights,
      normalizedHighlights,
      timestamp;

    if (!range || range.collapsed) {
      return;
    }

    if (this.options.onBeforeHighlight(range) === true) {
      timestamp = +new Date();
      wrapper = createWrapper(this.options, this.el.ownerDocument);
      wrapper.setAttribute(TIMESTAMP_ATTR, timestamp);

      createdHighlights = this.highlightRange(range, wrapper);
      normalizedHighlights = this.normalizeHighlights(createdHighlights);

      this.options.onAfterHighlight(range, normalizedHighlights, timestamp);
    }

    if (!keepRange) {
      dom(this.el).removeAllRanges();
    }
  }

  /**
   * Removes highlights from element. If element is a highlight itself, it is removed as well.
   * If no element is given, all highlights all removed.
   * @param {HTMLElement} [element] - element to remove highlights from
   * @memberof PrimitivoHighlighter
   */
  removeHighlights(element) {
    var container = element || this.el,
      highlights = this.getHighlights({ container: container }),
      self = this;

    function mergeSiblingTextNodes(textNode) {
      var prev = textNode.previousSibling,
        next = textNode.nextSibling;

      if (prev && prev.nodeType === NODE_TYPE.TEXT_NODE) {
        textNode.nodeValue = prev.nodeValue + textNode.nodeValue;
        dom(prev).remove();
      }
      if (next && next.nodeType === NODE_TYPE.TEXT_NODE) {
        textNode.nodeValue = textNode.nodeValue + next.nodeValue;
        dom(next).remove();
      }
    }

    function removeHighlight(highlight) {
      var textNodes = dom(highlight).unwrap();

      textNodes.forEach(function(node) {
        mergeSiblingTextNodes(node);
      });
    }

    sortByDepth(highlights, true);

    highlights.forEach(function(hl) {
      if (self.options.onRemoveHighlight(hl) === true) {
        removeHighlight(hl);
      }
    });
  }

  /**
   * Returns highlights from given container.
   * @param params
   * @param {HTMLElement} [params.container] - return highlights from this element. Default: the element the
   * highlighter is applied to.
   * @param {boolean} [params.andSelf] - if set to true and container is a highlight itself, add container to
   * returned results. Default: true.
   * @param {boolean} [params.grouped] - if set to true, highlights are grouped in logical groups of highlights added
   * in the same moment. Each group is an object which has got array of highlights, 'toString' method and 'timestamp'
   * property. Default: false.
   * @returns {Array} - array of highlights.
   * @memberof PrimitivoHighlighter
   */
  getHighlights(params) {
    const mergedParams = {
      container: this.el,
      dataAttr: DATA_ATTR,
      timestampAttr: TIMESTAMP_ATTR,
      ...params,
    };
    return retrieveHighlights(mergedParams);
  }

  /**
   * Returns true if element is a highlight.
   *
   * @param el - element to check.
   * @returns {boolean}
   * @memberof PrimitivoHighlighter
   */
  isHighlight(el, dataAttr) {
    return isElementHighlight(el, dataAttr);
  }

  /**
   * Serializes all highlights in the element the highlighter is applied to.
   * @returns {string} - stringified JSON with highlights definition
   * @memberof PrimitivoHighlighter
   */
  serializeHighlights() {
    let highlights = this.getHighlights(),
      refEl = this.el,
      hlDescriptors = [];

    function getElementPath(el, refElement) {
      let path = [],
        childNodes;

      do {
        childNodes = Array.prototype.slice.call(el.parentNode.childNodes);
        path.unshift(childNodes.indexOf(el));
        el = el.parentNode;
      } while (el !== refElement || !el);

      return path;
    }

    sortByDepth(highlights, false);

    highlights.forEach(function(highlight) {
      let offset = 0, // Hl offset from previous sibling within parent node.
        length = highlight.textContent.length,
        hlPath = getElementPath(highlight, refEl),
        wrapper = highlight.cloneNode(true);

      wrapper.innerHTML = "";
      wrapper = wrapper.outerHTML;

      if (highlight.previousSibling && highlight.previousSibling.nodeType === NODE_TYPE.TEXT_NODE) {
        offset = highlight.previousSibling.length;
      }

      hlDescriptors.push([wrapper, highlight.textContent, hlPath.join(":"), offset, length]);
    });

    return JSON.stringify(hlDescriptors);
  }

  /**
   * Deserializes highlights.
   * @throws exception when can't parse JSON or JSON has invalid structure.
   * @param {object} json - JSON object with highlights definition.
   * @returns {Array} - array of deserialized highlights.
   * @memberof PrimitivoHighlighter
   */
  deserializeHighlights(json) {
    let hlDescriptors,
      highlights = [],
      self = this;

    if (!json) {
      return highlights;
    }

    try {
      hlDescriptors = JSON.parse(json);
    } catch (e) {
      throw "Can't parse JSON: " + e;
    }

    function deserializationFn(hlDescriptor) {
      let hl = {
          wrapper: hlDescriptor[0],
          text: hlDescriptor[1],
          path: hlDescriptor[2].split(":"),
          offset: hlDescriptor[3],
          length: hlDescriptor[4],
        },
        elIndex = hl.path.pop(),
        node = self.el,
        hlNode,
        highlight,
        idx;

      while ((idx = hl.path.shift())) {
        node = node.childNodes[idx];
      }

      if (
        node.childNodes[elIndex - 1] &&
        node.childNodes[elIndex - 1].nodeType === NODE_TYPE.TEXT_NODE
      ) {
        elIndex -= 1;
      }

      node = node.childNodes[elIndex];
      hlNode = node.splitText(hl.offset);
      hlNode.splitText(hl.length);

      if (hlNode.nextSibling && !hlNode.nextSibling.nodeValue) {
        dom(hlNode.nextSibling).remove();
      }

      if (hlNode.previousSibling && !hlNode.previousSibling.nodeValue) {
        dom(hlNode.previousSibling).remove();
      }

      highlight = dom(hlNode).wrap(dom().fromHTML(hl.wrapper, parentNode.ownerDocument)[0]);
      highlights.push(highlight);
    }

    hlDescriptors.forEach(function(hlDescriptor) {
      try {
        deserializationFn(hlDescriptor);
      } catch (e) {
        if (console && console.warn) {
          console.warn("Can't deserialize highlight descriptor. Cause: " + e);
        }
      }
    });

    return highlights;
  }
}

export default PrimitivoHighlighter;
