/*
Helpers are application-specific functions.

They're useful for abstracting away plumbing and other important-but-
uninteresting parts of the code, specific to this codebase.

NOTE: For generalized concerns that aren't specific to this project,
use `utils.js` instead.
*/
import fs from "fs";
import { resolve } from "path";

import prettier from "prettier";
import prettierParserTypeScript from "prettier/parser-typescript";

// Get the configuration for this component.
// Overrides are as follows:
//  - default values
//  - command-line arguments.
//
// The CLI args aren't processed here; this config is used when no CLI argument
// is provided.
export function getConfig() {
  const defaults = {
    lang: "ts",
    dir: "src/_components",
  };

  return Object.assign({}, defaults);
}

export async function buildPrettifier(prettierConfig) {
  let config;
  try {
    config = await prettier.resolveConfig(process.cwd());
  } catch (error) {
    console.error("Error resolving Prettier configuration:", error);
  }

  config = config ||
    prettierConfig || {
      semi: true,
      singleQuote: true,
      trailingComma: "es5",
      parser: "typescript",
    };

  return (text) =>
    prettier.format(text, { ...config, plugins: [prettierParserTypeScript, "prettier-plugin-tailwindcss"] });
}

export function createParentDirectoryIfNecessary(dir) {
  const fullPathToParentDir = resolve(dir);

  if (!fs.existsSync(fullPathToParentDir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Emit a message confirming the creation of the component
const colors = {
  red: [216, 16, 16],
  green: [142, 215, 0],
  blue: [0, 186, 255],
  gold: [255, 204, 0],
  mediumGray: [128, 128, 128],
  darkGray: [90, 90, 90],
};

const langNames = {
  js: "JavaScript",
  ts: "TypeScript",
};

const logComponentLang = (selected) =>
  ["js", "ts"].map((option) => (option === selected ? `${langNames[option]}` : `${langNames[option]}`)).join("  ");

export function logIntro({ name, dir, lang }) {
  console.info("\n");
  console.info(`✨  Creating the ${name} component ✨`);
  console.info("\n");

  const pathString = dir;
  const langString = logComponentLang(lang);

  console.info(`Directory:  ${pathString}`);
  console.info(`Language:   ${langString}`);
  console.info("=========================================");

  console.info("\n");
}

export function logItemCompletion(successText) {
  const checkmark = "✓";
  console.info(`${checkmark} ${successText}`);
}

export function logConclusion() {
  console.info("\n");
  console.info("Component created!");
  console.info("\n");
}

export function logError(error) {
  console.info("\n");
  console.info("Error creating component.");
  console.info(error);
  console.info("\n");
}
