/**
 * The sleep function pauses the execution of code for a specified number of
 * milliseconds.
 * @param ms - The parameter "ms" stands for milliseconds. It represents the number of milliseconds
 * that the function should wait before resolving the promise.
 * @returns a Promise object.
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = sleep;