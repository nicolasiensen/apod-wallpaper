const { ipcRenderer } = require('electron');

ipcRenderer.on('onWallpaperSet', (event, wallpaper) => {
  const root = document.getElementById('root');
  root.innerHTML = "<p>" + wallpaper.date + "</p>";
  root.innerHTML += "<h1>" + wallpaper.title + "</h1>";
  root.innerHTML += "<p>" + wallpaper.explanation + "</p>";
});
