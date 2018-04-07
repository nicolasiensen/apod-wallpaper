const menubar = require("menubar");
const { APOD, setNasaApiKey } = require("nasa-sdk");
const wallpaper = require("wallpaper");
const download = require("download");
const path = require("path");

process.resourcesPath = process.env.PWD ? process.env.PWD : process.resourcesPath;

require('dotenv').config({ path: path.join(process.resourcesPath, ".env") })

const mb = menubar({
  icon: "build/tray-icon.png"
});

const setWallpaper = () => {
  return APOD.fetch()
    .then(apod => new Promise((resolve, reject) => resolve(apod["hdurl"])))
    .then(
      url =>
        new Promise((resolve, reject) => {
          download(url, "./images").then(() => resolve(url));
        })
    )
    .then(url => wallpaper.set(`./images/${url.replace(/^.*[\\\/]/, "")}`))
    .then(() => console.log("done"));
};

mb.on("ready", function ready() {
  setNasaApiKey(process.env.NASA_API_KEY);
  setWallpaper();
  setInterval(setWallpaper, 24 * 60 * 60 * 1000);
});
