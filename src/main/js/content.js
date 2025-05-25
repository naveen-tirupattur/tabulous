// (file deleted for new extension setup)
(function () {
    // Create the button
    const button = document.createElement('button');
    button.id = 'tabulous-btn';
    button.innerText = 'Tabulous';
    button.className = 'tabulous-btn';
    button.onclick = () => {
        alert('Tabulous button clicked!');
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