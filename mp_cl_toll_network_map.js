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

var baseURL = 'https://1048144.app.netsuite.com';
if (nlapiGetContext().getEnvironment() == "SANDBOX") {
    baseURL = 'https://system.sandbox.netsuite.com';
}

var days_of_week = [];
days_of_week[0] = 0;
days_of_week[1] = 'custrecord_service_freq_day_mon';
days_of_week[2] = 'custrecord_service_freq_day_tue';
days_of_week[3] = 'custrecord_service_freq_day_wed';
days_of_week[4] = 'custrecord_service_freq_day_thu';
days_of_week[5] = 'custrecord_service_freq_day_fri';
days_of_week[6] = 6;

function calcRoute() {
    var start = document.getElementById('start').value;
    var end = document.getElementById('end').value;
    var request = {
        origin: start,
        destination: end,
        travelMode: 'DRIVING'
    };
    directionsService.route(request, function(response, status) {
        if (status == 'OK') {
            directionsDisplay.setDirections(response);
        }
    });
}

var map;
var searchBox;


function clientPageInit(type) {

    $('#loader').remove();
    var zeeRecord;
    var zeeState = null;

    if (isNullorEmpty(nlapiGetFieldValue('zee'))) {
        zee = 0;
    } else {
        zee = parseInt(nlapiGetFieldValue('zee'));
        zeeRecord = nlapiLoadRecord('partner', zee);
        zeeState = zeeRecord.getFieldValue('location');
        console.log(zeeState);
    }
    // var zeeRecord = nlapiLoadRecord('partner', 228329);
    // var stop_freq_json = zeeRecord.getFieldValue('custentity_zee_run', stop_freq_json);
    var image = 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png';

    //if (zee != 0) {

    var zee_lodgement_postcode;
    var zee_lodgement_ncl_ids = [];

    var zeeTollPoints = nlapiLoadSearch('partner', 'customsearch_zee_toll_points');

    if (zee != 0) {
        var newFilters2 = new Array();
        newFilters2[newFilters2.length] = new nlobjSearchFilter('internalid', null, 'anyof', zee);
        zeeTollPoints.addFilters(newFilters2);
    }


    var resultSet2 = zeeTollPoints.runSearch();

    var ncl_locations_json = '{ "data": [';

    resultSet2.forEachResult(function(searchResult2) {

        console.log('Inside 2nd search for Zee ' + zee);
        console.log('Inside 2nd search for Zee ' + searchResult2.getValue('internalid'));
        console.log('Inside 2nd search for Zee ' + searchResult2.getValue('entityid'));
        zee_id = searchResult2.getValue('internalid');
        zee_name = searchResult2.getValue('entityid');
        zee_pickup = searchResult2.getValue('custentity__toll_pickup_dx_no');
        zee_pickup_zip = searchResult2.getValue("custrecord_ap_lodgement_postcode", "CUSTENTITY__TOLL_PICKUP_DX_NO", null);

        zee_lodge = searchResult2.getValue('custentity_toll_lodge_dx_no');
        zee_lodge_text = searchResult2.getText('custentity_toll_lodge_dx_no');
        zee_lodge_zip = searchResult2.getValue("custrecord_ap_lodgement_postcode", "CUSTENTITY_TOLL_LODGE_DX_NO", null);
        zee_lodge_lat = searchResult2.getValue("custrecord_ap_lodgement_lat", "CUSTENTITY_TOLL_LODGE_DX_NO", null);
        zee_lodge_lon = searchResult2.getValue("custrecord_ap_lodgement_long", "CUSTENTITY_TOLL_LODGE_DX_NO", null);
        zee_lodge_type = searchResult2.getValue("custrecord_noncust_location_type", "CUSTENTITY_TOLL_LODGE_DX_NO", null);
        zee_lodge_type_text = searchResult2.getText("custrecord_noncust_location_type", "CUSTENTITY_TOLL_LODGE_DX_NO", null);


        zee_lodgement_lat = zee_lodge_lat;
        zee_lodgement_lon = zee_lodge_lon;
        zee_lodgement_postcode = zee_lodge_zip;
        ncl_locations_json += '{"id": "' + zee_lodge + '",';
        ncl_locations_json += '"lat": "' + zee_lodge_lat + '",';
        ncl_locations_json += '"lon": "' + zee_lodge_lon + '",';
        ncl_locations_json += '"title": "' + zee_lodge_text + ' ( Zee Name: ' + zee_name + ')",';
        ncl_locations_json += '"type": "' + zee_lodge_type + '",';
        ncl_locations_json += '"type_text": "' + zee_lodge_type_text + '",';
        ncl_locations_json += '"color": "#3a87ad",';
        ncl_locations_json += '"zee_lodge": "yes",';
        ncl_locations_json = ncl_locations_json.substring(0, ncl_locations_json.length - 1);
        ncl_locations_json += '},';
        zee_lodgement_ncl_ids[zee_lodgement_ncl_ids.length] = zee_lodge;

        return true;

    });
    var nonCustomerLocations = nlapiLoadSearch('customrecord_ap_lodgment_location', 'customsearch_app_lodgement_location_2');

    // var day = moment().day();
    var date = new Date();
    date = nlapiDateToString(date);

    var newFilters = new Array();
    if (!isNullorEmpty(zeeState)) {
        newFilters[newFilters.length] = new nlobjSearchFilter('custrecord_ap_lodgement_site_state', null, 'anyof', zeeState);
    }
    newFilters[newFilters.length] = new nlobjSearchFilter('custrecord_noncust_location_type', null, 'anyof', [2, 12, 13, 14]);



    nonCustomerLocations.addFilters(newFilters);

    var resultSet = nonCustomerLocations.runSearch();

    var ncl_id;
    var ncl_name;
    var ncl_add1;
    var ncl_add2;
    var ncl_suburb;
    var ncl_zip;
    var ncl_state
    var ncl_lat;
    var ncl_lon;
    var ncl_type;
    var address;

    var zee_lodgement_lat;
    var zee_lodgement_lon;
    var zee_lodgement_type;



    console.log('Outside 1st search');

    resultSet.forEachResult(function(searchResult) {

        ncl_id = searchResult.getValue('internalid');
        ncl_name = searchResult.getValue('name');
        ncl_type = searchResult.getValue('custrecord_noncust_location_type');
        ncl_type_text = searchResult.getText('custrecord_noncust_location_type');
        ncl_add1 = searchResult.getValue('custrecord_ap_lodgement_addr1');
        ncl_add2 = searchResult.getValue('custrecord_ap_lodgement_addr2');
        ncl_suburb = searchResult.getValue('custrecord_ap_lodgement_suburb');
        ncl_state = searchResult.getValue('custrecord_ap_lodgement_site_state');
        ncl_zip = searchResult.getValue('custrecord_ap_lodgement_postcode');
        ncl_lat = searchResult.getValue('custrecord_ap_lodgement_lat');
        ncl_lon = searchResult.getValue('custrecord_ap_lodgement_long');


        if (ncl_type == 2) {
            var bg_color = '#108372'; //#108372 TOLL
        } else if (ncl_type == 1) {
            var bg_color = '#F15628'; //#F15628 AP
        }

        if (zee_lodgement_ncl_ids.indexOf(ncl_id) === -1) {
            ncl_locations_json += '{"id": "' + ncl_id + '",';
            ncl_locations_json += '"lat": "' + ncl_lat + '",';
            ncl_locations_json += '"lon": "' + ncl_lon + '",';
            ncl_locations_json += '"title": "' + ncl_name + '",';
            ncl_locations_json += '"type": "' + ncl_type + '",';
            ncl_locations_json += '"type_text": "' + ncl_type_text + '",';
            ncl_locations_json += '"color": "' + bg_color + '",';
            ncl_locations_json += '"zee_lodge": "no",';


            ncl_locations_json = ncl_locations_json.substring(0, ncl_locations_json.length - 1);
            ncl_locations_json += '},'
        }


        return true;
    });

    console.log('End of 1st search');



    ncl_locations_json = ncl_locations_json.substring(0, ncl_locations_json.length - 1);
    ncl_locations_json += ']}';

    console.log(ncl_locations_json);

    var parsedStopFreq = JSON.parse(ncl_locations_json);

    console.log(parsedStopFreq.data.length);

    var stops_number = parsedStopFreq.data.length;
    var stops_number_temp = 0;
    var waypoint_json = [];
    var origin = [];
    var destination = [];

    var markerArray = [];

    console.log(zee_lodgement_lat);
    console.log(zee_lodgement_lon);

    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 4,
        center: {
            lat: -25.363,
            lng: 131.044
        }
    });

    var input = document.getElementById('pac-input');
    console.log(input)
    searchBox = new google.maps.places.SearchBox(input);
    // map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);




    for (var x = 0; x < parsedStopFreq.data.length; x++) {
        var contentString = '<h1 id="firstHeading" class="firstHeading">' + parsedStopFreq.data[x].title + '</h1>' + '<div id="bodyContent">' + parsedStopFreq.data[x].type_text +
            '</div>';
        var infowindow = new google.maps.InfoWindow({
            content: contentString
        });
        var latLng = new google.maps.LatLng(parsedStopFreq.data[x].lat, parsedStopFreq.data[x].lon);
        if (parsedStopFreq.data[x].zee_lodge == 'no') {
            if (parsedStopFreq.data[x].type == 2) {
                var marker = new google.maps.Marker({
                    position: latLng,
                    map: map,
                    icon: {
                        path: google.maps.SymbolPath.CIRCLE,
                        scale: 5,
                        strokeColor: '#dc1928'
                    },
                    title: parsedStopFreq.data[x].title
                });

            } else {
                var marker = new google.maps.Marker({
                    position: latLng,
                    map: map,
                    icon: {
                        path: google.maps.SymbolPath.CIRCLE,
                        scale: 5,
                        strokeColor: '#1a73e8'
                    },
                    title: parsedStopFreq.data[x].title
                });
            }

        } else {
            if (parsedStopFreq.data[x].type == 2) {
                var marker = new google.maps.Marker({
                    position: latLng,
                    map: map,
                    icon: {
                        path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
                        scale: 7,
                        strokeColor: '#108372'
                    },
                    title: parsedStopFreq.data[x].title
                });
            } else {
                var marker = new google.maps.Marker({
                    position: latLng,
                    map: map,
                    icon: {
                        path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
                        scale: 7,
                        strokeColor: '#1a73e8'
                    },
                    title: parsedStopFreq.data[x].title
                });
            }
        }
        marker.addListener('click', function() {
            infowindow.open(map, marker);
        });
    }



}

