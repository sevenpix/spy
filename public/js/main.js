var watchID;
var geoLoc;
var socket = io();
var mymap;
var clients = {};
var areasInitialized = false;

// Generates a unique ID
function generateID() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    var id = s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    // Stores it in the local storage of the device
    localStorage.setItem('id', id);
    return id;
}

// Generates a random HEX color
function generateColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    // Stores it in the local storage of the device
    localStorage.setItem('col', color);
    return color;
}

// Gets the current position and sends it to the server
function getLocation(position) {
    var lat = position.coords.latitude;
    var long = position.coords.longitude;
    var acc = position.coords.accuracy;

    socket.emit('location', { lat: lat, lon: long, acc: acc, col: clientColor, name: clientName, id: clientID });
}

function errorHandler(err) {
    if(err.code == 1) {
        alert('Error: Maybe you don\'t use https.');
    }
    else if( err.code == 2) {
        alert('Error: Maybe your location service isn\'t enabled.');
    }
}

// Watches the current position and updates it
function getLocationUpdate(){
    if(navigator.geolocation){
        var options = {
          enableHighAccuracy: true,
        };
        geoLoc = navigator.geolocation;
        watchID = geoLoc.watchPosition(getLocation, errorHandler, options);
    }
    else{
        alert('Sorry, browser does not support geolocation!');
    }
}

// Gets the current name of the user
function setName(username){
    var name = prompt('Bitte gib deinen Namen ein:', username);

    if (!username){
        username = "Anonymous 👻";
    }

    if(name === null || name === '') {
      name = username;
    }
    localStorage.setItem('name', name);
    return name;
}

var clientID = localStorage.getItem('id') || generateID();
var clientColor = localStorage.getItem('col') || generateColor();
var clientName = localStorage.getItem('name') || setName('');

// Retrieves the information from the server
socket.on('location', function(client){
    var lat = client.lat;
    var lon = client.lon;
    var id = client.id;
    var col = client.col;
    var name = client.name;

    if (!mymap) {
        mymap = L.map('mapid').setView([lat, lon], 16);
        L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
            attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
            maxZoom: 18,
            id: 'mapbox.satellite',
            accessToken: 'pk.eyJ1IjoibWFwYm94MTM0MjM1IiwiYSI6ImNpd3cycWthbTAxa2MyeXBybHYwaXUxeG4ifQ.YkxkHkHwLm3whVsvUwc2fw'
        }).addTo(mymap);
    }

    if (!areasInitialized) {
        areas.push(createAreaOfInterest([47.722932, 13.089180], 30)); // spar
        areas.push(createAreaOfInterest([47.724271, 13.086316], 40)); // fh entrance
        areas.push(createAreaOfInterest([47.723525, 13.087985], 20)); // parking lot
        areas.push(createAreaOfInterest([47.723747, 13.086897], 5)); // fh project room for testing

        areasInitialized = true;
    }

    // Creates the circle marker
    var circle = L.circleMarker([lat, lon], {
        color: col,
        fillOpacity: 0.8,
        radius: 15
    });

    circle.bindPopup(name);

    if (!(id in clients)) {
        // Saves the new generatet circle in an object
        clients[id] = circle.addTo(mymap);
        // Appends the available users to a list
        var userEl = $('<li id="user-' + id + '"></li>').text(name).css('color', col);
        $('#user').append(userEl);
    } else {
        // Updates the position of the circle
        clients[id].setLatLng([lat, lon]).setStyle({color: col});
        $('li#user-' + id).text(name);
    }

    areas.forEach(function(area) {
        var numberOfClientsInArea = 0;
        for (var clientId in clients) {
            if (isInArea(clients[clientId].getLatLng(), area)) {
                numberOfClientsInArea++;
            }

            if (numberOfClientsInArea > 0) {
                area.setStyle({color: '#000000'});
            }
            else {
                area.setStyle({color: '#FFFFFF'});
            }
        }
    });
});

function createAreaOfInterest(circleCenter, circleRadius) {
    var area = L.circle(circleCenter, {
        color: '#FFFFFF',
        fillOpacity: 0.4,
        radius: circleRadius
    });
    area.addTo(mymap);
    return area;
}

function isInArea(position, area) {
    return (position.distanceTo(area.getLatLng()) <= area.getRadius());
}

var areas = [];

$(function() {
    getLocationUpdate();

    $('#user').on('click', function() {
        clientName = setName(clientName);
    });
});
