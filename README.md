# SnipSmart

![npm](https://img.shields.io/npm/v/snipsmart)
![npm downloads](https://img.shields.io/npm/dm/snipsmart)
![license](https://img.shields.io/npm/l/snipsmart)

Extract clean **JSON** or **HTML/XML** snippets from messy AI outputs or raw text. A tiny, dependency‑free utility built for MCPs, agents, and AI‑native applications.

## ✨ Features

- `snipSmart` -- Forgiving parser that extracts JSON or HTML/XML without throwing
- `snipSmartOrThrow` -- Strict variant that throws unless parsing is fully successful
- Handles:

  - Missing braces
  - Markdown fences
  - Leading/trailing noise
  - Broken or partial tag structures

## 📦 Installation

bash

```
npm install snipsmart

```

## 🔧 Usage

SnipSmart exposes **two functions**:

- `snipSmart` → forgiving, never throws
- `snipSmartOrThrow` → strict, throws on invalid or partial results

## ✅ Option 1: Use `snipSmart` (recommended)

js

```
import snipSmart from "snipsmart";

const input = `Broken JSON: { "name": "Alice", "age": 30 `;

const result = snipSmart(input, "json"); // or { format: "json" }

console.log(result);
/*
{
  status: "check",
  comments: "Added missing closing brace. Parsing passed",
  data: { name: "Alice", age: 30 },
  raw: null
}
*/

```

`snipSmart` never throws --- perfect for AI pipelines and debugging.

## ✅ Option 2: Use `snipSmartOrThrow` (strict)

js

```
import { snipSmartOrThrow } from "snipsmart";

try {
  const data = snipSmartOrThrow(`{ "x": 1 `, "json");
  console.log(data);
} catch (err) {
  console.log("Error:", err.message);
}

```

This variant throws unless:

Code

```
status === "success"

```

Ideal for validation, tests, and deterministic workflows.

## ✅ Extract HTML/XML

js

```
const tagInput = `
Random text
<div><p>Hello <b>World</b></p></div>
More text
`;

const result = snipSmart(tagInput, "tag");

console.log(result.data);
// "<div><p>Hello <b>World</b></p></div>"

```

## 📄 Return Object

Both JSON and TAG modes return:

ts

```
{
  status: "success" | "check" | "fail",
  comments: string,
  data: any | string | null,
  raw: string | null
}

```

- **success** → fully valid
- **check** → recovered with minor fixes (e.g., missing brace)
- **fail** → extraction failed

`snipSmartOrThrow` throws on `"check"` and `"fail"`.

## 🧪 Examples

The `/examples` folder contains runnable examples.

Run one:

bash

```
node examples/use-snipSmart.js

```

## 🧩 Test Cases

The `/testCases` folder includes curated cases for:

- JSON extraction
- Tag extraction
- Unified parsing behavior

Files include:

- `snipJson-cases.md`
- `snipByTag-cases.md`
- `snipSmart-cases.md`

## 🚀 Roadmap

Planned future extractors:

- `snipCsv` -- Extract CSV tables
- `snipCode` -- Extract code blocks
- Additional formats for broader AI‑output parsing

## 🤝 Contributing

Ideas, edge cases, or improvements are welcome. Open an issue or submit a pull request!

## 🔓 License

MIT © Shiny Sherbina<br>
Free for personal and commercial use --- just keep the license notice.

## 🌟 Why SnipSmart?

AI models often wrap structured data in explanations, markdown fences, or conversational fluff. SnipSmart extracts **only the useful part**, making it ideal for:

- MCP tools
- Agent pipelines
- LLM‑driven backends
- Any workflow requiring clean, predictable structured output

Lightweight, deterministic, and built for real‑world AI engineering.
