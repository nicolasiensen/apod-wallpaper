const electron = require("electron");
const app = electron.app;

const { APOD, setNasaApiKey } = require("nasa-sdk");
const wallpaper = require("wallpaper");
const download = require("download");

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

app.on("ready", () => {
  setNasaApiKey(process.env.NASA_API_KEY);
  setWallpaper();
  setInterval(setWallpaper, 24 * 60 * 60 * 1000);
});
