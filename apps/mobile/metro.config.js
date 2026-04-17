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

// Force Tamagui runtime packages to root (v1) copies to prevent v2 packages
// (hoisted by @tamagui/babel-plugin's deps) from creating a split config registry.
// Root @tamagui/web@1.x is where TamaguiProvider registers config — all components
// must resolve to the same instance or "Can't find Tamagui configuration" is thrown.
const TAMAGUI_ROOT = path.resolve(monorepoRoot, "node_modules");
config.resolver.extraNodeModules = {
  "@tamagui/web": path.resolve(TAMAGUI_ROOT, "@tamagui/web"),
  "@tamagui/react-native-web-lite": path.resolve(
    TAMAGUI_ROOT,
    "@tamagui/react-native-web-lite",
  ),
  "@tamagui/react-native-web-internals": path.resolve(
    TAMAGUI_ROOT,
    "@tamagui/react-native-web-internals",
  ),
};

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
  if (defaultResolver) {
    return defaultResolver(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
