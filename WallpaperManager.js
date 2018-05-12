const wallpaper = require("wallpaper");
const download = require("download");
const path = require("path");

class WallpaperManager {
  constructor(apodApi, imagesPath, options) {
    this.apodApi = apodApi;
    this.imagesPath = imagesPath;
    this.date = null;
    this.currentWallpaperDate = null;
    this.interval = null;

    this.options = {
      onWallpaperUpdateStart: () => {},
      onWallpaperUpdateComplete: () => {},
      onWallpaperUpdateFail: () => {},
      ...options
    };

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

  async setWallpaper() {
    if (this.currentWallpaperDate === null || this.currentWallpaperDate.valueOf() !== this.date.valueOf()) {
      try {
        this.options.onWallpaperUpdateStart();

        const apod = await this.apodApi.fetch({
          date: `${this.date.getFullYear()}-${("0" + (this.date.getMonth() + 1)).slice(-2)}-${("0" + this.date.getDate()).slice(-2)}`
        });

        const fileName = apod["hdurl"].replace(/^.*[\\\/]/, "")

        await download(apod["hdurl"], this.imagesPath);
        await wallpaper.set(path.join(this.imagesPath, fileName))
        this.currentWallpaperDate = this.date;
        this.options.onWallpaperUpdateComplete(apod);
      } catch(error) {
        this.options.onWallpaperUpdateFail(error);
      }
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
