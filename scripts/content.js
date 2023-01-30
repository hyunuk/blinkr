let countTimeStamp = new Map();

const video = document.createElement('video');

// Load pre-defined models and start video when loading is completed.
Promise.all([
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    faceapi.nets.ssdMobilenetv1.loadFromUri('/models')
]).then(startVideo)

function startVideo() {
    let isClose = false
    let time = new Date()

    const threshold = 0.3

    // Play video when it's ready
    video.addEventListener('canplay', () => video.play());

    navigator.getUserMedia(
        { video: true },
        stream => video.srcObject = stream,
        err => console.error(err)
    )


    video.addEventListener('play', () => {
        const canvas = document.createElement('canvas');
        document.body.appendChild(canvas)
        const displaySize = { width: video.width, height: video.height }
        faceapi.matchDimensions(canvas, displaySize)
        const ctx = canvas.getContext('2d');
        setInterval(async () => {
            try {
                ctx.drawImage(video, 0, 0);
                const detections = await faceapi.detectSingleFace(video, new faceapi.SsdMobilenetv1Options({ minConfidence: 0 })).withFaceLandmarks()
                const left_arr = detections.landmarks.getLeftEye();
                const right_arr = detections.landmarks.getRightEye();
                const ratio = getEAR(left_arr, right_arr);
                if (ratio < threshold && !isClose) {
                    isClose = true;
                    increaseCount();
                }
                if (ratio >= threshold) {
                    isClose = false;
                }
                time = new Date();
            } catch (e) {
                const curr = new Date();
                if (curr.valueOf() - time.valueOf() > 300000) {
                    console.log("We cannot detect your face! Please turn off if you do not use anymore")
                }
            }
        }, 50)
    })

}

/*
    Source: R. Gawande and S. Badotra,
    "Deep-Learning Approach for Efficient Eye-blink Detection with Hybrid Optimization Concept,"
    IJACSA, Vol.13, No.6, 2022
 */
function getEAR(left, right) {
    function getDistance(x1, x2, y1, y2) {
        return Math.sqrt(((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2)));
    }

    // left horizontal
    const lh = getDistance(left[0].x, left[3].x, left[0].y, left[3].y)
    // left vertical
    const lv = (getDistance(left[1].x, left[5].x, left[1].y, left[5].y) + getDistance(left[2].x, left[4].x, left[1].y, left[4].y))/2
    // right horizontal
    const rh = getDistance(right[0].x, right[3].x, right[0].y, right[3].y)
    // right vertical
    const rv = (getDistance(right[1].x, right[5].x, right[1].y, right[5].y) + getDistance(right[2].x, right[4].x, right[1].y, right[4].y))/2

    return ((lv / lh) + (rv / rh)) / 2;
}

function increaseCount() {
    let time = Math.floor(Date.now() / 1000)

    if (countTimeStamp.size === 0) {
        countTimeStamp.set(time, 1)
    } else if (countTimeStamp.has(time)) { // if blink more than once on same timestamp increase value
        countTimeStamp.set(time, countTimeStamp.get(time) + 1)
    } else {
        countTimeStamp.set(time, 1)
    }
}

setInterval(getBlinkCount, 100);
function getBlinkCount() {
    let countsPerMin = 0;
    let currTime = Math.floor(Date.now() / 1000);
    for (let i = currTime - 60; i < currTime; i++) {
        if (countTimeStamp.has(i)) {
            countsPerMin += countTimeStamp.get(i)
        }
    }
    chrome.runtime.sendMessage({
        type: "blinkr_time",
        time: countsPerMin
    })
}
