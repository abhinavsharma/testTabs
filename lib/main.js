const tabs = require("tabs");
const self = require("self");
const DEBUG = true;
const reportError = DEBUG ? console.log :  function() {}
let lastTab = null;

function isWebURL(url) {
  return (url && (/^http/).test(url));
}

tabs.on('activate', function(tab) {
  if (isWebURL(tab.url))
    lastTab = tab;
});

tabs.on('ready', function(tab) {
  if (tab.url == "about:blank") {
    tab.close();
  tabs.open({
    url: "http://www.google.com",
    onOpen: function onOpen(newTab) {
      // do stuff like listen for content
      // loading.
    }
});
    
  } else if (isWebURL(tab.url)) {
    lastTab = tab;
  }
});
