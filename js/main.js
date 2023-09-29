// global map variable
var mapWiscTemps;

// function to instantiate Leaflet map object
function createMap(){
    //create map
    mapWiscTemps = L.map('mapWiscTemps', {
        center: [44.4308975, -89.6884637],
        zoom: 7
    });

    //add base tilelayer
    // uses Stadia AlidadeSmooth map
    L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.{ext}', {
	minZoom: 0,
	maxZoom: 20,
	attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	ext: 'png'
	}).addTo(mapWiscTemps);

    //call getData function
    getData();
};

//function to attach popups to each mapped feature
function onEachFeature(feature, layer) {
    //no property named popupContent; instead, create html string with all properties
    var popupContent = "";
    if (feature.properties) {
        //loop to add feature property names and values to html string
        for (var property in feature.properties){
            if (property === 'NAME') {
                popupContent += "<p>" + property + ": " + feature.properties[property] + "</p>";
            }
            if (property.includes('TAVG')) {  // limit table so it only includes the ave temp field
				// format fields so they are more readable
                popupContent += "<p>" + "Ave. Yearly Temp " + property.substring(property.length-4, property.length) + ": " + feature.properties[property] + " F" + "</p>";
            }
        }
        layer.bindPopup(popupContent);
    };
};

//function to retrieve the data and place it on the map
function getData(){
    //load data
    fetch("data/wiscTemps.geojson")
        .then(function(response){
            return response.json();
        })
        .then(function(json){
            //create marker options
            var geojsonMarkerOptions = {
                radius: 10,
                fillColor: "#ffa07a",  //light salmon color
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 1
            };
            //create a Leaflet GeoJSON layer and add it to the map
            L.geoJson(json, {
                pointToLayer: function (feature, latlng){
                    return L.circleMarker(latlng, geojsonMarkerOptions);  // creates circle markers
                },
                onEachFeature: onEachFeature  // adds properties to pop-up
            }).addTo(mapWiscTemps);
        })  
};

document.addEventListener('DOMContentLoaded',createMap);