/**
 * @Author: Ankith Ravindran <ankithravindran>
 * @Date:   2021-12-02T13:00:48+11:00
 * @Filename: mp_cl_lastmile_suburb_selection.js
 * @Last modified by:   ankithravindran
 * @Last modified time: 2022-01-13T13:04:22+11:00
 */



var geojson;
var geojson2;
var map;
var info;

var categories = {},
	category;

var overlaysObj = {},
	categoryName,
	categoryArray,
	categoryLG;

var allPointsLG;

var stateLG = [];

var selected_areas = [];
var deleted_areas = [];

var basemapsObj = {};

var partner_state;
var partner_location;
var same_day;
var next_day;

var finalDeletedAreas = []
var intitalLocation = [];

var baseURL = 'https://1048144.app.netsuite.com';
if (nlapiGetContext().getEnvironment() == "SANDBOX") {
	baseURL = 'https://system.sandbox.netsuite.com';
}

function afterLoad() {
	$(".se-pre-con").fadeOut("slow");
}


function pageInit() {

	$("#NS_MENU_ID0-item0").css("background-color", "#CFE0CE");
	$("#NS_MENU_ID0-item0 a").css("background-color", "#CFE0CE");
	$("#body").css("background-color", "#CFE0CE");

	partner_state = (nlapiGetFieldValue('partner_state'));
	var codes = (nlapiGetFieldValue('partner_location'));

	same_day = nlapiGetFieldValue('same_day');
	next_day = nlapiGetFieldValue('next_day');
	if (!isNullorEmpty(same_day)) {
		same_day = same_day.split(',');
	}

	if (!isNullorEmpty(next_day)) {
		next_day = next_day.split(',');
	}



	if (!isNullorEmpty(codes)) {

		partner_location = codes.split(',');
	}
	console.log(partner_location);

	map = L.map('map', {
		zoomControl: false
	}).setView([-27.833, 133.583], 4);

	// var customLayer = L.geoJson(null, {
	// 	// http://leafletjs.com/reference.html#geojson-style
	// 	style: function(feature) {
	// 		return {
	// 			weight: 2,
	// 			color: '#666',
	// 			dashArray: '',
	// 			fillOpacity: 0.7,
	// 			fillColor: '#5cb85c'
	// 		};
	// 	}
	// });

	// omnivore.kml('https://1048144.app.netsuite.com/core/media/media.nl?id=1318421&c=1048144&h=4fc1e382ffe48f5cde34&mv=ibvx69x4&_xt=.txt&whence=', null, customLayer).addTo(map);

	$.getJSON(
		"https://1048144.app.netsuite.com/core/media/media.nl?id=2080754&c=1048144&h=a14f4ecbf9986cff6fb1&_xt=.js",
		function(data) {

			console.log(data)

			// add GeoJSON layer to the map once the file is loaded
			geojson2 = L.geoJson(data, {
				style: style2,
				// filter: layerFilter2,
				onEachFeature: onEachFeature
			});
			// afterLoad();
			ready(data);
		});


}

$(document).on('change', '.zee_dropdown', function(event) {
	var zee = $(this).val();

	var url = baseURL + "/app/site/hosting/scriptlet.nl?script=1401&deploy=1";

	url += "&zee=" + zee + "";

	window.location.href = url;
});

