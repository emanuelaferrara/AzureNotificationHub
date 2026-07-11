// Type declarations for the browserified bundle produced by `npm run browserify:azure-sdk`.
// Runtime lives in the generated ./azure.js; TypeScript pairs this .d.ts with it, so
// importing from './services/azure' is fully typed via the package's own declarations.
//
// The bundle is built standalone (browserify -s AzureDevOps) from azure-devops-node-api/WebApi.js,
// so its exports are exactly WebApi's exports. Re-export them verbatim.
export * from 'azure-devops-node-api/WebApi';
