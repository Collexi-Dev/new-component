#!/usr/bin/env node
import { existsSync } from "fs";
import { resolve, join } from "path";
import { program } from "commander";
import {
  getConfig,
  buildPrettifier,
  createParentDirectoryIfNecessary,
  logIntro,
  logItemCompletion,
  logConclusion,
  logError,
} from "./helpers.js";
import { mkDirPromise, readFilePromiseRelative, writeFilePromise } from "./utils.js";

// Load our package.json, so that we can pass the version onto `commander`.
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { version } = require("../package.json");

// Get the default config for this component, falls back to sensible defaults.
const config = getConfig();

// Convenience wrapper around Prettier, so that config doesn't have to be
// passed every time.
const prettify = await buildPrettifier(config.prettierConfig);

program
  .version(version)
  .arguments("<componentName>")
  .option("-l, --lang <language>", 'Which language to use (default: "ts")', /^(js|ts)$/i, config.lang)
  .option("-d, --dir <pathToDirectory>", 'Path to the "components" directory (default: "src/_components")', config.dir)
  .option("-c, --current", 'Create the component in the current directory "_components" folder')
  .parse(process.argv);

const [componentName] = program.args;

const options = program.opts();

const fileExtension = options.lang === "js" ? "js" : "tsx";
const indexExtension = options.lang === "js" ? "js" : "ts";

// Determine the component directory based on the provided options.
let componentDir;
if (options.current) {
  componentDir = join(process.cwd(), "_components", componentName);
} else {
  componentDir = join(options.dir, componentName);
}

// Find the path to the selected template file.
const templatePath = options.lang === "js" ? "./templates/js.js" : "./templates/ts.tsx";

// Get all of our file paths worked out, for the user's project.
const filePath = `${componentDir}/${componentName}.${fileExtension}`;
const indexPath = `${componentDir}/index.${indexExtension}`;

// Our index template is super straightforward, so we'll just inline it for now.
const indexTemplate = await prettify(`\
export * from './${componentName}';
export { default } from './${componentName}';
`);

logIntro({
  name: componentName,
  dir: componentDir,
  lang: options.lang,
});

// Check if componentName is provided
if (!componentName) {
  logError(`Sorry, you need to specify a name for your component like this: new-component <name>`);
  process.exit(0);
}

// Check to see if the parent directory exists.
// Create it if not
createParentDirectoryIfNecessary(options.current ? join(process.cwd(), "_components") : options.dir);

// Check to see if this component has already been created
const fullPathToComponentDir = resolve(componentDir);
if (existsSync(fullPathToComponentDir)) {
  logError(
    `Looks like this component already exists! There's already a component at ${componentDir}.\nPlease delete this directory and try again.`
  );
  process.exit(0);
}

// Start by creating the directory that our component lives in.
mkDirPromise(componentDir)
  .then(() => readFilePromiseRelative(templatePath))
  .then((template) => {
    logItemCompletion("Directory created.");
    return template;
  })
  .then((template) =>
    // Replace our placeholders with real data (so far, just the component name)
    template.replace(/COMPONENT_NAME/g, componentName)
  )
  .then(async (template) =>
    // Format it using prettier, to ensure style consistency, and write to file.
    writeFilePromise(filePath, await prettify(template))
  )
  .then((template) => {
    logItemCompletion("Component built and saved to disk.");
    return template;
  })
  .then(async (template) =>
    // We also need the `index.js` file, which allows easy importing.
    writeFilePromise(indexPath, await prettify(indexTemplate))
  )
  .then((template) => {
    logItemCompletion("Index file built and saved to disk.");
    return template;
  })
  .then((template) => {
    logConclusion();
  })
  .catch((err) => {
    console.error(err);
  });
