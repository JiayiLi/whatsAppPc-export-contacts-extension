inject();
async function inject() 
{
	await addScript('src/WebScoketInterception.js');
}

function addScript(scriptName) {
	return new Promise(function(resolve, reject) {
		var s = document.createElement('script');
		s.src = chrome.extension.getURL(scriptName);
		s.onload = function() {
			this.parentNode.removeChild(this);
			resolve(true);
        };
		(document.head||document.documentElement).appendChild(s);
	});
}