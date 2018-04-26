var the_tab_id = '';

function runSearchAndLike() { 
	console.log('running search');
	var text = document.getElementById('search').value;
	chrome.tabs.update(null, { url: 'https://www.instagram.com/explore/tags/' + text })
	
};


function my_listener(tabId, changeInfo, tab) { 
	if (changeInfo.status == "complete" && tabId == the_tab_id && status == 'on') {
        toggle_extension(tab);
    }
}

document.addEventListener('DOMContentLoaded', function () { 
	var buttons = document.querySelectorAll('button');

	for (var i = 0; i < buttons.length; i++) {
		buttons[i].addEventListener('click', function() { runSearchAndLike(); });
	}

	chrome.tabs.onUpdated.addListener(my_listener);
});