import snipJson from "../src/snipJson.js";

const input = `
Just some text, nothing valid
`;

const result = snipJson(input);
console.log("snipJson result:", result);