function calculateAndDisplayRoute(directionsDisplay, directionsService, waypoint_json, markerArray, stepDisplay, map) {
    for (var i = 0; i < markerArray.length; i++) {
        markerArray[i].setMap(null);
    }
    for (var i = 0; i < waypoint_json.length; i++) {
        var parsedWayPoint = JSON.parse(waypoint_json[i]);
        console.log(parsedWayPoint.length);

        var lastIndex = parsedWayPoint.length - 1;
        var start = parsedWayPoint[0].location;
        var end = parsedWayPoint[lastIndex].location;
        console.log(start);
        console.log(end);
        var waypts = [];
        waypts = parsedWayPoint;
        waypts.splice(0, 1);
        waypts.splice(waypts.length - 1, 1);

        var combinedResults;
        var unsortedResults = [{}]; // to hold the counter and the results themselves as they come back, to later sort
        var directionsResultsReturned = 0;

        // directionsService.route({
        //     origin: start,
        //     destination: end,
        //     waypoints: waypts,
        //     provideRouteAlternatives: true,
        //     optimizeWaypoints: false,
        //     travelMode: 'DRIVING',
        //     drivingOptions: {
        //         departureTime: new Date(),
        //         trafficModel: 'pessimistic'
        //     },
        // }, function(response, status) {
        //     if (status === 'OK') {
        //         directionsDisplay.setDirections(response);
        //     } else {
        //         window.alert('Directions request failed due to ' + status);
        //     }
        // });
        var request = {
            origin: start,
            destination: end,
            waypoints: waypts,
            provideRouteAlternatives: true,
            optimizeWaypoints: true,
            travelMode: window.google.maps.TravelMode.DRIVING
        };
        // directionsService.route(request, function(result, status) {
        //     if (status == window.google.maps.DirectionsStatus.OK) {
        //         if (directionsResultsReturned == 0) { // first bunch of results in. new up the combinedResults object
        //             combinedResults = result;
        //             directionsResultsReturned++;
        //         } else {
        //             // only building up legs, overview_path, and bounds in my consolidated object. This is not a complete
        //             // directionResults object, but enough to draw a path on the map, which is all I need
        //             combinedResults.routes[0].legs = combinedResults.routes[0].legs.concat(result.routes[0].legs);
        //             combinedResults.routes[0].overview_path = combinedResults.routes[0].overview_path.concat(result.routes[0].overview_path);

        //             combinedResults.routes[0].bounds = combinedResults.routes[0].bounds.extend(result.routes[0].bounds.getNorthEast());
        //             combinedResults.routes[0].bounds = combinedResults.routes[0].bounds.extend(result.routes[0].bounds.getSouthWest());
        //             directionsResultsReturned++;
        //         }
        //         if (directionsResultsReturned == waypoint_json.length) // we've received all the results. put to map
        //             directionsDisplay.setDirections(combinedResults);
        //     }
        // });
        (function(kk) {
            directionsService.route(request, function(result, status) {
                if (status == window.google.maps.DirectionsStatus.OK) {

                    var unsortedResult = {
                        order: kk,
                        result: result
                    };
                    unsortedResults.push(unsortedResult);

                    directionsResultsReturned++;

                    if (directionsResultsReturned == waypoint_json.length) // we've received all the results. put to map
                    {
                        // sort the returned values into their correct order
                        unsortedResults.sort(function(a, b) {
                            return parseFloat(a.order) - parseFloat(b.order);
                        });
                        var count = 0;
                        for (var key in unsortedResults) {
                            if (unsortedResults[key].result != null) {
                                if (unsortedResults.hasOwnProperty(key)) {
                                    if (count == 0) // first results. new up the combinedResults object
                                        combinedResults = unsortedResults[key].result;
                                    else {
                                        // only building up legs, overview_path, and bounds in my consolidated object. This is not a complete
                                        // directionResults object, but enough to draw a path on the map, which is all I need
                                        combinedResults.routes[0].legs = combinedResults.routes[0].legs.concat(unsortedResults[key].result.routes[0].legs);
                                        combinedResults.routes[0].overview_path = combinedResults.routes[0].overview_path.concat(unsortedResults[key].result.routes[0].overview_path);

                                        combinedResults.routes[0].bounds = combinedResults.routes[0].bounds.extend(unsortedResults[key].result.routes[0].bounds.getNorthEast());
                                        combinedResults.routes[0].bounds = combinedResults.routes[0].bounds.extend(unsortedResults[key].result.routes[0].bounds.getSouthWest());
                                    }
                                    count++;
                                }
                            }
                        }

                        directionsDisplay.setDirections(combinedResults);
                        showSteps(combinedResults, markerArray, stepDisplay, map);
                    }
                }
            });
        })(i);
    }
}


