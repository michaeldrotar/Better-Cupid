(function(){

chrome.browserAction.onClicked.addListener(function(tab) {
  window.open("http://www.okcupid.com");
});

/*
chrome.browserAction.setPopup({popup:"popup.html"})
setTimeout(function() {
  chrome.browserAction.setPopup({popup:""})
}, 1000)
chrome.browserAction.setBadgeBackgroundColor({color:[255,255,255,100]})
chrome.browserAction.setBadgeText({text:"1"})
//*/

// Run migrations
include('migrate.js');

})();
