const path = require("path");
const fs = require("fs-extra");
const asyncLib = require("async");
const axios = require("axios");
const mkdirp = require("mkdirp");
const _ = require("lodash");
const { resolve } = require("path");

const extractFromTypescript = require("./explore");

const LIMIT = 1;

const namedChunks = {
  "4": "Codes",
  "5": "CrossSave",
  "6": "Destiny",
  "7": "Destiny-Forsaken",
  "8": "Destiny-NewLight",
  "9": "Destiny-Shadowkeep",
  "10": "Legal",
  "11": "PCMigration",
  "12": "Registration",
  "13": "Seasons",
  "14": "Static",
  "15": "UserResearch",
};

const allChunks = {
  "0": "6d6f637d",
  "1": "4ed7a806",
  "2": "fe8c8592",
  "3": "52deb4c1",
  "4": "d75d07b0",
  "5": "75ace90f",
  "6": "78b83a65",
  "7": "843b0a77",
  "8": "9c745ecb",
  "9": "4321437d",
  "10": "830d8881",
  "11": "ba8c2f79",
  "12": "70e6a905",
  "13": "a0359137",
  "14": "e650d753",
  "15": "2b5ad417",
  "19": "ae1a172a",
};

// TODO: get this entry chunk from html file
var extraChunks = ["18"];
extraChunks.forEach((chunkId) => (allChunks[chunkId] = Math.random()));

const urls = Object.keys(allChunks).map((chunkId) => {
  const urlStart = namedChunks[chunkId] || chunkId;

  return `https://www.bungie.net/7/static/js/maps/${urlStart}.chunk.js.map?v=${allChunks[chunkId]}`;
});

urls.push(
  `https://www.bungie.net/7/static/js/maps/runtime-main.js.map?v=${Math.random()}`
);

console.log(urls);

const rootOut = path.join(".", "bungie-source-maps", "output", "_", "_", "_");
const crawledImagesRoot = path.join(
  ".",
  "bungie-source-maps",
  "output",
  "crawled-images"
);

mkdirp.sync(rootOut);
mkdirp.sync(crawledImagesRoot);

asyncLib.eachLimit(urls, LIMIT, (url, cb) => {
  console.log(url);

  axios.get(url).then((resp) => {
    const files = resp.data.sources
      .map((path, idx) => ({
        path,
        idx,
      }))
      .map(({ path, idx }) => {
        let out = resolve(rootOut, path);

        if (out.includes("webpack\\bootstrap")) {
          out += ".js";
        }

        const fileContent = resp.data.sourcesContent[idx];

        const foundUrls = extractFromTypescript(out, fileContent);

        if (foundUrls.length > 0) {
          console.log("  " + out);
          foundUrls.forEach((f) => console.log("   ", f));
          foundUrls.forEach((f) => downloadQueue.push(f));
        }

        fs.outputFile(out, fileContent);
      });

    Promise.all(files)
      .then(() => cb())
      .catch(cb);
  });
});
