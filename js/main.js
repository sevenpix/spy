$(function(){
    if ("geolocation" in navigator) {
        /* geolocation IS available */
        navigator.geolocation.getCurrentPosition(function(position) {

            var lat = position.coords.latitude;
            var long = position.coords.longitude;
            var acc = position.coords.accuracy;

            $('.lat').append(lat);
            $('.long').append(long);

            navigator.vibrate(1000);

        });

    } else {
        /* geolocation IS NOT available */
        console.log("not available");
    }
});