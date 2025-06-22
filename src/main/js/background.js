// Store for article content
const articleStore = new Map();

async function generateSummary(text, sender) {
  const apiUrl = 'http://0.0.0.0:11434/api/generate';
  const requestBody = {
    "model": "llama3.2",
    "system": "You are a smart assistant who was designed to summarize articles and web pages. \
              Your task is to understand the text provided, analyze it and generate a short summary that highlights key information\
              and insights. The summary should be concise, informative, and easy to understand. ",

    "prompt": text,
    "stream": true
  };

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) throw new Error('Network response was not ok');

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let fullSummary = '';

    // Send initial summary container message
    chrome.runtime.sendMessage({
      action: 'show_summary_container',
      tabId: sender.tab.id
    });

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        if (buffer) {
          try {
            const json = JSON.parse(buffer);
            if (json.response) {
              const chunk = json.response;
              fullSummary += chunk;
              // Send the final chunk
              chrome.runtime.sendMessage({
                action: 'streamUpdate',
                chunk: chunk,
                tabId: sender.tab.id
              });
            }
          } catch (e) {
            console.error('Error parsing final JSON:', e);
          }
        }
        // Send stream complete message
        chrome.runtime.sendMessage({
          action: 'streamComplete',
          tabId: sender.tab.id
        });
        break;
      }

      buffer += decoder.decode(value, { stream: true });

      while (buffer.includes('\n')) {
        const lineEnd = buffer.indexOf('\n');
        const line = buffer.slice(0, lineEnd);
        buffer = buffer.slice(lineEnd + 1);

        if (line.trim()) {
          try {
            const json = JSON.parse(line);
            if (json.response) {
              const chunk = json.response;
              fullSummary += chunk;
              // Stream each chunk to the side panel
              chrome.runtime.sendMessage({
                action: 'streamUpdate',
                chunk: chunk,
                tabId: sender.tab.id
              });
            }
          } catch (e) {
            console.error('Error parsing JSON:', e);
          }
        }
      }
    }

    return fullSummary || 'No summary generated';

  } catch (error) {
    console.error('Error calling Ollama:', error);
    chrome.runtime.sendMessage({
      action: 'streamError',
      error: 'Failed to generate summary',
      tabId: sender.tab.id
    });
    return 'Failed to generate summary';
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'summarize_content') {
    generateSummary(message.content, sender).then(summary => {
      const articleData = {
        title: message.title,
        content: message.content,
        summary: summary,
        url: message.url
      };
      articleStore.set(sender.tab.id, articleData);
    });
    return false; // No need to wait for response
  } else if (message.action === 'open_side_panel') {
    openSidePanel(sender);
    return false; // No need to wait for response
  }
});

// Function to open the side panel
async function openSidePanel(sender) {
  try {
    chrome.sidePanel.setOptions({
      tabId: sender.tab.id,
      path: "src/main/ui/sidepanel.html",
      enabled: true
    });
    await chrome.sidePanel.open({ tabId: sender.tab.id });
  } catch (error) {
    console.error('Error opening side panel:', error);
  }
}