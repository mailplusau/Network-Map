/*
 * @Author: ankith.ravindran
 * @Date:   2019-01-03 10:15:47
 * @Last Modified by:   ankith.ravindran
 * @Last Modified time: 2019-01-15 09:27:40
 */


function convertNetowrkToJSON() {
	var zeeServiceNetwork = nlapiLoadSearch('partner', 'customsearch_audit_zee_service_network');

	//Run through the search
	var resultZeeServiceNetwork = zeeServiceNetwork.runSearch();

	//iterate through each line from the search
	resultZeeServiceNetwork.forEachResult(function(searchResult) {

		//Get values from the search
		var zeeID = searchResult.getValue("internalid"); // Zee Internal ID
		var suburbs = searchResult.getValue("custentity_network_matrix_main"); // Zee Network Matrix Main

		var partner_record = nlapiLoadRecord('partner', parseInt(zeeID));

		var suburbs_array = suburbs.split(',');

		var network_JSON = '[';

		for (var x = 0; x < suburbs_array.length; x++) {

			network_JSON += '{"suburbs" : "' + suburbs_array[x] + '",';
			network_JSON += '"same_day" : "10",'
			network_JSON += '"next_day" : "8"},'
		}

		network_JSON = network_JSON.substring(0, network_JSON.length - 1);

		network_JSON += ']';

		partner_record.setFieldValue('custentity_network_matrix_json', network_JSON);

		nlapiSubmitRecord(partner_record, false, true);

		return true;
	})

}