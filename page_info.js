var pageInfo = { "title": document.title };
chrome.extension.connect().postMessage(pageInfo);