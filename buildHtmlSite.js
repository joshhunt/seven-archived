const fs = require("fs-extra");
const path = require("path");
const mkdirp = require("mkdirp");
const klaw = require("klaw");
const axios = require("axios");

const IMAGES_ROOT = path.join(".", "bungie-website-output", "crawled-images");
const fullImagesPath = path.resolve(IMAGES_ROOT);

function getFiles() {
  return new Promise((resolve) => {
    const items = []; // files, directories, symlinks, etc

    klaw(IMAGES_ROOT)
      .on("data", (item) => items.push(item.path))
      .on("end", () => resolve(items)); // => [ ... array of files]
  });
}

const IMAGES = [".jpg", ".jpeg", ".gif", ".png", ".svg"];
const VIDEOS = [".mp4"];
const EXTENSIONS = [...IMAGES, ...VIDEOS];

function run() {
  getFiles()
    .then((files) => {
      const validFiles = files
        .filter((f) => EXTENSIONS.includes(path.extname(f).toLowerCase()))
        .map((file) => {
          const ext = path.extname(file).toLowerCase();
          const bungiePath = file
            .replace(fullImagesPath, "")
            .replace(/\\/g, "/");

          return {
            fsPath: file,
            bungiePath,
            bungieUrl: `https://www.bungie.net${bungiePath}`,
            ext,
            friendlyExt: ext.replace(".", ""),
          };
        });

      const promises = validFiles.map((fileObj) => {
        console.log("checking", fileObj.bungieUrl);

        return imageStillOnBungie(fileObj.bungieUrl).then((isStillHosted) => {
          return {
            ...fileObj,
            htmlSrc: isStillHosted
              ? fileObj.bungieUrl
              : `/files${fileObj.bungiePath}`,
          };
        });
      });

      return Promise.all(promises);
    })
    .then((files) => {
      const srcs = files.map((file) => {
        // const src = file.replace(fullImagesPath, "").replace(/\\/g, "/");
        // const ext = path.extname(src).toLowerCase();
        // const friendlyExt = ext.replace(".", "");

        let html = "";

        if (IMAGES.includes(file.ext)) {
          html = `<img src="${file.htmlSrc}" loading=lazy />`;
        }

        if (VIDEOS.includes(file.ext)) {
          html = `<video src="${file.htmlSrc}" controls loading=lazy></video>`;
        }

        return `<div class="file-container ${file.friendlyExt}">${html} <div class="path">${file.bungiePath}</div></div>`;
      });

      const copyPromises = files.map((file) => {
        const dest = path.join(
          ".",
          "html-build",
          "files",
          file.fsPath.replace(fullImagesPath, "")
        );

        const destFolder = path.dirname(dest);

        return mkdirp(destFolder).then(() => fs.copyFile(file.fsPath, dest));
      });

      const html = `
        <html>
          <style>
            * { box-sizing: border-box; }
            html, body {
              background: #121212;
              margin: 0;
              padding: 0;
              color: #fafafa;
            }

            .file-container {
              display: inline-block;
              padding: 15px;
            }

            .path {
              font-family: monospace;
              font-size: 14px;
            }

            img, video {
              max-width: calc(50vw - 45px)
              height: auto;
            }

            .svg img {
              max-width: 500px !important;
            }
          </style>
          <body>
            ${srcs.join("\n")}
          </body>
        </html>
      `;

      const htmlPromise = fs.writeFile("./html-build/index.html", html);

      return Promise.all([htmlPromise, ...copyPromises]);
    });
}

run();

function imageStillOnBungie(src) {
  return axios
    .head(src)
    .catch((err) => Promise.resolve(null))
    .then((resp) => {
      if (!resp || !resp.headers) {
        return false;
      }

      const contentLength = resp.headers["content-length"] || "0";
      return parseInt(contentLength) > 0;
    });
}
