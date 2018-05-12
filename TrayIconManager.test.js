const TrayIconManager = require("./TrayIconManager");

jest.useFakeTimers();

const image = "tray-icon.png";
const tray = { setImage: jest.fn() };

const animationImages = [
  "tray-icon-loading-1.png",
  "tray-icon-loading-2.png",
  "tray-icon-loading-3.png"
];

describe("TrayIconManager", () => {
  let trayIconManager;

  beforeEach(() => {
    trayIconManager = new TrayIconManager(tray, image, animationImages);
  });

  describe("#setIcon", () => {
    it("should set the tray icon", () => {
      trayIconManager.setIcon();
      expect(tray.setImage).toHaveBeenCalledWith(image);
    });
  });

  describe("#startAnimation", () => {
    it("should set the first animation frame after 500ms", () => {
      trayIconManager.startAnimation();
      jest.advanceTimersByTime(500);

      expect(tray.setImage.mock.calls).toEqual([
        [animationImages[0]]
      ]);

      trayIconManager.stopAnimation();
    });

    it("should set the second animation frame after 1000ms", () => {
      trayIconManager.startAnimation();
      jest.advanceTimersByTime(1000);

      expect(tray.setImage.mock.calls).toEqual([
        [animationImages[0]],
        [animationImages[1]]
      ]);

      trayIconManager.stopAnimation();
    });

    it("should set the third animation frame after 1500ms", () => {
      trayIconManager.startAnimation();
      jest.advanceTimersByTime(1500);

      expect(tray.setImage.mock.calls).toEqual([
        [animationImages[0]],
        [animationImages[1]],
        [animationImages[2]]
      ]);

      trayIconManager.stopAnimation();
    });

    it("should set the first animation frame after 2000ms", () => {
      trayIconManager.startAnimation();
      jest.advanceTimersByTime(2000);

      expect(tray.setImage.mock.calls).toEqual([
        [animationImages[0]],
        [animationImages[1]],
        [animationImages[2]],
        [animationImages[0]]
      ]);

      trayIconManager.stopAnimation();
    });

    describe("when the animation has already started", () => {
      beforeEach(() => { trayIconManager.startAnimation(); });

      it("should not start the animation again", () => {
        trayIconManager.startAnimation();
        jest.advanceTimersByTime(500);

        expect(tray.setImage.mock.calls).toEqual([
          [animationImages[0]]
        ]);

        trayIconManager.stopAnimation();
      });
    });
  });

  describe("#stopAnimation", () => {
    beforeEach(() => {
      trayIconManager.startAnimation();
    });

    it("should stop the animation", () => {
      trayIconManager.stopAnimation();
      jest.advanceTimersByTime(500);
      expect(tray.setImage).not.toHaveBeenCalledWith(animationImages[0]);
    });

    it("should reset the tray icon", () => {
      trayIconManager.stopAnimation();
      expect(tray.setImage).toHaveBeenCalledWith(image);
    });
  })
});
