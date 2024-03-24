// background.js
// Set up an alarm to trigger the cleanup process every 24 hours (adjust as needed)
chrome.alarms.create('cleanupAlarm', {
  periodInMinutes: 24 * 60 // 24 hours
});

// Add listener for the alarm
chrome.alarms.onAlarm.addListener(alarm => {
  if (alarm.name === 'cleanupAlarm') {
    // Call a function to perform the cleanup
    cleanupLocalStorage();
  }
});

// Function to perform cleanup of local storage
function cleanupLocalStorage() {
  // Perform the cleanup process here
  // For example, remove outdated or unnecessary data
  // You can use chrome.storage.local.remove to remove specific keys or data
  // Sample code to remove all data from local storage
  chrome.storage.local.clear();
}
