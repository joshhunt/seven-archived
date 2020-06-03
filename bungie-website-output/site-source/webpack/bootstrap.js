// install a JSONP callback for chunk loading
function webpackJsonpCallback(data) {
  var chunkIds = data[0];
  var moreModules = data[1];
  var executeModules = data[2];

  // add "moreModules" to the modules object,
  // then flag all "chunkIds" as loaded and fire callback
  var moduleId,
    chunkId,
    i = 0,
    resolves = [];
  for (; i < chunkIds.length; i++) {
    chunkId = chunkIds[i];
    if (
      Object.prototype.hasOwnProperty.call(installedChunks, chunkId) &&
      installedChunks[chunkId]
    ) {
      resolves.push(installedChunks[chunkId][0]);
    }
    installedChunks[chunkId] = 0;
  }
  for (moduleId in moreModules) {
    if (Object.prototype.hasOwnProperty.call(moreModules, moduleId)) {
      modules[moduleId] = moreModules[moduleId];
    }
  }
  if (parentJsonpFunction) parentJsonpFunction(data);

  while (resolves.length) {
    resolves.shift()();
  }

  // add entry modules from loaded chunk to deferred list
  deferredModules.push.apply(deferredModules, executeModules || []);

  // run deferred modules when all chunks ready
  return checkDeferredModules();
}
function checkDeferredModules() {
  var result;
  for (var i = 0; i < deferredModules.length; i++) {
    var deferredModule = deferredModules[i];
    var fulfilled = true;
    for (var j = 1; j < deferredModule.length; j++) {
      var depId = deferredModule[j];
      if (installedChunks[depId] !== 0) fulfilled = false;
    }
    if (fulfilled) {
      deferredModules.splice(i--, 1);
      result = __webpack_require__((__webpack_require__.s = deferredModule[0]));
    }
  }

  return result;
}

// The module cache
var installedModules = {};

// object to store loaded CSS chunks
var installedCssChunks = {
  26: 0,
};

// object to store loaded and loading chunks
// undefined = chunk not loaded, null = chunk preloaded/prefetched
// Promise = chunk loading, 0 = chunk loaded
var installedChunks = {
  26: 0,
};

var deferredModules = [];

// script path function
function jsonpScriptSrc(chunkId) {
  return (
    __webpack_require__.p +
    "static/js/" +
    ({
      "5": "Codes",
      "6": "CrossSave",
      "7": "Destiny",
      "8": "Destiny-BeyondLight",
      "9": "Destiny-Buy",
      "10": "Destiny-BuyDetail",
      "11": "Destiny-Forsaken",
      "12": "Destiny-NewLight",
      "13": "Destiny-Shadowkeep",
      "14": "Legal",
      "15": "PCMigration",
      "16": "Registration",
      "17": "Season11",
      "18": "SeasonOfDawn",
      "19": "SeasonOfTheUndying",
      "20": "SeasonOfTheWorthy",
      "21": "Seasons",
      "22": "Static",
      "23": "User",
      "24": "UserResearch",
    }[chunkId] || chunkId) +
    "." +
    {
      "0": "15ae259a",
      "1": "9ed9fb1e",
      "2": "a8d89913",
      "3": "faf07e3f",
      "4": "090e4ea0",
      "5": "6b4e0a92",
      "6": "67a6c180",
      "7": "16f0f9d9",
      "8": "9ff04883",
      "9": "8d6ec77b",
      "10": "5db4fc0e",
      "11": "c370f333",
      "12": "8f5963a9",
      "13": "43ab92f4",
      "14": "55eb88d3",
      "15": "0d40ed47",
      "16": "fe509993",
      "17": "6e1352ea",
      "18": "ed7bdf5d",
      "19": "a96285da",
      "20": "a4487c2b",
      "21": "ae9d2640",
      "22": "0263b279",
      "23": "6d809fa2",
      "24": "37487f9d",
      "28": "0c1325f4",
      "29": "711f00d9",
      "30": "54333cbf",
      "31": "c4f2517e",
      "32": "4c5fbba6",
      "33": "a7736c83",
      "34": "b20327a9",
      "35": "29690999",
      "36": "fad922d5",
      "37": "6dd01992",
      "38": "f1d8eecc",
      "39": "980db57c",
    }[chunkId] +
    ".chunk.js"
  );
}

// The require function
function __webpack_require__(moduleId) {
  // Check if module is in cache
  if (installedModules[moduleId]) {
    return installedModules[moduleId].exports;
  }
  // Create a new module (and put it into the cache)
  var module = (installedModules[moduleId] = {
    i: moduleId,
    l: false,
    exports: {},
  });

  // Execute the module function
  modules[moduleId].call(
    module.exports,
    module,
    module.exports,
    __webpack_require__
  );

  // Flag the module as loaded
  module.l = true;

  // Return the exports of the module
  return module.exports;
}

