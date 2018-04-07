const menubar = require("menubar");
const { APOD, setNasaApiKey } = require("nasa-sdk");
const wallpaper = require("wallpaper");
const download = require("download");
const path = require("path");
const os = require("os");

process.resourcesPath = process.env.PWD ? process.env.PWD : process.resourcesPath;

require('dotenv').config({ path: path.join(process.resourcesPath, ".env") })

const mb = menubar({
  icon: path.join(process.resourcesPath, "build", "tray-icon.png")
});

const setWallpaper = (imagesPath) => {
  return APOD.fetch()
    .then(apod => new Promise((resolve, reject) => resolve(apod["hdurl"])))
    .then(
      url =>
        new Promise((resolve, reject) => {
          download(url, imagesPath).then(() => resolve(url));
        })
    )
    .then(url => wallpaper.set(path.join(imagesPath, url.replace(/^.*[\\\/]/, ""))))
    .then(() => console.log("done"));
};

mb.on("ready", function ready() {
  setNasaApiKey(process.env.NASA_API_KEY);

  const imagesPath = path.join(os.tmpdir(), "com.nicolasiensen.apod-wallpaper")
  setWallpaper(imagesPath);

  setInterval(setWallpaper, 24 * 60 * 60 * 1000);
});
