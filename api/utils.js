"use strict";

/**
 * Converts all alphabetical characters in a string to uppercase.
 * @param {string} str - The input string.
 * @returns {string} - The string with all characters converted to uppercase.
 */
function makeUpperCase(str) {
  if (!str) return str; // Return as is if the input is null or undefined
  return str.toUpperCase();
}

/**
 * Replaces spaces in a string with `%20` for URL encoding.
 * @param {string} str - The input string.
 * @returns {string} - The string with spaces replaced by `%20`.
 */
// function replaceSpaces(str) {
//   if (!str) return str; // Return as is if the input is null or undefined
//   return str.replace(/\s+/g, "%20");
// }

/**
 * Applies both `makeUpperCase` and `replaceSpaces` transformations to a string.
 * @param {string} str - The input string.
 * @returns {string} - The transformed string.
 */
// function transformForUrl(str) {
//   return replaceSpaces(makeUpperCase(str));
// }

function transformForUrl(str) {
    return makeUpperCase(str);
  }

module.exports = {
  makeUpperCase,
//   replaceSpaces,
  transformForUrl,
};