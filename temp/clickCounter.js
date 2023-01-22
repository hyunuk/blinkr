let count = 0;
let countsPerMin = 0;
let countTimeStamp = new Map();
let disp = document.getElementById("display")

function increaseCount() {
    const showNum = document.getElementById('num')
    showNum.innerHTML = count;
    // increase count
    count++;
    // console.log(count);

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
    let currTime = Math.floor(Date.now() / 1000);
        for (let i = currTime - 60; i < currTime; i++) {
            if (i in countTimeStamp) {
                countsPerMin += countTimeStamp[currTime - i]
            }
        }

    disp.innerHTML = countsPerMin;
    console.log(countsPerMin);
}

// EXAMPLE
// setInterval(myTimer, 1000);
//
// function myTimer() {
//     const date = new Date();
//     // document.getElementById("demo").innerHTML = date.toLocaleTimeString();
//     console.log(date.getMilliseconds())
// }