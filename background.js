var url = '';
var numberliked = 0;
var maxlikes = 150;
var exploreUrl = '';
var tabId = 0;


function runSomething(url) { 
	console.log('running something: ' + url);
	chrome.runtime.sendMessage({message: 'background'});
}


chrome.runtime.onMessage.addListener(
	function(response, sender) {
		if (response.message == 'liking') { 
			console.log('Beginning to like starting with ' + response.url);
			tabId = sender.tab.id;
			exploreUrl = response.url;
		} else if (response.message == 'numberliked') { 
			console.log('content.js has reported ' + response.numberliked + ' likes. (aiming for ' + response.maxlikes + ')');
			numberliked = response.numberliked;
			maxlikes = response.maxlikes;
		} else if (response.message == 'doneliking') { 
			console.log('content.js has reported DONE ' + response.numberliked);
			chrome.tabs.update( tabId, { url: exploreUrl } ); 
		}
   });

function extractStatus(line) {
	var match = line.match(/[^ ]* (\d{3})/);
	if(match) {
	  return {code: match[1], message: match[2]};
	} else {
	  return undefined;
	}
  }
  
  chrome.webRequest.onHeadersReceived.addListener(
	function(details) {
	  var status = extractStatus(details.statusLine);
	  console.log('Web Request status: ' + details.url + ' status: ' + status.code);
	  if(status.code == '403') {
		  // stop running.
	  } else if (status.code == '404') {
		  console.log('status was 404.... going back and continuing.');
		chrome.tabs.update( tabId, { url: exploreUrl } , function() {
			console.log('updated tab.');
			setTimeout(function() { 
				console.log('sending message to the browser to continue liking.');
				chrome.tabs.sendMessage(tabId, {action: "continueliking", numberliked: numberliked, maxlikes: maxlikes }, function(response) {});  
			}, 5000);
		}); 
		
	  }
	},
	{urls: ["<all_urls>"]}
  );

chrome.webRequest.onErrorOccurred.addListener(function(details) { 
	console.log('Error occurred!')
}, {
	urls: ["https://www.instagram.com/.*"]
   });

chrome.webNavigation.onCompleted.addListener(function(details) {
	url = details.url;
	numberliked = 0;
	runSomething(url);
}, {url: [{urlMatches : 'https://www.instagram.com/.*'}]});

chrome.webNavigation.onHistoryStateUpdated.addListener(function(details) { 

	if (details.frameId == 0) {
		if (url == details.url) { 
			return;
		} 

		url = details.url;

		runSomething(url);
	}
}, {url: [{urlMatches : 'https://www.instagram.com/.*'}]});