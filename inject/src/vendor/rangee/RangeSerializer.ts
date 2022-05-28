import { find, generateSelector } from "./HtmlElementSelectorGenerator"
import { RangeSerialized } from './RangeSerialized';

export const serialize = (range: Range, relativeTo: HTMLElement): RangeSerialized => {
    const start = generateSelector(range.startContainer, relativeTo);
    start.o = range.startOffset;
    const end = generateSelector(range.endContainer, relativeTo);
    end.o = range.endOffset;

    return { s: start, e: end };
}

export const deserialize = (result: RangeSerialized, document: Document): Range => {
    const range = document.createRange();
    let startNode = find(result.s, document);
    let endNode = find(result.e, document);

    if (startNode.nodeType != Node.TEXT_NODE && startNode.firstChild) {
        startNode = startNode.firstChild;
    }
    if (endNode.nodeType != Node.TEXT_NODE && endNode.firstChild) {
        endNode = endNode.firstChild;
    }
    if (startNode) {
        range.setStart(startNode, result.s.o);
    }
    if (endNode) {
        range.setEnd(endNode, result.e.o);
    }

    return range;
}