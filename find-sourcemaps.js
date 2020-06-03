var urlLib = require("url");
var axios = require("axios");
var _ = require("lodash");

var urls = [
  "https://www.bungie.net/7/static/js/Destiny-Shadowkeep.chunk.js.map",
];

var guesses = ["dev", "source", "map", "maps", "sourcemaps", "sourcemap"];

function check(url) {
  axios
    .get(url)
    .then((r) => console.log(`**** SUCCESS ${url} `))
    .catch((r) => console.log(`fail ${url} `));
}

urls.forEach((url) => {
  console.log(url);

  var gg = urlLib
    .parse(url)
    .pathname.split("/")
    .map((segment) => {
      console.log(`  ${segment}`);
      return guesses.map((guess) => {
        console.log(`    ${guess}`);
        return segment.length
          ? url.replace(segment, `${guess}/${segment}`)
          : url;
      });
    });

  console.log(urlsToCheck);

  var urlsToCheck = _(gg)
    .flatMap((v) => v)
    .uniq((b) => b)
    .forEach((url) => {
      check(url);
    });
});
