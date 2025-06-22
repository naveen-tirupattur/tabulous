// sidepanel.js
document.addEventListener('DOMContentLoaded', function () {
    const summaryContainer = document.getElementById('summary-content');

    function showLoadingAnimation() {
        summaryContainer.innerHTML = `
            <div class="tabulous-overlay-content">
                <div class="loading-container">
                    <h2>Generating Summary</h2>
                    <div class="loading-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                    <div class="loading-text">Processing page content...</div>
                </div>
            </div>
        `;
        return true;
    }

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.action === 'streamUpdate') {
            // If this is the first update, replace the loading animation with the summary container
            if (summaryContainer.querySelector('.loading-container')) {
                summaryContainer.innerHTML = `
                    <div class="tabulous-overlay-content">
                        <h2>Summary</h2>
                        <div class="summary-text"></div>
                    </div>
                `;
            }

            const summaryText = summaryContainer.querySelector('.summary-text');
            if (summaryText) {
                // Use a buffer to accumulate the markdown, then render as HTML
                if (!summaryText._markdownBuffer) summaryText._markdownBuffer = '';
                summaryText._markdownBuffer += message.chunk;
                summaryText.innerHTML = marked.parse(summaryText._markdownBuffer);
                summaryText.scrollTop = summaryText.scrollHeight;
            }
        } else if (message.action === 'streamComplete') {
            const summaryText = summaryContainer.querySelector('.summary-text');
            if (summaryText) {
                summaryText.innerHTML += '<p class="summary-complete">Summary complete.</p>';
            }
            // Optionally, clear the buffer after completion
            if (summaryText && summaryText._markdownBuffer) {
                delete summaryText._markdownBuffer;
            }
        } else if (message.action === 'streamError') {
            summaryContainer.innerHTML = `
                <div class="tabulous-overlay-content">
                    <div class="summary-error">${message.error}</div>
                </div>
            `;
        }
    });

    // Initial content load
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        showLoadingAnimation();
    });
});