// (file deleted for new extension setup)
(function () {
    // Create the button
    const button = document.createElement('button');
    button.id = 'tabulous-btn';
    button.innerText = 'Tabulous';
    button.className = 'tabulous-btn';
    // Overlay creation function
    function showOverlay(title, content) {
        if (document.getElementById('tabulous-overlay')) return;
        const overlay = document.createElement('div');
        overlay.id = 'tabulous-overlay';
        overlay.className = 'tabulous-overlay';
        overlay.innerHTML = `
            <div class="tabulous-overlay-content">
                <button class="tabulous-overlay-close">&times;</button>
                <h2>${title}</h2>
                <div style="max-height:60vh;overflow:auto;">${content}</div>
            </div>
        `;
        document.body.appendChild(overlay);
        overlay.querySelector('.tabulous-overlay-close').onclick = () => overlay.remove();
    }
    button.onclick = () => {
        // Open the side panel (Chrome 114+)
        if (chrome.sidePanel && chrome.sidePanel.open) {
            chrome.sidePanel.open();
        }
        // Show the Readability popup overlay as before
        let article;
        if (typeof window.Readability !== 'undefined') {
            const docClone = document.cloneNode(true);
            article = new window.Readability(docClone).parse();
        } else {
            article = { title: document.title, content: document.body.innerText };
        }
        showOverlay(article.title, article.content);
    };
    // Prevent duplicate buttons
    if (!document.getElementById('tabulous-btn')) {
        document.body.appendChild(button);
    }
    // Inject stylesheet if not already present
    if (!document.getElementById('tabulous-btn-style')) {
        const style = document.createElement('link');
        style.rel = 'stylesheet';
        style.type = 'text/css';
        style.href = chrome.runtime.getURL('src/main/ui/styles.css');
        style.id = 'tabulous-btn-style';
        document.head.appendChild(style);
    }
    // Make the button draggable
    let isDragging = false, offsetX = 0, offsetY = 0;
    button.addEventListener('mousedown', function (e) {
        isDragging = true;
        offsetX = e.clientX - button.getBoundingClientRect().left;
        offsetY = e.clientY - button.getBoundingClientRect().top;
        button.style.transition = 'none';
        document.body.style.userSelect = 'none';
    });
    document.addEventListener('mousemove', function (e) {
        if (isDragging) {
            button.style.left = (e.clientX - offsetX) + 'px';
            button.style.top = (e.clientY - offsetY) + 'px';
            button.style.right = 'auto';
            button.style.bottom = 'auto';
        }
    });
    document.addEventListener('mouseup', function () {
        if (isDragging) {
            isDragging = false;
            button.style.transition = '';
            document.body.style.userSelect = '';
        }
    });
})();