function showSteps(directionResult, markerArray, stepDisplay, map) {
    // For each step, place a marker, and add the text to the marker's infowindow.
    // Also attach the marker to an array so we can keep track of it and remove it
    // when calculating new routes.
    console.log(directionResult)
    var myRoute = directionResult.routes[0].legs[0];
    for (var i = 0; i < myRoute.steps.length; i++) {
        var marker = markerArray[i] = markerArray[i] || new google.maps.Marker;
        marker.setMap(map);
        marker.setPosition(myRoute.steps[i].start_location);
        attachInstructionText(
            stepDisplay, marker, myRoute.steps[i].instructions, map);
    }
}

function attachInstructionText(stepDisplay, marker, text, map) {
    google.maps.event.addListener(marker, 'click', function() {
        // Open an info window when the marker is clicked on, containing the text
        // of the step.
        stepDisplay.setContent(text);
        stepDisplay.open(map, marker);
    });
}

$(document).on('change', '#pac-input', function(event) {
    var input = document.getElementById('pac-input');
    console.log(input)
    var searchBox = new google.maps.places.SearchBox(input);
    // map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

    // Bias the SearchBox results towards current map's viewport.
    map.addListener('bounds_changed', function() {
        searchBox.setBounds(map.getBounds());
    });

    searchBox.addListener('places_changed', function() {
        var places = searchBox.getPlaces();

        if (places.length == 0) {
            return;
        }

        // Clear out the old markers.
        // markers.forEach(function(marker) {
        //     marker.setMap(null);
        // });
        // markers = [];

        // For each place, get the icon, name and location.
        var bounds = new google.maps.LatLngBounds();
        places.forEach(function(place) {
            if (!place.geometry) {
                console.log("Returned place contains no geometry");
                return;
            }
            var icon = {
                url: place.icon,
                size: new google.maps.Size(71, 71),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(17, 34),
                scaledSize: new google.maps.Size(25, 25)
            };

            // Create a marker for each place.
            // markers.push(new google.maps.Marker({
            //     map: map,
            //     icon: icon,
            //     title: place.name,
            //     position: place.geometry.location
            // }));

            if (place.geometry.viewport) {
                // Only geocodes have viewport.
                bounds.union(place.geometry.viewport);
            } else {
                bounds.extend(place.geometry.location);
            }
        });
        map.fitBounds(bounds);
    });
})

