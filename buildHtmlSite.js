const fs = require("fs-extra");
const path = require("path");
const mkdirp = require("mkdirp");
const klaw = require("klaw");

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
  getFiles().then((files) => {
    const validFiles = files.filter((f) =>
      EXTENSIONS.includes(path.extname(f).toLowerCase())
    );

    const srcs = validFiles.map((file) => {
      const src = file.replace(fullImagesPath, "").replace(/\\/g, "/");
      const ext = path.extname(src).toLowerCase();
      const friendlyExt = ext.replace(".", "");

      let html = "";

      if (IMAGES.includes(ext)) {
        html = `<img src="/files${src}" loading=lazy />`;
      }

      if (VIDEOS.includes(ext)) {
        html = `<video src="/files${src}" controls loading=lazy></video>`;
      }

      return `<div class="file-container ${friendlyExt}">${html} <div class="path">${src}</div></div>`;
    });

    const copyPromises = validFiles.map((file) => {
      const dest = path.join(
        ".",
        "html-build",
        "files",
        file.replace(fullImagesPath, "")
      );

      const destFolder = path.dirname(dest);

      return mkdirp(destFolder).then(() => fs.copyFile(file, dest));
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
              max-width: calc(50vw - 30px);
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
