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
function pointToLayer(feature, latlng, attributes){
    //Determine which attribute to visualize with proportional symbols
    var attribute = attributes[0];

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
    var popupContent = "<p><b>Weather Station:</b> " + feature.properties.NAME + "</p><p><b>" + "Ave Temp in " + attribute.slice(-4) + ":</b> " + feature.properties[attribute] + " F" + "</p>";

    //bind the popup to the circle marker
    layer.bindPopup(popupContent);

    //return the circle marker to the L.geoJson pointToLayer option
    return layer;
};


//Add circle markers for point features to the map
function createPropSymbols(data, attributes){
    //create a Leaflet GeoJSON layer and add it to the map
    L.geoJson(data, {
        pointToLayer: function(feature, latlng){
            return pointToLayer(feature, latlng, attributes);
        }
    }).addTo(mapWiscTemps);
};

function createSequenceControls(attributes){
    //create range input element (slider)
    var slider = "<input class='range-slider' type='range'></input>";
    document.querySelector("#panel").insertAdjacentHTML('beforeend',slider);

    //set slider attributes
    document.querySelector(".range-slider").max = 6;
    document.querySelector(".range-slider").min = 0;
    document.querySelector(".range-slider").value = 0;
    document.querySelector(".range-slider").step = 1;

    // add step buttons
    document.querySelector('#panel').insertAdjacentHTML('beforeend','<button class="step" id="reverse"></button>');
    document.querySelector('#panel').insertAdjacentHTML('beforeend','<button class="step" id="forward"></button>');

    //add icons to directional buttons
    document.querySelector('#reverse').insertAdjacentHTML('beforeend',"<img src='img/reverse.svg'>")
    document.querySelector('#forward').insertAdjacentHTML('beforeend',"<img src='img/forward.svg'>") 

    // click listener for buttons
    document.querySelectorAll('.step').forEach(function(step){
        step.addEventListener("click", function(){
            var index = document.querySelector('.range-slider').value;

            //increment or decrement depending on button clicked
            if (step.id == 'forward'){
                index++;
                // if past the last attribute, wrap around to first attribute
                index = index > 6 ? 0 : index;
            } else if (step.id == 'reverse'){
                index--;
                // if past the first attribute, wrap around to last attribute
                index = index < 0 ? 6 : index;
            };

            //update slider
            document.querySelector('.range-slider').value = index;

            // pass new attribute to update symbols
            updatePropSymbols(attributes[index]);
        })

    })

    // input listener for slider
    document.querySelector('.range-slider').addEventListener('input', function(){            
        var index = this.value;
        // pass new attribute to update symbols
        updatePropSymbols(attributes[index]);
    });
};

// build attributes array from data
function processData(data){
    //empty array to hold attributes
    var attributes = [];

    //properties of the first feature in the dataset
    var properties = data.features[0].properties;

    //push each attribute name into attributes array
    for (var attribute in properties){
        //only take attributes with avg temp values
        if (attribute.indexOf("TAVG") > -1){
            attributes.push(attribute);
        };
    };

    return attributes;
};

//Resize proportional symbols according to new attribute values
function updatePropSymbols(attribute){
    mapWiscTemps.eachLayer(function(layer){
        if (layer.feature && layer.feature.properties[attribute]){
            //access feature properties
            var props = layer.feature.properties;

            //update each feature's radius based on new attribute values
            var radius = calcPropRadius(props[attribute]);
            layer.setRadius(radius);

            //add city to popup content string
            var popupContent = "<p><b>City:</b> " + props.NAME + "</p>";

            //add formatted attribute to panel content string
            var year = attribute.split("_")[1];
            popupContent += "<p><b>Ave Temp in " + year + ":</b> " + props[attribute] + " F</p>";

            //update popup content            
            popup = layer.getPopup();            
            popup.setContent(popupContent).update();
        };
    });
};


//Import GeoJSON data
function getData(){
    //load the data
    fetch("data/wiscTemps.geojson")
        .then(function(response){
            return response.json();
        })
        .then(function(json){
            // create attribute array
            var attributes = processData(json);
            //calculate minimum data value
            minValue = calculateMinValue(json);
            //call function to create proportional symbols
            createPropSymbols(json, attributes);
            // call function to create slider control
            createSequenceControls(attributes);
        })
};

document.addEventListener('DOMContentLoaded',createMap)