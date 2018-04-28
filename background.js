var url = '';
var numberliked = 0;
var maxlikes = 150;
var exploreUrl = '';
var tabId = 0;
var autolike = false;

var tags = ['architecture', 
'minimal', 
'cityscape', 
'skyline', 
'buildings', 
'lighttrails', 
'citylights', 
'longexposure', 
'urbanlights', 
'depthobsessed', 
'landscape', 
'justgoshoot', 
'moodygrams', 
'visualambassadors', 
'agameoftones', 
'artofvisuals']

function numberBetween(min, max) {
	return Math.floor(Math.random() * (max-min) + min);
}

function runautomatically() { 
	if (parseInt(new Date().toString().split(' ')[4].split(':')[0]) > 20) { 
		// wait for about 8 hours or so....
		let waitTime = numberBetween(60*7*1000, 60*9*1000);
		setTimeout(function() { runAutomatically() }, waitTime);
		return;
	}

	var tag = tags[numberBetween(0, tags.length)];
	var exploreUrl = "https://www.instagram.com/explore/tags/" + tag;

	chrome.tabs.update( tabId, { url: exploreUrl } , function() {
		console.log('updated tab.');
		setTimeout(function() { 
			console.log('sending message to the browser to continue liking.');
			numberliked = 0;
			maxlikes = numberBetween(50, 125);
			chrome.tabs.sendMessage(tabId, {action: "continueliking", numberliked: numberliked, maxlikes: maxlikes }, function(response) {});  
		}, 5000);
	});
}

function runSomething(url) { 
	console.log('running something: ' + url);
	chrome.runtime.sendMessage({message: 'background'});
}


chrome.runtime.onMessage.addListener(
	function(response, sender) {
		if (response.message == 'liking') { 
			autolike = false;
			console.log('Beginning to like starting with ' + response.url);
			tabId = sender.tab.id;
			exploreUrl = response.url;
		} else if (response.message == 'numberliked') { 
			console.log('content.js has reported ' + response.numberliked + ' likes. (aiming for ' + response.maxlikes + ')');
			numberliked = response.numberliked;
			maxlikes = response.maxlikes;
		} else if (response.message == 'doneliking') { 
			console.log('content.js has reported DONE ' + response.numberliked);
			if (!autolike) {
				chrome.tabs.update( tabId, { url: exploreUrl } ); 
			}
			else { 
				setTimeout(function() { runautomatically() }, numberBetween(45*60*1000, 90*60*1000));
			}
		} else if (response.message == 'autorun') { 
			autolike = true;
			console.log('automatic run');
			tabId = sender.tab.id;
			runautomatically();
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