// This file contains only the entry chunk.
// The chunk loading function for additional chunks
__webpack_require__.e = function requireEnsure(chunkId) {
  var promises = [];

  // mini-css-extract-plugin CSS loading
  var cssChunks = {
    "3": 1,
    "4": 1,
    "5": 1,
    "6": 1,
    "7": 1,
    "8": 1,
    "9": 1,
    "10": 1,
    "11": 1,
    "12": 1,
    "13": 1,
    "14": 1,
    "15": 1,
    "16": 1,
    "17": 1,
    "18": 1,
    "19": 1,
    "20": 1,
    "21": 1,
    "24": 1,
    "28": 1,
    "29": 1,
    "30": 1,
    "31": 1,
    "32": 1,
  };
  if (installedCssChunks[chunkId]) promises.push(installedCssChunks[chunkId]);
  else if (installedCssChunks[chunkId] !== 0 && cssChunks[chunkId]) {
    promises.push(
      (installedCssChunks[chunkId] = new Promise(function (resolve, reject) {
        var href =
          "static/css/" +
          ({
            "5": "Codes",
            "6": "CrossSave",
            "7": "Destiny",
            "8": "Destiny-BeyondLight",
            "9": "Destiny-Buy",
            "10": "Destiny-BuyDetail",
            "11": "Destiny-Forsaken",
            "12": "Destiny-NewLight",
            "13": "Destiny-Shadowkeep",
            "14": "Legal",
            "15": "PCMigration",
            "16": "Registration",
            "17": "Season11",
            "18": "SeasonOfDawn",
            "19": "SeasonOfTheUndying",
            "20": "SeasonOfTheWorthy",
            "21": "Seasons",
            "22": "Static",
            "23": "User",
            "24": "UserResearch",
          }[chunkId] || chunkId) +
          "." +
          {
            "0": "31d6cfe0",
            "1": "31d6cfe0",
            "2": "31d6cfe0",
            "3": "ec610900",
            "4": "3d75c00c",
            "5": "e2e77995",
            "6": "b6a1597a",
            "7": "06889fbe",
            "8": "fde62bec",
            "9": "2a3558a7",
            "10": "70782db0",
            "11": "09e9c5cd",
            "12": "385dd7bf",
            "13": "95b82ac3",
            "14": "f1824888",
            "15": "3b42227b",
            "16": "3014e847",
            "17": "58f60079",
            "18": "2e098bdf",
            "19": "f801ece7",
            "20": "6f026de8",
            "21": "43f44762",
            "22": "31d6cfe0",
            "23": "31d6cfe0",
            "24": "f6c42431",
            "28": "c7a0f7fc",
            "29": "f8c7a0ed",
            "30": "f8c7a0ed",
            "31": "14458bf3",
            "32": "c0294a3f",
            "33": "31d6cfe0",
            "34": "31d6cfe0",
            "35": "31d6cfe0",
            "36": "31d6cfe0",
            "37": "31d6cfe0",
            "38": "31d6cfe0",
            "39": "31d6cfe0",
          }[chunkId] +
          ".chunk.css";
        var fullhref = __webpack_require__.p + href;
        var existingLinkTags = document.getElementsByTagName("link");
        for (var i = 0; i < existingLinkTags.length; i++) {
          var tag = existingLinkTags[i];
          var dataHref =
            tag.getAttribute("data-href") || tag.getAttribute("href");
          if (
            tag.rel === "stylesheet" &&
            (dataHref === href || dataHref === fullhref)
          )
            return resolve();
        }
        var existingStyleTags = document.getElementsByTagName("style");
        for (var i = 0; i < existingStyleTags.length; i++) {
          var tag = existingStyleTags[i];
          var dataHref = tag.getAttribute("data-href");
          if (dataHref === href || dataHref === fullhref) return resolve();
        }
        var linkTag = document.createElement("link");
        linkTag.rel = "stylesheet";
        linkTag.type = "text/css";
        linkTag.onload = resolve;
        linkTag.onerror = function (event) {
          var request = (event && event.target && event.target.src) || fullhref;
          var err = new Error(
            "Loading CSS chunk " + chunkId + " failed.\n(" + request + ")"
          );
          err.code = "CSS_CHUNK_LOAD_FAILED";
          err.request = request;
          delete installedCssChunks[chunkId];
          linkTag.parentNode.removeChild(linkTag);
          reject(err);
        };
        linkTag.href = fullhref;

        var head = document.getElementsByTagName("head")[0];
        head.appendChild(linkTag);
      }).then(function () {
        installedCssChunks[chunkId] = 0;
      }))
    );
  }

  // JSONP chunk loading for javascript

  var installedChunkData = installedChunks[chunkId];
  if (installedChunkData !== 0) {
    // 0 means "already installed".

    // a Promise means "currently loading".
    if (installedChunkData) {
      promises.push(installedChunkData[2]);
    } else {
      // setup Promise in chunk cache
      var promise = new Promise(function (resolve, reject) {
        installedChunkData = installedChunks[chunkId] = [resolve, reject];
      });
      promises.push((installedChunkData[2] = promise));

      // start chunk loading
      var script = document.createElement("script");
      var onScriptComplete;

      script.charset = "utf-8";
      script.timeout = 120;
      if (__webpack_require__.nc) {
        script.setAttribute("nonce", __webpack_require__.nc);
      }
      script.src = jsonpScriptSrc(chunkId);

      // create error before stack unwound to get useful stacktrace later
      var error = new Error();
      onScriptComplete = function (event) {
        // avoid mem leaks in IE.
        script.onerror = script.onload = null;
        clearTimeout(timeout);
        var chunk = installedChunks[chunkId];
        if (chunk !== 0) {
          if (chunk) {
            var errorType =
              event && (event.type === "load" ? "missing" : event.type);
            var realSrc = event && event.target && event.target.src;
            error.message =
              "Loading chunk " +
              chunkId +
              " failed.\n(" +
              errorType +
              ": " +
              realSrc +
              ")";
            error.name = "ChunkLoadError";
            error.type = errorType;
            error.request = realSrc;
            chunk[1](error);
          }
          installedChunks[chunkId] = undefined;
        }
      };
      var timeout = setTimeout(function () {
        onScriptComplete({ type: "timeout", target: script });
      }, 120000);
      script.onerror = script.onload = onScriptComplete;
      document.head.appendChild(script);
    }
  }
  return Promise.all(promises);
};