function ready(data) {

	// remove the loader div from the DOM
	$('#loader').remove();

	// map = L.map('map').setView([-27.833, 133.583], 4);
	L.tileLayer(
		'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
			attribution: '� OpenStreetMap',
			id: 'mapbox.light'
		}).addTo(map);



	var GoogleSearch = L.Control.extend({
		onAdd: function() {
			var element = document.createElement("input");

			element.id = "searchBox";

			return element;
		}
	});

	(new GoogleSearch({
		position: 'topleft'
	})).addTo(map);



	$("#searchBox").addClass('form-control');
	$("#searchBox").attr("placeholder", "SEARCH");
	$("#searchBox").css("width", "150%");

	var input = document.getElementById("searchBox");

	var searchBox = new google.maps.places.SearchBox(input);

	searchBox.addListener('places_changed', function() {
		var places = searchBox.getPlaces();

		if (places.length == 0) {
			return;
		}

		var group = L.featureGroup();

		places.forEach(function(place) {

			// Create a marker for each place.
			console.log(places);
			console.log(place.geometry.location.lat() + " / " + place.geometry.location
				.lng());
			var marker = L.marker([
				place.geometry.location.lat(),
				place.geometry.location.lng()
			]);
			group.addLayer(marker);
		});

		group.addTo(map);
		map.fitBounds(group.getBounds());
		map.setZoom(12);
		$("#searchBox").val('');
	});

	info = L.control();

	info.onAdd = function(map) {
		this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
		this.update();
		return this._div;
	};

	info.update = function(props) {
		this._div.innerHTML = '<h5>Suburb Name</h5>' + (props ?
			'<b>' + props.SSC_NAME16 + '</b><br />' : 'Hover over a suburb');
	};

	info.addTo(map);

	console.log(categories)
	console.log(categoryName)

	for (categoryName in categories) {
		categoryArray = categories[categoryName];
		categoryLG = L.featureGroup(categoryArray);
		categoryLG.categoryName = categoryName;
		overlaysObj[categoryName] = categoryLG;
	}

	var allPointsLG = L.layerGroup();
	overlaysObj["All Points"] = allPointsLG;

	var control = L.control.layers(basemapsObj, overlaysObj).addTo(map);

	overlaysObj[partner_state].addTo(map);

	// console.log(overlaysObj[partner_state])
	// map.fitBounds(overlaysObj[partner_state].getBounds())

	map.on("overlayadd overlayremove", function(event) {

		var layer = event.layer,
			layerCategory;

		if (layer === allPointsLG) {
			if (layer.notUserAction) {
				// allPointsLG has been removed just to sync its state with the fact that at least one
				// category is not shown. This event does not come from a user un-ticking the "All points" checkbox.
				layer.notUserAction = false;
				return;
			}
			// Emulate addition / removal of all category LayerGroups when allPointsLG is added / removed.
			for (var categoryName in overlaysObj) {
				if (categoryName !== "All Points") {
					if (event.type === "overlayadd") {
						overlaysObj[categoryName].addTo(map);
						map.fitBounds(overlaysObj[categoryName].getBounds())
					} else {
						map.removeLayer(overlaysObj[categoryName]);
					}
				}
			}
			control._update();
		} else if (layer.categoryName && layer.categoryName in overlaysObj) {
			if (event.type === "overlayadd") {
				// Check if all categories are shown.
				for (var categoryName in overlaysObj) {
					layerCategory = overlaysObj[categoryName];
					if (categoryName !== "All Points" && !layerCategory._map) {
						// At least one category is not shown, do nothing.
						return;
					}
				}
				allPointsLG.addTo(map);
				control._update();
			} else if (event.type === "overlayremove" && allPointsLG._map) {
				// Remove allPointsLG as at least one category is not shown.
				// But register the fact that this is purely for updating the checkbox, not a user action.
				allPointsLG.notUserAction = true;
				map.removeLayer(allPointsLG);
				control._update();
			}
		}
	});

	new L.Control.Zoom({
		position: 'bottomleft'
	}).addTo(map);

}



function layerFilter(feature) {

	if (feature.properties.SSC_CODE16 == partner_location) return true
}

function layerFilter2(feature) {
	if (feature.properties.STE_NAME16 == "Australian Capital Territory") {
		// var index = $.inArray(feature.properties.SSC_CODE16, partner_location);
		// if (index != -1) {
		return true;
		// }
	}
}


function getColor(d) {
	return d > 300 ? '#800026' :
		d > 150 ? '#BD0026' :
		d > 100 ? '#E31A1C' :
		d > 70 ? '#FC4E2A' :
		d > 50 ? '#FD8D3C' :
		d > 20 ? '#FEB24C' :
		d > 10 ? '#FED976' :
		'#FFEDA0';
}

