var watchID;
var geoLoc;
var socket = io();

function showLocation(position) {
    var lat = position.coords.latitude;
    var long = position.coords.longitude;
    var acc = position.coords.accuracy;

    $('.lat').append(lat + "<br>");
    $('.long').append(long + "<br>");
    $('.acc').append(acc + "<br>");

    socket.emit('location', { lat: lat, lon: long, acc: acc });
}

function errorHandler(err) {
    if(err.code == 1) {
        alert("Error: Access is denied!");
    }

    else if( err.code == 2) {
        alert("Error: Position is unavailable!");
    }
}

function getLocationUpdate(){
    if(navigator.geolocation){
        // timeout at 60000 milliseconds (60 seconds)
        var options = { timeout:60000 };
        geoLoc = navigator.geolocation;
        watchID = geoLoc.watchPosition(showLocation, errorHandler, options);
    }

    else{
        alert("Sorry, browser does not support geolocation!");
    }
}