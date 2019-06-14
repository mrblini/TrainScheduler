
// Your web app's Firebase configuration
console.log("connected");
var firebaseConfig = {
    apiKey: "AIzaSyA1kz0rl_1r2gOle3cUZz5j1B_3DxOtvQc",
    authDomain: "my-train-project-3003b.firebaseapp.com",
    databaseURL: "https://my-train-project-3003b.firebaseio.com",
    projectId: "my-train-project-3003b",
    storageBucket: "my-train-project-3003b.appspot.com",
    messagingSenderId: "680031115075",
    appId: "1:680031115075:web:150f2e3de6dd05d6"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
var database = firebase.database();
// itititalize variables to use across functions
var trainName = "";
var destination = "";
var firstTime = "";
var frequency = "";
var minAway = '';
//converts military time to seconds
function militaryToSec(str) {
    var arr = str.split('');
    var minutes = arr.splice(2).join('');
    var hours = arr.join('');
    console.log("hours:" + hours);
    console.log("minutes:" + minutes);
    var totalSec = Number(hours) * 60 * 60 + Number(minutes) * 60;
    return totalSec;
}
// listener for the submit button
$("#submit").on("click", function (event) {
    console.log("eventfired");
    // Prevent the page from refreshing
    event.preventDefault();
    // Get inputs
    trainName = $("#train-name").val().trim();
    destination = $("#destination").val().trim();
    firstTime = $("#first-time").val().trim();
    frequency = $("#frequency").val().trim();
    // Change what is saved in firebase
    database.ref().set({
        name: trainName,
        dest: destination,
        time: firstTime,
        freq: frequency
    });
});
database.ref().on("value", function (snapshot) {
    // Print the initial data to the console.
    console.log(snapshot.val());
    // Log the value of the various properties
    console.log(snapshot.val().name);
    console.log(snapshot.val().dest);
    console.log(snapshot.val().time);
    console.log(snapshot.val().freq);
    //uses moment js to get the time now in military format e.g. 0455
    var timeNow = moment().format("HHmm");
    console.log("time now:" + timeNow);
    //if colon was used to input military time remove the colon
    if (snapshot.val().time.indexOf(":") >= 0) {

        var newStr = snapshot.val().time.split('');
        var splicedStr = newStr.splice(newStr.indexOf(":"), 1);
        var joinedStr = newStr.join('');
        firstTime = joinedStr;
    }
    console.log("first time: " + firstTime + "timenow: " + timeNow);
    //converts military time to seconds
    var timeNowSec = militaryToSec(timeNow);
    var firstTimeSec = militaryToSec(firstTime);
    var freqSec = snapshot.val().freq * 60;
    console.log("timeNowSec:" + timeNowSec);
    console.log("firstTimeSec:" + firstTimeSec);
    //possibility "A" if the first train is before now
    if (timeNowSec > firstTimeSec) {
        var x = firstTimeSec;
        var y = timeNowSec;
        // add frequency to time now until it is greater then or equal to time now. this will let you know the next arival in secons
        while (x <= y) {
            x += freqSec;
            // now x is the next arrival in seconds you can calculate min away
            minAway = (x - y) / 60;
            // hours away if this is a large number. if it is less then one it gets rounded down to zero
            hrAway = Math.floor(minAway / 60)
            //adds our calculation to time now to get military time format
            var nextArrivalHr = moment().hour() + hrAway;
            var nextArrivalMin = moment().minute() + minAway % 60;
            //if miitary minutes is more then 60 then add one to hour and subtract 60 (this was a bug in my code)
            if (nextArrivalMin >= 60) {
                nextArrivalHr += 1;
                nextArrivalMin = nextArrivalMin - 60;
            }
            //calculate minutes away if next arrival is tommorrow
            if (nextArrivalHr >= 24) {
                nextArrival = snapshot.val().time;
                var dailySec = militaryToSec('2400');
                var secToMidnight = dailySec - timeNowSec;
                minAway = (secToMidnight + firstTimeSec) / 60
                //concatinate strings to print in military format
            } else {
                nextArrival = String(nextArrivalHr) + String(nextArrivalMin);
            }


        }
        //possibility "B" if "first train time" is after "now"
    } else {
        minAway = (firstTimeSec - timeNowSec) / 60;
        nextArrival = snapshot.val().time;
    }
    console.log("minaway: " + minAway);
    // if(timeNowSec > firstTimeSec) {
    //   
    //   
    //   minAway = (secToMidnight + firstTimeSec)/60;
    // }else {
    //   minAway = (timeNowSec - firstTimeSec) / 60;
    // }

    // Change the HTML and add the data with database data for veiwing across browsers
    var newRow = $("<tr> <td>" + snapshot.val().name + "</td><td>" + snapshot.val().dest + "</td><td>" + snapshot.val().freq + "</td><td>" + nextArrival + "</td><td>" + minAway + "</td></tr>");
    console.log(newRow);
    $("#train-table").append(newRow);
    // If any errors are experienced, log them to console.
}, function (errorObject) {
    console.log("The read failed: " + errorObject.code);
});