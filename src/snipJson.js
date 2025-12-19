/**
 * Attempts to extract and parse JSON data from a given string.
 *
 * NOTE:
 * This is a lightweight JSON recovery utility, not a full JSON repair engine.
 * It is designed to extract well-formed or near-well-formed JSON from noisy
 * text (e.g., LLM responses).
 *
 * It handles:
 * - Leading/trailing non-JSON content
 * - Embedded JSON objects or arrays
 * - One missing closing brace/bracket (auto-closure with warning)
 *
 * @param {string} content - Input string that may contain JSON.
 *
 * @returns {Object} result
 * @property {"success"|"check"|"fail"} result.status
 * @property {string} result.comments
 * @property {any|null} result.data
 * @property {string|null} result.raw
 */

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

function parseJsonSafely(text) {
  try {
    return { success: true, data: JSON.parse(text), error: null };
  } catch (error) {
    return { success: false, data: null, error };
  }
}

function sanitizeContent(content) {
  return content
    .replace(/['"]\s*\+\s*['"]?/g, "") // remove '+ / +" artifacts
    .replace(/^```json|```$/gm, "") // strip markdown fences
    .replace(/^['"]|['"]$/g, "") // remove outer quotes
    .replace(/`/g, "") // strip stray backticks
    .replace(/\\n/g, "\n") // turn escaped \n into real newlines
    .trim();
}

// -----------------------------------------------------------------------------
// Main
// -----------------------------------------------------------------------------

function snipJson(content) {
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

  content = sanitizeContent(content);

  const PAIRS = { "{": "}", "[": "]" };
  const OPENING = Object.keys(PAIRS);
  const CLOSING = Object.values(PAIRS);

  // ---------------------------------------------------------------------------
  // Step 1: Locate candidate JSON start
  // ---------------------------------------------------------------------------

  const firstObject = content.indexOf("{");
  const firstArray = content.indexOf("[");

  const start =
    firstObject === -1
      ? firstArray
      : firstArray === -1
      ? firstObject
      : Math.min(firstObject, firstArray);

  if (start === -1) {
    result.comments = "No JSON structure found.";
    return result;
  }

  // ---------------------------------------------------------------------------
  // Step 2: Fast-path parse (simple slice)
  // ---------------------------------------------------------------------------

  const expectedClosing = PAIRS[content[start]];
  const lastClosing = content.lastIndexOf(expectedClosing);

  if (lastClosing > start) {
    const candidate = content.slice(start, lastClosing + 1);
    const parsed = parseJsonSafely(candidate);

    if (parsed.success) {
      result.status = "success";
      result.comments = "JSON successfully extracted and parsed.";
      result.data = parsed.data;
      return result;
    }
  }

  // ---------------------------------------------------------------------------
  // Step 3: Stack-based structural validation
  // ---------------------------------------------------------------------------

  const stack = [];
  let end = -1;

  for (let i = start; i < content.length; i++) {
    const char = content[i];

    if (OPENING.includes(char)) {
      stack.push(char);
    } else if (CLOSING.includes(char)) {
      const last = stack.pop();

      if (!last || PAIRS[last] !== char) {
        result.comments = "Bracket mismatch detected.";
        result.raw = content.slice(start, i + 1);
        return result;
      }

      if (stack.length === 0) {
        end = i;
        break;
      }
    }
  }

  if (end === -1) {
    // Unclosed structure
    if (stack.length === 1) {
      const repaired = content.slice(start) + PAIRS[stack.pop()];
      const parsed = parseJsonSafely(repaired);

      result.comments = parsed.success
        ? "One missing closing bracket auto-added. Please verify."
        : `Auto-closure attempted but parsing failed: ${parsed.error.message}`;

      result.status = parsed.success ? "check" : "fail";
      result.data = parsed.success ? parsed.data : null;
      result.raw = parsed.success ? null : repaired;
      return result;
    }

    result.comments = "Unbalanced JSON structure.";
    result.raw = content.slice(start);
    return result;
  }

  // ---------------------------------------------------------------------------
  // Step 4: Final parse after structural validation
  // ---------------------------------------------------------------------------

  const finalCandidate = content.slice(start, end + 1);
  const finalParse = parseJsonSafely(finalCandidate);

  result.comments = finalParse.success
    ? "JSON successfully extracted and parsed."
    : `Structurally valid JSON failed to parse: ${finalParse.error.message}`;

  result.status = finalParse.success ? "success" : "check";
  result.data = finalParse.success ? finalParse.data : null;
  result.raw = finalParse.success ? null : finalCandidate;

  return result;
}

export default snipJson;
