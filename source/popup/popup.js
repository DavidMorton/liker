function sendMessage(message) { 
	if (chrome && chrome.runtime) { 
		chrome.runtime.sendMessage(message)
	}
}

document.addEventListener('DOMContentLoaded', function () { 
	var buttons = document.querySelectorAll('button');

	for (var i = 0; i < buttons.length; i++) {
		buttons[i].addEventListener('click', function() { sendMessage({message:'autorun'}); });
	}
});