$(document).on('change', '.zee_dropdown', function(event) {
    var zee = $(this).val();

    var url = baseURL + "/app/site/hosting/scriptlet.nl?script=963&deploy=1";

    url += "&zee=" + zee + "";

    window.location.href = url;
});

// function ready(data) {

// 	// remove the loader div from the DOM
// 	$('#loader').remove();

// 	// map = L.map('map').setView([-27.833, 133.583], 4);
// 	L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
// 		attribution: '© OpenStreetMap',
// 		id: 'mapbox.light'
// 	}).addTo(map);



// 	var GoogleSearch = L.Control.extend({
// 		onAdd: function() {
// 			var element = document.createElement("input");

// 			element.id = "searchBox";

// 			return element;
// 		}
// 	});

// 	(new GoogleSearch({
// 		position: 'topleft'
// 	})).addTo(map);



// 	$("#searchBox").addClass('form-control');
// 	$("#searchBox").attr("placeholder", "SEARCH");
// 	$("#searchBox").css("width", "150%");

// 	var input = document.getElementById("searchBox");

// 	var searchBox = new google.maps.places.SearchBox(input);

// 	searchBox.addListener('places_changed', function() {
// 		var places = searchBox.getPlaces();

// 		if (places.length == 0) {
// 			return;
// 		}

