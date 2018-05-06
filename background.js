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
'artofvisuals', 
'createcommune',
'shotzdelight']

function numberBetween(min, max) {
	return Math.floor(Math.random() * (max-min) + min);
}

function runautomatically() { 
	if (parseInt(new Date().toString().split(' ')[4].split(':')[0]) > 22) { 
		// wait for about 8 hours or so....
		let waitTime = numberBetween(60*6*1000, 60*8*1000);

		chrome.alarms.create('runAutomatically', { 
			delayInMinutes: (waitTime / 1000) / 60
		})

		//setTimeout(function() { runAutomatically() }, waitTime);
		return;
	}

	var tag = tags[numberBetween(0, tags.length)];
	var exploreUrl = "https://www.instagram.com/explore/tags/" + tag;

	chrome.tabs.update( tabId, { url: exploreUrl } , function() {
		console.log('updated tab.');

		chrome.alarms.create('startliking', {
			delayInMinutes: 5.0/60
		})

		// setTimeout(function() { 
		// 	console.log('sending message to the browser to continue liking.');
		// 	numberliked = 0;
		// 	maxlikes = numberBetween(75, 125);
		// 	chrome.tabs.sendMessage(tabId, {action: "continueliking", numberliked: numberliked, maxlikes: maxlikes }, function(response) {});  
		// }, 5000);
	});
}

chrome.alarms.onAlarm.addListener(function(alarm) {
	switch (alarm.name) { 
		case 'runAutomatically': 
			runautomatically();
			break;
		case 'startliking': 
			console.log('sending message to the browser to continue liking.');
			numberliked = 0;
			maxlikes = numberBetween(75, 125);
			chrome.tabs.sendMessage(tabId, {action: "continueliking", numberliked: numberliked, maxlikes: maxlikes }, function(response) {}); 
			break; 
		case 'continueliking': 
			console.log('sending message to the browser to continue liking.');
			chrome.tabs.sendMessage(tabId, {action: "continueliking", numberliked: numberliked, maxlikes: maxlikes }, function(response) {});  
			break;
	}
})


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
				let nextRun = numberBetween(45*60*1000, 75*60*1000);
				let date = new Date(new Date().valueOf() + nextRun).toString().split(' ')[4];
				chrome.tabs.sendMessage(tabId, {action: "nextrun", lastcount: response.numberliked, nextruntime: date }, function(response) {}); 
				chrome.alarms.create('runAutomatically', {
					delayInMinutes: (nextRun / 1000) / 60
				}) 
				//setTimeout(function() { runautomatically() }, nextRun);
			}
		} else if (response.message == 'autorun') { 
			autolike = true;
			console.log('automatic run');
			chrome.tabs.getSelected(null, function(tab) {
				tabId = tab.id;
				runautomatically();
			});
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
		chrome.tabs.update( tabId, { url: exploreUrl } , function() {
			console.log('updated tab.');
			chrome.alarms.create('continueliking', {
				delayInMinutes: 5.0/60
			})

			// setTimeout(function() { 
				
			// }, 5000);
		}); 
		
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