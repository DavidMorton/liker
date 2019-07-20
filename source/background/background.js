var url = '';
var numberliked = 0;
var maxlikes = 150;
var exploreUrl = '';
var tabId = 0;
var autolike = false;
var limitedauto = false;

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
'artofvisuals', 
'createcommune',
'shotzdelight']

function numberBetween(min, max) {
	return Math.floor(Math.random() * (max-min) + min);
}

var SAFE_DELAY = 1000; // Guaranteed not to fall asleep in this interval

function setBusyTimeout(callback, delay, timeoutObject) {
  if(delay <= SAFE_DELAY) {
	let result = setTimeout(callback, delay);
	if (timeoutObject) { 
		timeoutObject.timeout = result;
	}
  } else {
    var start = Date.now(); // setTimeout drifts, this prevents accumulation
    let result = setTimeout(
      function() {
        setBusyTimeout(callback, delay - (Date.now() - start), timeoutObject);
      }, SAFE_DELAY
	);
	if (timeoutObject) { 
		timeoutObject.timeout = result;
	}
  }
}

let loopObject = {};

function runautomatically() { 
	if (parseInt(new Date().toString().split(' ')[4].split(':')[0]) > 22) { 
		// wait for about 8 hours or so....
		let waitTime = numberBetween(60*6*1000, 60*8*1000);

		setBusyTimeout(function() { runautomatically() }, waitTime, loopObject);
		return;
	}

	var tag = tags[numberBetween(0, tags.length)];
	var exploreUrl = "https://www.instagram.com/explore/tags/" + tag;

	chrome.tabs.update( tabId, { url: exploreUrl } , function() {
		console.log('updated tab.');

		setBusyTimeout(function() { 
			console.log('sending message to the browser to continue liking.');
			numberliked = 0;
			maxlikes = numberBetween(30, 70);
			chrome.tabs.sendMessage(tabId, {action: "continueliking", numberliked: numberliked, maxlikes: maxlikes }, function(response) {});  
		}, 5000, loopObject);
	});
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
			if (limitedauto) { 
				limitedauto = false;
				chrome.tabs.remove(tabId, function() { });
			}
			else if (!autolike) {
				chrome.tabs.update( tabId, { url: exploreUrl } ); 
			}
			else { 
				let nextRun = numberBetween(20*60*1000, 32*60*1000);
				let date = new Date(new Date().valueOf() + nextRun).toString().split(' ')[4];
				chrome.tabs.sendMessage(tabId, {action: "nextrun", lastcount: response.numberliked, nextruntime: date }, function(response) {}); 

				setBusyTimeout(function() { runautomatically() }, nextRun, loopObject);
			}
		} else if (response.message == 'autorun') { 
			autolike = true;
			console.log('automatic run');
			chrome.tabs.getSelected(null, function(tab) {
				tabId = tab.id;
				runautomatically();
			});
		} else if (response.message == 'findUnfollowers') { 
			chrome.tabs.getSelected(null, function(tab) { 
				tabId = tab.id;
				chrome.tabs.sendMessage(tabId, { action: 'findUnfollowers' }, function(response) { });
			})
		} else if (response.message.indexOf('auto') == 0) { 
			let numbertolike = parseInt(response.message.replace('auto', ''));
			maxlikes = numberBetween(Math.round(numbertolike * .9), Math.round(numbertolike * 1.1));
			numberliked = 0;
			limitedauto = true;

			var tag = tags[numberBetween(0, tags.length)];
			var exploreUrl = "https://www.instagram.com/explore/tags/" + tag;
			
			chrome.tabs.getSelected(null, function(currenttab) { 
				chrome.tabs.create({ url: exploreUrl, active: false }, function(tab) { 
					tabId = tab.id;
					
					setBusyTimeout(function() { 
						console.log('sending message to the browser to continue liking.');
						chrome.tabs.sendMessage(tabId, {action: "continueliking", numberliked: numberliked, maxlikes: maxlikes }, function(response) {});  
					}, 5000, loopObject);
				});
			});
			

			// chrome.tabs.getSelected(null, function(tab) { 
			// 	tabId = tab.id;

			// 	chrome.tabs.update( tabId, { url: exploreUrl } , function() {
			// 		console.log('updated tab.');
		
			// 		setBusyTimeout(function() { 
			// 			console.log('sending message to the browser to continue liking.');
			// 			chrome.tabs.sendMessage(tabId, {action: "continueliking", numberliked: numberliked, maxlikes: maxlikes }, function(response) {});  
			// 		}, 5000, loopObject);
			// 	});
			// });
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
	  } else if (status.code == '404' || status.code == '503') {
		  console.log('status was 404.... going back and continuing.');
		if (loopObject && loopObject.timeout) { 
			clearTimeout(loopObject.timeout);
		}

		setBusyTimeout(function() { 
		chrome.tabs.update( tabId, { url: exploreUrl } , function() {
			console.log('updated tab.');

			setBusyTimeout(function() { 
				console.log('sending message to the browser to continue liking.');
				chrome.tabs.sendMessage(tabId, {action: "continueliking", numberliked: numberliked, maxlikes: maxlikes }, function(response) {});  
			}, 5000, loopObject);
		}); 
		}, 5000, loopObject)
		
	  } else if (status.code == '429') {
		  console.log('too many requests!')
		  chrome.tabs.sendMessage(tabId, { action: 'stopGettingUnfollowers' })
	  }
	},
	{urls: ["<all_urls>"]}
  );

chrome.webNavigation.onHistoryStateUpdated.addListener(function(details) { 

	if (details.frameId == 0) {
		if (url == details.url) { 
			return;
		} 

		url = details.url;
	}
}, {url: [{urlMatches : 'https://www.instagram.com/.*'}]});