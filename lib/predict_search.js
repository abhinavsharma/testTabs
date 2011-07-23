const {Cu} = require("chrome");
const self = require("self");
const {EventEmitter} = require("events");

const search = require("search");
const POSTagger = require("pos").POSTagger;

let Svcs = {};
Cu.import("resource://gre/modules/Services.jsm", Svcs);
let win = Svcs.Services.wm.getMostRecentWindow("navigator:browser");
console.log(win);
let XHR = win.XMLHttpRequest;
let xhr = new XHR();
xhr.overrideMimeType("application/json");
console.log(self.data.url("posdata.json"))

xhr.open('GET', self.data.url("posdata.json"), false);
xhr.send(null);
POSTAGGER_LEXICON = JSON.parse(xhr.responseText);

let pos = new POSTagger(POSTAGGER_LEXICON);
let sr = new search.search();

let EventWorker = EventEmitter.compose({
  postMessage: function(data) {
    console.log("emitting: " + JSON.stringify(data));
    this._emit("searchresults", data);
  }
});
let worker = EventWorker();
/*
worker = {
  postMessage: function(){},
  on: function(){}
}
*/

exports.getEventWorker = function() {
  return worker;
}

exports.predictSearch = function(latestTitle) {
  let RE_NOUN_VERB = new RegExp(/(^NN)|(^VB)|(^JJ)/);

  if (!latestTitle)
    return [];
  let tokens = pos.tag(sr.tokenize(latestTitle)).filter(function(a) {
    return RE_NOUN_VERB.test(a[1]);
  }).map(function (a) {
    return a[0];
  })
  sr.search(tokens, {
    "limit" : 50,
    "skip" : 0,
    "timeRange" : 0,
  }, {
    "title": latestTitle,
    "append": false,
    "time": Date.now(),
  }, worker)
}
