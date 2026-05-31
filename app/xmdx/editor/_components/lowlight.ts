import { createLowlight } from "lowlight";
import bash from "highlight.js/lib/languages/bash";
import css from "highlight.js/lib/languages/css";
import javascript from "highlight.js/lib/languages/javascript";
import json from "highlight.js/lib/languages/json";
import plaintext from "highlight.js/lib/languages/plaintext";
import python from "highlight.js/lib/languages/python";
import sql from "highlight.js/lib/languages/sql";
import typescript from "highlight.js/lib/languages/typescript";
import xml from "highlight.js/lib/languages/xml";

export const lowlight = createLowlight();

lowlight.register("bash", bash);
lowlight.register("sh", bash);
lowlight.register("css", css);
lowlight.register("javascript", javascript);
lowlight.register("js", javascript);
lowlight.register("json", json);
lowlight.register("plaintext", plaintext);
lowlight.register("text", plaintext);
lowlight.register("txt", plaintext);
lowlight.register("python", python);
lowlight.register("py", python);
lowlight.register("sql", sql);
lowlight.register("typescript", typescript);
lowlight.register("ts", typescript);
lowlight.register("html", xml);
lowlight.register("xml", xml);
