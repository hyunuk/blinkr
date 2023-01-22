// let video = document.getElementById("videoInput"); // video is the id of video tag
// navigator.mediaDevices.getUserMedia({ video: true, audio: false })
//     .then(function(stream) {
//         video.srcObject = stream;
//         video.play();
//     })
//     .catch(function(err) {
//         console.log("An error occurred! " + err);
//     });

// let canvasFrame = document.getElementById("canvasFrame"); // canvasFrame is the id of <canvas>
// let context = canvasFrame.getContext("2d");
// let src = new cv.Mat(height, width, cv.CV_8UC4);
// let dst = new cv.Mat(height, width, cv.CV_8UC1);
// const FPS = 30;
// function processVideo() {
//     let begin = Date.now();
//     context.drawImage(video, 0, 0, width, height);
//     src.data.set(context.getImageData(0, 0, width, height).data);
//     cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY);
//     cv.imshow("canvasOutput", dst); // canvasOutput is the id of another <canvas>;
//     // schedule next one.
//     let delay = 1000/FPS - (Date.now() - begin);
//     setTimeout(processVideo, delay);
// }
// // schedule first one.
// setTimeout(processVideo, 0);

let count = 0;
let countTimeStamp = new Map();
let disp = document.getElementById("display");

document.getElementById("butt").addEventListener('click', increaseCount);

function increaseCount() {
    const showNum = document.getElementById('num')
    showNum.innerHTML = count;
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
    let countsPerMin = 0;
    let currTime = Math.floor(Date.now() / 1000);
    for (let i = currTime - 5; i < currTime; i++) {
        if (countTimeStamp.has(i)) {
            countsPerMin += countTimeStamp.get(i)
        }
    }
    disp.innerHTML = countsPerMin;
    console.log(countsPerMin);
}



// IGORE BELOW

// EXAMPLE
// setInterval(myTimer, 1000);
//
// function myTimer() {
//     const date = new Date();
//     // document.getElementById("demo").innerHTML = date.toLocaleTimeString();
//     console.log(date.getMilliseconds())
// }
