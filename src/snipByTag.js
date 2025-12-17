/**
 * Attempts to extract a valid HTML/XML snippet from a given string
 * (e.g., AI response or raw text).
 *
 * NOTE:
 * This is a lightweight structural extractor, not a full HTML/XML parser.
 * It is designed to recover well-formed snippets from noisy text
 * (especially LLM-generated output).
 *
 * @param {string} content - Input string that may contain HTML/XML tags.
 * @param {Object} [options]
 * @param {boolean} [options.caseSensitive=false] - Whether tag matching is case-sensitive.
 *
 * @returns {Object} result
 * @property {"success"|"fail"} result.status
 * @property {string} result.comments
 * @property {string|null} result.data
 * @property {string|null} result.raw
 */
function snipByTag(content, { caseSensitive = false } = {}) {
  const result = {
    status: "fail",
    comments: "",
    data: null,
    raw: null,
  };

  if (typeof content !== "string" || !content) {
    result.comments = "Invalid input: content must be a non-empty string.";
    return result;
  }

  const stack = [];
  let snippetStart = -1;
  let i = 0;

  while (i < content.length) {
    if (content[i] !== "<") {
      i++;
      continue;
    }

    // Mark the start of the snippet
    if (snippetStart === -1) snippetStart = i;

    let isClosing = false;
    let isSelfClosing = false;

    i++; // move past '<'

    if (content[i] === "/") {
      isClosing = true;
      i++;
    }

    const tagNameStart = i;

    // Read tag name
    while (i < content.length && /[\w:-]/.test(content[i])) {
      i++;
    }

    const tagNameRaw = content.slice(tagNameStart, i).trim();

    if (!tagNameRaw) {
      result.comments = "Invalid tag name.";
      result.raw = snippetStart !== -1 ? content.slice(snippetStart, i) : null;
      return result;
    }

    const tagName = caseSensitive ? tagNameRaw : tagNameRaw.toLowerCase();

    // Skip attributes / whitespace until tag end
    while (i < content.length && content[i] !== ">") {
      // Detect explicit self-closing tags: />
      if (content[i] === "/" && content[i + 1] === ">") {
        isSelfClosing = true;
        i += 2;
        break;
      }
      i++;
    }

    if (content[i] === ">") {
      i++; // consume '>'
    }

    // Process tag
    if (isClosing) {
      const last = stack.pop();

      if (last !== tagName) {
        result.comments = `Mismatched closing tag: expected </${last}> but found </${tagName}>.`;
        result.raw =
          snippetStart !== -1 ? content.slice(snippetStart, i) : null;
        return result;
      }
    } else if (!isSelfClosing) {
      stack.push(tagName);
    }

    // All tags closed → success
    if (stack.length === 0 && snippetStart !== -1) {
      result.status = "success";
      result.comments = "Valid tag structure found.";
      result.data = content.slice(snippetStart, i);
      return result;
    }
  }

  // End-of-input handling
  if (stack.length > 0) {
    result.comments = `Unclosed tag <${stack.pop()}>.`;
    result.raw = snippetStart !== -1 ? content.slice(snippetStart) : null;
  } else if (snippetStart !== -1) {
    result.comments = "Incomplete tag structure.";
    result.raw = content.slice(snippetStart);
  } else {
    result.comments = "No tags found.";
  }

  return result;
}

export default snipByTag;