// expose the modules object (__webpack_modules__)
__webpack_require__.m = modules;

// expose the module cache
__webpack_require__.c = installedModules;

// define getter function for harmony exports
__webpack_require__.d = function (exports, name, getter) {
  if (!__webpack_require__.o(exports, name)) {
    Object.defineProperty(exports, name, { enumerable: true, get: getter });
  }
};

// define __esModule on exports
__webpack_require__.r = function (exports) {
  if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
    Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
  }
  Object.defineProperty(exports, "__esModule", { value: true });
};

// create a fake namespace object
// mode & 1: value is a module id, require it
// mode & 2: merge all properties of value into the ns
// mode & 4: return value when already ns object
// mode & 8|1: behave like require
__webpack_require__.t = function (value, mode) {
  if (mode & 1) value = __webpack_require__(value);
  if (mode & 8) return value;
  if (mode & 4 && typeof value === "object" && value && value.__esModule)
    return value;
  var ns = Object.create(null);
  __webpack_require__.r(ns);
  Object.defineProperty(ns, "default", { enumerable: true, value: value });
  if (mode & 2 && typeof value != "string")
    for (var key in value)
      __webpack_require__.d(
        ns,
        key,
        function (key) {
          return value[key];
        }.bind(null, key)
      );
  return ns;
};

// getDefaultExport function for compatibility with non-harmony modules
__webpack_require__.n = function (module) {
  var getter =
    module && module.__esModule
      ? function getDefault() {
          return module["default"];
        }
      : function getModuleExports() {
          return module;
        };
  __webpack_require__.d(getter, "a", getter);
  return getter;
};

// Object.prototype.hasOwnProperty.call
__webpack_require__.o = function (object, property) {
  return Object.prototype.hasOwnProperty.call(object, property);
};

// __webpack_public_path__
__webpack_require__.p = "/7/";

// on error function for async loading
__webpack_require__.oe = function (err) {
  console.error(err);
  throw err;
};

var jsonpArray = (this["webpackJsonpbungienet.web.renderer.core"] =
  this["webpackJsonpbungienet.web.renderer.core"] || []);
var oldJsonpFunction = jsonpArray.push.bind(jsonpArray);
jsonpArray.push = webpackJsonpCallback;
jsonpArray = jsonpArray.slice();
for (var i = 0; i < jsonpArray.length; i++) webpackJsonpCallback(jsonpArray[i]);
var parentJsonpFunction = oldJsonpFunction;

// run deferred modules from other chunks
checkDeferredModules();
