const electron = require('electron');
const { APOD, setNasaApiKey } = require("nasa-sdk");
const path = require("path");
const os = require("os");
const AutoLaunch = require('auto-launch');
const WallpaperManager = require("./WallpaperManager");
const TrayManager = require("./TrayManager");

var autoLauncher = new AutoLaunch({ name: 'APOD Wallpaper' });

autoLauncher.isEnabled().then((isEnabled) => {
  if (!isEnabled) autoLaunch.enable();
});

process.resourcesPath = process.env.PWD ? process.env.PWD : process.resourcesPath;

require('dotenv').config({ path: path.join(process.resourcesPath, ".env") })

const trayIcon = path.join(process.resourcesPath, "build", `TrayIconTemplate.png`);

const trayAnimationFrames = [
  path.join(process.resourcesPath, "build", `TrayIconLoading1Template.png`),
  path.join(process.resourcesPath, "build", `TrayIconLoading2Template.png`),
  path.join(process.resourcesPath, "build", `TrayIconLoading3Template.png`),
  path.join(process.resourcesPath, "build", `TrayIconLoading4Template.png`)
]

electron.app.on("ready", function ready() {
  setNasaApiKey(process.env.NASA_API_KEY);
  const imagesPath = path.join(os.tmpdir(), "com.nicolasiensen.apod-wallpaper");
  const trayManager = new TrayManager(trayIcon, trayAnimationFrames);

  const onWallpaperUpdateStart = () => {
    trayManager.startAnimation();
  };

  const onWallpaperUpdateComplete = (wallpaper) => {
    const date = new Date(wallpaper.date);
    const urlDate = wallpaper.date.replace(/-/g, "").slice(2);
    const url = `https://apod.nasa.gov/apod/ap${urlDate}.html`
    const menu = electron.Menu.buildFromTemplate([
      { label: date.toDateString(), type: "normal", enabled: false },
      { label: wallpaper.title, type: "normal", click: () => electron.shell.openExternal(url) },
      { type: "separator" },
      { label: "Quit", type: "normal", click: electron.app.quit }
    ]);

    trayManager.stopAnimation();
    trayManager.setToolTip(wallpaper.title);
    trayManager.setContextMenu(menu);
  }

  const onWallpaperUpdateFail = error => {
    trayManager.stopAnimation();
    console.log("WallpaperManager error: ", error);
  };

  const wallpaperManager = new WallpaperManager(APOD, imagesPath, {
    onWallpaperUpdateStart,
    onWallpaperUpdateComplete,
    onWallpaperUpdateFail
  });

  wallpaperManager.setWallpaper();
  wallpaperManager.enableDailyWallpaper();
  electron.powerMonitor.on('suspend', wallpaperManager.disableDailyWallpaper)
  electron.powerMonitor.on('resume', wallpaperManager.enableDailyWallpaper)
});
