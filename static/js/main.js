var heatmap;
var map;
var minSavings = 0;
var info;

/* update map values on slider change */
function updateSlider() {
	if(typeof info !== 'undefined') { //if file has not been uploaded yet
		var val = $("#slider").val();
		$('#title').html("Homes with energy savings potential greater than $"+val);
		var newInfo = {
			max: info.max,
			data: []
		};
		for(var i = 0; i < info.data.length; i ++){
			if(info.data[i].savings > val){
				newInfo.data.push(info.data[i]);
			}
		}
		heatmap.setData(newInfo);
	}
}

/* get new file from upload, update map */
function handleFile() {
	var file = document.getElementById("fileInput").files[0];
	var reader = new FileReader();

	reader.onload = function(e) {
		var text = $.trim(reader.result);
		var arr = Papa.parse(text,{
			'header':true
		}); //CSV Parser
		updateMap(arr.data);
	}
	reader.readAsText(file);
}

/* update heatmap with new file upload */
function updateMap(array){
	var max = 0;
	var min = 1000000;
	for(var i = 0; i < array.length; i ++){
		array[i].savings = Number(array[i].savings.replace(/[^0-9\.]+/g,"")); //clean monetary values
		array[i].lat = Number(array[i].lat); //clean data
		array[i].long = Number(array[i].long); 
		if(array[i].savings > max){ //get max savings value
			max = array[i].savings;
		}
		if(array[i].savings < min){ //get min savings value
			min = array[i].savings;
		}
	}
	info = {
		max: max,
		data: array
	};
	max = Math.round(max / 10) * 10;
	min = Math.round(min / 10) * 10;
	$('#slider').attr('max',max); //round numbers for slider values
	$('#slider').attr('min',min);
	$('#minLabel').html('$'+min); //set slider labels
	$('#maxLabel').html('$'+max);

	var mapInfo = avgCoords(array); //get object here and use it to zet zoom / location of MAP api
	var center = new google.maps.LatLng(mapInfo.latAvg,mapInfo.lonAvg);
	map.setCenter(center);
	var zoom = getZoom(mapInfo);
	map.setZoom(zoom);
	heatmap.setData(info);
	updateSlider();

}

/* initialize map & heatmap */
function initialize() {
	var options = {
		zoom: 3,
		center: new google.maps.LatLng(40,-100)
	};
	map = new google.maps.Map(document.getElementById("map-canvas"), options);
	heatmap = new HeatmapOverlay(map, 
	{
		"radius": 20,
		"maxOpacity": 1,
		"scaleRadius": false, 
		"useLocalExtrema": true,
		latField: 'lat',
		lngField: 'long',
		valueField: 'savings'
	}
	);
	initCanvas();
}

google.maps.event.addDomListener(window, 'load', initialize);

/* fill canvas color canvas-gradie nt*/
function initCanvas() {
	var c = document.getElementById("canvas-gradient");
	var ctx = c.getContext("2d");
	var ht = .6 * $(window).height();
	var grd=ctx.createLinearGradient(0,0,30,60);
	grd.addColorStop(0,"red");
	grd.addColorStop(.25,"orange");
	grd.addColorStop(.5,"yellow");
	grd.addColorStop(.75,"green");
	grd.addColorStop(1,"blue");

	ctx.fillStyle=grd;
	ctx.fillRect(0,0,30,60);
}

/* returns average of coordinates as [avg_lattitude,avg_longitude] */
function avgCoords(data) {
	var lat = 0;
	var lon = 0;
	var latMin = 500;
	var latMax = 0;
	var lonMin = 500;
	var lonMax = 0;
	for(var i = 0; i < data.length; i ++) {
		lat += data[i].lat;
		lon += data[i].long;
		if(data[i].lat < latMin) latMin = data[i].lat;
		if(data[i].lat > latMax) latMax = data[i].lat;
		if(data[i].long < lonMin) lonMin = data[i].long;
		if(data[i].long > lonMax) lonMax = data[i].long;
	}
	var lo= lon*1.0/data.length;
	var la = lat*1.0/data.length;
	var latRange = latMax - latMin;
	var lonRange = lonMax - lonMin;
	var res = {
		latAvg: la,
		lonAvg: lo,
		latRng: latRange,
		lonRng: lonRange
	}
	return res;
}

function getZoom(info) {
	return parseInt(((info.latRng + info.lonRng)/2)/15 + 9,10);
}




