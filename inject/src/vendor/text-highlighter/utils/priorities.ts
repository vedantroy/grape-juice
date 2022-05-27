/**
 * Determines whether the provided highlighter has
 * the highest priority of a set of highlighters applied to
 * the same document.
 *
 * @param {string} highlighterNamespace
 * @param {Record<string, number>} priorities
 *
 * @return boolean
 */
export function isHighestPriority(highlighterNamespace, priorities) {
  const keys = Object.keys(priorities);
  if (keys.length === 0) return true;
  if (!(highlighterNamespace in priorities)) return false;

  const highlighterPriority = priorities[highlighterNamespace];
  let hasHighestPriority = true;
  let i = 0;
  while (hasHighestPriority && i < keys.length) {
    hasHighestPriority = priorities[keys[i]] <= highlighterPriority;
    i = i + 1;
  }
  return hasHighestPriority;
}
