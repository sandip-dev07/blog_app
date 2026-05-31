"use client";

import hljs from "highlight.js/lib/core";
import bash from "highlight.js/lib/languages/bash";
import css from "highlight.js/lib/languages/css";
import javascript from "highlight.js/lib/languages/javascript";
import json from "highlight.js/lib/languages/json";
import plaintext from "highlight.js/lib/languages/plaintext";
import python from "highlight.js/lib/languages/python";
import sql from "highlight.js/lib/languages/sql";
import typescript from "highlight.js/lib/languages/typescript";
import xml from "highlight.js/lib/languages/xml";

let registered = false;

function registerLanguages() {
  if (registered) {
    return;
  }

  hljs.registerLanguage("bash", bash);
  hljs.registerLanguage("sh", bash);
  hljs.registerLanguage("css", css);
  hljs.registerLanguage("javascript", javascript);
  hljs.registerLanguage("js", javascript);
  hljs.registerLanguage("json", json);
  hljs.registerLanguage("plaintext", plaintext);
  hljs.registerLanguage("text", plaintext);
  hljs.registerLanguage("txt", plaintext);
  hljs.registerLanguage("python", python);
  hljs.registerLanguage("py", python);
  hljs.registerLanguage("sql", sql);
  hljs.registerLanguage("typescript", typescript);
  hljs.registerLanguage("ts", typescript);
  hljs.registerLanguage("html", xml);
  hljs.registerLanguage("xml", xml);
  registered = true;
}

export function highlightCodeBlocks(root: ParentNode | null) {
  if (!root) {
    return;
  }

  registerLanguages();

  root.querySelectorAll<HTMLElement>("pre code").forEach((codeBlock) => {
    delete codeBlock.dataset.highlighted;
    hljs.highlightElement(codeBlock);
  });
}
