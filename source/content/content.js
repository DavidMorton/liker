var maxtolike = 2;
var skipsBeforeGivingUp = 30;
var skipped = 0;
var received429 = false;

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
	} else if (response.action == 'findUnfollowers') { 
		listAllFollowers();
	} else if (response.action == 'stopGettingUnfollowers') {
		received429 = true;
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

var attemptsWithoutChange = 0;
var followers = [];
var following = [];

function scrollThroughFollowers(callback) { 
	if (received429) { 
		alert('Can\'t get unfollowers. It seems Instagram thinks you\'re doing this too often.');
		received429 = false;
		return;
	}

	let box = document.getElementsByClassName('_gs38e')[0];
	let scrollTop = box.scrollTop;
	box.scrollTop = box.scrollHeight - box.clientHeight;

	if (scrollTop == box.scrollTop) { 
		attemptsWithoutChange = attemptsWithoutChange + 1;
	} else { 
		attemptsWithoutChange = 0;
	}

	if (attemptsWithoutChange >= 10) {
		var result = [].slice.call(document.getElementsByClassName('_2g7d5')).map(function(x) { return x.innerText; })
		setTimeout(function() { callback(result); }, 2500);
	} else { 
		setTimeout(function() { scrollThroughFollowers(callback); }, numberBetween(1250, 1750));
	}
}

function listAllFollowers() { 
	received429 = false;
	let profileButton = document.getElementsByClassName('coreSpriteDesktopNavProfile')[0];
	if (profileButton) { 
		profileButton.click();
		setTimeout(function() { 
			let followersButton = [].slice.call(document.getElementsByClassName('_t98z6')).filter(function(x) { return x.innerText.indexOf('followers') > -1})[0];
			if (followersButton) { 
				followersButton.click();
				setTimeout(function() { scrollThroughFollowers(listAllFollowing); }, 2500);
			}
		}, 2500)
	}
}

function listAllFollowing(result) {
	followers = result; 
	document.getElementsByClassName('_pfyik')[0].click();

	setTimeout(function() { 
		let followingButton = [].slice.call(document.getElementsByClassName('_t98z6')).filter(function(x) { return x.innerText.indexOf('following') > -1})[0];
		if (followingButton) { 
			followingButton.click();
			setTimeout(function() { scrollThroughFollowers(reconcileAll); }, 2500);
		}
	}, 2500);
}

function reconcileAll(result) {
	following = result;

	let unfollowers = following.filter(function(x) { return followers.indexOf(x) == -1; });
	console.log(unfollowers);

	[].slice.call(document.getElementsByClassName('_6e4x5')).forEach(function(element, index) { if (followers.indexOf(following[index]) > -1) { element.remove(); } })
	document.getElementsByClassName('_lfwfo')[0].innerText = 'Not Following You'
	document.getElementsByClassName('_lfwfo')[0].style.color = 'red'
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