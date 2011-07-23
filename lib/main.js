const track = require("track");
const predict_search = require("predict_search");
const tabs  = require("tabs");
const predict_track = require("predict_track");
const common = require("common");
const J = JSON.stringify;
const reportError = console.log;
let lastTab = null;
let predictionMap = {};

let worker = predict_search.getEventWorker();
worker.on('searchresults', function(data) {
  console.log("adding results for " + data.title + " to awesome");
  predictionMap[data.title] = data.results;
})

track.startTracking();

function getSearchPredictions(latestTab) {
  console.log("getting search predictions for " + latestTab.title)
  if(latestTab)
    console.log(latestTab.title);
  if (!latestTab || !predictionMap[latestTab.title]) {
    console.log("title fail")
    return [];
  } else {
    console.log("returing for " + latestTab.title);
    return predictionMap[latestTab.title].map(function(a) {
      return {
        "url" : a.url,
        "fallback" : false,
      }
    });
  }
}

tabs.on('ready', function(tab) {
  if (tab.url == "about:blank") {
    let trackPredictions = predict_track.predictTrack(lastTab);
    let searchPredictions = getSearchPredictions(lastTab);
    console.log(JSON.stringify(trackPredictions));
    console.log("=============");
    console.log(JSON.stringify(searchPredictions));
  } else {
    predict_search.predictSearch(tab.title);
    lastTab = tab;
  }
});

tabs.on('activate', function(tab) {
  if (tab.url != "about:blank") {
    predict_search.predictSearch(tab.title);
    lastTab = tab;
  }
 });
