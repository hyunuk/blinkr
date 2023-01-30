const imagePath = {
    "red": {
        "19": "../images/19_red_eye.png",
        "36": "../images/36_red_eye.png",
    },
    "yellow": {
        "19": "../images/19_yellow_eye.png",
        "36": "../images/36_yellow_eye.png",
    },
    "green": {
        "19": "../images/19_green_eye.png",
        "36": "../images/36_green_eye.png",
    }
}
async function createOffscreen() {
    if (await chrome.offscreen.hasDocument()) return;
    await chrome.offscreen.createDocument({
        url: "/scripts/offscreen.html",
        reasons: ["DISPLAY_MEDIA"],
        justification: "Face recognition, doesn't record."
    });
}

async function closeScreen() {
    if (!await chrome.offscreen.hasDocument()) return;
    await chrome.offscreen.closeDocument();
}

function createNotification() {
    chrome.storage.session.get(["blinkr_start"]).then((res) => {
        const startTime = res.blinkr_start;
        const currTime = Math.floor(Date.now() / 1000);
        if ((currTime - startTime) > 90) {
            chrome.notifications.create(
                {
                    type: "basic",
                    iconUrl: "/images/128_red_eye.png",
                    title: "You have dry eyes!",
                    message: "You should blink more!",
                    buttons: [
                        {title: 'Keep it blinking.'}
                    ],
                    priority: 0
                }, () => {}
            )
            chrome.storage.session.set({"blinkr_start": currTime})
        }
    })
}

function clearStorage() {
    chrome.storage.session.clear()
}

chrome.runtime.onMessage.addListener(async (msg) => {
    switch (msg.type) {
        case "blinkr_on":
            await createOffscreen();
            chrome.storage.session.set({"blinkr_start": msg.time})
            break;
        case "blinkr_off":
            await closeScreen();
            clearStorage();
            break;
        case "blinkr_time":
            const count = msg.time;
            if (count < 5) {
                chrome.action.setIcon({path: imagePath.red});
                createNotification();
            } else if (count < 12) {
                chrome.action.setIcon({path: imagePath.yellow});
            } else {
                chrome.action.setIcon({path: imagePath.green});
            }
            chrome.storage.session.set({"blinkr_count": count})
            break;
    }
});
