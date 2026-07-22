const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const path = require('path');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  resolver: {
    unstable_enableSymlinks: true, // this enable the use of Symlinks
    // pnpm keeps deps strictly scoped, so files inside symlinked workspace
    // packages (e.g. packages/react-native-mac-notifications) can't resolve
    // shared deps like `react-native` by walking up from their own location.
    // These paths force all resolution to the app's single copy (and the root).
    nodeModulesPaths: [
      path.resolve(__dirname, 'node_modules'),
      path.resolve(__dirname, '..', '..', 'node_modules'),
    ],
  },
  // this specifies the folder where are located the node_modules for the project
  watchFolders: [path.join(__dirname, '..', '..')],
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);