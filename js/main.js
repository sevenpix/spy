$(function(){
    if ("geolocation" in navigator) {
        /* geolocation IS available */
        navigator.geolocation.getCurrentPosition(function(position) {

            var lat = position.coords.latitude;
            var long = position.coords.longitude;

            $('.lat').append(lat);
            $('.long').append(long);

        });

    } else {
        /* geolocation IS NOT available */
        console.log("not available");
    }
});