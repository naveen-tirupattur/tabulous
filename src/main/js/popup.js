// popup.js
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

function groupTabsHandler(selectedElement, selectedAction) {
  if(selectedAction)
    groupTabs(selectedElement);
  else
    ungroupTabs(selectedElement);
}

// Function to handle changes in the toggle switches
function handleEvent(selectedElement, selectedAction) {
  if (selectedElement === 'groupActive' || selectedElement === 'groupAll') {
    groupTabsHandler(selectedElement, selectedAction);
  } else if (selectedElement === 'detectDuplicates') {
    duplicateTabsHandler(selectedAction);
  }
  // Save the value to sync storage
  chrome.storage.sync.set({[selectedElement]: selectedAction}, function() {
    console.log('Saved', selectedElement, selectedAction);
  });
}

function clearDuplicates(){
  const duplicateTabsList = document.getElementById('duplicateTabsList');
  duplicateTabsList.innerHTML = '';
}

// Function to detect duplicate tabs in either active window or all windows
const tabUrls = new Set();
const duplicateTabs = new Set();
function duplicateTabsHandler(selectedAction) {
  if (selectedAction) {
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach((tab) => {
        if (tabUrls.has(tab.url)) {
          // Handle duplicate tab here, for example, group them or provide visual feedback
          // For simplicity, we'll just display an alert message
          // console.log('Found duplicate tab', tab.url)
          duplicateTabs.add(tab);
        } else {
          tabUrls.add(tab.url);
        }
      });
    });
    groupAllDuplicateTabs();
    tabUrls.clear();
  } else{
    clearDuplicates()
  }
}

// Function to update the popup content with the list of duplicate tabs
function updatePopupContent(duplicateTabs) {
  const duplicateTabsList = document.getElementById('duplicateTabsList');
  duplicateTabsList.innerHTML = '';

  if (duplicateTabs.length === 0) {
    duplicateTabsList.textContent = 'No duplicate tabs found.';
  } else {
    duplicateTabsList.innerHTML = ''; // Clear existing content
    duplicateTabs.forEach((group) => {
      const listItem = document.createElement('li');
      listItem.title = group[0].url; // Display the URL as tooltip
      listItem.textContent = group[0].title; // Display the title of the first tab in the group
      listItem.classList.add('duplicate-tab-group'); // Add the CSS class to the list item
      duplicateTabsList.appendChild(listItem);
    });
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
  updatePopupContent(groupedTabs);
}

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

document.addEventListener('DOMContentLoaded', function() {
  // Listen for changes in the toggle switches (radio buttons)
  const toggleSwitches = document.querySelectorAll('input[name="tabAction"]');
  toggleSwitches.forEach(switchElement => {
    const selectedElement = switchElement.value;
    // Load the previous state from sync storage
    chrome.storage.sync.get(selectedElement, function(result) {
      console.log(selectedElement, result[selectedElement])
      switchElement.checked = result[selectedElement];
      if(selectedElement === 'groupActive'
          || selectedElement === 'detectDuplicates')
        handleEvent(selectedElement, result[selectedElement]);
    });

    // Listen to switch value changes
    switchElement.addEventListener('change', function (){
      const selectedAction = switchElement.checked;
      handleEvent(selectedElement, selectedAction);
    });
  });


  const summarizeButton = document.getElementById('summarizeBtn');
  const statusDiv = document.getElementById("status");
  const summaryDiv = document.getElementById("summaryText");

  // Listen for the summarize button click event
  summarizeButton.addEventListener('click', function () {
    summaryDiv.textContent = "";
    statusDiv.textContent = "Summarizing...";
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const activeTab = tabs[0];
      (async () => {
        const visibleText = await chrome.tabs.sendMessage(activeTab.id, {action: "getVisibleText"});
        console.log(visibleText)
        const response = await summarize(activeTab.url, visibleText)
        showSummary(response, activeTab.id);
      })();
    });
   });

  // Function to update the popup with summary
  function showSummary(responseText, activeTabId) {
    console.log(responseText);
    if(responseText !== undefined && responseText.length !== 0){
      // Display the output
      statusDiv.textContent = "";
      // Save the llm output data to Chrome storage
      chrome.storage.local.set({[activeTabId]: responseText}, function () {
        // Display the themes and summary
        console.log('Stored in Chrome storage', activeTabId);
        displaySummary(responseText);
      });
    } else {
      statusDiv.textContent = "Failed to generate summary.";
      summaryDiv.textContent = "";
    }
  }

  // Function to display llm output
  function displaySummary(responseText) {
    const data = JSON.parse(responseText)
    // Parse the llm_output field as JSON
    const llmOutput = JSON.parse(data.llm_output);
    // Extract themes and summary from parsed JSON
    const themes = llmOutput.themes;
    const summary = llmOutput.summary;
    // Display the themes and summary
    summaryDiv.innerHTML = `
      <h2>Themes:</h2>
      <ul>
        ${themes.map(theme => `<li>${theme}</li>`).join('')}
      </ul>
      <h2>Summary:</h2>
      <p>${summary}</p>
      <br>
      <p><b>Time taken:</b> ${data.time_taken} seconds</p>
    `;
  }

  // Load saved summary data when popup is opened
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const activeTab = tabs[0];
    const activeTabId = String(activeTab.id);
    chrome.storage.local.get([activeTabId], function (result) {
      const responseText = result[activeTabId];
      console.log('Retrieved text for activeTab', activeTabId);
      if (responseText) {
        displaySummary(responseText);
      }
    });
  });
});


