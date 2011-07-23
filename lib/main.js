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

/* */
function getSearchPredictions(latestTab) {
  console.log("getting search predictions for " + latestTab.title)
  if(latestTab)
    console.log(latestTab.title);
  if (!latestTab || !predictionMap[latestTab.title]) {
    console.log("title fail")
    return [];
  } else {
    console.log("returing for " + latestTab.title);
    return predictionMap[latestTab.title];
  }
}

tabs.on('ready', function(tab) {
  if (tab.url == "about:blank") {
    /* this is where to get results, tracking results are
     * generated on the fly, search predictions are obtained
     * from caching */
    let trackPredictions = predict_track.predictTrack(lastTab);
    let searchPredictions = getSearchPredictions(lastTab);
    console.log(JSON.stringify(trackPredictions));
    console.log("=============");
    console.log(JSON.stringify(searchPredictions));
  } else {
    /* prepare and store search results for this tab to be used later */
    predict_search.predictSearch(tab.title);
    lastTab = tab;
  }
});

tabs.on('activate', function(tab) {
  if (tab.url != "about:blank") {
    /* dom loaded, prepare and store search results */
    predict_search.predictSearch(tab.title);
    lastTab = tab;
  }
 });
