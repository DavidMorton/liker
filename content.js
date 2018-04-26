function likeandnext(numberliked, maxlikes) { 
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
				likeandnext(numberliked, maxlikes); 
			}, Math.floor(Math.random() * 3000 + 500));
		} else { 
			 document.title = 'ERROR!!!!';
		} 
	}, Math.floor(Math.random() * 1000 + 500));
}

function like() { 
	let firstItem = document.getElementsByClassName('_e3il2')[9];
	if (firstItem) { 
		firstItem.click()
	}

	setTimeout(() => likeandnext(0, 100), 1000);
}

function addButton() { 

	let previousDiv = document.getElementById('autorunDiv');
	if (previousDiv) { 
		previousDiv.remove();
	}

	if (!location.href.match(/https:\/\/www\.instagram\.com\/explore\/.*/)) { 
		return;
	}

	let div = document.createElement('div');
	div.style.position = 'fixed';
	div.style.top = '0px';
	div.style.left = '0px';
	div.style.margin = '20px';
	div.style.padding = '10px';
	div.innerText = 'Run'
	div.style.backgroundColor = 'lightskyblue';
	div.style.borderRadius = '5px';
	div.id = 'autorunDiv';

	div.onclick = function() { 
		like();
	}

	document.body.appendChild(div);
}

let url = location.url;

setInterval(function() { 
	if (location.href != url) { 
		url = location.href
		addButton();
	}
}, 100)



// chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
// 	var url = tabs[0].url;
// 	var regexp = new RegExp(/https:\/\/www\.instagram\.com\/explore\/.*/)
// 	if (url.match(regexp)) { 
// 		addButton();
// 	}
// });


