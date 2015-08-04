var testData = {
  max: 8,
  data: [{lat: 24.6408, lng:46.7728, count: 3},{lat: 50.75, lng:-1.55, count: 1}]
};
	
function handleFile() {
	var file = document.getElementById("fileInput").files[0];
	var reader = new FileReader();

	reader.onload = function(e) {
		var text = reader.result;
		var arr = Papa.parse(text,{
			'header':true
		}); //CSV Parser
		updateMap(arr.data);
	}
	reader.readAsText(file);
}

function updateMap(array){
	console.log(array);
	for(var row in array){
		console.log(row["title"]);
	}
}

function initialize() {
	var myLatlng = new google.maps.LatLng(40.4397, -79.9764);
	// map options,
	var myOptions = {
	  zoom: 11,
	  center: myLatlng
	};
	// standard map
	map = new google.maps.Map(document.getElementById("map-canvas"), myOptions);
	// heatmap layer
	heatmap = new HeatmapOverlay(map, 
	  {
		// radius should be small ONLY if scaleRadius is true (or small radius is intended)
		"radius": 2,
		"maxOpacity": 1, 
		// scales the radius based on map zoom
		"scaleRadius": true, 
		// if set to false the heatmap uses the global maximum for colorization
		// if activated: uses the data maximum within the current map boundaries 
		//   (there will always be a red spot with useLocalExtremas true)
		"useLocalExtrema": true,
		// which field name in your data represents the latitude - default "lat"
		latField: 'lat',
		// which field name in your data represents the longitude - default "lng"
		lngField: 'lng',
		// which field name in your data represents the data value - default "value"
		valueField: 'count'
	  }
	);
		heatmap.setData(testData);
}

google.maps.event.addDomListener(window, 'load', initialize);