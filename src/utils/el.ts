/**
 * Retrieves all comment nodes from a given DOM node. Optionally filters comments by a target value.
 *
 * @param {Node} node - The DOM node to search for comment nodes.
 * @param {string} [target] - Optional. The target comment value to filter by.
 * @returns {Comment[]} An array of comment nodes. If a target is provided, only comments matching the target value are returned.
 */
export const getComments = (node, target?) => {
  const xPath = "//comment()",
    result = [];

  let query = document.evaluate(
    xPath,
    node,
    null,
    XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE,
    null
  );

  for (let i = 0, length = query.snapshotLength; i < length; ++i) {
    const item: any = query.snapshotItem(i);
    if (target) {
      if (target == item.nodeValue) {
        result.push(item);
      }
    } else {
      result.push(item);
    }
  }

  return result;
};

/**
 * Converts a string of HTML into a Document's body element.
 *
 * @param str - The HTML string to be converted.
 * @returns The body element of the parsed HTML document.
 */
export const stringToHTML = (str) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(str, "text/html");

  return doc.body;
};
