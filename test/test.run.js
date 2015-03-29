mocha.checkLeaks();
mocha.globals([
  // Libs:
  'jQuery',
  // Chrome stuff..?
  'AppView',
  'ExtensionOptions',
  'ExtensionView',
  'SurfaceWorker',
  'WebView'
]);
mocha.run();
