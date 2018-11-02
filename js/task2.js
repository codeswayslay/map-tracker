(function () {
    //set default position and zoom 52.199317, -0.736084), and zoom level 9
    var mymap = L.map('mapid').setView([52.199317, -0.736084], 9);

    //define map layer by view coordinates and zoom
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox.streets',
        accessToken: 'pk.eyJ1IjoiYWtpbi1hLWNvZGVyIiwiYSI6ImNqa2lqcnZpcTAyYWozbGtmNHJwd29vcGQifQ.3ZASIFvafsNuUeK84ZKgwQ',
        //initZoom: 10,
        //minZoom: 10,
        //maxZoom: 10
    }).addTo(mymap);

    $.get("base_url.txt", function (line) {
        return line;
    }).then(function (line) {
        var payload = $.get(line+"getvehiclelocations");
        return payload;
    }).
    then(function (payload) {
        loadRoutes(payload);
        return vehicleInfos;
    }).then(function (vehicleInfos) {
        loadVehiclesOnMap(vehicleInfos);
        return markers;
    }).then(function (markers) {
        startAnimation(markers)
    }, function () {
        alert("error accessing predina backend API");
    });

    //load route lines for all
    var vehicleInfos = [];
    function loadRoutes(payload) {
        $.each(payload, function (i, vehicle) {
            var routes = [];
            var vehicleInfo = {name: "", routes: undefined};

            var name = vehicle.vehicle;
            var locations = vehicle.locations;

            vehicleInfo.name = name;
            console.log("name: " + name);

            var polylineArray = [];
            $.each(locations, function (j, location) {
                var locationArray = [];
                locationArray.push(location.latitude);
                locationArray.push(location.logitude);
                polylineArray.push(locationArray);
            });

            var polyline = L.polyline(polylineArray);
            routes.push(polyline);

            vehicleInfo.routes = routes;
            vehicleInfos.push(vehicleInfo);

        });
    }

    var vehicleIcon = L.AwesomeMarkers.icon({
        icon: 'car',
        //iconSize: [25, 39],
        //iconAnchor: [12, 39],
        iconColor: 'white',
        prefix: 'fa',
        markerColor: 'yellow'
    });

    var markers = [];
    function loadVehiclesOnMap(vehicleInfos) {
        $.each(vehicleInfos, function (i, vehicleInfo) {
            var info = vehicleInfo.name;
            var routes = vehicleInfo.routes;

            $.each(routes, function (j, routeLine) {
                var marker = L.animatedMarker(routeLine.getLatLngs(), {
                    icon: vehicleIcon,
                    autoStart: false,
                    distance: 100,
                    interval: 200,
                    onEnd: function () {
                        $(this._shadow).fadeOut();
                        $(this._icon).fadeOut(5000, function () {
                            mymap.removeLayer(this);
                        });
                    }
                });
                mymap.addLayer(marker);
                marker.bindPopup("hey! I'm " + info);
                markers.push(marker);
            });

        });
        console.log("how many markers: " + markers.length);
    }

    function startAnimation(markers) {
        $.each(markers, function (i, marker) {
            marker.start();
        })
    }

    var popup2 = L.popup();
    function onMapClick(e) {
        popup2
            .setLatLng(e.latlng)
            .setContent("You clicked the map at " + e.latlng.toString() + ", and zoom level " + mymap.getZoom())
            .openOn(mymap);
    }

    mymap.on('click', onMapClick);
}());