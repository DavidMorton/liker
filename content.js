var maxtolike = 2;

chrome.runtime.onMessage.addListener(function(response) { 
	if (response.message == 'continueliking') {
		console.log('continuing to like...')
		let firstItem = document.getElementsByClassName('_e3il2')[9];
		if (firstItem) { 
			firstItem.click()
		}

		setTimeout(() => likeandnext(response.numberliked, response.maxlikes));
	}
});

function sendMessage(message) { 
	if (chrome && chrome.runtime) { 
		chrome.runtime.sendMessage(message)
	}
}

function likeandnext(numberliked, maxlikes) { 
	sendMessage({message: 'numberliked', numberliked: numberliked, maxlikes: maxlikes});
	document.title = numberliked + ' - ' + new Date().toString().split(' ')[4];
	let likeButton = document.getElementsByClassName('coreSpriteHeartOpen')[0];
	let rightArrow = document.getElementsByClassName('coreSpriteRightPaginationArrow')[0]; 

	if (likeButton) { 
		 likeButton.click(); 
		 numberliked = numberliked + 1; 
	} 

	if (numberliked > maxlikes) {
		document.title = 'DONE!'
		sendMessage({ message: 'doneliking', numberliked: numberliked })
		return;
	}
	
	setTimeout(function() { 
		if (rightArrow) { 
			rightArrow.click(); 
			setTimeout(function() { 
				likeandnext(numberliked, maxlikes); 
			}, Math.floor(Math.random() * 3000 + 500));
		} else { 
			 document.title = 'ERROR!!!!';
		} 
	}, Math.floor(Math.random() * 1000 + 500));
}

function like(maxtolike) { 
	let firstItem = document.getElementsByClassName('_e3il2')[9];
	if (firstItem) { 
		firstItem.click()
	}

	setTimeout(() => likeandnext(0, maxtolike), 1000);
}

function addButton() { 

	let previousDiv = document.getElementById('autorunDiv');
	if (previousDiv) { 
		previousDiv.remove();
	}

	if (!location.href.match(/https:\/\/www\.instagram\.com\/explore\/.*/)) { 
		return;
	}

	var increments = [5, 10, 25, 50, 100, 250];

	let maindiv = document.createElement('div');
	maindiv.style.position = 'fixed';
	maindiv.style.top = '0px';
	maindiv.style.left = '0px';
	maindiv.style.alignItems = 'left'
	maindiv.style.whiteSpace = 'nowrap';
	maindiv.style.display = 'inline-block';
	maindiv.style.transform = 'scale(.5) translateX(-50%) translateY(-50%)';
	maindiv.id = 'autorunDiv';

	for (var i = 0; i < increments.length; i++) { 
		let div = document.createElement('div');
		div.style.margin = '10px';
		div.style.padding = '8px';
		div.innerText = '❤️ ' + increments[i]
		div.style.backgroundColor = 'lightskyblue';
		div.style.borderRadius = '5px';
		div.style.cursor = 'pointer';
		div.style.display = 'inline-block';

		let increment = increments[i];

		div.onclick = function() { 
			sendMessage({message: 'liking', url: location.href});
			like(increment);
		}

		maindiv.appendChild(div);
	}

	document.body.appendChild(maindiv)

}

let url = location.url;

setInterval(function() { 
	if (location.href != url) { 
		url = location.href
		addButton();
	}
}, 1000)



// chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
// 	var url = tabs[0].url;
// 	var regexp = new RegExp(/https:\/\/www\.instagram\.com\/explore\/.*/)
// 	if (url.match(regexp)) { 
// 		addButton();
// 	}
// });