// 		var group = L.featureGroup();

// 		places.forEach(function(place) {

// 			// Create a marker for each place.
// 			console.log(places);
// 			console.log(place.geometry.location.lat() + " / " + place.geometry.location.lng());
// 			var marker = L.marker([
// 				place.geometry.location.lat(),
// 				place.geometry.location.lng()
// 			]);
// 			group.addLayer(marker);
// 		});

// 		group.addTo(map);
// 		map.fitBounds(group.getBounds());
// 		map.setZoom(12);
// 		$("#searchBox").val('');
// 	});

// 	info = L.control();

// 	info.onAdd = function(map) {
// 		this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
// 		this.update();
// 		return this._div;
// 	};

// 	info.update = function(props) {
// 		this._div.innerHTML = '<h5>Suburb Name</h5>' + (props ?
// 			'<b>' + props.SSC_NAME16 + '</b><br />' : 'Hover over a suburb');
// 	};

// 	info.addTo(map);

// 	for (categoryName in categories) {
// 		categoryArray = categories[categoryName];
// 		categoryLG = L.featureGroup(categoryArray);
// 		categoryLG.categoryName = categoryName;
// 		overlaysObj[categoryName] = categoryLG;
// 	}

// 	var allPointsLG = L.layerGroup();
// 	overlaysObj["All Points"] = allPointsLG;

