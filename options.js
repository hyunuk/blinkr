const THRESHOLD = 0.3
const video = document.getElementById('video')

Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
    faceapi.nets.faceExpressionNet.loadFromUri('/models'),
    faceapi.nets.ssdMobilenetv1.loadFromUri('/models')
]).then(startVideo)

function startVideo() {
    navigator.getUserMedia(
        { video: {} },
        stream => video.srcObject = stream,
        err => console.error(err)
    )
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
        const detections = await faceapi.detectSingleFace(video, new faceapi.SsdMobilenetv1Options({ minConfidence: 0 })).withFaceLandmarks()
        const left_arr = detections.landmarks.getLeftEye();
        const right_arr = detections.landmarks.getRightEye();
        const ear = getEAR(left_arr, right_arr);
        if (ear < THRESHOLD) {
            console.log("Blink");
        }

        const resizedDetections = faceapi.resizeResults(detections, displaySize)
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
    }, 100)
})
