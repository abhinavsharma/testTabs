const tabs = require("tabs");
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
    let lastURL = (lastTab ? lastTab.url : "blank");
    tab.attach({
      contentScript: 'document.body.innerHTML = "' + lastURL + '";self.postMessage(document.body.innerHTML);',
      onMessage: function (message) {
        console.log(message);
      }
    });
  } else if (isWebURL(tab.url)) {
    lastTab = tab;
  }
});