// 	var control = L.control.layers(basemapsObj, overlaysObj).addTo(map);

// 	overlaysObj[partner_state].addTo(map);

// 	// console.log(overlaysObj[partner_state])
// 	// map.fitBounds(overlaysObj[partner_state].getBounds())

// 	map.on("overlayadd overlayremove", function(event) {

// 		var layer = event.layer,
// 			layerCategory;

// 		if (layer === allPointsLG) {
// 			if (layer.notUserAction) {
// 				// allPointsLG has been removed just to sync its state with the fact that at least one
// 				// category is not shown. This event does not come from a user un-ticking the "All points" checkbox.
// 				layer.notUserAction = false;
// 				return;
// 			}
// 			// Emulate addition / removal of all category LayerGroups when allPointsLG is added / removed.
// 			for (var categoryName in overlaysObj) {
// 				if (categoryName !== "All Points") {
// 					if (event.type === "overlayadd") {
// 						overlaysObj[categoryName].addTo(map);
// 						map.fitBounds(overlaysObj[categoryName].getBounds())
// 					} else {
// 						map.removeLayer(overlaysObj[categoryName]);
// 					}
// 				}
// 			}
// 			control._update();
// 		} else if (layer.categoryName && layer.categoryName in overlaysObj) {
// 			if (event.type === "overlayadd") {
// 				// Check if all categories are shown.
// 				for (var categoryName in overlaysObj) {
// 					layerCategory = overlaysObj[categoryName];
// 					if (categoryName !== "All Points" && !layerCategory._map) {
// 						// At least one category is not shown, do nothing.
// 						return;
// 					}
// 				}
// 				allPointsLG.addTo(map);
// 				control._update();
// 			} else if (event.type === "overlayremove" && allPointsLG._map) {
// 				// Remove allPointsLG as at least one category is not shown.
// 				// But register the fact that this is purely for updating the checkbox, not a user action.
// 				allPointsLG.notUserAction = true;
// 				map.removeLayer(allPointsLG);
// 				control._update();
// 			}
// 		}
// 	});

// 	new L.Control.Zoom({
// 		position: 'bottomleft'
// 	}).addTo(map);

// }



// function layerFilter(feature) {

// 	if (feature.properties.SSC_CODE16 == partner_location) return true
// }

// function layerFilter2(feature) {
// 	if (feature.properties.STE_NAME16 == "Australian Capital Territory") {
// 		// var index = $.inArray(feature.properties.SSC_CODE16, partner_location);
// 		// if (index != -1) {
// 		return true;
// 		// }
// 	}
// }


// function getColor(d) {
// 	return d > 300 ? '#800026' :
// 		d > 150 ? '#BD0026' :
// 		d > 100 ? '#E31A1C' :
// 		d > 70 ? '#FC4E2A' :
// 		d > 50 ? '#FD8D3C' :
// 		d > 20 ? '#FEB24C' :
// 		d > 10 ? '#FED976' :
// 		'#FFEDA0';
// }

// function style2(feature) {
// 	return {
// 		fillColor: '#FD8D3C',
// 		weight: 2,
// 		opacity: 1,
// 		color: 'white',
// 		dashArray: '3',
// 		fillOpacity: 0.7
// 	};
// }

// function style(feature) {
// 	return {
// 		fillColor: getColor(feature.properties.AREASQKM16),
// 		weight: 2,
// 		opacity: 1,
// 		color: 'white',
// 		dashArray: '3',
// 		fillOpacity: 0.7
// 	};
// }

// function onEachFeature(feature, layer) {
// 	console.log(layer);
// 	var state_name = feature.properties.STE_NAME16;
// 	var suburb = feature.properties.SSC_NAME16;
// 	var zipcode = feature.properties.SSC_CODE16;

