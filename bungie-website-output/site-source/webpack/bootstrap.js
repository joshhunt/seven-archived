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
  24: 0,
};

// object to store loaded and loading chunks
// undefined = chunk not loaded, null = chunk preloaded/prefetched
// Promise = chunk loading, 0 = chunk loaded
var installedChunks = {
  24: 0,
};

var deferredModules = [];

// script path function
function jsonpScriptSrc(chunkId) {
  return (
    __webpack_require__.p +
    "static/js/" +
    ({
      "3": "Codes",
      "4": "CrossSave",
      "5": "Destiny",
      "6": "Destiny-BeyondLight",
      "7": "Destiny-BeyondLightMedia",
      "8": "Destiny-Buy",
      "9": "Destiny-BuyDetail",
      "10": "Destiny-Forsaken",
      "11": "Destiny-NewLight",
      "12": "Destiny-Shadowkeep",
      "13": "Legal",
      "14": "PCMigration",
      "15": "Registration",
      "16": "Season11",
      "17": "SeasonOfDawn",
      "18": "SeasonOfTheUndying",
      "19": "SeasonOfTheWorthy",
      "20": "Seasons",
      "21": "Static",
      "22": "UserResearch",
    }[chunkId] || chunkId) +
    ".chunk.js?v=" +
    {
      "0": "1dc3e6fc",
      "1": "a58b4ab9",
      "2": "4da96317",
      "3": "37b8006a",
      "4": "544d56c7",
      "5": "79334651",
      "6": "269ae74b",
      "7": "2517eb20",
      "8": "9bad29be",
      "9": "8c6d6ac7",
      "10": "733d709e",
      "11": "91ef6179",
      "12": "36ddc9f3",
      "13": "4033a3db",
      "14": "b96deb60",
      "15": "ff2f201b",
      "16": "7068164a",
      "17": "422a3aa4",
      "18": "15400b92",
      "19": "294df2c3",
      "20": "681a4558",
      "21": "87713958",
      "22": "82b8f3ff",
      "26": "65090c3b",
    }[chunkId] +
    ""
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
    "2": 1,
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
    "22": 1,
    "26": 1,
  };
  if (installedCssChunks[chunkId]) promises.push(installedCssChunks[chunkId]);
  else if (installedCssChunks[chunkId] !== 0 && cssChunks[chunkId]) {
    promises.push(
      (installedCssChunks[chunkId] = new Promise(function (resolve, reject) {
        var href =
          "static/css/" +
          ({
            "3": "Codes",
            "4": "CrossSave",
            "5": "Destiny",
            "6": "Destiny-BeyondLight",
            "7": "Destiny-BeyondLightMedia",
            "8": "Destiny-Buy",
            "9": "Destiny-BuyDetail",
            "10": "Destiny-Forsaken",
            "11": "Destiny-NewLight",
            "12": "Destiny-Shadowkeep",
            "13": "Legal",
            "14": "PCMigration",
            "15": "Registration",
            "16": "Season11",
            "17": "SeasonOfDawn",
            "18": "SeasonOfTheUndying",
            "19": "SeasonOfTheWorthy",
            "20": "Seasons",
            "21": "Static",
            "22": "UserResearch",
          }[chunkId] || chunkId) +
          ".chunk.css?v=" +
          {
            "0": "31d6cfe0",
            "1": "31d6cfe0",
            "2": "db172dc5",
            "3": "9dca398c",
            "4": "996aa6cc",
            "5": "c2fefd06",
            "6": "9e8a5480",
            "7": "d7d26705",
            "8": "d42f498e",
            "9": "b6f44fff",
            "10": "de97a445",
            "11": "78b0a48a",
            "12": "5cb6114a",
            "13": "cecc27cc",
            "14": "102676c5",
            "15": "6563b01a",
            "16": "52e73570",
            "17": "b2c42111",
            "18": "1b4e54ae",
            "19": "a04edb45",
            "20": "445dd75f",
            "21": "31d6cfe0",
            "22": "fbc6dc2f",
            "26": "4a42a770",
          }[chunkId] +
          "";
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
