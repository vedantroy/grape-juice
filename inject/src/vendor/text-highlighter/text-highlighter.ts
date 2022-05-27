import dom from "./utils/dom";
import { bindEvents, unbindEvents } from "./utils/events";
import Primitivo from "./highlighters/primitivo";
import Independencia from "./highlighters/independencia";
import { DATA_ATTR, IGNORE_TAGS } from "./config";
import { createWrapper } from "./utils/highlights";

const highlighters = {
  primitivo: Primitivo,
  "v1-2014": Primitivo,
  independencia: Independencia,
  "v2-2019": Independencia,
};

const versionNames = {
  "v1-2014": "Primitivo (v1-2014)",
  primitivo: "Primitivo (v1-2014)",
  "v2-2019": "Independencia (v2-2019)",
  independencia: "Independencia (v2-2019)",
};

/**
 * TextHighlighter that provides text highlighting functionality to dom elements.
 */
class TextHighlighter {
  /**
   * Creates wrapper for highlights.
   * TextHighlighter instance calls this method each time it needs to create highlights and pass options retrieved
   * in constructor.
   *
   * @param {object} options - the same object as in TextHighlighter constructor.
   * @param {Document} doc - the document to create the wrapper with.
   * @returns {HTMLElement}
   */
  static createWrapper(options, doc = document) {
    return createWrapper(options, doc);
  }

  /**
   * Creates TextHighlighter instance and binds to given DOM elements.
   *
   * @param {HTMLElement} element - DOM element to which highlighted will be applied.
   * @param {object} [options] - additional options.
   * @param {string} options.version - The version of the text highlighting functionality to use.
   * There are three options:
   *   primitivo (v1-2014) is for the initial implementation using interdependent highlight locators.
   *   (Lots of issues for requirements beyond simple all or nothing highlights)
   *
   *   independencia (v2-2019) is for an improved implementation focusing on making highlights independent
   *   from eachother and other element nodes within the context DOM object. v2 uses data attributes
   *   as the source of truth about the text range selected to create the original highlight.
   *   This allows us freedom to manipulate the DOM at will and handle overlapping highlights a lot better.
   *
   * @param {string} [options.color=#ffff7b] - highlight color.
   * @param {string[]} [options.excludeNodes=["SCRIPT", "STYLE", "SELECT", "OPTION", "BUTTON", "OBJECT", "APPLET", "VIDEO", "AUDIO", "CANVAS", "EMBED", "PARAM", "METER", "PROGRESS"]] - Node types to exclude when calculating offsets and determining where to inject highlights.
   * @param {string} [options.highlightedClass=highlighted] - class added to highlight, 'highlighted' by default.
   * @param {string} [options.namespaceDataAttribute=data-highlighted] - Namespace data attribute to identify highlights for a particular highlighter instance.
   * @param {boolean} options.excludeWhiteSpaceAndReturns - Whether or not to exclude white space and carriage returns while calculating text content
   *                                                        offsets. The white space that is excluded is only the white space that comes directly
   *                                                        after carriage returns.
   * @param {Record<string, number>} options.priorities - Defines priorities for multiple highlighters, the keys
   *                                                      are the namespaces for highlighters and the values are the priorities
   *                                                      where the higher number has the higher priority.
   *                                                      For example { userHighlights: 1, staticHighlights: 2 } would mean
   *                                                      that highlights from the "static" highlighter will always appear above highlights
   *                                                      from the "user" highlighter.
   * @param {string} [options.contextClass=highlighter-context] - class added to element to which highlighter is applied,
   *  'highlighter-context' by default.
   * @param {boolean} [options.useDefaultEvents=true] - Whether or not to use the default events to listen for text selections.
   *  The default events are "mouseup" and "touchend". Set this to false and register TextHiglighter.highlightHandler with your own events.
   *  It is down to you to remove the listener from your custom events when destroying instances of the text highlighter.
   * @param {boolean} [options.normalizeElements=false] - Whether or not to normalise elements on the DOM when highlights are created, deserialised
   *  into the DOM, focused and deselected. Normalising events has a huge performance implication when enabling highlighting for a root element
   *  that contains thousands of nodes. This only applies for the independencia v2-2019 version.
   * @param {boolean} [options.keepRange=false] - Whether or not to keep the highlight selection after highlights are created. If set to true then the selection will stay active.
   * @param {boolean} [options.highlightWhiteSpaceChars=false] - Whether or not to deserialise highlights into the DOM when they only contain white space characters.
   * @param {function} options.onRemoveHighlight - function called before highlight is removed. Highlight is
   *  passed as param. Function should return true if highlight should be removed, or false - to prevent removal.
   * @param {function} options.onBeforeHighlight - function called before highlight is created. Range object is
   *  passed as param. Function should return true to continue processing, or false - to prevent highlighting.
   * @param {function} options.preprocessDescriptors - function called when a user has made a selection to create a highlight,
   *   this is called before the highlight are loaded into the DOM. This should be used to carry out tasks like customising the span wrapper
   *   used to inject highlights with data attributes specific to your application. (This is only utilised by v2-2019 onwards)
   * @param {function} options.onAfterHighlight - function called after highlight is created. Array of created
   *   wrappers is passed as param. This is called once the highlights have been loaded into the DOM.
   *   (The callback interface differs between versions, see specific highlighter classes for more info)
   *
   * @param {boolean} registerEventsOnConstruction - Whether or not to attempt to register events when the text highlighter is first instantiated.
   *   In the case options.useDefaultEvents is false, even with this enabled the events won't be registered, this is only relevant if you want more
   *   control and register events at a later point.
   */
  constructor(element, options = {}, registerEventsOnConstruction = true) {
    if (!element) {
      throw new Error("Missing anchor element");
    }

    this.el = element;
    this.options = {
      color: "#ffff7b",
      highlightedClass: "highlighted",
      contextClass: "highlighter-context",
      version: "independencia",
      useDefaultEvents: true,
      excludeNodes: IGNORE_TAGS,
      excludeWhiteSpaceAndReturns: false,
      namespaceDataAttribute: DATA_ATTR,
      priorities: {},
      normalizeElements: false,
      keepRange: false,
      highlightWhiteSpaceChars: false,
      cancelProperty: "cancel",
      onRemoveHighlight: function() {
        return true;
      },
      onBeforeHighlight: function() {
        return true;
      },
      preprocessDescriptors: function(_, hlts) {
        // We need to return the highlight descriptors parameter by
        // default in order to create highlights in the DOM.
        // Also an empty meta object is needed given that it is expected in the interface.
        return { descriptors: hlts, meta: {} };
      },
      onAfterHighlight: function() {},
      ...options,
    };

    this.highlightHandler = this.highlightHandler.bind(this);

    if (!highlighters[this.options.version]) {
      throw new Error("Please provide a valid version of the text highlighting functionality");
    }

    this.highlighter = new highlighters[this.options.version](this.el, this.options);

    dom(this.el).addClass(this.options.contextClass);

    if (registerEventsOnConstruction) {
      this.registerDefaultEvents();
    }
  }

