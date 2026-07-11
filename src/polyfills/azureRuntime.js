// Runtime shims required by the browserified azure-devops-node-api bundle
// (src/services/azure.js). Import this ONCE, as early as possible, before any
// module that touches the SDK.
//
// azure-devops-node-api is a Node server SDK; browserify inlines browser shims
// for its Node-core deps. One of them, stream-http (the `http`/`https` shim),
// reads `global.location.protocol` UNCONDITIONALLY when building every request:
//
//     var defaultProtocol =
//       global.location.protocol.search(/^https?:$/) === -1 ? 'http:' : ''
//
// React Native/Hermes has no `location` global, so without this shim every
// request throws "Cannot read properties of undefined (reading 'protocol')".
// A minimal https location is enough — the SDK always uses absolute URLs, so
// only `protocol` (and, defensively, `hostname`) is actually read.
if (typeof global.location === 'undefined') {
  global.location = {
    protocol: 'https:',
    hostname: 'localhost',
    host: 'localhost',
    port: '',
    href: 'https://localhost/',
  };
}
