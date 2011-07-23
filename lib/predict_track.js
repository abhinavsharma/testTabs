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
function getBestForHost (revHost) {
  let result = utils.spinQuery(Places.PlacesUtils.history.DBConnection, {
    "query" : "SELECT url FROM moz_places WHERE rev_host = :revHost",
    "params" : {"revHost" : revHost},
    "names"  : ["url"],
  });
  return result.length ? result[0].url : null;
}

exports.predictTrack = function(lastTab) {
  if (!lastTab)
    return common.addFallBacks("",[])
  let url = lastTab.url;
  console.log("PREDICTING FOR : " + url);
  if (!common.isWebURL(url))
    return common.addFallBacks(url, []);
  let revHost = common.getHostFromURL(url);
  let dstDict = ss.storage.tracker[revHost];
  if (!dstDict)
    return common.addFallBacks(url,[]);
  let results = [];
  for (let dstHost in dstDict) {
    let url = getBestForHost(dstHost);
    if (!url || dstHost == revHost || ss.storage.dstCount[dstHost] < 5)
      continue;
    results.push({
      "url" : url,
      "score" : dstDict[dstHost] / ss.storage.dstCount[dstHost],
      "fallback" : false,
    });
  }
  return common.addFallBacks(url,results.sort(function(a,b){return b.score - a.score}));
}
