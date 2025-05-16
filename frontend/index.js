import {AppRegistry, LogBox} from 'react-native';
import App from './src/App';
import {name as appName} from './app.json';

// Disable all logs and RedBox in non-dev mode
if (!__DEV__) {
  console.log = () => {};
  console.warn = () => {};
  console.error = () => {};
  LogBox.ignoreAllLogs(); // hides the red warning box
}

AppRegistry.registerComponent(appName, () => App);
