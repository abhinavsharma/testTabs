const track = require("track");
const tabs  = require("tabs");
const predictor = require("predictor");
const J = JSON.stringify;
const reportError = console.log;

track.startTracking();

tabs.on('ready', function(tab) {
  if (tab.url == "about:blank") {
    let predictions = predictor.predictTrack(track.getLastURL());
    reportError(J(predictions));
  }
});
