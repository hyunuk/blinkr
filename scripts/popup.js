document.getElementById("button").addEventListener("click", () => {
    chrome.tabs.create({
        url: chrome.runtime.getURL("./scripts/app.html")
    });
});
