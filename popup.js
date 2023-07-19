// popup.js

// Function to send a message to background.js
function sendMessageToBackground(action) {
  chrome.runtime.sendMessage({ action });
}

// Handle form submission
document.getElementById('tabActionsForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const selectedAction = document.querySelector('input[name="tabAction"]:checked').value;
  sendMessageToBackground(selectedAction);
});
