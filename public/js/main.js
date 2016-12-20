var watchID;
var geoLoc;
var socket = io();
var mymap;
var clients = {};

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
    localStorage.setItem('col', color);
    return color;
}

function getLocation(position) {
    var lat = position.coords.latitude;
    var long = position.coords.longitude;
    var acc = position.coords.accuracy;

    $('.lat').append(lat + "<br>");
    $('.long').append(long + "<br>");
    $('.acc').append(acc + "<br>");

    socket.emit('location', { lat: lat, lon: long, acc: acc, col: clientColor, name: clientName, id: clientID });
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

function getName(){
    var name = prompt("Bitte gib deinen Namen ein:", "");
    localStorage.setItem('name', name);
    return name;
}

var clientID = localStorage.getItem('id') || generateID();
var clientColor = localStorage.getItem('col') || generateColor();
var clientName = localStorage.getItem('name') || getName();

socket.on('location', function(client){
    var lat = client.lat;
    var lon = client.lon;
    var id = client.id;
    var col = client.col;
    var name = client.name;

    if (!mymap) {
        mymap = L.map('mapid').setView([lat, lon], 13);
        L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
            attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
            maxZoom: 18,
            id: 'mapbox.satellite',
            accessToken: 'pk.eyJ1IjoibWFwYm94MTM0MjM1IiwiYSI6ImNpd3cycWthbTAxa2MyeXBybHYwaXUxeG4ifQ.YkxkHkHwLm3whVsvUwc2fw'
        }).addTo(mymap);
    }

    var circle = L.circleMarker([lat, lon], {
        color: col,
        fillOpacity: 0.8,
        radius: 7
    });

    circle.bindPopup(name);

    if (!(id in clients)){
        clients[id] = circle.addTo(mymap);
    } else {
        clients[id].setLatLng([lat, lon]).setStyle({color: col});
    }

});

$(function() {
    getLocationUpdate();
});
