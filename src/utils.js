/*
Utils are general building blocks. Platform-specific, but not
application-specific

They're useful for abstracting away the configuration for native methods,
or defining new convenience methods for things like working with files,
data munging, etc.

NOTE: Utils should be general enough to be useful in any Node application.
For application-specific concerns, use `helpers.js`.
*/
import { mkdir, readFile, writeFile } from "fs";
import { join } from "path";

import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function mkDirPromise(dirPath) {
  return new Promise((resolve, reject) => {
    mkdir(dirPath, (err) => {
      err ? reject(err) : resolve();
    });
  });
}

// Simple promise wrappers for read/write files.
// utf-8 is assumed.
export function readFilePromise(fileLocation) {
  return new Promise((resolve, reject) => {
    readFile(fileLocation, "utf-8", (err, text) => {
      err ? reject(err) : resolve(text);
    });
  });
}

export function writeFilePromise(fileLocation, fileContent) {
  return new Promise((resolve, reject) => {
    writeFile(fileLocation, fileContent, "utf-8", (err) => {
      err ? reject(err) : resolve();
    });
  });
}

// Somewhat counter-intuitively, `fs.readFile` works relative to the current
// working directory (if the user is in their own project, it's relative to
// their project). This is unlike `require()` calls, which are always relative
// to the code's directory.
export function readFilePromiseRelative(fileLocation) {
  return readFilePromise(join(__dirname, fileLocation));
}

export function sample(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
