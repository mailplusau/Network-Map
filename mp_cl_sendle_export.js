/**
 * Module Description
 * 
 * NSVersion    Date                        Author         
 * 1.00         2020-11-19 06:14:47         Ankith
 *
 * Description:         
 * 
 * @Last Modified by:   ankit
 * @Last Modified time: 2020-12-11 12:25:08
 *
 */


var sendle_teams = [];
var sendle_drivers = [];
var sendle_tasks_temp = [];
var sendle_tasks = [];

var globalLastID = null;

var extraBarcodesEmailZee = [];
var extraBarcodesEmail = [];

var dropOffTime = new Array();
var dropOffAddress = new Array();
var dropOffName = new Array();

var sendle_teams_id = new Array();
var sendle_drivers_id = new Array();
var sendle_teams_name = new Array();
var sendle_drivers_name = new Array();
var sendle_drivers_team = new Array();

var dataSet = '';
var finalJSONDataSet = '';

var baseURL = 'https://1048144.app.netsuite.com';
if (nlapiGetContext().getEnvironment() == "SANDBOX") {
	baseURL = 'https://1048144-sb3.app.netsuite.com';
}

//To show loader while the page is laoding
$(window).load(function() {
	// Animate loader off screen
	$(".se-pre-con").fadeOut("slow");;
});

