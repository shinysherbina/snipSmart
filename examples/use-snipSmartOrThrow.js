import { snipSmartOrThrow } from "../src/index.js";

// ------------------------------------------------------------
// Example input with broken JSON (will THROW)
// ------------------------------------------------------------
const brokenJson = `
Some text before
{ "key": "value", "open": [1, 2 }
Some text after
`;

console.log("=== snipSmartOrThrow (JSON) ===");

try {
  const result = snipSmartOrThrow(brokenJson, "json");
  console.log("Parsed JSON:", result);
} catch (err) {
  console.log("Error caught:");
  console.log(err.name); // SnipSmartError
  console.log(err.message); // Human-readable reason
  console.log(err.result); // Full parse result context
}

// ------------------------------------------------------------
// Example input with valid HTML/XML tags (will PASS)
// ------------------------------------------------------------
const tagInput = `
Noise before
<section><h1>Hello</h1><p>World</p></section>
Noise after
`;

console.log("\n=== snipSmartOrThrow (TAG) ===");

try {
  const result = snipSmartOrThrow(tagInput, "tag");
  console.log("Extracted snippet:");
  console.log(result);
} catch (err) {
  console.log("Unexpected error:", err.message);
}

// ------------------------------------------------------------
// Invalid format example (will THROW)
// ------------------------------------------------------------
console.log("\n=== snipSmartOrThrow (invalid format) ===");

try {
  snipSmartOrThrow(brokenJson, "unknown");
} catch (err) {
  console.log("Error caught:");
  console.log(err.message);
}
