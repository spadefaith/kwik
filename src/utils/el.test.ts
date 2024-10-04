import { getComments, stringToHTML } from "./el";

describe("getComments", () => {
  it("should retrieve all comment nodes from a given DOM node", () => {
    const htmlString =
      "<div><!-- Comment 1 --><p>Text</p><!-- Comment 2 --></div>";
    const node = stringToHTML(htmlString);

    const comments: HTMLElement[] = getComments(node);

    expect(comments.length).toBe(2);
    expect(comments[0].nodeValue).toBe(" Comment 1 ");
    expect(comments[1].nodeValue).toBe(" Comment 2 ");
  });

  it("should retrieve only comments matching the target value", () => {
    const htmlString =
      "<div><!-- Comment 1 --><p>Text</p><!-- Comment 2 --></div>";
    const node = stringToHTML(htmlString);

    const comments: HTMLElement[] = getComments(node, " Comment 1 ");

    expect(comments.length).toBe(1);
    expect(comments[0].nodeValue).toBe(" Comment 1 ");
  });

  it("should return an empty array if no comments match the target value", () => {
    const htmlString =
      "<div><!-- Comment 1 --><p>Text</p><!-- Comment 2 --></div>";
    const node = stringToHTML(htmlString);

    const comments = getComments(node, " Non-existent Comment ");

    expect(comments.length).toBe(0);
  });
});

describe("stringToHTML", () => {
  it("should convert a string of HTML into a Document's body element", () => {
    const htmlString = "<div><p>Text</p></div>";
    const body = stringToHTML(htmlString);

    expect(body).toBeInstanceOf(HTMLBodyElement);
    expect(body.innerHTML).toBe("<div><p>Text</p></div>");
  });

  it("should handle empty HTML string", () => {
    const htmlString = "";
    const body = stringToHTML(htmlString);

    expect(body).toBeInstanceOf(HTMLBodyElement);
    expect(body.innerHTML).toBe("");
  });
});
