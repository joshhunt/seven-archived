const urlLib = require("url");
const axios = require("axios");
const path = require("path");
const fs = require("fs-extra");
const cheerio = require("cheerio");
const asyncLib = require("async");
const mkdirp = require("mkdirp");
const prettier = require("prettier");
const slugify = require("slugify");
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
const CHUNK_HASHES_RE = /\.chunk\.js\?v=" \+ ([{}"\w:,-]+)/;
const CSS_CHUNKS_RE = /var cssChunks = ([{}"\w:,-]+)/;
const NAMED_CSS_CHUNKS_RE = /"static\/css\/" \+ \(([{}"\w:,-]+)/;
const LIMIT = 1;
const DEBUG = false;

mkdirp.sync(path.join(IMAGES_ROOT, "_flat"));

function bungieUrl(path) {
  let url;

  if (path.match(/^https?:/)) {
    url = path;
  } else {
    url = `https://www.bungie.net/${path}`.replace("net//", "net/");
  }

  return url.replace(urlLib.parse(url).search, "");
}

async function mapUrlFromSourceUrl(sourceUrl) {
  const source = await axios.get(bungieUrl(sourceUrl));

  const match = SOURCE_MAP_RE.exec(source.data);

  const mapFileName = match && match[1];

  if (!mapFileName) {
    throw new Error(`Unable to find source map in ${sourceUrl}`);
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

  const resp = await axios.get(sourceMapUrl);
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

      fs.outputFile(outFilePath, prettierFileContent);
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
    const urlStart = namedChunks[chunkId] || chunkId;

    return `https://www.bungie.net/7/static/js/maps/${urlStart}.chunk.js.map?v=${chunkHashes[chunkId]}`;
  });

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

  const cssSourceMapUrls = Object.keys(chunkHashes).map((chunkId) => {
    const urlStart = namedChunks[chunkId] || chunkId;

    return `https://www.bungie.net/7/static/css/${urlStart}.chunk.css.map?v=${chunkHashes[chunkId]}`;
  });

  const cssUrls = Object.keys(chunkHashes).map((chunkId) => {
    const urlStart = namedChunks[chunkId] || chunkId;

    return `https://www.bungie.net/7/static/css/${urlStart}.chunk.css?v=${chunkHashes[chunkId]}`;
  });

  return {
    cssSourceMapUrls,
    cssUrls,
  };
}

async function getAllSourceMapUrls(indexPageUrl) {
  const basePageResp = await axios.get(indexPageUrl);
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
  const writer = fs.createWriteStream(outPath);

  const response = await axios({
    url,
    method: "GET",
    responseType: "stream",
  });

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
}

async function downloadImage(toDownload) {
  if (path.parse(toDownload).ext === ".webp") {
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

  let fileAlreadyExists;
  try {
    const stats = fs.statSync(fullOutPath);
    fileAlreadyExists = stats.size > 0;
  } catch (err) {
    fileAlreadyExists = false;
  }

  if (fileAlreadyExists) {
    return;
  }

  console.log("Downloading", downloadUrl);

  await mkdirp(outFolder);
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

  const url = `https://www.bungie.net/Platform/Content/GetContentByTagAndType/${callObj.args[0]}/${callObj.args[1]}/en/?lc=en&fmt=true&lcin=true&&head=true`;
  console.log("CMS call", url);
  const resp = await axios(url, {
    headers: {
      "x-api-key": BUNGIES_API_KEY,
    },
  });

  if (resp.data.Response.properties.Path) {
    downloadQueue.push(resp.data.Response.properties.Path);
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

    return;
  }

  await downloadImage(toDownload);
}

const downloadQueue = asyncLib.queue(downloadWorker, 1);

async function run() {
  const { sourceMapUrls, cssUrls } = await getAllSourceMapUrls(BASE_URL);

  asyncLib.eachLimit(sourceMapUrls, LIMIT, (sourceMapUrl, cb) => {
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
      .catch(cb);
  });

  asyncLib.eachLimit(cssUrls, LIMIT, (cssUrl, cb) => {
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
      .catch(cb);
  });
}

run();

downloadQueue.error(function (err, task) {
  console.error("task experienced an error");
  console.error(err);
});

// downloadQueue.push({
//   type: "fn",
//   fnName: "GetContentByTagAndType",
//   args: ["S10_product_page_assets", "ContentSet", false, false],
// });