  /**
   * Permanently disables highlighting.
   * Unbinds events and remove context element class.
   * @memberof TextHighlighter
   */
  destroy() {
    if (this.options.useDefaultEvents) {
      unbindEvents(this.el, this);
    }
    dom(this.el).removeClass(this.options.contextClass);
  }

  /**
   * Registers the default event listeners that trigger the proecss
   * of creating a highlight.
   *
   * @memberof TextHighlighter
   */
  registerDefaultEvents() {
    if (this.options.useDefaultEvents) {
      bindEvents(this.el, this);
    }
  }

  /**
   * Listener to events that can trigger the creation of a highlight.
   * By default this is triggered  on "mouseup" and "touchend" events.
   * If you disable the default events by setting options.useDefaultEvents
   * you will need to register this handler with your own events and make sure you
   * remove the listener when you destroy the instance of the TextHighlighter as well.
   */
  highlightHandler() {
    this.doHighlight();
  }

  doHighlight() {
    this.highlighter.doHighlight(this.options.keepRange);
  }

  /**
   * Highlights range.
   * Wraps text of given range object in wrapper element.
   * @param {Range} range
   * @param {HTMLElement} wrapper
   * @returns {Array} - array of created highlights.
   * @memberof TextHighlighter
   */
  highlightRange(range, wrapper) {
    return this.highlighter.highlightRange(range, wrapper);
  }

  /**
   * Normalizes highlights. Ensure at least text nodes are normalized, carries out some flattening and nesting
   * where necessary.
   *
   * @param {Array} highlights - highlights to normalize.
   * @returns {Array} - array of normalized highlights. Order and number of returned highlights may be different than
   * input highlights.
   * @memberof TextHighlighter
   */
  normalizeHighlights(highlights) {
    return this.highlighter.normalizeHighlights(highlights);
  }

  /**
   * Sets highlighting color.
   * @param {string} color - valid CSS color.
   * @memberof TextHighlighter
   */
  setColor(color) {
    this.options.color = color;
  }

  /**
   * Returns highlighting color.
   * @returns {string}
   * @memberof TextHighlighter
   */
  getColor() {
    return this.options.color;
  }

  /**
   * Removes highlights from element. If element is a highlight itself, it is removed as well.
   * If no element is given, all highlights all removed.
   * @param {HTMLElement} element - element to remove highlights from.
   *                                 if empty, the root element of the highlighter will  be used.
   * @param {string} id - The unique id of a highlight represented by a collection of elements.
   * @memberof TextHighlighter
   */
  removeHighlights(element, id) {
    this.highlighter.removeHighlights(element, id);
  }

