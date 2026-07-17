const { getDefaultConfig } = require('@expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// 1. Watch all files in the monorepo
config.watchFolders = [workspaceRoot];

// 2. Resolve modules from both local and workspace root node_modules
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// 3. Shim 'crypto' for React Native
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  crypto: path.resolve(workspaceRoot, 'node_modules/react-native-get-random-values'),
};

// 4. Force Metro to resolve symlinks and work in monorepo
config.resolver.unstable_enableSymlinks = true;
config.resolver.unstable_enablePackageExports = true;

module.exports = config;
