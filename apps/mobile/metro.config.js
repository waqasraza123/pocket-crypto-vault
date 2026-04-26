const { getDefaultConfig } = require("expo/metro-config");
const path = require("node:path");

const config = getDefaultConfig(__dirname);
const valtioPackageRoot = path.dirname(require.resolve("valtio/package.json"));

const resolveValtioModulePath = (moduleName) => {
  if (moduleName === "valtio") {
    return path.join(valtioPackageRoot, "index.js");
  }

  return path.join(valtioPackageRoot, `${moduleName.slice("valtio/".length)}.js`);
};

config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  valtio: path.resolve(__dirname, "../../node_modules/valtio"),
};

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === "valtio" || moduleName.startsWith("valtio/")) {
    return context.resolveRequest(context, resolveValtioModulePath(moduleName), platform);
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
