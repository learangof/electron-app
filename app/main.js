const { app, BrowserWindow } = require('electron');
const server = require('http').Server().listen(8080);
const io = require('socket.io')(server);

let mainWindow = null;

io.sockets.on('connection', (socket) => {
  const id = socket.id;
  console.log(`Connection: ${id}`);

  socket.on('peer', () => {
    socket.broadcast.emit('peer', { peerId: id });
  });

  socket.on('signal', ({ signal, peerId }) => {
    let socketPeer = io.sockets.connected[peerId];
    if (!socketPeer) return;
    socketPeer.emit('signal', { signal, peerId: socket.id });
  });
});

const createWindow = () => {
  mainWindow = new BrowserWindow({ show: false });
  mainWindow.loadFile(`${__dirname}/index.html`);
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.webContents.openDevTools();
  });
};

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  // eslint-disable-line global-require
  app.quit();
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('ready', createWindow);
app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