// 	var index = $.inArray(suburb, partner_location);
// 	var count = 0;

// 	if (index != -1) {
// 		layer.setStyle({
// 			weight: 2,
// 			color: '#666',
// 			dashArray: '',
// 			fillOpacity: 0.7,
// 			fillColor: '#5cb85c'
// 		});

// 		count++;
// 		if (count == 1) {
// 			map.fitBounds(layer.getBounds());
// 		}


// 		selected_areas[zipcode] = state_name;

// 		var inlineQty = '';
// 		inlineQty += '<tr>';
// 		inlineQty += '<td><button class="btn btn-danger btn-sm remove_class glyphicon glyphicon-trash" type="button" data-toggle="tooltip" data-placement="right" title="Delete"></button></td><td class="suburb_name">' + suburb + '</td><td class="state_name">' + state_name + '</td><td><input type="number" value="' + same_day[index] + '" class="form-control same_day_rate" pattern="^\d*(\.\d{2}$)?" /></td><td><input type="number" class="form-control next_day_rate" value="' + next_day[index] + '" pattern="^\d*(\.\d{2}$)?" /></td><input type="hidden" class="state_code" value="' + suburb + '" />';
// 		inlineQty += '</tr>';
// 		$('#network_map tr:last').after(inlineQty);
// 		deleted_areas[zipcode] = layer;
// 	}

// 	// layer.bindPopup(suburb);
// 	category = state_name;

// 	// if (feature.properties.STE_NAME16 == "Australian Capital Territory") {
// 	// Initialize the category array if not already set.
// 	if (typeof categories[category] === "undefined") {
// 		categories[category] = [];
// 	}

// 	categories[category].push(layer);

// 	layer.on({
// 		mouseover: highlightFeature,
// 		mouseout: resetHighlight,
// 		click: zoomToFeature
// 	});
// 	// }
// }

// function zoomToFeature(e) {
// 	// map.fitBounds(e.target.getBounds());

// 	var layer = e.target;

// 	layer.setStyle({
// 		weight: 2,
// 		color: '#666',
// 		dashArray: '',
// 		fillOpacity: 0.7,
// 		fillColor: '#5cb85c'
// 	});

// 	// var state_code = layer.feature.properties.SSC_CODE16;
// 	var state_name = layer.feature.properties.STE_NAME16;
// 	var suburb = layer.feature.properties.SSC_NAME16;
// 	var zipcode = layer.feature.properties.SSC_CODE16;

// 	if (isNullorEmpty(selected_areas[zipcode])) {
// 		selected_areas[zipcode] = state_name;
// 		var inlineQty = '';
// 		inlineQty += '<tr>';
// 		inlineQty += '<td><button class="btn btn-danger btn-sm remove_class glyphicon glyphicon-trash" type="button" data-toggle="tooltip" data-placement="right" title="Delete"></button></td><td class="suburb_name">' + suburb + '</td><td class="state_name">' + state_name + '</td><td><input type="number" class="form-control same_day_rate" pattern="^\d*(\.\d{2}$)?" /></td><td><input type="number" class="form-control next_day_rate" pattern="^\d*(\.\d{2}$)?" /></td><input type="hidden" class="state_code" value="' + suburb + '" />';
// 		inlineQty += '</tr>';
// 		$('#network_map tr').eq(1).after(inlineQty);
// 		deleted_areas[zipcode] = layer;
// 	} else {
// 		geojson2.resetStyle(e.target);
// 		var $rowsNo = $('#network_map tbody tr').filter(function() {
// 			return $.trim($(this).find('td').eq(1).text()) == suburb
// 		}).remove();
// 		delete selected_areas[zipcode];
// 	}
// }

// $(document).on('click', '.remove_class', function(event) {


// 	var zipcode = $(this).closest('tr').find('.state_code').val();
// 	var layer = $(this).closest('tr').find('.target').val();
// 	$(this).closest("tr").remove();

