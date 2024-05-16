const os = require("os");
const fs = require("fs");
const path = require("path");
const prettier = require("prettier");

const { requireOptional, sample } = require("./utils");
const AFFIRMATIONS = require("./affirmations");

// Dynamically import chalk
let chalkPromise = import("chalk").then((chalkModule) => chalkModule.default);

// Get the configuration for this component.
// Overrides are as follows:
//  - default values
//  - globally-set overrides
//  - project-specific overrides
//  - command-line arguments.
//
// The CLI args aren't processed here; this config is used when no CLI argument
// is provided.
module.exports.getConfig = () => {
  const home = os.homedir();
  const currentPath = process.cwd();

  const defaults = {
    lang: "ts",
    dir: "src/components",
  };

  const globalOverrides = requireOptional(`${home}/.new-component-config.json`);

  const localOverrides = requireOptional(`${currentPath}/.new-component-config.json`);

  return Object.assign({}, defaults, globalOverrides, localOverrides);
};

module.exports.buildPrettifier = (prettierConfig) => {
  let config;
  try {
    config = prettier.resolveConfig.sync(process.cwd()) || prettierConfig;
  } catch (error) {
    console.error("Error resolving Prettier configuration:", error);
    config = prettierConfig;
  }

  // default config:
  config = config || {
    semi: true,
    singleQuote: true,
    trailingComma: "es5",
  };

  // Ensure the correct parser is set based on the file extension
  return (text, parser) => prettier.format(text, { ...config, parser });
};

module.exports.createParentDirectoryIfNecessary = async (dir) => {
  const fullPathToParentDir = path.resolve(dir);

  if (!fs.existsSync(fullPathToParentDir)) {
    fs.mkdirSync(dir);
  }
};

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

const logComponentLang = async (selected) => {
  const chalk = await chalkPromise;
  return ["js", "ts"]
    .map((option) =>
      option === selected
        ? `${chalk.bold.rgb(...colors.blue)(langNames[option])}`
        : `${chalk.rgb(...colors.darkGray)(langNames[option])}`
    )
    .join("  ");
};

module.exports.logIntro = async ({ name, dir, lang }) => {
  const chalk = await chalkPromise;
  console.info("\n");
  console.info(`✨  Creating the ${chalk.bold.rgb(...colors.gold)(name)} component ✨`);
  console.info("\n");

  const pathString = chalk.bold.rgb(...colors.blue)(dir);
  const langString = await logComponentLang(lang);

  console.info(`Directory:  ${pathString}`);
  console.info(`Language:   ${langString}`);
  console.info(chalk.rgb(...colors.darkGray)("========================================="));

  console.info("\n");
};

module.exports.logItemCompletion = async (successText) => {
  const chalk = await chalkPromise;
  const checkmark = chalk.rgb(...colors.green)("✓");
  console.info(`${checkmark} ${successText}`);
};

module.exports.logConclusion = async () => {
  const chalk = await chalkPromise;
  console.info("\n");
  console.info(chalk.bold.rgb(...colors.green)("Component created!"));
  console.info(chalk.rgb(...colors.mediumGray)(sample(AFFIRMATIONS)));
  console.info("\n");
};

module.exports.logError = async (error) => {
  const chalk = await chalkPromise;
  console.info("\n");
  console.info(chalk.bold.rgb(...colors.red)("Error creating component."));
  console.info(chalk.rgb(...colors.red)(error));
  console.info("\n");
};
