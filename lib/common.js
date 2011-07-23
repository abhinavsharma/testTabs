const {Cu, Ci} = require("chrome");
const utils = require("utils");

var Places = {};
Cu.import("resource://gre/modules/PlacesUtils.jsm", Places);
Places.PlacesUtils.history.QueryInterface(Ci.nsPIPlacesDatabase);

function isWebURL(url) {
  return (url && (/^http/).test(url));
}

function getHostFromURL(url) {
  if (!url)
    return null;
  let m = url.match(/^https{0,1}:\/\/([^/]+).*/);
  if (!m)
    return null;
  return m[1].split('').reverse().join('') + '.';
}

exports.getHostFromURL = getHostFromURL;
exports.isWebURL = isWebURL;

exports.addFallBacks = function (currentURL, currentList) {
  console.log("CURRENT: " + currentURL);
  let currentRevHost = getHostFromURL(currentURL);
  let seenHosts = {};
  seenHosts[currentRevHost] = true;
  let i = 0;
  let params = {};
  currentList.forEach(function(exisiting) {
    seenHosts[getHostFromURL(exisiting.url)] = true;
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

exports.isURLHub = function(url) {
  re_bad_substrings = new RegExp(/(\/post\/|\/article\/)/g);
  re_is_num = new RegExp(/\/[0-9]+\/{0,1}$/);
  re_bad_param = new RegExp(/^([a-z]|search)=/);
  let RE_HOME_URL = new RegExp(/^https{0,1}:\/\/[a-zA-Z0-9\.\-\_]+\/{0,1}$/);

  if (!url) {
    return false;
  }
  url = url.split('?');
  if (url.length > 1) {
    if (re_bad_param.test(url[1])){
      return false;
    }
  }

  if (RE_HOME_URL.test(url)) {
    return true;
  }

  url = url[0];
  let splitURL = url.split('/');


  /* Quick reject */
  if (url.length > 80) { // very unlikely to be a hub
    reportError(url + "TOO LONG");
    return false
  }

  if (RE_FAIL_URL.test(url)) {
    return false;
  }

  let r1 = url.match(/[0-9]+/g);
  if (r1 && !r1.reduce(function(p,c,i,a) {
        return (p && (c.length < 6))
      }, true)) {
    return false; // if after removing slash, more than 8 consec digits
  }
  if (splitURL.length > 7) {
    return false; // craziest i've seen is https://www.amazon.com/gp/dmusic/mp3/player
  }

  if (!splitURL.reduce(function(p,c){
        return (p && c.length < 40 && c.split(/[\-\_]/g).length < 3);
      }, true)) {
    return false;
  }
  return true;
}


