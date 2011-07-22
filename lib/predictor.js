const tabs = require("tabs");
const ss   = require("simple-storage");
const common = require("common");
const {Ci, Cu} = require("chrome");
const utils = require("utils");
const pos = require("pos");
const searcher = require("searcher");
let sr = new searcher.search();

var Places = {};
Cu.import("resource://gre/modules/PlacesUtils.jsm", Places);
Places.PlacesUtils.history.QueryInterface(Ci.nsPIPlacesDatabase);

function addFallBacks(currentURL, currentList) {
  console.log("CURRENT: " + currentURL);
  let currentRevHost = common.getHostFromURL(currentURL);
  let seenHosts = {};
  seenHosts[currentRevHost] = true;
  let i = 0;
  let params = {};
  currentList.forEach(function(exisiting) {
    seenHosts[common.getHostFromURL(exisiting.url)] = true;
  });

  let count = currentList.length;
  utils.spinQuery(Places.PlacesUtils.history.DBConnection, {
    "query" : "SELECT * FROM moz_places ORDER BY frecency DESC LIMIT 50",
    "params" : params,
    "names" : ["url", "rev_host"],
  }).forEach(function({url, rev_host}) {
    if (count >= 16 || rev_host in seenHosts)
      return;
    currentList.push({
      "url" : url,
      "fallback" : true,
    });
    seenHosts[rev_host] = true;
    count++;
  })
  return currentList;
}

function getBestForHost (revHost) {
  let result = utils.spinQuery(Places.PlacesUtils.history.DBConnection, {
    "query" : "SELECT url FROM moz_places WHERE rev_host = :revHost",
    "params" : {"revHost" : revHost},
    "names"  : ["url"],
  });
  return result.length ? result[0].url : null;
}

exports.predictTrack = function(lastURL) {
  let url = lastURL;
  console.log("PREDICTING FOR : " + url);
  if (!common.isWebURL(url))
    return addFallBacks(url, []);
  let revHost = common.getHostFromURL(url);
  let dstDict = ss.storage.tracker[revHost];
  if (!dstDict)
    return addFallBacks(url,[]);
  let results = [];
  for (let dstHost in dstDict) {
    let url = getBestForHost(dstHost);
    if (!url || dstHost == revHost)
      continue;
    results.push({
      "url" : url,
      "score" : dstDict[dstHost] / ss.storage.dstCount[dstHost],
      "fallback" : false,
    });
  }
  return addFallBacks(url,results.sort(function(a,b){return b.score - a.score}));
}
