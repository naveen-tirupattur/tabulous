// popup.js

// Function to send a message to background.js
function sendMessageToBackground(handler, selectedElement, selectedAction) {
  chrome.runtime.sendMessage({ handler, selectedElement, selectedAction });
}

// Function to handle changes in the toggle switches
function handleToggleSwitches(selectedElement, selectedAction) {
  // const selectedAction = document.querySelector('input[name="tabAction"]:checked').value;
  if (selectedElement === 'groupActive' || selectedElement === 'groupAll') {
    sendMessageToBackground('groupTabs', selectedElement, selectedAction);
  } else if (selectedElement === 'detectAll') {
    sendMessageToBackground('detectDuplicates', selectedElement, selectedAction);
  }
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
      if(selectedElement === 'groupActive' || selectedElement === 'detectAll')
        handleToggleSwitches(selectedElement, result[selectedElement]);
    });

    // Listen to switch value changes
    switchElement.addEventListener('change', function (){
      const selectedAction = switchElement.checked;
      handleToggleSwitches(selectedElement, selectedAction);
    });
  });

  const groupAllButton = document.getElementById('groupAll');

  groupAllButton.addEventListener('click', function () {
    handleToggleSwitches('groupAll', true);
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

  // Handle messages from background script
  chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.action === 'updateDuplicateTabs') {
      updatePopupContent(message.duplicates);
    }
  });
});


