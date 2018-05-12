class TrayIconManager {
  constructor(tray, icon, animationFrames) {
    this.tray = tray;
    this.icon = icon;
    this.animationFrames = animationFrames;
    this.animationInterval = undefined;
  }

  setIcon() {
    this.tray.setImage(this.icon);
  }

  startAnimation() {
    if (this.animationInterval === undefined) {
      let i = 0;
      this.animationInterval = setInterval(() => {
        this.tray.setImage(this.animationFrames[i]);
        i = i === this.animationFrames.length - 1 ? 0 : i + 1;
      }, 500)
    }
  }

  stopAnimation() {
    clearInterval(this.animationInterval);
    this.animationInterval = undefined;
    this.setIcon();
  }
}

module.exports = TrayIconManager;
