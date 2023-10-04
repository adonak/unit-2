//declare map variable globally so all functions have access
var mapWiscTemps;
var minValue;

//create map
function createMap(){

    //create the map
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
    getData(mapWiscTemps);
};

function calculateMinValue(data){
    //create empty array to store all data values
    var allValues = [];
    //loop through each city
    for(var NAME of data.features){
        //loop through each year
        for(var year = 2015; year <= 2021; year+=1){
              //get temp for current year
              var value = NAME.properties["TAVG_"+ String(year)];
              console.log(value)
              allValues.push(value)
        }
    }
    //get minimum value of array
    var minValue = Math.min(...allValues)

    return minValue;
}

//calculate radius of each proportional symbol
function calcPropRadius(attValue) {
    //constant factor adjusts symbol sizes evenly
    var minRadius = 8;
    //Flannery Apperance Compensation formula
    var radius = 1.0083 * Math.pow(Number(attValue)/minValue,0.5715) * Number(minRadius)

    return radius;
};

//function to convert markers to circle markers
function pointToLayer(feature, latlng){
    //Determine which attribute to visualize with proportional symbols
    var attribute = "TAVG_2015";

    //create marker options
    var options = {
        fillColor: "#ff7800",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };

    //For each feature, determine its value for the selected attribute
    var attValue = Number(feature.properties[attribute]);

    //Give each feature's circle marker a radius based on its attribute value
    options.radius = calcPropRadius(attValue);

    //create circle marker layer
    var layer = L.circleMarker(latlng, options);

    //build popup content string
    var popupContent = "<p><b>Weather Station:</b> " + feature.properties.NAME + "</p><p><b>" + "Ave. Temp. " + attribute.slice(-4) + ":</b> " + feature.properties[attribute] + "</p>";

    //bind the popup to the circle marker
    layer.bindPopup(popupContent);

    //return the circle marker to the L.geoJson pointToLayer option
    return layer;
};


//Add circle markers for point features to the map
function createPropSymbols(data){
    //create a Leaflet GeoJSON layer and add it to the map
    L.geoJson(data, {
        pointToLayer: pointToLayer
    }).addTo(mapWiscTemps);
};


//Import GeoJSON data
function getData(){
    //load the data
    fetch("data/wiscTemps.geojson")
        .then(function(response){
            return response.json();
        })
        .then(function(json){
            //calculate minimum data value
            minValue = calculateMinValue(json);
            //call function to create proportional symbols
            createPropSymbols(json);
        })
};

document.addEventListener('DOMContentLoaded',createMap)