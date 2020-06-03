const urlLib = require("url");
const axios = require("axios");
const path = require("path");
const fs = require("fs-extra");
const cheerio = require("cheerio");
const asyncLib = require("async");
const mkdirp = require("mkdirp");
const prettier = require("prettier");
const _ = require("lodash");

const extractFromTypescript = require("./explore");
const extractFromCss = require("./parseCss");

const BASE_URL = "https://www.bungie.net/7/en/Destiny/NewLight";
const BUNGIES_API_KEY = "10E792629C2A47E19356B8A79EEFA640";

const ROOT_OUT = path.join(".", "bungie-website-output", "site-source");
const IMAGES_ROOT = path.join(".", "bungie-website-output", "crawled-images");

const INITIAL_CHUNK_RE = /\/7\/static\/js\/(\d+).chunk.js/;
const SOURCE_MAP_RE = /\/\/# sourceMappingURL=([\w-\.\?=]+)/;
const NAMED_CHUNKS_RE = /__webpack_require__\.p \+ "static\/js\/" \+ \(([{}"\w:,-]+)/;
const CHUNK_HASHES_RE = /chunkId\) \+ "\." \+ ([{}"\w:,-]+)\[chunkId\] \+ "\.chunk\.js"/;
const CSS_CHUNKS_RE = /chunkId\) \+ "\." \+ ([{}"\w:,-]+)\[chunkId\] \+ "\.chunk\.css";/;
const NAMED_CSS_CHUNKS_RE = /"static\/css\/" \+ \(([{}"\w:,-]+)/;
const LIMIT = 1;
const DEBUG = false;
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

mkdirp.sync(path.join(IMAGES_ROOT, "_flat"));

function bungieUrl(path) {
  let url;

  if (path.match(/^https?:/)) {
    url = path;
  } else {
    url = `https://www.bungie.net/${path}`
      .replace("net//", "net/")
      .replace(/ca\/\//g, "ca/");
  }

  return url.replace(urlLib.parse(url).search, "");
}

async function mapUrlFromSourceUrl(sourceUrl) {
  const url = bungieUrl(sourceUrl);
  console.log("-> requesting source map for url", url);
  const source = await guardedGet("mapUrlFromSourceUrl()", url);
  console.log("<- axios call is back", url);

  const match = SOURCE_MAP_RE.exec(source.data);

  const mapFileName = match && match[1];

  if (!mapFileName) {
    console.log("source:");
    console.log("");
    console.log(source.data);
    console.log("");
    console.log(source);
    throw new Error(`Unable to find source map in ${url}`);
  }

  const sourceUrlParsed = path.parse(sourceUrl);

  return sourceUrlParsed.dir + "/maps/" + mapFileName;
}

function tryPrettier(name, source) {
  const ext = path.extname(name);
  let prettierParser = "typescript";

  if (ext === ".scss") {
    prettierParser = "css";
  }

  try {
    return prettier.format(source, {
      parser: prettierParser,
    });
  } catch (err) {
    return source;
  }
}

async function extractFilesFromSourceMapUrl(_sourceMapUrl, onFile = () => {}) {
  const sourceMapUrl = _sourceMapUrl.includes("http")
    ? _sourceMapUrl
    : bungieUrl(_sourceMapUrl);

  const resp = await guardedGet("extractFilesFromSourceMapUrl()", sourceMapUrl);
  const sourceMap = resp.data;

  const files = sourceMap.sources
    .map((path, idx) => ({
      path,
      idx,
    }))
    .map(({ path: sourcePath, idx }) => {
      const fileContent = resp.data.sourcesContent[idx];

      const safePath = path
        .normalize(sourcePath)
        .replace(/^(\.\.(\/|\\|$))+/, "");

      let outFilePath = path.join(ROOT_OUT, safePath);

      if (
        path.parse(outFilePath).ext === ".scss" &&
        !fileContent.includes("module.exports = {")
      ) {
        outFilePath = path.join(ROOT_OUT, "_scss", safePath);
      }

      if (outFilePath.includes("webpack\\bootstrap")) {
        outFilePath += ".js";
      }

      onFile(sourcePath, fileContent, outFilePath);

      const prettierFileContent = tryPrettier(sourcePath, fileContent);

      return fs.outputFile(outFilePath, prettierFileContent);
    });

  return Promise.all(files);
}

async function getBootstrapSource(runtimeSourceMapUrl) {
  let source;

  await extractFilesFromSourceMapUrl(
    runtimeSourceMapUrl,
    (filePath, fileContents) => {
      if (filePath.includes("webpack/bootstrap")) {
        source = fileContents;
      }
    }
  );

  return source;
}

async function getSourceMapUrlsFromBootstrap(bootstrapSource, initialChunkSrc) {
  const namedChunksMatch = NAMED_CHUNKS_RE.exec(bootstrapSource);
  const namedChunks =
    namedChunksMatch && namedChunksMatch[1] && JSON.parse(namedChunksMatch[1]);

  const chunkHashesMatch = CHUNK_HASHES_RE.exec(bootstrapSource);
  const chunkHashes =
    chunkHashesMatch && chunkHashesMatch[1] && JSON.parse(chunkHashesMatch[1]);

  const urls = Object.keys(chunkHashes).map((chunkId) => {
    const chunkName = namedChunks[chunkId] || chunkId;

    return `https://www.bungie.net/7/static/js/maps/${chunkName}.${chunkHashes[chunkId]}.chunk.js.map`;
  });

  console.log("Source maps?", urls);

  if (initialChunkSrc) {
    urls.push(bungieUrl(await mapUrlFromSourceUrl(initialChunkSrc)));
  }

  return urls;
}

async function getCssSourceMapUrlsFromBootstrap(bootstrapSource) {
  const namedChunksMatch = NAMED_CSS_CHUNKS_RE.exec(bootstrapSource);
  const namedChunks =
    namedChunksMatch && namedChunksMatch[1] && JSON.parse(namedChunksMatch[1]);

  const chunkHashesMatch = CSS_CHUNKS_RE.exec(bootstrapSource);
  const chunkHashes =
    chunkHashesMatch && chunkHashesMatch[1] && JSON.parse(chunkHashesMatch[1]);

  console.log("namedChunks", namedChunks);
  console.log("chunkHashes", chunkHashes);

  const cssSourceMapUrls = Object.keys(chunkHashes).map((chunkId) => {
    const urlStart = namedChunks[chunkId] || chunkId;

    return `https://www.bungie.net/7/static/css/${urlStart}.${chunkHashes[chunkId]}.chunk.css.map`;
  });

  const cssUrls = Object.keys(chunkHashes).map((chunkId) => {
    const urlStart = namedChunks[chunkId] || chunkId;

    return `https://www.bungie.net/7/static/css/${urlStart}.${chunkHashes[chunkId]}.chunk.css`;
  });

  console.log("cssUrls", cssUrls);
  console.log("cssSourceMapUrls", cssSourceMapUrls);

  return {
    cssSourceMapUrls,
    cssUrls,
  };
}

async function getAllSourceMapUrls(indexPageUrl) {
  const basePageResp = await guardedGet("getAllSourceMapUrls()", indexPageUrl);

  const $ = cheerio.load(basePageResp.data);
  var scriptTags = $("script");
  const scriptSrcs = [];

  scriptTags.each((index, el) => {
    el.attribs.src && scriptSrcs.push(el.attribs.src);
  });

  var runtimeSrc = scriptSrcs.find((src) =>
    src.includes("/7/static/js/runtime-main")
  );

  var initialChunkSrc = scriptSrcs.find((src) => src.match(INITIAL_CHUNK_RE));

  console.log("runtimeSrc", runtimeSrc);
  console.log("initialChunkSrc", initialChunkSrc);

  const runtimeSourceMapUrl = await mapUrlFromSourceUrl(runtimeSrc);
  console.log("mapUrlFromSourceUrl done");
  const bootstrapSource = await getBootstrapSource(runtimeSourceMapUrl);

  const urls = await getSourceMapUrlsFromBootstrap(
    bootstrapSource,
    initialChunkSrc
  );

  const { cssSourceMapUrls, cssUrls } = await getCssSourceMapUrlsFromBootstrap(
    bootstrapSource
  );

  return {
    sourceMapUrls: [...urls, ...cssSourceMapUrls],
    cssUrls,
  };
}

async function downloadImageActual(url, outPath) {
  const response = await axios({
    url,
    method: "GET",
    responseType: "stream",
  });

  if (!response) {
    console.error("in downloadImageActual, the response was empty so aborting");
    const fakeError = new Error();
    console.log("Stack:", fakeError.stack);
    process.exit(1);
  }

  const writer = fs.createWriteStream(outPath);
  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
}

async function downloadImage(toDownload) {
  const { ext } = path.parse(toDownload);

  if (!ext || ext === "" || ext === ".webp") {
    return;
  }

  if (toDownload.includes("#{$")) {
    return;
  }

  const downloadUrl = bungieUrl(toDownload);

  const urlPath = urlLib.parse(downloadUrl).path;
  const folder = path.parse(urlPath).dir;

  const outFolder = path.join(IMAGES_ROOT, folder);
  const fullOutPath = path.join(IMAGES_ROOT, urlPath);

  let fileAlreadyExists = false;
  // try {
  //   const stats = fs.statSync(fullOutPath);
  //   fileAlreadyExists = stats.size > 0;
  // } catch (err) {
  //   fileAlreadyExists = false;
  // }

  if (fileAlreadyExists) {
    return;
  }

  console.log("Downloading", downloadUrl);

  try {
    await mkdirp(outFolder);
  } catch (err) {
    console.error(`mkdirp failed for ${outFolder} because ${err.toString()}`);
  }

  try {
    await downloadImageActual(downloadUrl, fullOutPath);
  } catch (err) {
    if (err && err.response && err.response.status === 404) {
      console.log("404", downloadUrl);
      return;
    }

    throw err;
  }

  const ss = urlPath.replace(/\//g, "_").replace(/\\/g, "_").replace(/^_/, "");
  const copyTo = path.join(IMAGES_ROOT, "_flat", ss);

  await fs.copy(fullOutPath, copyTo);
}

async function getContentByTagAndType(callObj) {
  const DOWNLOADABLE_PROPERTIES = [
    "LargeImage",
    "VideoThumbnail",
    "LoopingVideoThumbnail",
    "FrontPageBanner",
  ];

  const url = _.isString(callObj)
    ? callObj
    : `https://www.bungie.net/Platform/Content/GetContentByTagAndType/${callObj.args[0]}/${callObj.args[1]}/en/?lc=en&fmt=true&lcin=true&&head=true`;

  console.log("CMS call", url);

  const resp = await guardedGet("getContentByTagAndType()", url, {
    headers: {
      "x-api-key": BUNGIES_API_KEY,
    },
  });

  if (resp.data.Response.properties.Path) {
    downloadQueue.push(resp.data.Response.properties.Path);
  }

  if (resp.data.Response.properties.LargeImage) {
    console.log("pushing", resp.data.Response.properties.LargeImage);
    downloadQueue.push(resp.data.Response.properties.LargeImage);
  }

  resp.data.Response.properties.ContentItems &&
    resp.data.Response.properties.ContentItems.forEach((contentItem) => {
      DOWNLOADABLE_PROPERTIES.forEach((prop) => {
        if (contentItem.properties[prop]) {
          console.log("  pushing downloadable", contentItem.properties[prop]);
          downloadQueue.push(contentItem.properties[prop]);
        }
      });

      if (contentItem.properties.VideoId) {
        const youtubeUrl = `https://www.youtube.com/watch?v=${contentItem.properties.VideoId}`;
        console.log("  Youtube:", youtubeUrl);
      }
    });
}

async function downloadWorker(toDownload) {
  if (DEBUG) {
    return;
  }

  if (toDownload.type === "fn") {
    if (toDownload.fnName == "GetContentByTagAndType") {
      await getContentByTagAndType(toDownload);
      return;
    }

    if (toDownload.fnName == "GetContentById") {
      await getContentByTagAndType(
        `https://www.bungie.net/Platform/Content/GetContentById/${toDownload.args[0]}/en/?lc=en&fmt=true&lcin=true&&head=false`
      );
      return;
    }

    return;
  }

  await downloadImage(toDownload);
}

const downloadQueue = asyncLib.queue(downloadWorker, 1);

async function guardedGet(name = "unnamed", ...args) {
  const url = args[0].url || args[0];

  try {
    console.log("* REQUESTING", url);
    return await axios.get(...args);
  } catch (err) {
    console.log("Original error", err.message || err);
    throw new Error(`Error getting URL in ${name}: ${url}`);
  }
}

async function run() {
  const indexHtmlPath = path.join(".", "bungie-website-output", "index.html");

  let previousIndex = "";

  try {
    previousIndex = (await fs.readFile(indexHtmlPath)).toString();
  } catch {}

  const pageResp = await guardedGet("run()", BASE_URL);

  if (previousIndex === pageResp.data) {
    console.log("Page has not changed, stopping.");
    // return;
  }

  await fs.writeFile(indexHtmlPath, pageResp.data);

  const { sourceMapUrls, cssUrls } = await getAllSourceMapUrls(BASE_URL);

  const urlsWithErrors = [];

  await asyncLib.eachLimit(sourceMapUrls, LIMIT, (sourceMapUrl, cb) => {
    extractFilesFromSourceMapUrl(
      sourceMapUrl,
      (filePath, fileContents, outFilePath) => {
        const foundUrls = extractFromTypescript(outFilePath, fileContents);

        if (foundUrls.length > 0) {
          console.log("  " + outFilePath);
          foundUrls.forEach((f) => console.log("   ", f));
          foundUrls.forEach((f) => downloadQueue.push(f));
        }
      }
    )
      .then(() => cb())
      .catch((err) => {
        urlsWithErrors.push(sourceMapUrl);
        console.log(
          "Error requesting",
          sourceMapUrl,
          "so ignoring it",
          err.message
        );
        cb();
      });
  });

  await asyncLib.eachLimit(cssUrls, LIMIT, (cssUrl, cb) => {
    axios
      .get(cssUrl)
      .then((resp) => {
        // const parsedUrl = urlLib.parse(cssUrl);
        // const prettierSource = prettier.format(resp.data, { parser: "css" });
        // const outdir = path.join(IMAGES_ROOT, parsedUrl.pathname);
        // mkdirp.sync(path.parse(outdir).dir);
        // fs.outputFileSync(outdir, prettierSource);

        const foundUrls = extractFromCss(resp.data);

        if (foundUrls.length > 0) {
          console.log("  " + cssUrl);
          foundUrls.forEach((f) => console.log("   ", f));
          foundUrls.forEach((f) => downloadQueue.push(f));
        }
      })

      .then(() => cb())
      .catch((err) => {
        urlsWithErrors.push(cssUrl);
        console.log("Error requesting", cssUrl, "so ignoring it", err.message);
        cb();
      });
  });

  if (urlsWithErrors) {
    console.log("");
    console.log("The following urls had errors:");
    urlsWithErrors.forEach((v) => console.log(` - ${v}`));
    console.log("");
  }

  console.log("All done :)");
}

run();

downloadQueue.error(function (err, task) {
  console.error("task experienced an error");
  console.error(err);
  // process.exit(0);
});

// downloadQueue.push({
//   type: "fn",
//   fnName: "GetContentByTagAndType",
//   args: ["S10_product_page_assets", "ContentSet", false, false],
// });
