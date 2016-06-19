var electron = require('electron');

// Module to control application life.
var app = electron.app,
	// Module to create native browser window.
	BrowserWindow = electron.BrowserWindow,
 	Tray = electron.Tray,
	Menu = electron.Menu,
	Ipc = electron.ipcMain
;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
var win,
	appTray,
	ctxMenu
;

function createWindow() {
	var _cxt_destroy = false,
			_create = function () {
			// Create the browser window.
			win = new BrowserWindow({
				// Add x,y so it boots on primary monitor
				x: 0,
				y: 0,
				icon: __dirname + '/img/g2.png'
			});
			win.maximize();

			// and load the index.html of the app.
			win.loadURL('file://' + __dirname + '/html/index.html');

			// Open the DevTools.
			//win.webContents.openDevTools();

			win.on('close', function (e) {
				if (_cxt_destroy) return;
				e.preventDefault();
				win.hide();
			});

			// Emitted when the window is closed.
			win.on('closed', function () {
				// Dereference the window object, usually you would store windows
				// in an array if your app supports multi windows, this is the time
				// when you should delete the corresponding element.
				//win = null;
			});

			win.on('focus', function () {
				appTray.setImage(__dirname + '/img/g2.png');
			});
		}
	;
	_create();

	ctxMenu = Menu.buildFromTemplate([
		{label: 'Exit', click: function () {
			_cxt_destroy = true;
			app.quit();
		}},
	]);

	appTray = new Tray(__dirname + '/img/g2.png');
	appTray.setToolTip("test test");
	appTray.setContextMenu(ctxMenu);

	appTray.on("click", function () {
		_create();
	});

	Ipc.on('new-line', function (e, txt) {
		appTray.setToolTip(txt);
		appTray.setImage(__dirname + '/img/g2-notify.png');
	});

	Ipc.on('mark-read', function (e) {
		appTray.setImage(__dirname + '/img/g2.png');
	});
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
	//app.quit();
});

app.on('activate', function () {
	if (win === null) {
		createWindow();
	}
});
