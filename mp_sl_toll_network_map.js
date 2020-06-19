var ctx = nlapiGetContext();

var zee = null;
var role = ctx.getRole();

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

        var form = nlapiCreateForm('TOLL Service Network');

        var inlineQty = '<meta name="viewport" content="width=device-width, initial-scale=1.0"><script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"><script src="//code.jquery.com/jquery-1.11.0.min.js"></script><script src="//api.tiles.mapbox.com/mapbox.js/plugins/leaflet-omnivore/v0.3.1/leaflet-omnivore.min.js"></script><link type="text/css" rel="stylesheet" href="https://cdn.datatables.net/1.10.13/css/jquery.dataTables.min.css"><link href="//netdna.bootstrapcdn.com/bootstrap/3.3.2/css/bootstrap.min.css" rel="stylesheet"><link href="https://1048144.app.netsuite.com/core/media/media.nl?id=1988776&c=1048144&h=58352d0b4544df20b40f&mv=j11m86u8&_xt=.css" rel="stylesheet"><script src="//netdna.bootstrapcdn.com/bootstrap/3.3.2/js/bootstrap.min.js"></script><script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyA92XGDo8rx11izPYT7z2L-YPMMJ6Ih1s0&libraries=places&callback=initAutocomplete"></script></script><link rel="stylesheet" href="https://unpkg.com/leaflet@1.2.0/dist/leaflet.css" /><script src="https://unpkg.com/leaflet@1.2.0/dist/leaflet.js"></script><style>.info {padding: 6px 8px;font: 14px/16px Arial, Helvetica, sans-serif;background: white;background: rgba(255,255,255,0.8);box-shadow: 0 0 15px rgba(0,0,0,0.2);border-radius: 5px;}.info h5 { margin: 0 0 5px;color: #777;}.table {border-radius: 5px;width: 50%;margin: 0px auto;float: none;} #loader {position: absolute;top: 0;bottom: 0;width: 100%;background-color: rgba(245, 245, 245, 0.7);z-index: 200; }#loader img {width: 66px;height: 66px;position: absolute;top: 50%;left: 50%;margin: -33px 0 0 -33px;}.pac-card {margin: 10px 10px 0 0;border-radius: 2px 0 0 2px;box-sizing: border-box;-moz-box-sizing: border-box;outline: none;box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);background-color: #fff;font-family: Roboto;}.center{position: absolute;height: 500px; width: 800px;top: 50%;left: 50%;margin-left:400px;margin-top:250px;}</style>';

        // if (role != 1000) {
        //     inlineQty += '<div class="container" style="padding-top: 3%;"><div class="form-group container"><div class="row"><div class="input-group"><span class="input-group-addon">SELECT ZEE</span><select class="form-control zee_dropdown" >';

        //     var searched_zee = nlapiLoadSearch('partner', 'customsearch_job_inv_process_zee');

        //     var resultSet_zee = searched_zee.runSearch();

        //     var count_zee = 0;

        //     inlineQty += '<option value="' + 0 + '"></option>'

        //     resultSet_zee.forEachResult(function(searchResult_zee) {

        //         zeeid = searchResult_zee.getValue('internalid');
        //         zee_name = searchResult_zee.getValue('entityid');

        //         if (request.getParameter('zee') == zeeid) {
        //             inlineQty += '<option value="' + zeeid + '" selected="selected">' + zee_name + '</option>';
        //         } else {
        //             inlineQty += '<option value="' + zeeid + '">' + zee_name + '</option>';
        //         }


        //         return true;
        //     });

        //     inlineQty += '</select></div></div></div></div>';
        //     zee = request.getParameter('zee');
        // }
        form.addField('zee', 'text', 'zee').setDisplayType('hidden').setDefaultValue(zee);

        inlineQty += '<input id="pac-input" class="form-control form-group container controls" type="text" placeholder="Search Box" style="z-index: 0;left: 250px;top: 0px;width: 50%;/* align-content: center; */"><div id="map" style="height: 500px"  class="container "></div>';
        inlineQty += '</br>';
        inlineQty += '</br>';
        inlineQty += '</br>';



        inlineQty += '</div>'
        form.addField('preview_table', 'inlinehtml', '').setLayoutType('outsidebelow', 'startrow').setDefaultValue(inlineQty);
        form.setScript('customscript_cl_toll_network_map');

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