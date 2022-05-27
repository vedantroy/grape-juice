/**
 * Extracts the scale from a 2D transform matrix.
 *
 * @param {string} transformMatrix The 2D transform matrix.
 *
 * @return {number} The combined scale element of the transform.
 */
export function scaleFromTransformMatrix(transformMatrix) {
  const matrixValues = transformMatrix
    .split("(")[1]
    .split("(")[0]
    .split(",");
  const a = matrixValues[0];
  const b = matrixValues[1];
  return Math.sqrt(a * a + b * b);
}
