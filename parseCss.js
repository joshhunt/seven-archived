const csstree = require("css-tree");

function urlsFromCss(cssSource) {
  const ast = csstree.parse(cssSource);
  const urls = [];

  csstree.walk(ast, function (node) {
    if (node.type === "Raw" && node.value.length > 1) {
      urls.push(node.value.replace("https://local-admin.bungie.bng.local", ""));
    }
  });

  return urls;
}

module.exports = urlsFromCss;
