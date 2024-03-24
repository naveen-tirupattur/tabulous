// Handle messages from background script
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.action === 'getVisibleText') {
        const documentClone = document.cloneNode(true);
        const article = new Readability(documentClone).parse();
        console.log(article.textContent);
        sendResponse(article.textContent);
    }
    return true;
});