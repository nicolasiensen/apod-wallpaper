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

const setWallpaper = (imagesPath, date) => {
  return APOD.fetch({ date: `${date.getFullYear()}-${("0" + (date.getMonth() + 1)).slice(-2)}-${("0" + date.getDate()).slice(-2)}` })
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

const getToday = () => {
  const today = new Date();
  today.setHours(0,0,0,0);
  return today;
}

mb.on("ready", function ready() {
  setNasaApiKey(process.env.NASA_API_KEY);
  let wallpaperSetAt = getToday();
  const imagesPath = path.join(os.tmpdir(), "com.nicolasiensen.apod-wallpaper")
  setWallpaper(imagesPath, wallpaperSetAt);

  setInterval(() => {
    if (wallpaperSetAt.valueOf() !== getToday().valueOf()) {
      wallpaperSetAt = getToday();
      setWallpaper(imagesPath, wallpaperSetAt);
    }
  }, 10000);
});
