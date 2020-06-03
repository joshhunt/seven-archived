const fs = require("fs");
const ts = require("typescript");
const _ = require("lodash");

function extractUrlsFromNode(node, collectionArr) {
  switch (node.kind) {
    case ts.SyntaxKind.StringLiteral:
      if (node.text.match(/^\/?7\/ca/)) {
        collectionArr.push(node.text);
      }

      if (node.text.includes("/img")) {
        collectionArr.push(node.text);
      }

      if (node.text.match(/^url\(\/?7\/ca/)) {
        const re = /url\((.+)\)/;
        const results = re.exec(node.text);
        if (results && results[1]) {
          collectionArr.push(results[1]);
        }
      }

      break;

    case ts.SyntaxKind.CallExpression:
      const fnName =
        node.expression.text ??
        (node.expression.name && node.expression.name.text) ??
        "";

      const args = node.arguments.map(
        (n) => n.kind === ts.SyntaxKind.StringLiteral && n.text
      );

      if (fnName === "GetContentByTagAndType") {
        console.log("$$$$$ GetContentByTagAndType call");
        if (_.isString(args[0]) && _.isString(args[1])) {
          collectionArr.push({
            type: "fn",
            fnName,
            args,
          });
        }
      }

      if (fnName === "Img") {
        console.log("$$$$$ found Img call");

        if (args[0]) collectionArr.push(`/7/ca/${args[0]}`);
      }

      break;
  }

  ts.forEachChild(node, (n) => extractUrlsFromNode(n, collectionArr));
}

module.exports = function extractUrlsFromFile(fileName, fileSource) {
  const ast = ts.createSourceFile(
    fileName,
    fileSource,
    ts.ScriptTarget.ES2015,
    /*setParentNodes */ true
  );

  var collectionArr = [];

  extractUrlsFromNode(ast, collectionArr);

  return collectionArr;
};

// const testFile = "C:\\Users\\josh\\scripts\\bungie-source-maps\\output\\src\\Areas\\Seasons\\ProductPages\\Season10\\SeasonOfTheWorthy.tsx",

// testFile
