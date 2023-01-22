let count = 0;
let countTimeStamp = new Map();

function increaseCount() {
    // increase count
    count++;
    console.log(count);

    // update map
    let date = Math.floor(Date.now() / 1000)
    console.log(date);
    // empty map
    if (countTimeStamp.size === 0) {
        countTimeStamp.set(date, 1)
    } else if (countTimeStamp.has(date)) { // if blink more than once on same timestamp increase value
        countTimeStamp.set(date, countTimeStamp.get(date) + 1)
    } else {
        countTimeStamp.set(date, 1)
    }
    console.log(countTimeStamp)
}

// function updateCount() {
//     //
// }
//
// setInterval(updateCount(), 1000)
// // time = {2: 1, 3: 2, 5: 1, 7: 1}
// //
// // curr_time = 60
// // cnt = 5
// //
// // for i in range(1, 61): # i == 60
// // if curr_time - i in time:
// // cnt += time[curr_time - i]