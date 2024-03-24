// background.js
// Attempt to summarize the page
async function summarize(url, truncatedVisibleText) {
  // Define the URL of your FastAPI endpoint
  const apiUrl = 'http://localhost:9000/summarizeText';

  // Create a JSON object to send as the request body (if needed)
  const requestBody = {
    "url": url,
    "text": truncatedVisibleText,
  };

  // Define the headers for the request (if needed)
  const headers = {
    'Content-Type': 'application/json', // Adjust as needed
    // Add any other headers you need here
  };

  // Define the fetch options
  const fetchOptions = {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(requestBody),
  };

  console.log(fetchOptions)

  // Use the fetch API to make the POST request
  const response = await fetch(apiUrl, fetchOptions)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        // Handle the response data here
        const jsonResponse = JSON.stringify(data, null, 2);
        console.log('Response from FastAPI:', jsonResponse);
        return jsonResponse;
      })
      .catch((error) => {
        // Handle any errors that occurred during the fetch here
        console.error('Fetch error:', error);
      });
  return response;
}

// Function to summarize the active tab
function summarizeTabHandler() {
  (async () => {
    const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
    const visibleText = await chrome.tabs.sendMessage(tab.id, {action: "getVisibleText"});
    const response = summarize(tab.url, visibleText)
    response.then((responseText)=> {
      chrome.runtime.sendMessage({ action: 'summary', responseText: responseText});
    });
  })();
}

// Listen for messages from the popup window
chrome.runtime.onMessage.addListener((request, sender,  sendResponse) => {
  if (request.handler === 'summarize') {
    summarizeTabHandler();
  }
});

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
