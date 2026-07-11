// Minimal fs shim for the browserified azure-devops-node-api bundle.
// The only fs use on the client path is WebApi's constructor reading its own
// package.json to build a User-Agent version string (best-effort, guarded by
// existsSync). browserify's default fs stub is an empty object, so existsSync
// is undefined and the guard throws. Returning false makes the SDK fall back to
// nodeApiVersion = 'unknown', which is fine in a mobile app.
module.exports = {
  existsSync: () => false,
  readFileSync: () => {
    throw new Error('fs.readFileSync is not available in React Native (azure-sdk shim)');
  },
};
