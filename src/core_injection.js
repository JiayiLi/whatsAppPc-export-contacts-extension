inject();
async function inject() 
{	
	await addScript('src/BinaryReader.js');
	await addScript('src/wapacket.js');
	await addScript('src/crypto.js');	
	await addScript('src/NodeParser.js');
	await addScript('src/NodeParser.js');
	await addScript('src/WebScoketInterception.js');
	await addScript('src/lib/jquery.js');
	await addScript('src/addExportBtn.js');
	
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