  /**
   * Returns highlights from given container.
   * @param params
   * @param {HTMLElement} [params.container] - return highlights from this element. Default: the element the
   * highlighter is applied to.
   * @param {boolean} [params.andSelf] - if set to true and container is a highlight itself, add container to
   * returned results. Default: true.
   * @param {string} [params.dataAttr] - Namespaced used to identify highlights for a specific highlighter instance.
   * @param {boolean} [params.grouped] - if set to true, highlights are grouped in logical groups of highlights added
   * in the same moment. Each group is an object which has got array of highlights, 'toString' method and 'timestamp'
   * property. Default: false.
   * @returns {Array} - array of highlights.
   * @memberof TextHighlighter
   */
  getHighlights(params) {
    return this.highlighter.getHighlights(params);
  }

  /**
   * Returns true if element is a highlight.
   * All highlights have 'data-highlighted' attribute.
   * @param el - element to check.
   * @param dataAttr - namespace used to identify highlights for a specific highlighter instance.
   * @returns {boolean}
   * @memberof TextHighlighter
   */
  isHighlight(el, dataAttr = DATA_ATTR) {
    return this.highlighter.isHighlight(el, dataAttr);
  }

  /**
   * Serializes all highlights in the element the highlighter is applied to.
   * the id is not used in the initial version of the highlighter.
   *
   * @param {string} id - The unique identifier grouping a set of highlight elements together.
   * @returns {string} - stringified JSON with highlights definition
   * @memberof TextHighlighter
   */
  serializeHighlights(id) {
    return this.highlighter.serializeHighlights(id);
  }

  /**
   * Deserializes highlights.
   * @throws exception when can't parse JSON or JSON has invalid structure.
   * @param {object} json - JSON object with highlights definition.
   * @returns {Array} - array of deserialized highlights.
   * @memberof TextHighlighter
   */
  deserializeHighlights(json) {
    return this.highlighter.deserializeHighlights(json);
  }

  /**
   * Finds and highlights given text.
   * @param {string} text - text to search for
   * @param {boolean} [caseSensitive] - if set to true, performs case sensitive search (default: true)
   * @memberof TextHighlighter
   */
  find(text, caseSensitive) {
    let wnd = dom(this.el).getWindow(),
      scrollX = wnd.scrollX,
      scrollY = wnd.scrollY,
      caseSens = typeof caseSensitive === "undefined" ? true : caseSensitive;

    dom(this.el).removeAllRanges();

    if (wnd.find) {
      while (wnd.find(text, caseSens)) {
        this.doHighlight(true);
      }
    } else if (wnd.document.body.createTextRange) {
      let textRange = wnd.document.body.createTextRange();
      textRange.moveToElementText(this.el);
      while (textRange.findText(text, 1, caseSens ? 4 : 0)) {
        if (
          !dom(this.el).contains(textRange.parentElement()) &&
          textRange.parentElement() !== this.el
        ) {
          break;
        }

        textRange.select();
        this.doHighlight(true);
        textRange.collapse(false);
      }
    }

    dom(this.el).removeAllRanges();
    wnd.scrollTo(scrollX, scrollY);
  }

  /**
   * Focuses a highlight, bringing it forward in the case it is sitting behind another
   * overlapping highlight, or a highlight it is nested inside.
   *
   * This is only supported by independencia (v2-2019) and onwards.
   * For older versions, this will simply do nothing.
   *
   * @param {string} id - The id of the highlight present in the class names of all elements
   *                      in the DOM that represent the highlight.
   *
   * @param {string} descriptors - Optional serialised descriptors, useful in the case a highlight has no representation in the DOM
   *                        where empty highlight wrapper nodes are removed to use less dom elements.
   *
   * @memberof TextHighlighter
   */
  focusUsingId(id, descriptors) {
    if (this.highlighter.focusUsingId) {
      this.highlighter.focusUsingId(id, descriptors);
    } else {
      console.warn(
        `The ${
          versionNames[this.options.version]
        } version of the text highlighter does not support focusing highlights.`,
      );
    }
  }

  /**
   * Deselects a highlight, bringing any nested highlights in the list of descriptors
   * forward.
   *
   * This is only supported by independencia (v2-2019) and onwards.
   * For older versions, this will simply do nothing.
   *
   * @typedef HighlightDescriptor
   * @type {object}
   * @property {string} id
   * @property {string} serialisedDescriptor
   *
   * @param {string} id  The id of the deselected highlight.
   * @param {HighlightDescriptor[]} descriptors the serialised highlight descriptors for a set of highlights that could be nested
   *                               in the deselected highlight.
   * @memberof TextHighlighter
   */
  deselectUsingId(id, descriptors) {
    if (this.highlighter.deselectUsingId) {
      this.highlighter.deselectUsingId(id, descriptors);
    } else {
      console.warn(
        `The ${
          versionNames[this.options.version]
        } version of the text highlighter does not support deselecting highlights.`,
      );
    }
  }
}

export default TextHighlighter;
