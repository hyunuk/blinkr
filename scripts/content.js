const THRESHOLD = 0.3
const video = document.createElement('video');

let isClose = false
let time = new Date()
let errorSent = false
let count = 0;
let countTimeStamp = new Map();

// Load pre-defined models and start video when loading is completed.
Promise.all([
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    faceapi.nets.ssdMobilenetv1.loadFromUri('/models')
]).then(startVideo)

function startVideo() {
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
                if (ratio < THRESHOLD && !isClose) {
                    isClose = true;
                    increaseCount();
                }
                if (ratio >= THRESHOLD) {
                    isClose = false;
                }
                time = new Date();
                errorSent = false
            } catch (e) {
                const curr = new Date();
                if (!errorSent) {
                    if (curr.valueOf() - time.valueOf() > 300000) {
                        console.log("We cannot detect your face! Please turn off if you do not use anymore")
                        errorSent = true;
                    }
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
    // increase button click count NOT BLINKS PER MINUTE
    count++;
    console.log(count)

    // update map
    let time = Math.floor(Date.now() / 1000)
    // console.log(time);

    // empty map
    if (countTimeStamp.size === 0) {
        countTimeStamp.set(time, 1)
    } else if (countTimeStamp.has(time)) { // if blink more than once on same timestamp increase value
        countTimeStamp.set(time, countTimeStamp.get(time) + 1)
    } else {
        countTimeStamp.set(time, 1)
    }
    console.log(countTimeStamp)
}

setInterval(getBlinkCount, 1000);
function getBlinkCount() {
    let disp = document.getElementById("display");
    let countsPerMin = 0;
    let currTime = Math.floor(Date.now() / 1000);
    for (let i = currTime - 60; i < currTime; i++) {
        if (countTimeStamp.has(i)) {
            countsPerMin += countTimeStamp.get(i)
        }
    }
    disp.innerHTML = countsPerMin;
    console.log(countsPerMin);

    if (countsPerMin < 5) {
        chrome.action.setIcon({path: {
                "19": "../images/19_red_eye.png",
                "36": "../images/36_red_eye.png",
            }});
        document.body.style.backgroundColor = 'green';
    } else if (countsPerMin < 12) {
        chrome.action.setIcon({path: {
                "19": "../images/19_yellow_eye.png",
                "36": "../images/36_yellow_eye.png",
            }});
        document.body.style.backgroundColor = 'white';
    } else {
        chrome.action.setIcon({path: {
                "19": "../images/19_blue_eye.png",
                "36": "../images/36_blue_eye.png",
            }});
    }
}
