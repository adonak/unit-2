//initialize function called when the script loads
function initialize(){
	cities();
};

//function to create a table with cities and their populations
function cities(){
	//define arrays with cities and pop
	var cityPop = [
		{ 
			city: 'Madison',
			population: 233209
		},
		{
			city: 'Milwaukee',
			population: 594833
		},
		{
			city: 'Green Bay',
			population: 104057
		},
		{
			city: 'Superior',
			population: 27244
		}
	];

	//create table element
	var table = document.createElement("table");

	//create header and append it to table
	var headerRow = document.createElement("tr");
	table.appendChild(headerRow);

	//create headers for city and population
	headerRow.insertAdjacentHTML("beforeend","<th>City</th><th>Population</th>")
	
	//add each city
    cityPop.forEach(function(cityObject){
		table.insertAdjacentHTML('beforeend',"<tr><td>" + cityObject.city + "</td><td>" + cityObject.population + "</td></tr>");
	})
	
	//append the table element to the div
	document.querySelector("#mydiv").appendChild(table);

    addColumns(cityPop);
    addEvents();

};

//function to add new column to table
function addColumns(cityPop){
    
	//select all column rows
	var rows = document.querySelectorAll("tr")
	//loop to add new column to each row
	document.querySelectorAll("tr").forEach(function(row,i){
		//for first row in the table, add the column header
		if (i == 0){
    		//create new header, add to table
			row.insertAdjacentHTML('beforeend', '<th>City Size</th>');
    	} else {
    		var citySize;

    		if (cityPop[i-1].population < 100000){
    			citySize = 'Small';
    		} else if (cityPop[i-1].population < 500000){
    			citySize = 'Medium';
    		} else {
    			citySize = 'Large';
    		};

			//add new table cell with the city size
    		row.insertAdjacentHTML('beforeend','<td>' + citySize + '</td>');
    	};
	})
};

//function adds random colors to table when mouse hovers over
function addEvents(){
	table = document.querySelector("table");
	document.querySelector("table").addEventListener("mouseover", function(){
		var color = "rgb(";
		for (var i=0; i<3; i++){

			var random = Math.round(Math.random() * 255);
			color += random;

			if (i<2){
				color += ",";
			} else {
				color += ")";
			};
		}
		//style table with the random style
		table.style.color = color;
	}); 

	//function that shows an alert on click
	function clickme(){
		alert('Hey, you clicked me!');
	};

	//event listener for the click
	table.addEventListener("click", clickme)
};

//call the initialize function when the document has loaded
document.addEventListener('DOMContentLoaded',initialize)