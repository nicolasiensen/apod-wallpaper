const download = require("download");
const wallpaper = require("wallpaper");
const { APOD } = require("nasa-sdk");
const WallpaperManager = require("./WallpaperManager");

jest.useFakeTimers();
jest.mock("download");
jest.mock("wallpaper");
jest.mock("nasa-sdk");

const date = new Date("2018/04/21");
const hdurl = "https://apod.nasa.gov/apod/image/1804/FalconTessLaunchKraus.jpg";
const imagesPath = "/images/path/";
const callback = jest.fn();
let wallpaperManager;

global.Date = jest.fn(() => date);
APOD.fetch.mockResolvedValue({ hdurl });
download.mockImplementation(url => Promise.resolve(url));

describe("WallpaperManager", () => {
  beforeEach(async () => {
    wallpaperManager = new WallpaperManager(APOD, imagesPath, callback);
    await wallpaperManager.setWallpaper();
  })

  describe("#setWallpaper", () => {
    it("should fetch the APOD for today from the API", () => {
      expect(APOD.fetch).toHaveBeenCalledWith({ date: "2018-04-21" });
    });

    it("should download the high definition APOD to the images folder", () => {
      expect(download).toHaveBeenCalledWith(hdurl, imagesPath);
    });

    it("should set the wallpaper with the downloaded APOD", () => {
      expect(wallpaper.set).toHaveBeenCalledWith(imagesPath + "FalconTessLaunchKraus.jpg");
    });

    it("should call the callback with the wallpaper", () => {
      expect(callback).toHaveBeenCalledWith({ hdurl });
    });

    describe("when the wallpaper was already set", () => {
      beforeEach(async () => {
        await wallpaperManager.setWallpaper();
      });

      it("should not fetch the APOD for today from the API again", () => {
        expect(APOD.fetch).toHaveBeenCalledTimes(1);
      });

      it("should not download the high definition APOD to the images folder again", () => {
        expect(download).toHaveBeenCalledTimes(1);
      });

      it("should not set the wallpaper with the downloaded APOD again", () => {
        expect(wallpaper.set).toHaveBeenCalledTimes(1);
      });

      it("should not call the callback", () => {
        expect(callback).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe("#enableDailyWallpaper", () => {
    it("should enable a timer to update the wallpaper every 10s", () => {
      wallpaperManager.setWallpaper = jest.fn()
      wallpaperManager.enableDailyWallpaper();
      jest.advanceTimersByTime(10000);
      expect(wallpaperManager.setWallpaper).toHaveBeenCalledTimes(1);
      jest.advanceTimersByTime(10000);
      expect(wallpaperManager.setWallpaper).toHaveBeenCalledTimes(2);
    });
  });

  describe("#disableDailyWallpaper", () => {
    it("should disable the timer to update the wallpaper every 10s", () => {
      wallpaperManager.setWallpaper = jest.fn()
      wallpaperManager.enableDailyWallpaper();
      jest.advanceTimersByTime(10000);
      expect(wallpaperManager.setWallpaper).toHaveBeenCalledTimes(1);
      wallpaperManager.disableDailyWallpaper();
      jest.advanceTimersByTime(10000);
      expect(wallpaperManager.setWallpaper).toHaveBeenCalledTimes(1);
    });
  });
});