function style2(feature) {
	return {
		fillColor: '#FD8D3C',
		weight: 2,
		opacity: 1,
		color: 'white',
		dashArray: '3',
		fillOpacity: 0.7
	};
}

function style(feature) {
	return {
		fillColor: getColor(feature.properties.AREASQKM16),
		weight: 2,
		opacity: 1,
		color: 'white',
		dashArray: '3',
		fillOpacity: 0.7
	};
}

function onEachFeature(feature, layer) {
	console.log(layer);
	var state_name = feature.properties.STE_NAME16;
	var suburb = feature.properties.SSC_NAME16;
	var zipcode = feature.properties.SSC_CODE16;

	var index = $.inArray(suburb, partner_location);
	var count = 0;

	if (index != -1) {
		layer.setStyle({
			weight: 2,
			color: '#666',
			dashArray: '',
			fillOpacity: 0.7,
			fillColor: '#5cb85c'
		});

		console.log(layer)

		count++;
		if (count == 1) {
			map.fitBounds(layer.getBounds());
		}


		selected_areas[zipcode] = state_name;

		var inlineQty = '';
		inlineQty += '<tr>';
		inlineQty +=
			'<td><button class="btn btn-danger btn-sm remove_class glyphicon glyphicon-trash" type="button" data-toggle="tooltip" data-placement="right" title="Delete"></button></td><td class="suburb_name">' +
			suburb + '</td><td class="state_name">' + state_name +
			'</td><input type="hidden" class="state_code" value="' + suburb + '" />';
		inlineQty += '</tr>';
		$('#network_map tr:last').after(inlineQty);
		deleted_areas[zipcode] = layer;
	}

	// layer.bindPopup(suburb);
	category = state_name;

	// if (feature.properties.STE_NAME16 == "Australian Capital Territory") {
	// Initialize the category array if not already set.
	if (typeof categories[category] === "undefined") {
		categories[category] = [];
	}

	categories[category].push(layer);

	layer.on({
		mouseover: highlightFeature,
		mouseout: resetHighlight,
		click: zoomToFeature
	});
	// }
}

function zoomToFeature(e) {
	// map.fitBounds(e.target.getBounds());

	var layer = e.target;

	layer.setStyle({
		weight: 2,
		color: '#666',
		dashArray: '',
		fillOpacity: 0.7,
		fillColor: '#5cb85c'
	});

	// var state_code = layer.feature.properties.SSC_CODE16;
	var state_name = layer.feature.properties.STE_NAME16;
	var suburb = layer.feature.properties.SSC_NAME16;
	var zipcode = layer.feature.properties.SSC_CODE16;

	console.log(layer);

	if (isNullorEmpty(selected_areas[zipcode])) {
		selected_areas[zipcode] = state_name;
		var inlineQty = '';
		inlineQty += '<tr>';
		inlineQty +=
			'<td><button class="btn btn-danger btn-sm remove_class glyphicon glyphicon-trash" type="button" data-toggle="tooltip" data-placement="right" title="Delete"></button></td><td class="suburb_name">' +
			suburb + '</td><td class="state_name">' + state_name +
			'</td><input type="hidden" class="state_code" value="' + suburb + '" />';
		inlineQty += '</tr>';
		$('#network_map tr').eq(1).after(inlineQty);
		deleted_areas[zipcode] = layer;
	} else {
		geojson2.resetStyle(e.target);
		var $rowsNo = $('#network_map tbody tr').filter(function() {
			return $.trim($(this).find('td').eq(1).text()) == suburb
		}).remove();
		delete selected_areas[zipcode];
		finalDeletedAreas[finalDeletedAreas.length] = suburb
	}
}

