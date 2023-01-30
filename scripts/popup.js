const checkbox = document.querySelector("input[type='checkbox']")
const power = document.getElementById("power")

chrome.storage.session.get(["blinkr_start"]).then((res) => {
    const startTime = res.blinkr_start;
    if (startTime) {
        checkbox.checked = true;
    }
    power.textContent = "On"
})


checkbox.addEventListener('change', () => {
    if (checkbox.checked) {
        chrome.runtime.sendMessage({
            type: "blinkr_on",
            time: Math.floor(Date.now() / 1000)
        })
        power.textContent = "On"
    } else {
        chrome.runtime.sendMessage({
            type: "blinkr_off",
        })
        power.textContent = "Off"
    }
})

setInterval(setBlinkCount, 1000)
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