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
const onWallpaperUpdateComplete = jest.fn();
const onWallpaperUpdateStart = jest.fn();
const onWallpaperUpdateFail = jest.fn();

const initializeWallpaperManager = () => new WallpaperManager(APOD, imagesPath, {
  onWallpaperUpdateStart,
  onWallpaperUpdateComplete,
  onWallpaperUpdateFail
});

download.mockResolvedValue(undefined);
wallpaper.set.mockResolvedValue(undefined);
global.Date = jest.fn(() => date);

describe("WallpaperManager", () => {
  let wallpaperManager;

  beforeEach(() => {
    APOD.fetch.mockResolvedValue({ hdurl });
  });

  describe("#setWallpaper", () => {
    describe("when it succeeds to set the wallpaper", () => {
      beforeEach(async () => {
        wallpaperManager = initializeWallpaperManager();
        await wallpaperManager.setWallpaper();
      });

      it("should fetch the APOD for today from the API", () => {
        expect(APOD.fetch).toHaveBeenCalledWith({ date: "2018-04-21" });
      });

      it("should download the high definition APOD to the images folder", () => {
        expect(download).toHaveBeenCalledWith(hdurl, imagesPath);
      });

      it("should set the wallpaper with the downloaded APOD", () => {
        expect(wallpaper.set).toHaveBeenCalledWith(imagesPath + "FalconTessLaunchKraus.jpg");
      });

      it("should trigger onWallpaperUpdateStart", () => {
        expect(onWallpaperUpdateStart).toHaveBeenCalledTimes(1);
      });

      it("should trigger onWallpaperUpdateComplete", () => {
        expect(onWallpaperUpdateComplete).toHaveBeenCalledWith({ hdurl });
      });

      it("should not trigger onWallpaperUpdateFail", () => {
        expect(onWallpaperUpdateFail).not.toHaveBeenCalled();
      });
    });

    describe("when it fails to set the wallpaper", () => {
      let error;

      beforeEach(async () => {
        error = new Error("Network error");
        APOD.fetch.mockRejectedValue(error);
        wallpaperManager = initializeWallpaperManager();
        await wallpaperManager.setWallpaper();
      });

      it("should trigger onWallpaperUpdateStart", () => {
        expect(onWallpaperUpdateStart).toHaveBeenCalledTimes(1);
      });

      it("should not trigger onWallpaperUpdateComplete", () => {
        expect(onWallpaperUpdateComplete).not.toHaveBeenCalled();
      });

      it("should trigger onWallpaperUpdateFail", () => {
        expect(onWallpaperUpdateFail).toHaveBeenCalledWith(error);
      });
    });

    describe("when its called twice for the same day", () => {
      beforeEach(async () => {
        wallpaperManager = initializeWallpaperManager();
        await wallpaperManager.setWallpaper();
        await wallpaperManager.setWallpaper();
      });

      it("should fetch the APOD just once", () => {
        expect(APOD.fetch).toHaveBeenCalledTimes(1);
      });

      it("should download the high definition APOD to the images folder just once", () => {
        expect(download).toHaveBeenCalledTimes(1);
      });

      it("should set the wallpaper with the downloaded APOD just once", () => {
        expect(wallpaper.set).toHaveBeenCalledTimes(1);
      });

      it("should trigger onWallpaperUpdateStart just once", () => {
        expect(onWallpaperUpdateStart).toHaveBeenCalledTimes(1);
      });

      it("should trigger onWallpaperUpdateComplete just once", () => {
        expect(onWallpaperUpdateComplete).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe("#enableDailyWallpaper", () => {
    it("should enable a timer to update the wallpaper every 10s", () => {
      wallpaperManager = initializeWallpaperManager();
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
      wallpaperManager = initializeWallpaperManager();
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
