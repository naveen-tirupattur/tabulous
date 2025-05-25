// sidepanel.js

document.addEventListener('DOMContentLoaded', function () {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        const activeTab = tabs[0];
        chrome.storage.local.get([String(activeTab.id)], function (result) {
            const summaryContent = document.getElementById('summary-content');
            const responseText = result[String(activeTab.id)];

            if (responseText) {
                const data = JSON.parse(responseText);
                const llmOutput = JSON.parse(data.llm_output);
                const themes = llmOutput.themes;
                const summary = llmOutput.summary;

                summaryContent.innerHTML = `
                    <h2>Themes:</h2>
                    <ul>
                        ${themes.map(theme => `<li>${theme}</li>`).join('')}
                    </ul>
                    <h2>Summary:</h2>
                    <p>${summary}</p>
                    <br>
                    <p><b>Generated in:</b> ${data.time_taken} seconds</p>
                `;
            } else {
                summaryContent.innerHTML = '<p>No summary available for this tab.</p>';
            }
        });
    });
});

// Update the sidepanel to handle streaming updates
chrome.runtime.onMessage.addListener((message) => {
    if (message.action === 'streamUpdate') {
        const summaryContent = document.getElementById('summary-content');
        summaryContent.innerHTML += message.chunk;
    } else if (message.action === 'streamComplete') {
        const summaryContent = document.getElementById('summary-content');
        summaryContent.innerHTML += '<p><b>Summary complete.</b></p>';
    }
});