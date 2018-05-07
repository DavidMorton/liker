var maxtolike = 2;
var skipsBeforeGivingUp = 10;
var skipped = 0;

chrome.runtime.onMessage.addListener(function(response) { 
	if (response.action == 'continueliking') {
		console.log('continuing to like...')
		let firstItem = document.getElementsByClassName('_e3il2')[9];
		if (firstItem) { 
			firstItem.click()
		}

		setTimeout(function() { likeandnext(response.numberliked, response.maxlikes) }, 5000);
	} else if (response.action == 'nextrun') { 
		document.title = "Liked " + response.lastcount + '. Sched: ' + response.nextruntime;
	}
});

function numberBetween(min, max) {
	return Math.floor(Math.random() * (max-min) + min);
}

function sendMessage(message) { 
	if (chrome && chrome.runtime) { 
		chrome.runtime.sendMessage(message)
	}
}

function likeandnext(numberliked, maxlikes) { 
	sendMessage({message: 'numberliked', numberliked: numberliked, maxlikes: maxlikes});
	document.title = numberliked + ' - ' + new Date().toString().split(' ')[4];
	let likeButton = document.getElementsByClassName('coreSpriteHeartOpen')[0];

	// like about 7/8 items. 
	if (likeButton && numberBetween(1, 8) != 5) { 
		 likeButton.click(); 
		 numberliked = numberliked + 1; 
		 skipped = 0;
	} else if (!likeButton) { 
		skipped = skipped + 1;
		numberLiked = maxlikes + 1;
	}

	if (numberliked > maxlikes) {
		document.title = 'DONE!'
		sendMessage({ message: 'doneliking', numberliked: numberliked })
		return;
	}
	
	setTimeout(function() { 
		let rightArrow = document.getElementsByClassName('coreSpriteRightPaginationArrow')[0]; 

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

	setTimeout(function ()  {likeandnext(0, maxtolike), 1000 });
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

	let div = document.createElement('div');
	div.style.margin = '10px';
	div.style.padding = '8px';
	div.innerText = '❤️ auto';
	div.style.backgroundColor = 'lightskyblue';
	div.style.borderRadius = '5px';
	div.style.cursor = 'pointer';
	div.style.display = 'inline-block';

	let increment = increments[i];

	div.onclick = function() { 
		sendMessage({message: 'autorun'});
	}

	maindiv.appendChild(div);

	document.body.appendChild(maindiv)

}

let url = location.url;

setInterval(function() { 
	if (location.href != url) { 
		url = location.href
		addButton();
	}
}, 1000)


document.addEventListener('DOMContentLoaded', function () { 
	var buttons = document.querySelectorAll('button');

	for (var i = 0; i < buttons.length; i++) {
		buttons[i].addEventListener('click', function() { sendMessage({message:'autorun'}); });
	}
});