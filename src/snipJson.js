/**
 * Attempts to extract and parse JSON data from a given string.
 *
 * This function identifies potential JSON structures within a larger text,
 * validates their syntax, and returns a structured result indicating success,
 * partial validity (requiring manual review), or failure.
 *
 * It handles common issues such as:
 * - Leading/trailing non-JSON content
 * - Unmatched braces
 * - Minor formatting issues (e.g., attempts to auto-close one missing brace)
 * Input :
 *  @param {string} content - The input string that may contain embedded JSON data.
 * Output :
 * @returns {Object} result - The result object with the following fields:
 * result.status - Parsing status:
 *   - `"success"` if valid JSON was found and parsed
 *   - `"check"` if a possible JSON structure was recovered with one brace auto-closed, but needs manual review
 *   - `"fail"` if no valid JSON structure could be extracted
 * result.comments - A human-readable message describing what happened during parsing.
 * result.data - The parsed JSON object/array if parsing was successful; otherwise `null`.
 * result.raw - Raw JSON string if parsing failed but an attempt was made (useful for debugging or manual correction); otherwise `null`.
 *
 **/

// Helper function to safely parse a JSON string and capture errors.
// -----------------------------------------------------------------
function parseJson(data) {
  try {
    const parsed = JSON.parse(data);
    return { success: true, parsedData: parsed, error: null };
  } catch (error) {
    return { success: false, parsedData: null, error: error };
  }
}

function sanitizeContent(content) {
  return content
    .replace(/['"]\s*\+\s*['"]?/g, "") // remove '+ or +" artifacts
    .replace(/^```json|```$/gm, "") // strip markdown fences
    .trim();
}

// Main function to extract and parse JSON from raw text.
// ------------------------------------------------------
function snipJson(content) {
  content = sanitizeContent(content);
  const result = {
    status: "fail", // 'success' | 'check' | 'fail'
    comments: "",
    data: null,
    raw: null,
  };

  const braces = { "{": "}", "[": "]" };
  const opening = Object.keys(braces);
  const closing = Object.values(braces);

  let stack = [];

  if (!content || typeof content !== "string") {
    result.comments = "Invalid input: content must be a string.";
    return result;
  }

  // Check 1 : Locate and extract a potential JSON block enclosed in {} or []
  // -------------------------------------------------------------------------
  const startingBrace = Math.min(
    content.indexOf("{") >= 0 ? content.indexOf("{") : Infinity,
    content.indexOf("[") >= 0 ? content.indexOf("[") : Infinity
  );
  const endingBrace = content.lastIndexOf(braces[content[startingBrace]]);

  if (
    startingBrace === Infinity ||
    (endingBrace <= startingBrace && endingBrace !== -1)
  ) {
    result.comments = "No valid JSON structure found.";
    return result;
  }

  const slice = content.slice(startingBrace, endingBrace + 1);

  // Parse check
  const firstParse = parseJson(slice);
  if (firstParse.success) {
    result.status = "success";
    result.comments = "JSON successfully extracted and parsed.";
    result.data = firstParse.parsedData;
    return result;
  } else {
    result.comments = "Simple slice failed. Proceeding to precise parsing";
  }

  // Check 2. Validate JSON structure by tracking matched braces using a stack
  //--------------------------------------------------------------------------
  let jsonEnd = -1;
  let dataParsed = null;

  // Loop through the string to match braces
  for (let i = startingBrace; i < content.length; i++) {
    jsonEnd = i;
    const char = content[i];
    if (opening.includes(char)) stack.push(char);
    if (closing.includes(char)) {
      const pair = stack.length > 0 ? stack.pop() : null;

      if (pair === null || braces[pair] !== char) {
        result.comments = "Bracket mismatch";
        result.status = "fail";
        result.data = null;
        result.raw = content.slice(startingBrace, jsonEnd + 1);
        return result;
      }
    }
  }

  // Detect any unmatched opening braces.
  if (stack.length > 1) {
    result.comments = "Bracket mismatch";
    result.status = "fail";
    result.data = null;
    result.raw = content.slice(startingBrace, jsonEnd + 1);
    return result;
  } else if (stack.length === 1) {
    // One closing brace is missing.
    dataParsed =
      content.slice(startingBrace, jsonEnd + 1) + braces[stack.pop()];
    const secondParse = parseJson(dataParsed);
    result.comments = "Added missing closing brace. ";
    result.comments += secondParse.success
      ? "Parsing passed"
      : `But parsing failed. Error: ${secondParse.error.message}`;
    result.status = secondParse.success ? "check" : "fail";
    result.data = secondParse.parsedData;
    result.raw = secondParse.success ? null : dataParsed;
    return result;
  } else {
    dataParsed = content.slice(startingBrace, jsonEnd + 1);
    const thirdParse = parseJson(dataParsed);

    result.comments = thirdParse.success
      ? "JSON successfully extracted and parsed."
      : `Extracted candidate JSON passed bracket validation but failed to parse. Check result.raw. Error : ${thirdParse.error.message}`;
    result.status = thirdParse.success ? "success" : "check";
    result.data = thirdParse.success ? thirdParse.parsedData : null;
    result.raw = thirdParse.success ? null : dataParsed;
    return result;
  }
}

export default snipJson;
