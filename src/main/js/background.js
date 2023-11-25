// background.js

// Function to group tabs by URL
function groupTabsByDomain(tabs) {
  var tabsByDomain = new Map();
  tabs.forEach((tab) => {
    var url = new URL(tab.url);
    var domain = url.hostname;
    if (tabsByDomain.has(domain)) {
      var tabsArray = tabsByDomain.get(domain);
      tabsArray.push(tab.id);
    } else {
      tabsByDomain.set(domain, [tab.id]);
    }
  });
  return tabsByDomain;
}

// Function to group tabs
async function groupTabsToWindow(tabIds, windowId, domain) {
  const group = await chrome.tabs.group({tabIds});
  await chrome.tabGroups.update(group, { title: domain });
  // await chrome.tabs.move(tabIds, { windowId, index: -1 });
}

// Group Tabs Handler
function groupTabsHandler(selectedElement, selectedAction) {
  if (selectedAction) {
    groupTabs(selectedElement)
  } else {
    ungroupTabs(selectedElement)
  }
}

// Function to handle grouping tabs
function groupTabs(tabGroupingOption) {
  const windowId = tabGroupingOption === 'groupActive' ? chrome.windows.WINDOW_ID_CURRENT : chrome.windows.WINDOW_ID_NONE;
  chrome.tabs.query({windowId: windowId}, (tabs) => {
    const tabGroups = groupTabsByDomain(tabs);
    tabGroups.forEach(function (tabIds, domain) {
      if (tabIds.length > 1) {
        groupTabsToWindow(tabIds, windowId, domain);
      }
    });
  });
}

// Function to handle ungrouping of tabs in active window
function ungroupTabs(tabGroupingOption) {
  const windowId = tabGroupingOption === 'groupActive' ? chrome.windows.WINDOW_ID_CURRENT : chrome.windows.WINDOW_ID_NONE;
  console.log('Ungrouping Tabs', windowId);
  chrome.tabs.query({windowId:windowId}, (tabs) => {
    tabs.forEach((tab) => {
      chrome.tabs.ungroup(tab.id);
    });
  });
}

// Attempt to summarize the page
async function summarize(url, truncatedVisibleText) {
  // // Use the user's stored API key
  // const apiKey = chrome.storage.sync.get('apiKey', function (obj){
  //   return obj.apiKey;
  // })

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
        return response.text();
      })
      .then((data) => {
        // Handle the response data here
        console.log('Response from FastAPI:', data);
        return data;
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

    // do something with response here, not outside the function
    const summary = summarize(tab.url, visibleText)
    summary.then((summaryText)=> {
      chrome.runtime.sendMessage({ action: 'summary', summaryText: summaryText });
    });
  })();
}

const tabUrls = new Set();
const duplicateTabs = new Set();

// Function to detect duplicate tabs in either active window or all windows
function duplicateTabsHandler(selectedAction) {
  if (selectedAction) {
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach((tab) => {
        if (tabUrls.has(tab.url)) {
          // Handle duplicate tab here, for example, group them or provide visual feedback
          // For simplicity, we'll just display an alert message
          console.log('Found duplicate tab', tab.url)
          duplicateTabs.add(tab);
        } else {
          tabUrls.add(tab.url);
        }
      });
    });
    groupAllDuplicateTabs();
    tabUrls.clear();
  }
}

function groupAllDuplicateTabs() {
  const groups = new Map();
  duplicateTabs.forEach((tab) => {
    const key = tab.url;
    if (!groups.has(key)) {
      groups.set(key, [tab]);
    } else {
      groups.get(key).push(tab);
    }
  });

  const groupedTabs = [];
  groups.forEach((group) => {
    if (group.length >= 1) {
      groupedTabs.push(group);
    }
  });
  duplicateTabs.clear();
  sendGroupedTabsToPopup(groupedTabs);
}

function sendGroupedTabsToPopup(groupedTabs) {
  chrome.runtime.sendMessage({ action: 'updateDuplicateTabs', duplicates: groupedTabs });
}

// Listen for messages from the popup window
chrome.runtime.onMessage.addListener((request, sender,  sendResponse) => {
  if (request.handler === 'groupTabs') {
    groupTabsHandler(request.selectedElement, request.selectedAction);
  } else if (request.handler === 'detectDuplicates') {
    duplicateTabsHandler(request.selectedAction);
  } else if (request.handler === 'summarize') {
    summarizeTabHandler();
  }
});
