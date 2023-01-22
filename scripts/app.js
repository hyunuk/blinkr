const THRESHOLD = 0.3
const video = document.getElementById('video')
let isClose = false
let time = new Date()
let errorSent = false
let start

let count = 0;
let countTimeStamp = new Map();

Promise.all([
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    faceapi.nets.ssdMobilenetv1.loadFromUri('/models')
]).then(startVideo)

function startVideo() {
    navigator.getUserMedia(
        { video: {} },
        stream => video.srcObject = stream,
        err => console.error(err)
    )
    start = new Date()
}

function getEAR(left, right) {
    function getDistance(x1, x2, y1, y2) {
        return Math.sqrt(((x1-x2)*(x1-x2) + (y1-y2)*(y1-y2)));
    }

    // left horizontal, left vertical, right horizontal, right vertical
    const lh = getDistance(left[0].x, left[3].x, left[0].y, left[3].y)
    const lv = (getDistance(left[1].x, left[5].x, left[1].y, left[5].y) + getDistance(left[2].x, left[4].x, left[1].y, left[4].y))/2
    const rh = getDistance(right[0].x, right[3].x, right[0].y, right[3].y)
    const rv = (getDistance(right[1].x, right[5].x, right[1].y, right[5].y) + getDistance(right[2].x, right[4].x, right[1].y, right[4].y))/2

    return ((lv/lh)+(rv/rh))/2;

    // source: R. Gawande and S. Badotra,
    // "Deep-Learning Approach for Efficient Eye-blink Detection with Hybrid Optimization Concept," IJACSA, Vol.13, No.6, 2022
}

video.addEventListener('play', () => {
    const canvas = faceapi.createCanvasFromMedia(video)
    document.body.append(canvas)
    const displaySize = { width: video.width, height: video.height }
    faceapi.matchDimensions(canvas, displaySize)
    setInterval(async () => {
        try {
            const detections = await faceapi.detectSingleFace(video, new faceapi.SsdMobilenetv1Options({ minConfidence: 0 })).withFaceLandmarks()
            const left_arr = detections.landmarks.getLeftEye();
            const right_arr = detections.landmarks.getRightEye();
            const ear = getEAR(left_arr, right_arr);
            if (ear < THRESHOLD) {
                if (isClose) {
                    // no update
                } else {
                    isClose = true;
                    // console.log("Blink");
                    increaseCount();
                }
            }
            if (ear >= THRESHOLD) {
                isClose = false;
            }

            const resizedDetections = faceapi.resizeResults(detections, displaySize)
            canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
            faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
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
    }, 100)
})

function increaseCount() {
    // const showNum = document.getElementById('num')
    // showNum.innerHTML = count;
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

setInterval(getBlink, 1000);
function getBlink() {
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

    if (countsPerMin < 50 && (Date.now() - start) > 60000) {
        document.body.style.backgroundColor = 'red';
    }
}
