import snipSmart from "../src/index.js";

// ------------------------------------------------------------
// Example input with broken JSON
// ------------------------------------------------------------
const jsonInput = `
Here is some content:
{ "key": "value", "open": [1, 2 }
Some other text here.
`;

// ------------------------------------------------------------
// 1. snipSmart (JSON mode — forgiving, never throws)
// ------------------------------------------------------------
const resultJson = snipSmart(jsonInput, "json");

console.log("=== snipSmart (JSON) ===");
console.log(resultJson);
/*
Expected output : 
{
  status: 'fail',
  comments: 'Bracket mismatch detected.',
  data: null,
  raw: '{ "key": "value", "open": [1, 2 }'
}
*/

// Accessing parsed data safely
console.log("snipSmart JSON data:", resultJson.data);

// ------------------------------------------------------------
// Example input with HTML/XML tags
// ------------------------------------------------------------
const tagInput = `
Random text before
<div><p>Hello <b>World</b></p></div>
Random text after
`;

// ------------------------------------------------------------
// 2. snipSmart (TAG mode)
// ------------------------------------------------------------
const resultTag = snipSmart(tagInput, "tag");

console.log("\n=== snipSmart (TAG) ===");
console.log(resultTag);
/*
Expected output :
{
  status: "success",
  comments: "Valid tag structure found.",
  data: "<div><p>Hello <b>World</b></p></div>",
  raw: null
}
*/

console.log("snipSmart TAG data:", resultTag.data);

// ------------------------------------------------------------
// 3. Invalid format (still non-throwing)
// ------------------------------------------------------------
const invalidFormat = snipSmart(jsonInput, "unknown");

console.log("\n=== snipSmart (invalid format) ===");
console.log(invalidFormat);
/*
Expected output : 
{
  status: 'fail',
  comments: "Invalid format 'unknown'. Expected 'json' or 'tag'.",
  data: null,
  raw: '\n' +
    'Here is some content:\n' +
    '{ "key": "value", "open": [1, 2 }\n' +
    'Some other text here.\n'
}
*/
