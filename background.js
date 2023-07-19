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
  console.log(tabsByDomain);
  return tabsByDomain;
}

// Function to group tabs
async function groupTabsToWindow(tabIds, windowId, domain) {
  const group = await chrome.tabs.group({tabIds});
  await chrome.tabGroups.update(group, { title: domain });
  // await chrome.tabs.move(tabIds, { windowId, index: -1 });
}

// Function to handle grouping tabs
function groupTabsHandler(tabGroupingOption) {
  const windowId = tabGroupingOption === 'groupActive' ? chrome.windows.WINDOW_ID_CURRENT : chrome.windows.WINDOW_ID_NONE;
  chrome.tabs.query({windowId:windowId}, (tabs) => {
    const tabGroups = groupTabsByDomain(tabs);
    // var sortedMap = [tabGroups.entries()].sort((a, b) => a[1] > b[1]);
    tabGroups.forEach(function (tabIds, domain) {
      console.log("Domain:", domain);
      console.log("Tabs:", tabIds);
      if (tabIds.length > 1) {
        groupTabsToWindow(tabIds, windowId, domain);
      }
    });
  });
}

// Function to handle ungrouping of tabs in active window
function ungroupTabsHandler(tabGroupingOption) {
  console.log(tabGroupingOption);
  const windowId = tabGroupingOption === 'ungroupActive' ? chrome.windows.WINDOW_ID_CURRENT : chrome.windows.WINDOW_ID_NONE;
  chrome.tabs.query({windowId:windowId}, (tabs) => {
    tabs.forEach((tab) => {
      chrome.tabs.ungroup(tab.id);
    });
  });
}

// Listen for messages from the popup window
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log(request);
  if (request.action === 'groupActive' || request.action === 'groupAll') {
    groupTabsHandler(request.action);
  } else if (request.action === 'ungroupActive' || request.action === 'ungroupAll') {
    ungroupTabsHandler(request.action);
  }
});
