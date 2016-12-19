if ("geolocation" in navigator) {
    console.log("available");
    navigator.geolocation.getCurrentPosition(function(position) {
        console.log(position.coords.latitude, position.coords.longitude);
    });
} else {
    /* geolocation IS NOT available */
    console.log("not available");
}