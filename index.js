const menubar = require("menubar");
const electron = require('electron');
const { APOD, setNasaApiKey } = require("nasa-sdk");
const path = require("path");
const os = require("os");
const WallpaperManager = require("./WallpaperManager");
const TrayIconManager = require("./TrayIconManager");

process.resourcesPath = process.env.PWD ? process.env.PWD : process.resourcesPath;

require('dotenv').config({ path: path.join(process.resourcesPath, ".env") })

const trayIcon = path.join(process.resourcesPath, "build", `tray-icon.png`);

const trayAnimationFrames = [
  path.join(process.resourcesPath, "build", `tray-icon-loading-1.png`),
  path.join(process.resourcesPath, "build", `tray-icon-loading-2.png`),
  path.join(process.resourcesPath, "build", `tray-icon-loading-3.png`),
  path.join(process.resourcesPath, "build", `tray-icon-loading-4.png`)
]

const mb = menubar({ preloadWindow: true, icon: trayIcon });

mb.on("ready", function ready() {
  setNasaApiKey(process.env.NASA_API_KEY);
  const imagesPath = path.join(os.tmpdir(), "com.nicolasiensen.apod-wallpaper");
  const trayIconManager = new TrayIconManager(mb.tray, trayIcon, trayAnimationFrames);

  const onWallpaperUpdateStart = () => {
    trayIconManager.startAnimation();
  };

  const onWallpaperUpdateComplete = wallpaper => {
    trayIconManager.stopAnimation();
    mb.window.webContents.send('onWallpaperSet', wallpaper);
    mb.showWindow();
  };

  const onWallpaperUpdateFail = error => {
    trayIconManager.stopAnimation();
    console.log("WallpaperManager error: ", error);
  };

  const wallpaperManager = new WallpaperManager(APOD, imagesPath, {
    onWallpaperUpdateStart,
    onWallpaperUpdateComplete,
    onWallpaperUpdateFail
  });

  trayIconManager.setIcon();

  wallpaperManager.setWallpaper();
  wallpaperManager.enableDailyWallpaper();
  electron.powerMonitor.on('suspend', wallpaperManager.disableDailyWallpaper)
  electron.powerMonitor.on('resume', wallpaperManager.enableDailyWallpaper)
});
