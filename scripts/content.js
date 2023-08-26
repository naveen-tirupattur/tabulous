// Summarize endpoint is currently limited to 100k chars
const charLimit = 100000;

// Display the text at the top of the page
function display(text) {
    header = document.createElement("div");
    header.style.backgroundColor = "#9af375";
    header.style.padding = "5px";

    // Write the text with a bit of styling and add it to the header
    tldr = document.createElement("p");
    tldr.textContent = text;
    tldr.style.margin = "10px 100px";
    tldr.style.fontSize = "medium";
    tldr.style.color = "black";
    tldr.style.textAlign = "center";
    tldr.style.fontFamily = "Verdana, Geneva, sans-serif";
    header.appendChild(tldr);

    // Insert the header immediately before the HTML body
    document.body.parentNode.insertBefore(header, document.body);
}

// Fetch the summary for the given text and display it
function summarize(text) {
    // Use the user's stored API key
    chrome.storage.sync.get('apiKey', key => {
        // Set up the request to send to the endpoint
        options = {
            "method": "POST",
            "headers": {
                "Accept": "application/json",
                "Content-type": "application/json",
                "Authorization": "Bearer " + key.apiKey,
                "Request-Source": "sandbox-condense"
            },
            // These are the summarize endpt paramters.
            // Try playing around with them and reloading the extension to see
            // how they affect the summarization behaviour.
            // Reference: https://docs.cohere.com/reference/summarize-2
            "body": JSON.stringify({
                "length": "long",
                "format": "auto",
                "model": "summarize-xlarge",
                "extractiveness": "low",
                "temperature": 0.1,
                "text": text,
                // We tell the model that it's summarizing a webpage
                "additional_command": "of this webpage"
            })
        };

        fetch('https://api.cohere.ai/v1/summarize', options)
            .then((response) => response.json())
            .then((response) => {
                if (response.summary === undefined) {
                    // If there's no summary in the endpoint's response,
                    // display whatever error message it returned
                    display("There was an error: " + response.message);
                } else {
                    // Otherwise, display the summary
                    display("tl;dr: " + response.summary);
                }
            });
    });
}

// Returns true if the given element isn't visible on the page
function isHidden(el) {
    var style = window.getComputedStyle(el);
    return ((style.display === 'none') || (style.visibility === 'hidden'))
}

// Returns only the visible text from the page
function getVisibleText() {
    // Using jQuery selectors, try to find the page's main body of content,
    // often in a content or main element. Fall back to using the whole
    // body which is ~universal.
    var body = document.querySelector('body')
    if (document.querySelector('#content')) {
        body = document.querySelector('#content');
    }
    if (document.main) {
        body = document.querySelector('main');
    }

    var allTags = body.getElementsByTagName('*');

    let visibleText = [];
    var nChars = 0;
    // Select all visible text in the body, up to charLimit
    for (var i = 0, max = allTags.length; i < max; i++) {
        var elem = allTags[i];
        if (!isHidden(elem)) {

            var text = $(elem).contents().filter(function() {
                return this.nodeType == Node.TEXT_NODE;
            });
            if (text === undefined || text.length == 0) {
                continue;
            }
            text = text[0].nodeValue
            nChars += text.length + 1; // for newline
            if (nChars < charLimit) {
                visibleText.push(text);
            } else {
                break
            }
        }
    }
    console.log(visibleText)
    // Separate all the text elements with a newline
    return visibleText.join('\n');
}

// Attempt to summarize the page
function main() {
    chrome.storage.sync.get('apiKey', key => {
        if (key.apiKey === undefined) {
            display("Please add an API key");
        } else {
            const truncatedVisibleText = getVisibleText();
            console.log(truncatedVisibleText);
            summarize(truncatedVisibleText);
        }
    });
}
// Handle messages from background script
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.action === 'summarize') {
        main()
    }
    sendResponse('hello')
});