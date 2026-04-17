const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

config.watchFolders = [monorepoRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(monorepoRoot, "node_modules"),
];
config.resolver.unstable_enablePackageExports = true;

// Packages that must always resolve to root (v1) copies.
// @tamagui/babel-plugin@2.x hoists v2 react-native-web-lite/internals/web to
// root when npm reorganizes the tree (e.g. adding a new workspace). These v2
// packages carry their own @tamagui/web@2.x, creating a second config registry
// instance. TamaguiProvider registers in v1 but components look up in v2 →
// "Can't find Tamagui configuration". extraNodeModules is a fallback only, so
// we intercept via resolveRequest (runs before resolution) instead.
const TAMAGUI_V1_PACKAGES = new Set([
  "@tamagui/web",
  "@tamagui/react-native-web-lite",
  "@tamagui/react-native-web-internals",
]);

const defaultResolver = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === "@aramiworks/ui") {
    return {
      filePath: path.resolve(
        monorepoRoot,
        "node_modules/@aramiworks/ui/src/index.ts",
      ),
      type: "sourceFile",
    };
  }
  if (TAMAGUI_V1_PACKAGES.has(moduleName) || Array.from(TAMAGUI_V1_PACKAGES).some((pkg) => moduleName.startsWith(pkg + "/"))) {
    // Resolve as if the import originated from the monorepo root, ensuring the
    // root node_modules (v1) is found instead of any nested v2 copy.
    return context.resolveRequest(
      {
        ...context,
        originModulePath: path.resolve(monorepoRoot, "package.json"),
      },
      moduleName,
      platform,
    );
  }
  if (defaultResolver) {
    return defaultResolver(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
