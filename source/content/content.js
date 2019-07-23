var maxtolike = 2;
var skipsBeforeGivingUp = 30;
var skipped = 0;
var received429 = false;
var CLASS_NAME_FOR_GRID_POST = '_9AhH0';
var CLASS_NAME_FOR_HEART_BUTTON_WRAPPER = 'fr66n';
var CLASS_NAME_FOR_FOCUSED_POST_FOR_DOUBLE_CLICK_USE = 'kPFhm';

chrome.runtime.onMessage.addListener(function (response) {
	if (response.action == 'continueliking') {
		console.log('continuing to like...')
		let firstItem = document.getElementsByClassName(CLASS_NAME_FOR_GRID_POST)[9];
		if (firstItem) {
			firstItem.click()
		}

		setTimeout(function () { likeandnext(response.numberliked, response.maxlikes) }, 5000);
	} else if (response.action == 'nextrun') {
		document.title = "Liked " + response.lastcount + '. Sched: ' + response.nextruntime;
	} else if (response.action == 'findUnfollowers') {
		listAllFollowers();
	} else if (response.action == 'stopGettingUnfollowers') {
		received429 = true;
	} else if (response.action === 'reloadScripts') {

	}
});

function numberBetween(min, max) {
	return Math.floor(Math.random() * (max - min) + min);
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
		var result = [].slice.call(document.getElementsByClassName('_2g7d5')).map(function (x) { return x.innerText; })
		setTimeout(function () { callback(result); }, 2500);
	} else {
		setTimeout(function () { scrollThroughFollowers(callback); }, numberBetween(1250, 1750));
	}
}

function listAllFollowers() {
	received429 = false;
	let profileButton = document.getElementsByClassName('coreSpriteDesktopNavProfile')[0];
	if (profileButton) {
		profileButton.click();
		setTimeout(function () {
			let followersButton = [].slice.call(document.getElementsByClassName('_t98z6')).filter(function (x) { return x.innerText.indexOf('followers') > -1 })[0];
			if (followersButton) {
				followersButton.click();
				setTimeout(function () { scrollThroughFollowers(listAllFollowing); }, 2500);
			}
		}, 2500)
	}
}

function listAllFollowing(result) {
	followers = result;
	document.getElementsByClassName('_pfyik')[0].click();

	setTimeout(function () {
		let followingButton = [].slice.call(document.getElementsByClassName('_t98z6')).filter(function (x) { return x.innerText.indexOf('following') > -1 })[0];
		if (followingButton) {
			followingButton.click();
			setTimeout(function () { scrollThroughFollowers(reconcileAll); }, 2500);
		}
	}, 2500);
}

function reconcileAll(result) {
	following = result;

	let unfollowers = following.filter(function (x) { return followers.indexOf(x) == -1; });
	console.log(unfollowers);

	[].slice.call(document.getElementsByClassName('_6e4x5')).forEach(function (element, index) { if (followers.indexOf(following[index]) > -1) { element.remove(); } })
	document.getElementsByClassName('_lfwfo')[0].innerText = 'Not Following You'
	document.getElementsByClassName('_lfwfo')[0].style.color = 'red'
}

