// popup.js

// Function to send a message to background.js
function sendMessageToBackground(handler, selectedElement, selectedAction) {
  chrome.runtime.sendMessage({ handler, selectedElement, selectedAction });
}

// Function to handle changes in the toggle switches
function handleEvent(selectedElement, selectedAction) {
  // const selectedAction = document.querySelector('input[name="tabAction"]:checked').value;
  if (selectedElement === 'groupActive' || selectedElement === 'groupAll') {
    sendMessageToBackground('groupTabs', selectedElement, selectedAction);
  } else
    sendMessageToBackground(selectedElement, selectedElement, selectedAction);

  // Save the value to sync storage
  chrome.storage.sync.set({[selectedElement]: selectedAction}, function() {
    console.log('Saved', selectedElement, selectedAction);
  });
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

  //  TODO - Enable this functionality in the future
  // const groupAllButton = document.getElementById('groupAll');
  //
  // groupAllButton.addEventListener('click', function () {
  //   handleEvent('groupAll', true);
  // });
  //

  // TODO - Add functionality to save API keys
  // // Saves the API key to chrome.storage
  // const saveButton = document.getElementById('saveButton');
  //
  // saveButton.addEventListener('click', function () {
  //   const apiKey = document.querySelector('#apiKey').value;
  //   chrome.storage.sync.set({
  //     "apiKey": apiKey
  //   }, () => {
  //     // Update status to let user know options were saved.
  //     const status = document.getElementById('status');
  //     status.textContent = 'API Key Saved.';
  //     setTimeout(() => {
  //       status.textContent = '';
  //     }, 750);
  //   });
  // });

  // const apiKeyText = document.getElementById('apiKey');
  // chrome.storage.sync.get('apiKey', key => {
  //   if(key.apiKey != undefined)
  //   apiKeyText.placeholder = key.apiKey;
  // });

  const summarizeButton = document.getElementById('summarizeBtn');

  summarizeButton.addEventListener('click', function () {
    // Show loading message while waiting for API response
    showLoadingMessage();
    handleEvent('summarize', true);
    // Hide loading message once text is generated and displayed
    hideLoadingMessage();

    // Function to show loading message
    function showLoadingMessage() {
      loadingMessage.style.display = 'block';
    }

    // Function to hide loading message
    function hideLoadingMessage() {
      loadingMessage.style.display = 'none';
    }
  });

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
        listItem.textContent = group[0].title; // Display the title of the first tab in the group
        listItem.classList.add('duplicate-tab-group'); // Add the CSS class to the list item
        duplicateTabsList.appendChild(listItem);
      });
    }
  }

  // Function to update the popup with summary
  function showSummary(summary) {
    const summaryText = document.getElementById('summaryText');

    if (summary.length === 0) {
      summaryText.textContent = 'Could not summarize the document';
    } else {
      summaryText.textContent = summary;
    }
  }

  // Handle messages from background script
  chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.action === 'updateDuplicateTabs') {
      updatePopupContent(message.duplicates);
    } else if (message.action === 'summary') {
        showSummary(message.summaryText);
    }
  });
});


