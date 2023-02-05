const TAB_URL = chrome.runtime.getURL("./scripts/tab.html")
let TAB_ID;
const IMAGE_PATH = {
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
let checkbox;

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

function createTab() {
    const update = () => chrome.tabs.update(TAB_ID, {active: true});
    const create = () => chrome.tabs.create({ url:TAB_URL }, (tab) => {
        TAB_ID = tab.id;
    });
    TAB_ID ? update() : create();
}

function closeTab() {
    if (TAB_ID) {
        chrome.tabs.remove(TAB_ID, () =>{});
        TAB_ID = null;
    }
}

chrome.runtime.onMessage.addListener(async (msg) => {
    switch (msg.type) {
        case "blinkr_on":
            createTab();
            chrome.storage.session.set({"blinkr_start": msg.time});
            break;
        case "blinkr_off":
            closeTab();
            chrome.storage.session.clear();
            break;
        case "blinkr_time":
            const count = msg.time;
            if (count < 5) {
                chrome.action.setIcon({path: IMAGE_PATH.red});
                createNotification();
            } else if (count < 12) {
                chrome.action.setIcon({path: IMAGE_PATH.yellow});
            } else {
                chrome.action.setIcon({path: IMAGE_PATH.green});
            }
            chrome.storage.session.set({"blinkr_count": count})
            break;
        case "temp":
            console.log(msg.msg)
    }
});

chrome.tabs.onRemoved.addListener((closedTabId) => {
    if (TAB_ID === closedTabId) {
        chrome.storage.session.set({"blinkr_tabClosed": true})
        TAB_ID = null;
    }
})
