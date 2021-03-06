var ctx = nlapiGetContext();

var zee = 0;
var role = ctx.getRole();

if (role == 1000) {
	//Franchisee
	zee = ctx.getUser();
} else if (role == 3) { //Administrator
	zee = 6; //test
} else if (role == 1032) { // System Support
	zee = 425904; //test-AR
}

function stateNames(state) {
	switch (state) {
		case 'ACT':
			return 'Australian Capital Territory';
		case 'NSW':
			return 'New South Wales';
		case 'VIC':
			return 'Victoria';
		case 'QLD':
			return 'Queensland';
		case 'WA':
			return 'Western Australia';
		case 'SA':
			return 'South Australia';
		case 'NT':
			return 'Northern Territory';
		case 'TAS':
			return 'Tasmania';
	}
}

function summary_page(request, response) {

	if (request.getMethod() === "GET") {

		var form = nlapiCreateForm('Your Franchise Service Network');

		var inlineQty = '<meta name="viewport" content="width=device-width, initial-scale=1.0"><script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"><script src="//code.jquery.com/jquery-1.11.0.min.js"></script><script src="//api.tiles.mapbox.com/mapbox.js/plugins/leaflet-omnivore/v0.3.1/leaflet-omnivore.min.js"></script><link type="text/css" rel="stylesheet" href="https://cdn.datatables.net/1.10.13/css/jquery.dataTables.min.css"><link href="//netdna.bootstrapcdn.com/bootstrap/3.3.2/css/bootstrap.min.css" rel="stylesheet"><link href="https://1048144.app.netsuite.com/core/media/media.nl?id=1988776&c=1048144&h=58352d0b4544df20b40f&mv=j11m86u8&_xt=.css" rel="stylesheet"><script src="//netdna.bootstrapcdn.com/bootstrap/3.3.2/js/bootstrap.min.js"></script><script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyA92XGDo8rx11izPYT7z2L-YPMMJ6Ih1s0&libraries=places"></script></script><link rel="stylesheet" href="https://unpkg.com/leaflet@1.2.0/dist/leaflet.css" /><script src="https://unpkg.com/leaflet@1.2.0/dist/leaflet.js"></script><style>.info {padding: 6px 8px;font: 14px/16px Arial, Helvetica, sans-serif;background: white;background: rgba(255,255,255,0.8);box-shadow: 0 0 15px rgba(0,0,0,0.2);border-radius: 5px;}.info h5 { margin: 0 0 5px;color: #777;}.table {border-radius: 5px;width: 50%;margin: 0px auto;float: none;} #loader {position: absolute;top: 0;bottom: 0;width: 100%;background-color: rgba(245, 245, 245, 0.7);z-index: 200; }#loader img {width: 66px;height: 66px;position: absolute;top: 50%;left: 50%;margin: -33px 0 0 -33px;}</style>';

		if (role != 1000) {
			inlineQty += '<div class="container" style="padding-top: 3%;"><div class="form-group container"><div class="row"><div class="input-group"><span class="input-group-addon">SELECT ZEE</span><select class="form-control zee_dropdown" >';

			var searched_zee = nlapiLoadSearch('partner', 'customsearch_job_inv_process_zee');

			var resultSet_zee = searched_zee.runSearch();

			var count_zee = 0;

			inlineQty += '<option value=""></option>'

			resultSet_zee.forEachResult(function(searchResult_zee) {

				zeeid = searchResult_zee.getValue('internalid');
				zee_name = searchResult_zee.getValue('entityid');

				if (request.getParameter('zee') == zeeid) {
					inlineQty += '<option value="' + zeeid + '" selected="selected">' + zee_name + '</option>';
					zee = zeeid;
				} else {
					inlineQty += '<option value="' + zeeid + '">' + zee_name + '</option>';
				}


				return true;
			});

			inlineQty += '</select></div></div></div>';
		}

		if (!isNullorEmpty(zee)) {

			var param_zee = request.getParameter('zee');

			if (!isNullorEmpty(param_zee)) {
				zee = param_zee;
			}

			nlapiLogExecution('DEBUG', 'Zee', zee)

			var partner_record = nlapiLoadRecord('partner', parseInt(zee));

			var partner_state = partner_record.getFieldText('location');
			var partner_location = partner_record.getFieldValue('custentity_networkmtrx_suburb');
			var partner_location2 = partner_record.getFieldValue('custentity_networkmtrx_suburb_2');
			var partner_location3 = partner_record.getFieldValue('custentity_networkmtrx_suburb_3');
			var partner_main = null;
			var network_json = partner_record.getFieldValue('custentity_network_matrix_json');

			if (!isNullorEmpty(network_json)) {
				var parsedJSON = JSON.parse(network_json);

				var suburbs_array = [];
				var same_day_array = [];
				var next_day_array = [];


				for (var i = 0; i < parsedJSON.length; i++) {
					var obj = parsedJSON[i];

					suburbs_array[suburbs_array.length] = obj.suburbs;
					same_day_array[same_day_array.length] = obj.same_day;
					next_day_array[next_day_array.length] = obj.next_day;
				}

				partner_main = suburbs_array.toString();
				var same_day = same_day_array.toString();
				var next_day = next_day_array.toString();
			}

			nlapiLogExecution('DEBUG', 'main', partner_main);

			var partner_name = partner_record.getFieldValue('companyname');

			partner_location += ',' + partner_location2 + ',' + partner_location3;

			partner_state = stateNames(partner_state);

			form.addField('zee', 'text', 'zee').setDisplayType('hidden').setDefaultValue(zee);
			form.addField('name', 'text', 'name').setDisplayType('hidden').setDefaultValue(partner_name);
			form.addField('partner_state', 'text', 'partner_state').setDisplayType('hidden').setDefaultValue(partner_state);
			form.addField('partner_location', 'textarea', 'partner_location').setDisplayType('hidden').setDefaultValue(partner_main);
			form.addField('same_day', 'textarea', 'partner_location').setDisplayType('hidden').setDefaultValue(same_day);
			form.addField('next_day', 'textarea', 'partner_location').setDisplayType('hidden').setDefaultValue(next_day);
			form.addField('code_array', 'textarea', 'code_array').setDisplayType('hidden');
			form.addField('same_day_array', 'textarea', 'code_array').setDisplayType('hidden');
			form.addField('next_day_array', 'textarea', 'code_array').setDisplayType('hidden');

			inlineQty += '<div id="map" style="width: 1000px; height: 500px"><div id="loader"><img src="https://1048144.app.netsuite.com/core/media/media.nl?id=2089999&c=1048144&h=e0aef405c22b65dfe546" alt="loader" /></div></div>';
			inlineQty += '</br>';
			inlineQty += '</br>';
			inlineQty += '</br>';
			inlineQty += '<div class="table-responsive"><table border="0" cellpadding="10" id="network_map" cellspacing="0" class="table table-striped text-centered" style="width: 100%;"><thead style="color: white;background-color: #607799;"><tr><th><b>ACTION</b></th><th><b>SUBURB</b></th><th><b>STATE</b></th><th class="col-xs-2"><b>SAME DAY DELIVERY RATE</b></th><th class="col-xs-2"><b>NEXT DAY DELIVERY RATE<b></th></tr></thead><tbody><tr></tr>';


			inlineQty += '</tbody></table></div>'



		} else {
			inlineQty += '<div id="map" style="width: 1000px; height: 500px"><div id="loader"><img src="https://1048144.app.netsuite.com/core/media/media.nl?id=2089999&c=1048144&h=e0aef405c22b65dfe546" alt="loader" /></div></div>';
			inlineQty += '</br>';
			inlineQty += '</br>';
			inlineQty += '</br>';
			inlineQty += '<div class="table-responsive"><table border="0" cellpadding="10" id="network_map" cellspacing="0" class="table table-striped text-centered" style="width: 100%;"><thead style="color: white;background-color: #607799;"><tr><th><b>ACTION</b></th><th><b>SUBURB</b></th><th><b>STATE</b></th><th class="col-xs-2"><b>SAME DAY DELIVERY RATE</b></th><th class="col-xs-2"><b>NEXT DAY DELIVERY RATE<b></th></tr></thead><tbody><tr></tr>';


			inlineQty += '</tbody></table></div>'
		}

		inlineQty += '</div>'
		form.addField('preview_table', 'inlinehtml', '').setLayoutType('outsidebelow', 'startrow').setDefaultValue(inlineQty);
		form.setScript('customscript_cl_network_map');

		form.addSubmitButton('Submit');

		response.writePage(form);
	} else {
		var zee2 = request.getParameter('zee');
		var code_array = request.getParameter('code_array');
		var same_day_array = request.getParameter('same_day_array');
		var next_day_array = request.getParameter('next_day_array');

		code_array = code_array.split(',');
		same_day_array = same_day_array.split(',');
		next_day_array = next_day_array.split(',');

		var network_JSON = '['

		for (var x = 0; x < code_array.length; x++) {

			network_JSON += '{"suburbs" : "' + code_array[x] + '",';
			network_JSON += '"same_day" : "' + same_day_array[x] + '",'
			network_JSON += '"next_day" : "' + next_day_array[x] + '"},'
		}

		network_JSON = network_JSON.substring(0, network_JSON.length - 1);

		network_JSON += ']';

		var partner_record = nlapiLoadRecord('partner', parseInt(zee2));

		partner_record.setFieldValue('custentity_network_matrix_main', code_array);
		partner_record.setFieldValue('custentity_network_matrix_json', network_JSON);

		nlapiSubmitRecord(partner_record);

		var params = {};

		if (role == 1000) {
			nlapiSetRedirectURL('TASKLINK', 'CARD_-29');
		} else {
			nlapiSetRedirectURL('SUITELET', 'customscript_sl_network_map', 'customdeploy_network_map', null, params);
		}


	}

}