$(document).on('click', '.remove_class', function(event) {


	var zipcode = $(this).closest('tr').find('.state_code').val();
	var layer = $(this).closest('tr').find('.target').val();
	$(this).closest("tr").remove();

	if (!isNullorEmpty(selected_areas[zipcode])) {
		delete selected_areas[zipcode];
		finalDeletedAreas[finalDeletedAreas.length] = zipcode
		geojson2.resetStyle(deleted_areas[zipcode]);
	}
});


function resetHighlight(e) {
	var layer = e.target;

	var zipcode = layer.feature.properties.SSC_CODE16;

	if (isNullorEmpty(selected_areas[zipcode])) {
		geojson2.resetStyle(e.target);
	}

	info.update();
}

function highlightFeature(e) {
	var layer = e.target;

	var zipcode = layer.feature.properties.SSC_CODE16;

	if (isNullorEmpty(selected_areas[zipcode])) {
		layer.setStyle({
			weight: 2,
			color: '#428bca',
			dashArray: '',
			fillOpacity: 0.7,
			fillColor: '#FFEDA0'
		});
	}



	if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
		layer.bringToFront();
	}

	info.update(layer.feature.properties);
}

function saveRecord() {

	var code_elem = document.getElementsByClassName("state_code");
	// var same_day_elem = document.getElementsByClassName("same_day_rate");
	// var next_day_elem = document.getElementsByClassName("next_day_rate");
	var code = [];
	var same_day_array = [];
	var next_day_array = [];
	var deletes_suburbs = []

	var newSuburbsAdded = [];

	for (var i = 0; i < code_elem.length; ++i) {
		code[i] = code_elem[i].value;
		// same_day_array[i] = same_day_elem[i].value;
		// next_day_array[i] = next_day_elem[i].value;
		if (intitalLocation.indexOf(code_elem[i].value) === -1) {
			newSuburbsAdded[newSuburbsAdded.length] = code_elem[i].value;
		}
	}

	console.log('intitalLocation: ' + intitalLocation);
	console.log('finalDeletedAreas: ' + finalDeletedAreas);
	console.log('newSuburbsAdded: ' + newSuburbsAdded);
	console.log('On save Locations: ' + code);

	finalDeletedAreas = finalDeletedAreas.filter(function(item, pos) {
		return finalDeletedAreas.indexOf(item) == pos;
	});


	console.log('finalDeletedAreas: ' + finalDeletedAreas);

	var message = "Last-Mile suburb selections change:</br></br>";
	message += "<b>Deleted Suburbs</b>: " + finalDeletedAreas + "</br>";
	message += "<b>New Suburbs</b>: " + newSuburbsAdded + "</br>";


	nlapiSendEmail(409635, ['fiona.harrison@mailplus.com.au'],
		'Last-Mile Suburb Addition/Removal - ' + nlapiGetFieldValue('name'),
		message, ['ankith.ravindran@mailplus.com.au', 'claude.busse@mailplus.com.au']
	)

	var total_array = code.toString();

	var strs = [];
	var text_field_length = 300

	// while (total_array.length >= text_field_length) {
	// 	var pos = (total_array.substring(0, text_field_length).lastIndexOf(','));
	// 	pos = pos <= text_field_length ? (text_field_length + 1) : pos;
	// 	strs.push(total_array.substring(0, pos));
	// 	var i = total_array.indexOf(',', pos) + 1;
	// 	if (i < pos || i > pos + text_field_length) {
	// 		i = pos;
	// 	}
	// 	total_array = total_array.substring(i);
	// }
	// strs.push(total_array);

	// console.log(strs);


	console.log(total_array)
		// console.log(same_day_array)
		// console.log(next_day_array)


	nlapiSetFieldValue('code_array', total_array);
	// nlapiSetFieldValue('same_day_array', same_day_array.toString());
	// nlapiSetFieldValue('next_day_array', next_day_array.toString());
	// if (!isNullorEmpty(strs[1])) {
	// 	nlapiSetFieldValue('code_array2', strs[1]);
	// }
	// if (!isNullorEmpty(strs[2])) {
	// 	nlapiSetFieldValue('code_array3', strs[2]);
	// }

	return true;

}
