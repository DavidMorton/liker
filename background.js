var url = '';
var numberliked = 0;
var maxlikes = 150;

function runSomething() { 
	console.log('running something');
	chrome.runtime.sendMessage({message: 'background'});
}


chrome.runtime.onMessage.addListener(
	function(response, callback) {
		console.log('Received message from UI');
   });

function likeandnext(numberliked) { 
	document.title = numberliked + ' - ' + new Date().toString().split(' ')[4];
	let likeButton = document.getElementsByClassName('coreSpriteHeartOpen')[0];
	let rightArrow = document.getElementsByClassName('coreSpriteRightPaginationArrow')[0]; 

	if (likeButton) { 
		 likeButton.click(); 
		 numberliked = numberliked + 1; 
	} 

	if (numberliked >= maxlikes) {
		document.title = 'DONE!'
		return;
	}
	
	setTimeout(function() { 
		if (rightArrow) { 
			rightArrow.click(); 
			setTimeout(function() { 
				likeandnext(numberliked); 
			}, Math.floor(Math.random() * 3000 + 500));
		} else { 
			 document.title = 'ERROR!!!!';
		} 
	}, Math.floor(Math.random() * 1000 + 500));
}

chrome.webNavigation.onCompleted.addListener(function(details) {
	url = details.url;
	numberliked = 0;
	runSomething();
}, {url: [{urlMatches : 'https://www.instagram.com/.*'}]});

chrome.webNavigation.onHistoryStateUpdated.addListener(function(details) { 

	
	

	if (details.frameId == 0) {
		if (url == details.url) { 
			return;
		} 

		url = details.url;

		runSomething();
	}
}, {url: [{urlMatches : 'https://www.instagram.com/.*'}]});