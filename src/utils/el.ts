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

export const stringToHTML = (str) => {
  const parser = new DOMParser();

  const doc = parser.parseFromString(str, "text/html");

  return doc.body;
};
