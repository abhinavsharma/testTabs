const tabs = require("tabs");
const common = require("common");
const ss   = require("simple-storage");

let lastURL = null;
let lastTitle = null;
function addNewURL(url) {
  function addPair(src, dst) {
    if (!src || !dst)
      return;
    let srcHost = common.getHostFromURL(src);
    let dstHost = common.getHostFromURL(dst);
    if (srcHost != dstHost) {
      // awesome

      if (ss.storage.dstCount[dstHost]) {
        ss.storage.dstCount[dstHost] += 1;
      } else {
        ss.storage.dstCount[dstHost] = 1;
      }

      if (ss.storage.tracker[srcHost]) {
        if (ss.storage.tracker[srcHost][dstHost]) {
          ss.storage.tracker[srcHost][dstHost] += 1;
        } else {
          ss.storage.tracker[srcHost][dstHost] = 1;
        }
      } else {
        ss.storage.tracker[srcHost] = {dstHost : 1};
      }
    }
  }
  addPair(lastURL, url);
  lastURL = url;
}

exports.startTracking = function() {
  
  if (!ss.storage.tracker || !ss.storage.dstCount) {
    ss.storage.tracker = {};
    ss.storage.dstCount = {};
  }

  tabs.on('activate', function(tab) {
    if (common.isWebURL(tab.url)) {
      addNewURL(tab.url);
      lastTitle = tab.title;
    }
  });

  tabs.on('ready', function(tab) {
    if (common.isWebURL(tab.url)) {
      addNewURL(tab.url)
      lastTitle = tab.title;
    }
  });
}

exports.getLastURL = function() {
  return lastURL;
}
