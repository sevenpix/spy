var watchID;
var geoLoc;
var socket = io();

function generateID() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

function getLocation(position) {
    var lat = position.coords.latitude;
    var long = position.coords.longitude;
    var acc = position.coords.accuracy;

    $('.lat').append(lat + "<br>");
    $('.long').append(long + "<br>");
    $('.acc').append(acc + "<br>");

    socket.emit('location', { lat: lat, lon: long, acc: acc, client: clientID });
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
        watchID = geoLoc.watchPosition(getLocation, errorHandler, options);
    }

    else{
        alert("Sorry, browser does not support geolocation!");
    }

}

var clientID = generateID();