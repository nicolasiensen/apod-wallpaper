const menubar = require("menubar");
const electron = require('electron');
const { APOD, setNasaApiKey } = require("nasa-sdk");
const path = require("path");
const os = require("os");
const WallpaperManager = require("./WallpaperManager");

process.resourcesPath = process.env.PWD ? process.env.PWD : process.resourcesPath;

require('dotenv').config({ path: path.join(process.resourcesPath, ".env") })

const mb = menubar({
  icon: path.join(process.resourcesPath, "build", "tray-icon.png"),
  preloadWindow: true
});

mb.on("ready", function ready() {
  setNasaApiKey(process.env.NASA_API_KEY);
  const imagesPath = path.join(os.tmpdir(), "com.nicolasiensen.apod-wallpaper");

  const wallpaperManager = new WallpaperManager(
    APOD,
    imagesPath,
    wallpaper => {
      mb.window.webContents.send('onWallpaperSet', wallpaper);
      mb.showWindow();
    }
  );

  wallpaperManager.setWallpaper();
  wallpaperManager.enableDailyWallpaper();
  electron.powerMonitor.on('suspend', wallpaperManager.disableDailyWallpaper)
  electron.powerMonitor.on('resume', wallpaperManager.enableDailyWallpaper)
});
