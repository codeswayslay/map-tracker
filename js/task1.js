(function () {
    //set default position and zoom
    var mymap = L.map('mapid').setView([51.499625, -0.182682], 13);

    //define map layer by view coordinates and zoom
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox.streets',
        accessToken: 'pk.eyJ1IjoiYWtpbi1hLWNvZGVyIiwiYSI6ImNqa2lqcnZpcTAyYWozbGtmNHJwd29vcGQifQ.3ZASIFvafsNuUeK84ZKgwQ',
        //detectRetina: true
    }).addTo(mymap);

    $.get("base_url.txt", function (line) {
        return line;
    }).then(function (line) {
        var payload = $.get(line+"getcoordinates");
        return payload;
    }).then(function (payload) {
        processCoordinatesOnMap(payload);
        return payload;
    }).then(function (payload) {
        loadRisksOnMap(payload);
    }, function () {
        alert("error accessing predina backend API");
    });

    //process coordinates from back-end on map
    var riskPointsLayerGroup = undefined;
    var riskPoints = [];

    var intervalInMilliseconds = 1000;//1000 millisecond for 1 second
    function processCoordinatesOnMap(payload) {

        //run regeneration every second every second
        setInterval(function () {
            //clear all risk points if any exist
            if (riskPointsLayerGroup !== undefined) {
                clearCoordinatesOnMap();
                //console.log("erased coordinates");
            }

            //loop through coordinates and regenerate
            $.each(payload, function (i, coordinate) {
                coordinate.riskRating = getRandomRating(1, 10);
                coordinate.riskColour = getRiskRatingColourCode(coordinate.riskRating).colour;
                var risk = L.circle([coordinate.latitude, coordinate.longitude], {
                    color: coordinate.riskColour,
                    fillColor: coordinate.riskColour,
                    fillOpacity: 0.5,
                    radius: 120
                }).bindPopup("Risk rating: " + coordinate.riskRating);

                riskPoints.push(risk);
            });

            //load risks onto map
            loadRisksOnMap();
        }, intervalInMilliseconds);
    }

    function loadRisksOnMap() {
        riskPointsLayerGroup = L.layerGroup(riskPoints).addTo(mymap);
    }

    function clearCoordinatesOnMap() {
        riskPointsLayerGroup.clearLayers();
        console.log("layer group cleared from map");
    }

    //get randomised rating from 1 to 10
    function getRandomRating(min, max) {
        return Math.floor((Math.random() * max) + min);
    }

    //risk ratings and colours
    var allRatingsColours = [{rating: 1, colour: "#008000"},
        {rating: 2, colour: "#008000"},
        {rating: 3, colour: "#008000"},
        {rating: 4, colour: "#FFFF00"},
        {rating: 5, colour: "#FFFF00"},
        {rating: 6, colour: "#FFA500"},
        {rating: 7, colour: "#FFA500"},
        {rating: 8, colour: "#FF0000"},
        {rating: 9, colour: "#8B0000"},
        {rating: 10, colour: "#8B0000"}];

    //retrieve risk rating and colour according to supplied rating
    function getRiskRatingColourCode(rating) {
        var objToReturn = {};
        $.each(allRatingsColours, function (index, ratingColour) {
            if (rating === ratingColour.rating) {
                objToReturn = ratingColour;
                return false;
            }
        });
        return objToReturn;
    }
}());