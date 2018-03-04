const electron = require("electron");
const app = electron.app;

const { APOD, setNasaApiKey } = require("nasa-sdk");
const wallpaper = require("wallpaper");
const download = require("download");

app.on("ready", () => {
  setNasaApiKey("DEMO_KEY");

  APOD.fetch()
    .then(apod => new Promise((resolve, reject) => resolve(apod["hdurl"])))
    .then(
      url =>
        new Promise((resolve, reject) => {
          download(url, "./images").then(() => resolve(url));
        })
    )
    .then(url => wallpaper.set(`./images/${url.replace(/^.*[\\\/]/, "")}`))
    .then(() => console.log("done"));
});
