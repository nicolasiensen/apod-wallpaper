const { Tray } = require('electron');

class TrayManager {
  constructor (trayIcon, trayAnimationFrames) {
    this.trayIcon = trayIcon;
    this.trayAnimationFrames = trayAnimationFrames;
    this.tray = new Tray(this.trayIcon);
    this.animationInterval = undefined;
    this.setToolTip = this.tray.setToolTip.bind(this.tray);
    this.setContextMenu = this.tray.setContextMenu.bind(this.tray);
  }

  startAnimation() {
    if (this.animationInterval === undefined) {
      let i = 0;
      this.animationInterval = setInterval(() => {
        this.tray.setImage(this.trayAnimationFrames[i]);
        i = i === this.trayAnimationFrames.length - 1 ? 0 : i + 1;
      }, 500)
    }
  }

  stopAnimation() {
    clearInterval(this.animationInterval);
    this.animationInterval = undefined;
    this.tray.setImage(this.trayIcon);
  }
}

module.exports = TrayManager;
