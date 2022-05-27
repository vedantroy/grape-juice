export function bindEvents(el, scope) {
  el.addEventListener("mouseup", scope.highlightHandler);
  el.addEventListener("touchend", scope.highlightHandler);
}

export function unbindEvents(el, scope) {
  el.removeEventListener("mouseup", scope.highlightHandler);
  el.removeEventListener("touchend", scope.highlightHandler);
}
