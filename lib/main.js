const track = require("track");
const predict_search = require("predict_search");
const tabs  = require("tabs");
const predictor = require("predictor");
const J = JSON.stringify;
const reportError = console.log;

let worker = predict_search.getEventWorker();
worker.on('searchresults', function(data) {
  reportError(J(data));
})

track.startTracking();

tabs.on('ready', function(tab) {
  if (tab.url == "about:blank") {
    //let predictions = predictor.predictTrack(track.getLastURL());
    predict_search.predictSearch("hello world");
    //reportError(J(predictions));
  }
});
