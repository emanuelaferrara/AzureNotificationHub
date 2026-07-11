/**
 * @format
 */

import './src/polyfills/azureRuntime'; // must run before any azure-devops-node-api usage
import {AppRegistry} from 'react-native';
import App from './src/App';
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => App);
