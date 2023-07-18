// popup.js

// Function to send a message to background.js
function sendMessageToBackground(action, tabGroupingOption) {
  chrome.runtime.sendMessage({ action, tabGroupingOption });
}

// Attach click event listeners to the buttons
document.getElementById('groupActive').addEventListener('click', () => {
  sendMessageToBackground('groupTabs', 'active');
});

document.getElementById('groupAll').addEventListener('click', () => {
  sendMessageToBackground('groupTabs', 'all');
});

document.getElementById('ungroup').addEventListener('click', () => {
  sendMessageToBackground('ungroup', 'active');
});

document.getElementById('ungroupAll').addEventListener('click', () => {
  sendMessageToBackground('ungroup', 'allß');
});