function likeandnext(numberliked, maxlikes, mechanic) {
	if (!mechanic) { 
		if (Math.random() < 0.5) { 
			mechanic = 'doubleclick'
		} else { 
			mechanic = 'heart';
		}
	}

	sendMessage({ message: 'numberliked', numberliked: numberliked, maxlikes: maxlikes });
	document.title = numberliked + '/' + maxlikes + ' - ' + new Date().toString().split(' ')[4];

	let likeButton = null;

	if (mechanic === 'heart') { 
		let likeButtonWrapper = document.getElementsByClassName(CLASS_NAME_FOR_HEART_BUTTON_WRAPPER)[0];
		if (likeButtonWrapper) { 
			likeButton = likeButtonWrapper.firstElementChild;
		}

		if (likeButton) { 
			// Never 'unlike' items.
			if (likeButton.firstElementChild && likeButton.firstElementChild.attributes['aria-label'].value === 'Unlike') { 
				likeButton = null;
			}
		}
	} else if (mechanic === 'doubleclick') { 
		let likeButtonWrapper = document.getElementsByClassName(CLASS_NAME_FOR_FOCUSED_POST_FOR_DOUBLE_CLICK_USE)[0];
		if (likeButtonWrapper) { 
			likeButton = likeButtonWrapper.firstElementChild;
		}
	}

	// like about 7/8 items. 
	if (likeButton && numberBetween(1, 8) != 5) {
		if (mechanic == 'heart') { 
			likeButton.click();
		} else if (mechanic === 'doubleclick') { 
			var event = new MouseEvent('dblclick', {
				'view': window,
				'bubbles': true,
				'cancelable': true
			});
			likeButton.dispatchEvent(event);
		}

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

	setTimeout(function () {
		let rightArrow = document.getElementsByClassName('coreSpriteRightPaginationArrow')[0];

		if (Math.random() < 0.1) { 
			if (mechanic = 'heart') {
				mechanic = 'doubleclick';
			} else { 
				mechanic = 'heart';
			}
		}

		if (rightArrow) {
			rightArrow.click();
			setTimeout(function () {
				likeandnext(numberliked, maxlikes, mechanic);
			}, Math.floor(Math.random() * 3000 + 500));
		} else {
			document.title = 'ERROR!!!!';

		}
	}, Math.floor(Math.random() * 1000 + 500));
}


function like(maxtolike) {
	let firstItem = document.getElementsByClassName(CLASS_NAME_FOR_GRID_POST)[9];
	if (firstItem) {
		firstItem.click()
	}

	setTimeout(function () { likeandnext(0, maxtolike), 1000 });
}

let maindiv;

function isTagExplorePage() { 
	return location.href.match(/https:\/\/www\.instagram\.com\/explore\/tags\/[^\/]+\/$/)
}
function isPersonalPage() { 
	return location.href.match(/https:\/\/www\.instagram\.com\/[^\/]+\/$/)
}

function addButton() {

	let previousDiv = document.getElementById('autorunDiv');
	if (previousDiv) {
		previousDiv.remove();
	}

	if (!isTagExplorePage() && !isPersonalPage()) {
		return;
	}

	var increments = [5, 10, 25, 50, 100, 250];


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

		div.onclick = function () {
			sendMessage({ message: 'liking', url: location.href });
			increment = Math.round(increment + ((Math.random() * (increment/2))-(increment/4)))
			like(increment);
		}

		maindiv.appendChild(div);
	}

	let sharedDataSet = false;
	setInterval(() => {
		if (document._sharedData && !sharedDataSet && document._sharedData.entry_data && location.href.endsWith(document._sharedData.entry_data.TagPage["0"].graphql.hashtag.name + '/')) {
			sharedDataSet = true;

		}
	}, 1000);

	let div = document.createElement('div');
	div.style.margin = '10px';
	div.style.padding = '8px';
	div.innerText = '❤️ auto';
	div.style.backgroundColor = 'lightskyblue';
	div.style.borderRadius = '5px';
	div.style.cursor = 'pointer';
	div.style.display = 'inline-block';

	let increment = increments[i];

	div.onclick = function () {
		sendMessage({ message: 'autorun' });
	}

	maindiv.appendChild(div);

	document.body.appendChild(maindiv)

}

let url = location.url;

setInterval(function () {
	if (location.href != url) {
		sharedDataSet = false;
		url = location.href

		maindiv = document.createElement('div');
		delete document._sharedData;
		addButton();
	} else if (location.href === url && !document._sharedData) {
		if (!location.href.match(/https:\/\/www\.instagram\.com\/explore\/.*/)) {
			return;
		}



		let sharedData = new Array(...document.scripts).filter(x => x.innerHTML.indexOf('_sharedData =') > -1);
		let newScript = sharedData[0].innerHTML.replace('window._sharedData', 'document._sharedData');
		eval(newScript);

		if (!document._sharedData.entry_data || !document._sharedData.entry_data.TagPage) {
			document._sharedData = null;
			return;
		}

		let likeData = document._sharedData.entry_data.TagPage[0].graphql.hashtag.edge_hashtag_to_media.count + ',' + document._sharedData.entry_data.TagPage[0].graphql.hashtag.edge_hashtag_to_top_posts.edges.map(x => x.node).map(x => `${x.edge_liked_by.count},${x.edge_media_to_comment.count},${Math.round((new Date().valueOf() - (x.taken_at_timestamp * 1000)) / 1000 / 60)}`).join(',');

		let input = document.createElement('input');
		input.id = 'tagData';
		input.style.width = 1;
		input.style.height = 1;
		input.value = likeData;
		input.setAttribute('onClick', "this.setSelectionRange(0, this.value.length);document.execCommand('copy')");
		maindiv.appendChild(input);
	}
}, 1000)


document.addEventListener('DOMContentLoaded', function () {
	alert('hahahaha')
	var buttons = document.querySelectorAll('button');

	for (var i = 0; i < buttons.length; i++) {
		buttons[i].addEventListener('click', function () { sendMessage({ message: 'autorun' }); });
	}

	let sharedData = new Array(...document.scripts).filter(x => x.innerHTML.indexOf('_sharedData =') > -1);
	let newScript = sharedData.innerHTML.replace('window._sharedData', 'document._sharedData');
	eval(newScript);
});