/**
 * Returns array without duplicated values.
 * @param {Array} arr
 * @returns {Array}
 */
export function unique(arr) {
  return arr.filter(function(value, idx, self) {
    return self.indexOf(value) === idx;
  });
}

/**
 * Returns array of strings with all strings converted to lower case.
 *
 * @param {String[]} arr
 * @returns {String[]}
 */
export function arrayToLower(arr) {
  return arr.map(Function.prototype.call, String.prototype.toLowerCase);
}
