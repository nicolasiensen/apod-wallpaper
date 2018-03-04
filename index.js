const electron = require("electron");
const app = electron.app;

app.on("ready", () => {
  console.log("hello world!");
});
