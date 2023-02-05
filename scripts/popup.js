const checkbox = document.querySelector("input[type='checkbox']")
const power = document.getElementById("power")

checkbox.addEventListener('change', () => {
    if (checkbox.checked) {
        chrome.runtime.sendMessage({
            type: "blinkr_on",
            time: Math.floor(Date.now() / 1000),
        })
        power.textContent = "On"
    } else {
        chrome.runtime.sendMessage({
            type: "blinkr_off",
        })
        power.textContent = "Off"
    }
})

setInterval(setBlinkCount, 100);
function setBlinkCount() {
    let display = document.getElementById("display");
    chrome.storage.session.get(["blinkr_count"]).then((res) => {
        const count = res.blinkr_count;
        let msg = `blinkr count: ${count} times/min`
        if (count === undefined) {
            msg = "blinkr is not working. Please turn on.";
        }
        display.innerHTML = msg;
    })
}

checkSessions();

function checkSessions() {
    chrome.storage.session.get(["blinkr_start"]).then((res) => {
        const startTime = res.blinkr_start;
        if (startTime) {
            checkbox.checked = true;
            power.textContent = "On"
        }
        chrome.storage.session.remove("blinkr_start");
    })

    chrome.storage.session.get(["blinkr_tabClosed"]).then((res) => {
        const isTabClosed = res.blinkr_tabClosed;
        if (isTabClosed) {
            console.log(isTabClosed);
            checkbox.checked = false;
            power.textContent = "Off"
        }
        chrome.storage.session.remove("blinkr_tabClosed");
    })
}
