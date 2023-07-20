// popup.js
// Function to send a message to background.js
function sendMessageToBackground(action, selectedGroups) {
  chrome.runtime.sendMessage({ action, selectedGroups });
}

// Function to handle changes in the toggle switches (radio buttons)
function handleToggleSwitches() {

  const selectedAction = document.querySelector('input[name="tabAction"]:checked').value;
  if (selectedAction === 'groupActive' || selectedAction === 'groupAll') {
    chrome.runtime.sendMessage({ action: 'groupTabs', optionValue: selectedAction });
  } else if (selectedAction === 'ungroupActive' || selectedAction === 'ungroupAll') {
    chrome.runtime.sendMessage({ action: 'ungroupTabs', optionValue: selectedAction });
  }
}

// Listen for changes in the toggle switches (radio buttons)
const toggleSwitches = document.querySelectorAll('input[name="tabAction"]');
toggleSwitches.forEach(switchElement => {
  switchElement.addEventListener('change', handleToggleSwitches);
});

// Listen for messages from background.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // (No changes required for this part)
});
