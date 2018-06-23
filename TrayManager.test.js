const electron = require("electron");
const TrayManager = require("./TrayManager");

const mockSetImage = jest.fn();
const mockSetContextMenu = jest.fn();
const mockSetToolTip = jest.fn();

jest.mock("electron", () => ({
  Tray: jest.fn().mockImplementation(() => {
    return {
      setImage: mockSetImage,
      setContextMenu: mockSetContextMenu,
      setToolTip: mockSetToolTip
    };
  })
}));

jest.useFakeTimers();

const trayIcon = "tray-icon.png";
const trayAnimationFrames = [
  "tray-icon-loading-1.png",
  "tray-icon-loading-2.png",
  "tray-icon-loading-3.png"
];

describe("TrayManager", () => {
  let trayManager;

  beforeEach(() => {
    trayManager = new TrayManager(trayIcon, trayAnimationFrames);
  });

  describe("#startAnimation", () => {
    it("should set the first animation frame after 500ms", () => {
      trayManager.startAnimation();
      jest.advanceTimersByTime(500);

      expect(mockSetImage.mock.calls).toEqual([
        [trayAnimationFrames[0]]
      ]);

      trayManager.stopAnimation();
    });

    it("should set the second animation frame after 1000ms", () => {
      trayManager.startAnimation();
      jest.advanceTimersByTime(1000);

      expect(mockSetImage.mock.calls).toEqual([
        [trayAnimationFrames[0]],
        [trayAnimationFrames[1]]
      ]);

      trayManager.stopAnimation();
    });

    it("should set the third animation frame after 1500ms", () => {
      trayManager.startAnimation();
      jest.advanceTimersByTime(1500);

      expect(mockSetImage.mock.calls).toEqual([
        [trayAnimationFrames[0]],
        [trayAnimationFrames[1]],
        [trayAnimationFrames[2]]
      ]);

      trayManager.stopAnimation();
    });

    it("should set the first animation frame after 2000ms", () => {
      trayManager.startAnimation();
      jest.advanceTimersByTime(2000);

      expect(mockSetImage.mock.calls).toEqual([
        [trayAnimationFrames[0]],
        [trayAnimationFrames[1]],
        [trayAnimationFrames[2]],
        [trayAnimationFrames[0]]
      ]);

      trayManager.stopAnimation();
    });

    describe("when the animation has already started", () => {
      beforeEach(() => { trayManager.startAnimation(); });

      it("should not start the animation again", () => {
        trayManager.startAnimation();
        jest.advanceTimersByTime(500);

        expect(mockSetImage.mock.calls).toEqual([
          [trayAnimationFrames[0]]
        ]);

        trayManager.stopAnimation();
      });
    });
  });

  describe("#stopAnimation", () => {
    beforeEach(() => {
      trayManager.startAnimation();
    });

    it("should stop the animation", () => {
      trayManager.stopAnimation();
      jest.advanceTimersByTime(500);
      expect(mockSetImage).not.toHaveBeenCalledWith(trayAnimationFrames[0]);
    });

    it("should reset the tray icon", () => {
      trayManager.stopAnimation();
      expect(mockSetImage).toHaveBeenCalledWith(trayIcon);
    });
  });

  describe("#setContextMenu", () => {
    it("should proxy to the tray object", () => {
      trayManager.setContextMenu("123");
      expect(mockSetContextMenu).toHaveBeenCalledWith("123");
    });
  });

  describe("#setToolTip", () => {
    it("should proxy to the tray object", () => {
      trayManager.setToolTip("123");
      expect(mockSetToolTip).toHaveBeenCalledWith("123");
    });
  });
});