//On page load
function pageInit() {

	//get date from page
	var date_from = nlapiGetFieldValue('custpage_date_from');
	var date_from_iso = dateNetsuiteToISO(date_from);

	if (!isNullorEmpty(date_from_iso)) {
		//Set FROM date
		$('#date_from').val(date_from_iso);
		var from_date = new Date(date_from_iso);
		from_date.setHours(00, 00, 00, 00);
		console.log(from_date)
		var stringDate = nlapiDateToString(from_date);

		//Set TO Date
		var to_date = new Date(date_from_iso);
		to_date.setHours(23, 59, 59, 59);
		console.log(to_date)
		var tostringDate = nlapiDateToString(to_date);
	} else {

		//Set FROM Date
		var from_date = new Date();
		from_date.setHours(00, 00, 00, 00);
		var stringDate = nlapiDateToString(from_date);

		//Set TO Date
		var to_date = new Date();
		to_date.setHours(23, 59, 59, 59);
		console.log(to_date)
		var tostringDate = nlapiDateToString(to_date);
	}

	var unix_timestamp_from_date = from_date.getTime();
	var unix_timestamp_to_date = to_date.getTime();

	//Onfleet API to get Teams, Drivers & Tasks based
	sendle_teams = getJson('https://onfleet.com/api/v2/teams');
	sendle_drivers = getJson('https://onfleet.com/api/v2/workers');
	sendle_tasks_temp = getJson('https://onfleet.com/api/v2/tasks/all?from=' + unix_timestamp_from_date + '&to=' + unix_timestamp_to_date);

	//Store all the Team ID's and names into an Array
	for (var z = 0; z < sendle_teams.length; z++) {

		var teamID = sendle_teams[z]['id'];
		var teamName = sendle_teams[z]['name'];

		sendle_teams_id[sendle_teams_id.length] = teamID;
		sendle_teams_name[sendle_teams_name.length] = teamName;
	}

	//Store all the Driver ID's and names into an array
	for (var w = 0; w < sendle_drivers.length; w++) {

		var driverID = sendle_drivers[w]['id'];
		var driverName = sendle_drivers[w]['name'];
		var driverTeam = sendle_drivers[w]['teams'];

		sendle_drivers_id[sendle_drivers_id.length] = driverID;
		sendle_drivers_name[sendle_drivers_name.length] = driverName;
		sendle_drivers_team[sendle_drivers_team.length] = driverTeam;
	}

	//Get the last ID from the API
	sendle_tasks = sendle_tasks.concat(sendle_tasks_temp['tasks']);

	//Keep getting the tasks if last ID is present from the API
	while (!isNullorEmpty(sendle_tasks_temp['lastId'])) {
		sendle_tasks_temp = getJson('https://onfleet.com/api/v2/tasks/all?from=' + unix_timestamp_from_date + '&to=' + unix_timestamp_to_date + '&lastId=' + sendle_tasks_temp['lastId']);
		sendle_tasks = sendle_tasks.concat(sendle_tasks_temp['tasks'])
	}

	//Form JSON of the data from Onfleet
	dataSet += '{"data":[';

	if (!isNullorEmpty(sendle_tasks) && sendle_tasks.length > 0) {

		for (var x = 0; x < sendle_tasks.length; x++) {

			// console.log(sendle_tasks[x])

			var extraBarcodes = '';
			var status = '';

			var pickupTask = sendle_tasks[x]['pickupTask'];
			var notes = sendle_tasks[x]['notes'];
			notes = notes.slice(7, notes.length);
			var parcels = sendle_tasks[x]['quantity'];
			var shortId = sendle_tasks[x]['shortId'];
			var importBarcodes = sendle_tasks[x]['destination']['notes'];
			var driverID = sendle_tasks[x]['worker'];
			var failureNotes = sendle_tasks[x]['completionDetails']['failureNotes'];
			var failureReason = sendle_tasks[x]['completionDetails']['failureReason'];
			var completionTime = sendle_tasks[x]['completionDetails']['time'];

			//Convert Unix timestamp to date and time
			if (!isNullorEmpty(completionTime)) {
				const milliseconds = completionTime // 1575909015000

				const dateObject = new Date(milliseconds)

				var humanDateFormat = dateObject.toLocaleString()
			} else {
				var humanDateFormat = "";
			}

			//Hubbed Location Names
			if (pickupTask === false) {
				var pickupName = sendle_tasks[x]['destination']['address']['name'];
				if (!isNullorEmpty(pickupName)) {
					pickupName = pickupName.replace((/  |\r\n|\n|\r/gm), '');
				} else {
					pickupName = '';
				}

			} else {
				var pickupName = '';
			}

			var address2 = sendle_tasks[x]['destination']['address']['apartment'];
			var streetNumber = sendle_tasks[x]['destination']['address']['number'];
			var streetName = sendle_tasks[x]['destination']['address']['street'];
			var suburb = sendle_tasks[x]['destination']['address']['city'];
			var postcode = sendle_tasks[x]['destination']['address']['postalCode'];
			var state = sendle_tasks[x]['destination']['address']['state'];
			var country = sendle_tasks[x]['destination']['address']['country'];
			var scannedBarcodes = sendle_tasks[x]['barcodes'];


			if (shortId == '4bf02285') {
				console.log(scannedBarcodes)
			}


			//Decodea all the scanned barcodes and store as String
			var scannedBarcodesString = '';
			if (!isNullorEmpty(scannedBarcodes)) {
				var barcodesLength = scannedBarcodes['captured'].length;

				for (var y = 0; y < barcodesLength; y++) {
					if (scannedBarcodes['captured'][y]['symbology'] == 'CODE 128' || scannedBarcodes['captured'][y]['symbology'] == 'CODE128') {

						var decodedBarcode = window.atob(scannedBarcodes['captured'][y]['data']);
						decodedBarcode = decodedBarcode.replace("\"", "");
						decodedBarcode = decodedBarcode.replace(//gm, "");
						decodedBarcode = decodedBarcode.replace((/  |\r\n|\n|\r/gm), '');

						var startingSixChars = decodedBarcode.slice(0, 7);
						var remainingChars = decodedBarcode.slice(7, decodedBarcode.length);

						if (startingSixChars == "CPAFXLT") {
							decodedBarcode = "CPAFXLC" + remainingChars;
						} else if (startingSixChars == "CPBZL5T") {
							decodedBarcode = "CPBZL5C" + remainingChars;
						}

						//Remove any Attention to leave barcodes
						if (!decodedBarcode.includes("|")) {
							scannedBarcodesString += decodedBarcode + ";"
						}
					} else {
						var decodedBarcode = window.atob(scannedBarcodes['captured'][y]['data']);
						decodedBarcode = decodedBarcode.replace("\"", "");
						decodedBarcode = decodedBarcode.replace(//gm, "");
						decodedBarcode = decodedBarcode.replace((/  |\r\n|\n|\r/gm), '');

						var startingSixChars = decodedBarcode.slice(0, 7);
						var remainingChars = decodedBarcode.slice(7, decodedBarcode.length);

						if (startingSixChars == "CPAFXLT") {
							decodedBarcode = "CPAFXLC" + remainingChars;
						} else if (startingSixChars == "CPBZL5T") {
							decodedBarcode = "CPBZL5C" + remainingChars;
						}

						//Remove any Attention to leave barcodes
						if (!decodedBarcode.includes("|")) {
							scannedBarcodesString += decodedBarcode + ";"
						}
					}

				}
				scannedBarcodesString = scannedBarcodesString.substring(0, scannedBarcodesString.length - 1);

				if (shortId == '4bf02285') {
					console.log(scannedBarcodesString)
				}

				//Find all extra barcodes scanned and the status of task
				if (pickupTask === true) {

					importBarcodes = importBarcodes.replace(/ /gm, "");

					var pickupBarcodesArray = importBarcodes.split(";");
					var scannedBarcodesArray = scannedBarcodesString.split(";");

					pickupBarcodesArray.sort(function(a, b) {
						return a - b
					});
					var uniqueArray = [pickupBarcodesArray[0]];

					for (var i = 1; i < pickupBarcodesArray.length; i++) {
						if (pickupBarcodesArray[i - 1] !== pickupBarcodesArray[i])
							uniqueArray.push(pickupBarcodesArray[i]);
					}

					uniqueArray = uniqueArray.filter(function(el) {
						return el != "";
					});
					scannedBarcodesArray = scannedBarcodesArray.filter(function(el) {
						return el != "";
					});

					//Scanned barcodes count greater than or equal to the imported barcodes
					if (scannedBarcodesArray.length > uniqueArray.length || scannedBarcodesArray.length == uniqueArray.length) {
						status = 'C';
						for (var q = 0; q < scannedBarcodesArray.length; q++) {
							var indexBarcodes = uniqueArray.indexOf(scannedBarcodesArray[q]);

							if (indexBarcodes == -1) {
								extraBarcodes += scannedBarcodesArray[q] + ';'
							}
						}
					} else if (scannedBarcodesArray.length < uniqueArray.length) {
						status = 'PFC';
						for (var q = 0; q < scannedBarcodesArray.length; q++) {
							var indexBarcodes = uniqueArray.indexOf(scannedBarcodesArray[q]);

							if (indexBarcodes == -1) {
								extraBarcodes += scannedBarcodesArray[q] + ';'
							}
						}
					}

					extraBarcodes = extraBarcodes.substring(0, extraBarcodes.length - 1);

					if (!isNullorEmpty(extraBarcodes)) {
						extraBarcodesEmail[extraBarcodesEmail.length] = extraBarcodes;
						extraBarcodesEmailZee[extraBarcodesEmailZee.length] = teamName;
					}
				} else if (pickupTask === false) {
					status = '';
				} else {
					status = 'FC';
				}
			}

			var driverIndex = -1;
			var driverName;
			var teamIndex = -1;
			var teamName;

			var importBarcodesArrayTemp = [];
			var reference = [];

			var otherReference = '';

			//Imported barcodes divided into reference and other reference columns

			if (pickupTask === true) {
				if (!isNullorEmpty(failureNotes) || (!isNullorEmpty(failureReason) && failureReason != "NONE")) {
					status = 'FC';
				}
				importBarcodes = importBarcodes.replace(/ /gm, "");
				importBarcodesArrayTemp = importBarcodes.split(';');
				importBarcodesArrayTemp.sort(function(a, b) {
					return a - b
				});
				var uniqueArray = [importBarcodesArrayTemp[0]];

				for (var i = 1; i < importBarcodesArrayTemp.length; i++) {
					if (importBarcodesArrayTemp[i - 1] !== importBarcodesArrayTemp[i])
						uniqueArray.push(importBarcodesArrayTemp[i]);
				}

				// console.log('uniqueArray: ' + uniqueArray);

				reference = importBarcodes.split(';', 1);
				for (var i = 1; i < uniqueArray.length; i++) {
					otherReference += uniqueArray[i] + ';'
				}
				otherReference = otherReference.substring(0, otherReference.length - 1);
			}

			//Find out the driver name and team name based on the driver ID
			driverIndex = sendle_drivers_id.indexOf(driverID);
			if (driverIndex != -1) {
				driverName = sendle_drivers_name[driverIndex];
				teamIndex = sendle_teams_id.indexOf(sendle_drivers_team[driverIndex].toString());
				if (teamIndex != -1) {
					teamName = sendle_teams_name[teamIndex];
				}
			}

			//Get the drop off time and address
			if (pickupTask === false && !isNullorEmpty(scannedBarcodes)) {
				driverName = driverName.replace((/  /gm), '');
				console.log(driverName);
				dropOffTime[driverName] = humanDateFormat;
				dropOffAddress[driverName] = streetNumber + " " + streetName + ", " + suburb + ", " + state + " - " + postcode;
				dropOffName[driverName] = pickupName;
			}


			dataSet += '{"job_date":"' + stringDate + '",';
			dataSet += '"shortId":"' + shortId + '",';
			dataSet += '"pickupTask":"' + pickupTask + '",';
			dataSet += '"deliveryBy": " ",';
			dataSet += '"notes":"' + notes.replace((/  |\r\n|\n|\r/gm), '') + '",';
			dataSet += '"parcels":"' + parcels + '",';
			dataSet += '"reference":"' + reference + '",';
			dataSet += '"otherReference":"' + otherReference + '",';
			dataSet += '"driverNameRef":"' + driverName.replace((/  |\r\n|\n|\r/gm), '') + '",';
			dataSet += '"driverName":"' + driverName + '",';
			dataSet += '"teamName":"' + teamName + '",';
			dataSet += '"failureNotes":"' + failureNotes.replace((/  |\r\n|\n|\r/gm), '') + '",';
			dataSet += '"failureReason":"' + failureReason + '",';
			dataSet += '"completionTime":"' + humanDateFormat + '",';
			if (!isNullorEmpty(pickupName)) {
				var pickupAddress = pickupName + " - " + streetNumber + " " + streetName + ", " + suburb + ", " + state + " - " + postcode;
			} else {
				var pickupAddress = streetNumber + " " + streetName + ", " + suburb + ", " + state + " - " + postcode;
			}

			dataSet += '"pickupAddress":"' + pickupAddress + '", ';
			dataSet += '"status":"' + status + '", ';
			dataSet += '"extraBarcodes":"' + extraBarcodes + '", ';
			dataSet += '"scannedBarcodesString":"' + scannedBarcodesString + '"},';
		}
		dataSet = dataSet.substring(0, dataSet.length - 1);
	}

	dataSet += ']}';

	console.log(dataSet);
	console.log(dropOffTime);
	console.log(dropOffAddress);
	console.log(dropOffName);

	//Send email of extra barcodes scanned
	if (!isNullorEmpty(extraBarcodesEmail)) {
		var emailBody = 'Below are the extra barcodes: \n\n';
		for (var t = 0; t < extraBarcodesEmail.length; t++) {
			emailBody += 'Franchisee: ' + extraBarcodesEmailZee[t] + '\n';
			emailBody += 'Extra Barcodes: ' + extraBarcodesEmail[t] + '\n\n';
		}
		// nlapiSendEmail(112209, ['raine.giderson@mailplus.com.au', 'ankith.ravindran@mailplus.com.au'], 'Extra Barcodes - Date: ' + stringDate, emailBody, null);
	}

	var parsedData = JSON.parse(dataSet);

	finalJSONDataSet += '{"data":[';

	if (parsedData.data.length > 0) {
		for (var a = 0; a < parsedData.data.length; a++) {
			finalJSONDataSet += '{"job_date":"' + parsedData.data[a]['job_date'] + '",';
			finalJSONDataSet += '"shortId":"' + parsedData.data[a]['shortId'] + '",';
			finalJSONDataSet += '"pickupTask":"' + parsedData.data[a]['pickupTask'] + '",';

			if (parsedData.data[a]['pickupTask'] === 'true' && !isNullorEmpty(dropOffTime[parsedData.data[a]['driverNameRef']]) && (isNullorEmpty(parsedData.data[a]['failureNotes']) || (isNullorEmpty(parsedData.data[a]['failureReason']) && parsedData.data[a]['failureReason'] == "NONE"))) {

				finalJSONDataSet += '"deliveryBy": "' + dropOffTime[parsedData.data[a]['driverNameRef']] + '",';
				finalJSONDataSet += '"deliveryAddress": "' + dropOffAddress[parsedData.data[a]['driverNameRef']] + '",';
				finalJSONDataSet += '"deliveryName": "' + dropOffName[parsedData.data[a]['driverNameRef']] + '",';
			} else {
				finalJSONDataSet += '"deliveryBy": " ",';
				finalJSONDataSet += '"deliveryAddress": " ",';
				finalJSONDataSet += '"deliveryName": " ",';
			}
			finalJSONDataSet += '"notes":"' + parsedData.data[a]['notes'] + '",';
			finalJSONDataSet += '"parcels":"' + parsedData.data[a]['parcels'] + '",';
			finalJSONDataSet += '"reference":"' + parsedData.data[a]['reference'] + '",';
			finalJSONDataSet += '"otherReference":"' + parsedData.data[a]['otherReference'] + '",';
			finalJSONDataSet += '"driverName":"' + parsedData.data[a]['driverName'] + '",';
			finalJSONDataSet += '"teamName":"' + parsedData.data[a]['teamName'] + '",';
			finalJSONDataSet += '"failureNotes":"' + parsedData.data[a]['failureNotes'] + '",';
			finalJSONDataSet += '"failureReason":"' + parsedData.data[a]['failureReason'] + '",';
			finalJSONDataSet += '"completionTime":"' + parsedData.data[a]['completionTime'] + '",';
			finalJSONDataSet += '"pickupAddress":"' + parsedData.data[a]['pickupAddress'] + '", ';
			finalJSONDataSet += '"status":"' + parsedData.data[a]['status'] + '", ';
			finalJSONDataSet += '"extraBarcodes":"' + parsedData.data[a]['extraBarcodes'] + '", ';
			finalJSONDataSet += '"scannedBarcodesString":"' + parsedData.data[a]['scannedBarcodesString'] + '"},';
		}
		finalJSONDataSet = finalJSONDataSet.substring(0, finalJSONDataSet.length - 1);
	}

	finalJSONDataSet += ']}';

	var finalparsedData = JSON.parse(finalJSONDataSet);

	console.log(finalparsedData)

	//JQuery to sort table based on click of header. Attached library  
	$(document).ready(function() {
		$('#customer thead tr.search_row th').each(function(i) {
			var title = $(this).text();
			$(this).html('<input type="text" style="width: 100%;" placeholder="Search" />');

			$('input', this).on('change', function() {
				if (table.column(i).search() !== this.value) {
					table
						.search(this.value)
						.draw();
				}
			});
		});
		table = $("#customer").DataTable({
			dom: 'Bfrtip',
			buttons: [
				'copy', 'csv', 'excel', 'pdf', 'print'
			],
			"data": finalparsedData.data,
			"columns": [{
				"data": "job_date"
			}, {
				"data": null,
				"render": function(data, type, row) {
					return '<div style="text-align: center;vertical-align: middle;"><b>' + data.pickupTask + '</b></div>';
				}
			}, {
				"data": null,
				"render": function(data, type, row) {
					return '<div style="text-align: center;vertical-align: middle;"><b>' + data.deliveryBy + '</b></div>';
				}
			}, {
				"data": "reference"
			}, {
				"data": null,
				"render": function(data, type, row) {
					return '<div style="word-break: break-all;">' + data.otherReference + '</div>';
					// return '<div style="word-break: break-all;"></div>';
				}
			}, {
				"data": "pickupAddress"
			}, {
				"data": null,
				"render": function(data, type, row) {
					return '<div style=""><b>' + data.deliveryName + '</b></div>';
				}
			}, {
				"data": null,
				"render": function(data, type, row) {
					return '<div style=""><b>' + data.deliveryAddress + '</b></div>';
				}
			}, {
				"data": "parcels"
			}, {
				"data": "notes"
			}, {
				"data": null,
				"render": function(data, type, row) {
					return '<b>' + data.shortId + '</b>';
				}
			}, {
				"data": "driverName"
			}, {
				"data": null,
				"render": function(data, type, row) {
					return '<b>' + data.teamName + '</b>';
				}
			}, {
				"data": null,
				"render": function(data, type, row) {
					return '<b>' + data.completionTime + '</b>';
				}
			}, {
				"data": "status"
			}, {
				"data": null,
				"render": function(data, type, row) {
					return '<div style="word-break: break-all;">' + data.scannedBarcodesString + '</div>';
				}
			}, {
				"data": null,
				"render": function(data, type, row) {
					return '<div style="word-break: break-all;">' + data.extraBarcodes + '</div>';
				}
			}, {
				"data": null,
				"render": function(data, type, row) {
					var finalReason = data.failureNotes
					return finalReason;
				}
			}],
			"columnDefs": [],
			"order": [
				[13, 'desc']
			],
			"pageLength": 100,
			"scrollY": "1000px",
			"scrollX": false,
			"fixedHeader": {
				"header": true
			},
			"createdRow": function(row, data, index) {
				//Color the rows based on below conditions

				//Failure to pickup
				if (!isNullorEmpty(data.failureNotes) || (!isNullorEmpty(data.failureReason) && data.failureReason != "NONE")) {
					$('td', row).css('background-color', '#f19b93');
				} else if (!isNullorEmpty(data.scannedBarcodesString) && data.pickupTask == "true") {
					//Scanned barcodes & pickup tasks
					$('td', row).css('background-color', '#93f1b9');
				} else if (data.pickupTask == "false") {
					//Dropp of tasks
					$('td', row).css('background-color', '#9a9595');
				}
			}
		});
	});
}

//Reload page when date is selected
$('#date_from').change(function() {
	reloadPageWithParams();
});

//HTTPS requst to the Onfleet API
function getJson(url) {
	return JSON.parse($.ajax({
		type: 'GET',
		url: url,
		dataType: 'json',
		global: false,
		async: false,
		beforeSend: function(xhr) {
			xhr.setRequestHeader("Authorization", "Basic YTk5MjIyY2Y0ZWIzY2I5MWNhMTI1YTFmYjY2OTBkMTY6TWEhMWxwbHVz")
		},
		success: function(data) {
			return data;
		}
	}).responseText);
}

/**
 * Triggered when a new Franchisee is selected,
 * or when a new date is selected, and there is a selected Franchisee.
 */
function reloadPageWithParams() {
	var date_from = dateISOToNetsuite($('#date_from').val());
	var params = {
		date_from: date_from,
	};
	params = JSON.stringify(params);
	var upload_url = baseURL + nlapiResolveURL('suitelet', 'customscript_sl_sendle_export', 'customdeploy1') + '&custparam_params=' + encodeURIComponent(params);

	window.open(upload_url, "_self", "height=750,width=650,modal=yes,alwaysRaised=yes");

}

/**
 * Used to set the value of the date input fields.
 * @param   {String} date_netsuite  "1/6/2020"
 * @returns {String} date_iso       "2020-06-01"
 */
function dateNetsuiteToISO(date_netsuite) {
	var date_iso = '';
	if (!isNullorEmpty(date_netsuite)) {
		var date = nlapiStringToDate(date_netsuite);
		var date_day = date.getDate();
		var date_month = date.getMonth();
		var date_year = date.getFullYear();
		var date_utc = new Date(Date.UTC(date_year, date_month, date_day));
		date_iso = date_utc.toISOString().split('T')[0];
	}
	return date_iso;
}

/**
 * Used to pass the values of `date_from` and `date_to` between the scripts and to Netsuite for the records and the search.
 * @param   {String} date_iso       "2020-06-01"
 * @returns {String} date_netsuite  "1/6/2020"
 */
function dateISOToNetsuite(date_iso) {
	var date_netsuite = '';
	if (!isNullorEmpty(date_iso)) {
		var date_utc = new Date(date_iso);
		var date_netsuite = nlapiDateToString(date_utc);
	}
	return date_netsuite;
}