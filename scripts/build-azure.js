// Builds src/services/azure.js from azure-devops-node-api for React Native.
//
// azure-devops-node-api is a Node server SDK; browserify inlines browser shims
// for its Node-core deps (http -> stream-http on XMLHttpRequest, crypto, url,
// stream, buffer, ...). The one shim browserify gets wrong for us is `fs`: its
// default is an empty object, but WebApi's constructor calls fs.existsSync()
// (best-effort package.json read for a User-Agent string), which then throws.
// We override just the `fs` builtin with a stub that returns false.
const fs = require('fs');
const path = require('path');
const browserify = require('browserify');

const OUT = path.resolve(__dirname, '..', 'src', 'services', 'azure.js');
const builtins = {
  ...require('browserify/lib/builtins'),
  fs: require.resolve('./azure-shims/fs.js'),
};

browserify(require.resolve('azure-devops-node-api/WebApi.js'), {
  standalone: 'AzureDevOps',
  builtins,
})
  .bundle()
  .on('error', err => {
    console.error(err);
    process.exit(1);
  })
  .pipe(fs.createWriteStream(OUT))
  .on('finish', () => console.log('wrote', path.relative(process.cwd(), OUT)));
