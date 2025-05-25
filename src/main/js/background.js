// (file deleted for new extension setup)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'open_sidepanel') {
    if (chrome.sidePanel && chrome.sidePanel.open) {
      chrome.sidePanel.open();
    }
  }
});
