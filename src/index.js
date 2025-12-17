import snipJson from "./snipJson.js";
import snipByTag from "./snipByTag.js";

class SnipSmartError extends Error {
  constructor(message, result) {
    super(message);
    this.name = "SnipSmartError";
    this.result = result;
  }
}

function snipSmart(content, options = "json") {
  const format =
    typeof options === "string" ? options : options?.format || "json";

  switch (format) {
    case "json":
      return snipJson(content);

    case "tag":
      return snipByTag(content);

    default:
      return {
        status: "fail",
        comments: `Invalid format '${format}'. Expected 'json' or 'tag'.`,
        data: null,
        raw: content,
      };
  }
}

function snipSmartOrThrow(content, options = "json") {
  const result = snipSmart(content, options);

  if (result.status !== "success") {
    throw new SnipSmartError(result.comments, result);
  }

  return result.data;
}

export { snipSmart, snipSmartOrThrow, SnipSmartError };
export default snipSmart;