// 	if (!isNullorEmpty(selected_areas[zipcode])) {
// 		delete selected_areas[zipcode];
// 		geojson2.resetStyle(deleted_areas[zipcode]);
// 	}
// });


// function resetHighlight(e) {
// 	var layer = e.target;

// 	var zipcode = layer.feature.properties.SSC_CODE16;

// 	if (isNullorEmpty(selected_areas[zipcode])) {
// 		geojson2.resetStyle(e.target);
// 	}

// 	info.update();
// }

// function highlightFeature(e) {
// 	var layer = e.target;

// 	var zipcode = layer.feature.properties.SSC_CODE16;

// 	if (isNullorEmpty(selected_areas[zipcode])) {
// 		layer.setStyle({
// 			weight: 2,
// 			color: '#428bca',
// 			dashArray: '',
// 			fillOpacity: 0.7,
// 			fillColor: '#FFEDA0'
// 		});
// 	}



// 	if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
// 		layer.bringToFront();
// 	}

// 	info.update(layer.feature.properties);
// }

function saveRecord() {

    var code_elem = document.getElementsByClassName("state_code");
    var same_day_elem = document.getElementsByClassName("same_day_rate");
    var next_day_elem = document.getElementsByClassName("next_day_rate");
    var code = [];
    var same_day_array = [];
    var next_day_array = [];

    for (var i = 0; i < code_elem.length; ++i) {
        code[i] = code_elem[i].value;
        same_day_array[i] = same_day_elem[i].value;
        next_day_array[i] = next_day_elem[i].value;
    }

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
    console.log(same_day_array)
    console.log(next_day_array)


    nlapiSetFieldValue('code_array', total_array);
    nlapiSetFieldValue('same_day_array', same_day_array.toString());
    nlapiSetFieldValue('next_day_array', next_day_array.toString());
    // if (!isNullorEmpty(strs[1])) {
    // 	nlapiSetFieldValue('code_array2', strs[1]);
    // }
    // if (!isNullorEmpty(strs[2])) {
    // 	nlapiSetFieldValue('code_array3', strs[2]);
    // }

    return true;

}

function convertSecondsToMinutes(seconds) {
    var min = Math.floor(seconds / 60);
    var sec = seconds % 60;

    var minutes_array = [];

    minutes_array[0] = min;
    minutes_array[1] = sec;

    return minutes_array;
}

function convertTo24Hour(time) {
    // nlapiLogExecution('DEBUG', 'time', time);
    var hours = parseInt(time.substr(0, 2));
    if (time.indexOf('AM') != -1 && hours == 12) {
        time = time.replace('12', '0');
    }
    if (time.indexOf('AM') != -1 && hours < 10) {
        time = time.replace(hours, ('0' + hours));
    }
    if (time.indexOf('PM') != -1 && hours < 12) {
        time = time.replace(hours, (hours + 12));
    }
    return time.replace(/( AM| PM)/, '');
}

function onTimeChange(value) {
    // console.log('value: ' + value)
    if (!isNullorEmpty(value)) {
        var timeSplit = value.split(':'),
            hours,
            minutes,
            meridian;
        hours = timeSplit[0];
        minutes = timeSplit[1];
        if (hours > 12) {
            meridian = 'PM';
            hours -= 12;
        } else if (hours < 12) {
            meridian = 'AM';
            if (hours == 0) {
                hours = 12;
            }
        } else {
            meridian = 'PM';
        }
        return (hours + ':' + minutes + ' ' + meridian);
    }
}

function arraysEqual(_arr1, _arr2) {

    if (!Array.isArray(_arr1) || !Array.isArray(_arr2) || _arr1.length !== _arr2.length)
        return false;

    var arr1 = _arr1.concat().sort();
    var arr2 = _arr2.concat().sort();

    for (var i = 0; i < arr1.length; i++) {

        if (arr1[i] !== arr2[i])
            return false;

    }

    return true;

}

function getDate() {
    var date = new Date();
    // if (date.getHours() > 6) {
    // 	date = nlapiAddDays(date, 1);
    // }
    date = nlapiDateToString(date);

    return date;
}