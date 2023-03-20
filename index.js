const { app, BrowserWindow } = require('electron');

app.whenReady().then(() => {
  const electron = new BrowserWindow({
    title: 'Map Editor',
    show: false,
    fullscreen: true
  });

  electron.loadFile('./index.html');
  electron.show();
});

app.on('window-all-closed', () => {
  app.quit();
});
