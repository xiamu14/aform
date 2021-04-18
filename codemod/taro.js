const _ = require("lodash");
const babylon = require("@babel/parser");
const baseOptions = require("./tsOptions");

const options = _.merge(baseOptions, { plugins: ["jsx"] });

module.exports = function transform(fileInfo, api) {
  const { source, path } = fileInfo;
  const { jscodeshift: j } = api;
  const root = j(source, {
    parser: {
      parse(code) {
        return babylon.parse(code, options);
      },
    },
  });
  if (path.includes("submit/index.tsx")) {
    root
      .find(j.ImportDeclaration, { source: { value: "react" } })
      .forEach((path) => {
        j(path).insertAfter(
          j.importDeclaration(
            [j.importSpecifier(j.identifier("Button"))],
            j.literal("@tarojs/components")
          )
        );
      });
  } else if (path.includes("core/index.tsx")) {
    root
      .find(j.ImportDeclaration, { source: { value: "react" } })
      .forEach((path) => {
        j(path).insertAfter(
          j.importDeclaration(
            [j.importSpecifier(j.identifier("Form"))],
            j.literal("@tarojs/components")
          )
        );
      });
  }
  root.find(j.JSXIdentifier, { name: "form" }).forEach((path) => {
    // console.log(path);
    path.node.name = "Form";
  });

  root.find(j.JSXIdentifier, { name: "button" }).forEach((path) => {
    // console.log(path);
    path.node.name = "Button";
  });

  return root.toSource();
};
