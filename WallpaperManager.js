const wallpaper = require("wallpaper");
const download = require("download");
const path = require("path");

class WallpaperManager {
  constructor(apodApi, imagesPath) {
    this.apodApi = apodApi;
    this.imagesPath = imagesPath;
    this.date = null;
    this.currentWallpaperDate = null;
    this.interval = null;

    this._updateDate();

    this.setWallpaper = this.setWallpaper.bind(this);
    this.disableDailyWallpaper = this.disableDailyWallpaper.bind(this);
    this.enableDailyWallpaper = this.enableDailyWallpaper.bind(this);
  }

  _updateDate() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    this.date = today;
  }

  setWallpaper() {
    if (this.currentWallpaperDate === null || this.currentWallpaperDate.valueOf() !== this.date.valueOf()) {
      return this.apodApi.fetch({ date: `${this.date.getFullYear()}-${("0" + (this.date.getMonth() + 1)).slice(-2)}-${("0" + this.date.getDate()).slice(-2)}` })
        .then(apod => new Promise((resolve, reject) => resolve(apod["hdurl"])))
        .then(
          url =>
            new Promise((resolve, reject) => {
              download(url, this.imagesPath).then(() => resolve(url));
            })
        )
        .then(url => wallpaper.set(path.join(this.imagesPath, url.replace(/^.*[\\\/]/, ""))))
        .then(() => this.currentWallpaperDate = this.date);
    }
  };

  disableDailyWallpaper() {
    clearInterval(this.interval);
  }

  enableDailyWallpaper() {
    this.interval = setInterval(() => {
      this._updateDate();
      this.setWallpaper()
    }, 10000);;
  }
}

module.exports = WallpaperManager;
