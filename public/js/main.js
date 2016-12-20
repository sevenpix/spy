var watchID;
var geoLoc;
var socket = io();
var mymap;
var clients = {};
var areasInitialized = false;

function generateID() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    var id = s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    localStorage.setItem('id', id);
    return id;
}

function generateColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function getLocation(position) {
    var lat = position.coords.latitude;
    var long = position.coords.longitude;
    var acc = position.coords.accuracy;

    $('.lat').append(lat + "<br>");
    $('.long').append(long + "<br>");
    $('.acc').append(acc + "<br>");

    socket.emit('location', { lat: lat, lon: long, acc: acc, col: clientColor, id: clientID });
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
        var options = {
          enableHighAccuracy: true,
        };
        geoLoc = navigator.geolocation;
        watchID = geoLoc.watchPosition(getLocation, errorHandler, options);
    }

    else{
        alert("Sorry, browser does not support geolocation!");
    }

}

var clientID = localStorage.getItem('id') || generateID();
console.log(clientID);
var clientColor = generateColor();

socket.on('location', function(client){
    var lat = client.lat;
    var lon = client.lon;
    var id = client.id;
    var col = client.col;

    if (!mymap) {
        mymap = L.map('mapid').setView([lat, lon], 13);
        L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
            attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
            maxZoom: 18,
            id: 'mapbox.satellite',
            accessToken: 'pk.eyJ1IjoibWFwYm94MTM0MjM1IiwiYSI6ImNpd3cycWthbTAxa2MyeXBybHYwaXUxeG4ifQ.YkxkHkHwLm3whVsvUwc2fw'
        }).addTo(mymap);
    }

    if (!areasInitialized) {
        areas.push(createAreaOfInterest([47.722932, 13.089180], 30)); // spar
        areas.push(createAreaOfInterest([47.724271, 13.086316], 30)); // fh entrance
        areas.push(createAreaOfInterest([47.723525, 13.087985], 30)); // parking lot
        areas.push(createAreaOfInterest([47.723747, 13.086897], 30)); // fh project room for testing
        
        areasInitialized = true;
    }


    var circle = L.circleMarker([lat, lon], {
        color: col,
        // fillColor: '#fff',
        fillOpacity: 0.8,
        radius: 7
    });

    if (!(id in clients)){
        clients[id] = circle.addTo(mymap);
    } else {
        clients[id].setLatLng([lat, lon]).setStyle({color: col});
    }



    areas.forEach(function(area) {
        var numberOfClientsInArea = 0
        for (clientId in clients) {
            if (isInArea(clients[clientId].getLatLng(), area)) {
                numberOfClientsInArea++;
            }

            if (numberOfClientsInArea > 0) {
                area.setStyle({color: "#000000"});
            }
            else {
                area.setStyle({color: "#FFFFFF"});
            }
        }
    })

});


function createAreaOfInterest(circleCenter, circleRadius) {
    var area = L.circle(circleCenter, {
        color: "#FFFFFF",
        fillOpacity: 0.8,
        radius: circleRadius
    })
    area.addTo(mymap);
    return area
}

function isInArea(position, area) {
    return (position.distanceTo(area.getLatLng()) <= area.getRadius())
}

var areas = []

$(function() {

    getLocationUpdate();

});
