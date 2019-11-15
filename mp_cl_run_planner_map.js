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


function clientPageInit(type) {

    $('#loader').remove();

    if (isNullorEmpty(nlapiGetFieldValue('zee'))) {
        zee = 0;
    } else {
        zee = parseInt(nlapiGetFieldValue('zee'));
    }
    // var zeeRecord = nlapiLoadRecord('partner', 228329);
    // var stop_freq_json = zeeRecord.getFieldValue('custentity_zee_run', stop_freq_json);

    if (zee != 0) {
        var serviceLegSearch = nlapiLoadSearch('customrecord_service_leg', 'customsearch_rp_leg_freq_all_2');

        var day = moment().day();
        var date = new Date();
        date = nlapiDateToString(date);
        console.log(date);
        console.log(moment().day())
            // day++;
        console.log('day of week ' + days_of_week[day]);

        if (day != 0 && day != 6) {

            var newFilters = new Array();
            newFilters[newFilters.length] = new nlobjSearchFilter('custrecord_service_leg_franchisee', null, 'anyof', zee);
            newFilters[newFilters.length] = new nlobjSearchFilter(days_of_week[day], "custrecord_service_freq_stop", "is", "T");

            var stop_count = 0;
            var freq_count = 0;

            var old_stop_name = null;
            var service_id_array = [];
            var service_name_array = [];
            var service_descp_array = [];
            var old_customer_id_array = [];
            var old_customer_text_array = [];
            var old_run_plan_array = [];
            var old_run_plan_text_array = [];
            var old_closing_day = [];
            var old_opening_day = [];
            var old_service_notes = [];

            var stop_id;
            var stop_name;
            var address;
            var stop_duration;
            var stop_notes;
            var stop_lat;
            var stop_lon;
            var service_id;
            var service_text;
            var customer_id;
            var customer_text;
            var ncl;
            var freq_id;
            var freq_mon;
            var freq_tue;
            var freq_wed;
            var freq_thu;
            var freq_fri;
            var freq_adhoc;
            var freq_time_current;
            var freq_time_start;
            var freq_time_end;
            var freq_run_plan;

            var old_stop_id = [];
            var old_stop_name;
            var old_service_time;
            var old_address;
            var old_stop_duration;
            var old_stop_notes = '';
            var old_stop_lat;
            var old_stop_lon;
            var old_service_id;

            var old_service_text;
            var old_customer_id;
            var old_customer_text;
            var old_ncl;
            var old_freq_id = [];
            var old_freq_mon;
            var old_freq_tue;
            var old_freq_wed;
            var old_freq_thu;
            var old_freq_fri;
            var old_freq_adhoc;
            var old_freq_time_current;
            var old_freq_time_start;
            var old_freq_time_end;
            var old_freq_run_plan;
            var old_address;


            var freq = [];
            var old_freq = [];

            var stop_freq_json = '{ "data": [';

            serviceLegSearch.addFilters(newFilters);

            var resultSet = serviceLegSearch.runSearch();

            resultSet.forEachResult(function(searchResult) {
                stop_id = searchResult.getValue('internalid', null, "GROUP");
                stop_name = searchResult.getValue('name', null, "GROUP");
                stop_duration = parseInt(searchResult.getValue('custrecord_service_leg_duration', null, "GROUP"));
                stop_notes = searchResult.getValue('custrecord_service_leg_notes', null, "GROUP");
                stop_lat = searchResult.getValue("custrecord_service_leg_addr_lat", null, "GROUP");
                stop_lon = searchResult.getValue("custrecord_service_leg_addr_lon", null, "GROUP");
                service_id = searchResult.getValue('custrecord_service_leg_service', null, "GROUP");
                service_text = searchResult.getText('custrecord_service_leg_service', null, "GROUP");
                customer_id = searchResult.getValue('custrecord_service_leg_customer', null, "GROUP");
                customer_text = searchResult.getText('custrecord_service_leg_customer', null, "GROUP");
                customer_id_text = searchResult.getValue("entityid", "CUSTRECORD_SERVICE_LEG_CUSTOMER", "GROUP");
                customer_name_text = searchResult.getValue("companyname", "CUSTRECORD_SERVICE_LEG_CUSTOMER", "GROUP");
                ncl = searchResult.getValue('custrecord_service_leg_non_cust_location', null, "GROUP");

                if (!isNullorEmpty(stop_notes)) {
                    if (isNullorEmpty(ncl)) {
                        stop_notes = '</br><b>Stop Notes</b> - ' + stop_notes + '</br>';
                    } else {
                        // stop_notes = '</br><b>Stop Notes</b> - '+customer_name_text + ' : ' + stop_notes + '</br>';
                        stop_notes = '<b>Stop Notes</b> - ' + stop_notes + '</br>';
                    }

                } else {
                    stop_notes = '';
                }

                freq_id = searchResult.getValue("internalid", "CUSTRECORD_SERVICE_FREQ_STOP", "GROUP");
                freq_mon = searchResult.getValue("custrecord_service_freq_day_mon", "CUSTRECORD_SERVICE_FREQ_STOP", "GROUP");
                freq_tue = searchResult.getValue("custrecord_service_freq_day_tue", "CUSTRECORD_SERVICE_FREQ_STOP", "GROUP");
                freq_wed = searchResult.getValue("custrecord_service_freq_day_wed", "CUSTRECORD_SERVICE_FREQ_STOP", "GROUP");
                freq_thu = searchResult.getValue("custrecord_service_freq_day_thu", "CUSTRECORD_SERVICE_FREQ_STOP", "GROUP");
                freq_fri = searchResult.getValue("custrecord_service_freq_day_fri", "CUSTRECORD_SERVICE_FREQ_STOP", "GROUP");
                freq_adhoc = searchResult.getValue("custrecord_service_freq_day_adhoc", "CUSTRECORD_SERVICE_FREQ_STOP", "GROUP");
                freq_time_current = convertTo24Hour(searchResult.getValue("custrecord_service_freq_time_current", "CUSTRECORD_SERVICE_FREQ_STOP", "GROUP"));
                freq_time_start = convertTo24Hour(searchResult.getValue("custrecord_service_freq_time_start", "CUSTRECORD_SERVICE_FREQ_STOP", "GROUP"));
                freq_time_end = convertTo24Hour(searchResult.getValue("custrecord_service_freq_time_end", "CUSTRECORD_SERVICE_FREQ_STOP", "GROUP"));
                freq_run_plan = searchResult.getValue("custrecord_service_freq_run_plan", "CUSTRECORD_SERVICE_FREQ_STOP", "GROUP");
                closing_day = searchResult.getValue("custrecord_service_leg_closing_date", null, "GROUP");
                opening_day = searchResult.getValue("custrecord_service_leg_opening_date", null, "GROUP");
                freq_run_plan_text = searchResult.getText("custrecord_service_freq_run_plan", "CUSTRECORD_SERVICE_FREQ_STOP", "GROUP");
                freq_run_st_no = searchResult.getValue("custrecord_service_leg_addr_st_num_name", null, "GROUP");
                freq_run_suburb = searchResult.getValue("custrecord_service_leg_addr_suburb", null, "GROUP");
                freq_run_state = searchResult.getValue("custrecord_service_leg_addr_state", null, "GROUP");
                freq_run_postcode = searchResult.getValue("custrecord_service_leg_addr_postcode", null, "GROUP");

                if (!isNullorEmpty(freq_run_st_no)) {
                    address = freq_run_st_no + ', ' + freq_run_suburb + ', ' + freq_run_state + ' - ' + freq_run_postcode;
                } else {
                    address = freq_run_suburb + ', ' + freq_run_state + ' - ' + freq_run_postcode;
                }



                freq = [];

                if (freq_mon == 'T') {
                    freq[freq.length] = 1
                }

                if (freq_tue == 'T') {
                    freq[freq.length] = 2
                }

                if (freq_wed == 'T') {
                    freq[freq.length] = 3
                }

                if (freq_thu == 'T') {
                    freq[freq.length] = 4
                }

                if (freq_fri == 'T') {
                    freq[freq.length] = 5
                }

                if (isNullorEmpty(ncl)) {
                    // stop_name = customer_id_text + ' ' + customer_name_text + ' - ' + address;
                    stop_name = customer_name_text + ' \\n Address: ' + address;
                }


                if (stop_count != 0 && old_stop_name != stop_name) {
                    if (!isNullorEmpty(old_freq_id.length)) {
                        var freq_time_current_array = old_freq_time_current.split(':');

                        var min_array = convertSecondsToMinutes(old_stop_duration);

                        min_array[0] = min_array[0] + parseInt(freq_time_current_array[1]);

                        if (isNullorEmpty(old_ncl)) {
                            var bg_color = '#3a87ad';
                        } else {
                            var bg_color = '#009688';
                        }


                        var date = moment().day(day).date();
                        var month = moment().day(day).month();
                        var year = moment().day(day).year();

                        var date_of_week = date + '/' + (month + 1) + '/' + year;

                        stop_freq_json += '{"id": "' + old_stop_id + '",';
                        stop_freq_json += '"closing_days": "' + old_closing_day + '",';
                        stop_freq_json += '"opening_days": "' + old_opening_day + '",';
                        stop_freq_json += '"lat": "' + old_stop_lat + '",';
                        stop_freq_json += '"lon": "' + old_stop_lon + '",';
                        stop_freq_json += '"address": "' + old_address + '",';
                        if (isNullorEmpty(old_ncl)) {
                            for (var i = 0; i < service_id_array.length; i++) {
                                if (date_of_week >= old_closing_day[i] && date_of_week < old_opening_day[i]) {
                                    stop_freq_json += '"title": "CLOSED - ' + old_stop_name + '",';
                                    stop_freq_json += '"color": "#ad3a3a",';
                                } else {
                                    stop_freq_json += '"title": "' + old_stop_name + '",';
                                    stop_freq_json += '"color": "' + bg_color + '",';

                                }
                            }
                        } else {
                            stop_freq_json += '"title": "' + old_stop_name + '",';
                            stop_freq_json += '"color": "' + bg_color + '",';
                        }

                        var start_time = moment().day(day).hours(freq_time_current_array[0]).minutes(freq_time_current_array[1]).seconds(0).format();
                        var end_time = moment().add({
                            seconds: min_array[1]
                        }).day(day).hours(freq_time_current_array[0]).minutes(min_array[0]).format();

                        stop_freq_json += '"start": "' + start_time + '",';
                        stop_freq_json += '"end": "' + end_time + '",';
                        stop_freq_json += '"description": "' + old_stop_notes + '",';
                        stop_freq_json += '"ncl": "' + old_ncl + '",';
                        stop_freq_json += '"freq_id": "' + old_freq_id + '",';
                        stop_freq_json += '"services": ['

                        for (var i = 0; i < service_id_array.length; i++) {
                            // nlapiLogExecution('DEBUG', 'customer', old_customer_text_array[i]);
                            // nlapiLogExecution('DEBUG', 'closing day', old_closing_day[i]);
                            stop_freq_json += '{';
                            stop_freq_json += '"customer_id": "' + old_customer_id_array[i] + '",';
                            stop_freq_json += '"customer_notes": "' + old_service_notes[i] + '",';
                            if (date_of_week >= old_closing_day[i] && date_of_week < old_opening_day[i]) {
                                stop_freq_json += '"customer_text": "CLOSED - ' + old_customer_text_array[i] + '",';
                            } else {
                                stop_freq_json += '"customer_text": "' + old_customer_text_array[i] + '",';
                            }



                            stop_freq_json += '"run_plan": "' + old_run_plan_array[i] + '",';
                            stop_freq_json += '"run_plan_text": "' + old_run_plan_text_array[i] + '",';
                            stop_freq_json += '"service_id": "' + service_id_array[i] + '",';
                            stop_freq_json += '"service_text": "' + service_name_array[i] + '"';
                            stop_freq_json += '},'
                        }
                        stop_freq_json = stop_freq_json.substring(0, stop_freq_json.length - 1);
                        stop_freq_json += ']},'



                        old_stop_name = null;
                        old_address = null;
                        old_stop_lat;
                        old_stop_lon;
                        old_stop_id = [];
                        old_closing_day = [];
                        old_opening_day = [];
                        service_id_array = [];
                        service_name_array = [];
                        old_customer_id_array = [];
                        old_customer_text_array = [];
                        old_freq_id = [];
                        old_run_plan_array = [];
                        old_run_plan_text_array = [];
                        old_stop_notes = '';
                        old_service_notes = [];


                        old_freq = [];
                        freq = [];

                        if (freq_mon == 'T') {
                            freq[freq.length] = 1
                        }

                        if (freq_tue == 'T') {
                            freq[freq.length] = 2
                        }

                        if (freq_wed == 'T') {
                            freq[freq.length] = 3
                        }

                        if (freq_thu == 'T') {
                            freq[freq.length] = 4
                        }

                        if (freq_fri == 'T') {
                            freq[freq.length] = 5
                        }



                        service_id_array[service_id_array.length] = service_id;
                        old_service_notes[old_service_notes.length] = stop_notes;
                        service_name_array[service_name_array.length] = service_text;
                        old_customer_id_array[old_customer_id_array.length] = customer_id;
                        old_customer_text_array[old_customer_text_array.length] = customer_id_text + ' ' + customer_name_text;
                        old_run_plan_array[old_run_plan_array.length] = freq_run_plan;
                        old_run_plan_text_array[old_run_plan_text_array.length] = freq_run_plan_text;
                        old_closing_day[old_closing_day.length] = closing_day;
                        old_opening_day[old_opening_day.length] = opening_day;
                        // stop_count++;
                    }
                } else {

                    var result = arraysEqual(freq, old_freq);
                    if (old_service_time != freq_time_current && stop_count != 0) {
                        if (!isNullorEmpty(old_freq_id.length)) {
                            var freq_time_current_array = old_freq_time_current.split(':');

                            var min_array = convertSecondsToMinutes(old_stop_duration);

                            min_array[0] = min_array[0] + parseInt(freq_time_current_array[1]);

                            if (isNullorEmpty(old_ncl)) {
                                var bg_color = '#3a87ad';
                            } else {
                                var bg_color = '#009688';
                            }


                            var date = moment().day(day).date();
                            var month = moment().day(day).month();
                            var year = moment().day(day).year();

                            var date_of_week = date + '/' + (month + 1) + '/' + year;

                            stop_freq_json += '{"id": "' + old_stop_id + '",';
                            stop_freq_json += '"closing_days": "' + old_closing_day + '",';
                            stop_freq_json += '"opening_days": "' + old_opening_day + '",';
                            stop_freq_json += '"lat": "' + old_stop_lat + '",';
                            stop_freq_json += '"lon": "' + old_stop_lon + '",';
                            stop_freq_json += '"address": "' + old_address + '",';
                            if (isNullorEmpty(old_ncl)) {
                                for (var i = 0; i < service_id_array.length; i++) {
                                    if (date_of_week >= old_closing_day[i] && date_of_week < old_opening_day[i]) {
                                        stop_freq_json += '"title": "CLOSED - ' + old_stop_name + '",';
                                        stop_freq_json += '"color": "#ad3a3a",';
                                    } else {
                                        stop_freq_json += '"title": "' + old_stop_name + '",';
                                        stop_freq_json += '"color": "' + bg_color + '",';

                                    }
                                }
                            } else {
                                stop_freq_json += '"title": "' + old_stop_name + '",';
                                stop_freq_json += '"color": "' + bg_color + '",';
                            }

                            var start_time = moment().day(day).hours(freq_time_current_array[0]).minutes(freq_time_current_array[1]).seconds(0).format();
                            var end_time = moment().add({
                                seconds: min_array[1]
                            }).day(day).hours(freq_time_current_array[0]).minutes(min_array[0]).format();


                            stop_freq_json += '"start": "' + start_time + '",';
                            stop_freq_json += '"end": "' + end_time + '",';
                            stop_freq_json += '"description": "' + old_stop_notes + '",';
                            stop_freq_json += '"ncl": "' + old_ncl + '",';
                            stop_freq_json += '"freq_id": "' + old_freq_id + '",';
                            stop_freq_json += '"services": ['

                            for (var i = 0; i < service_id_array.length; i++) {
                                // nlapiLogExecution('DEBUG', 'customer', old_customer_text_array[i]);
                                // nlapiLogExecution('DEBUG', 'closing day', old_closing_day[i]);
                                stop_freq_json += '{';
                                stop_freq_json += '"customer_id": "' + old_customer_id_array[i] + '",';
                                stop_freq_json += '"customer_notes": "' + old_service_notes[i] + '",';
                                if (date_of_week >= old_closing_day[i] && date_of_week < old_opening_day[i]) {
                                    stop_freq_json += '"customer_text": "CLOSED - ' + old_customer_text_array[i] + '",';
                                } else {
                                    stop_freq_json += '"customer_text": "' + old_customer_text_array[i] + '",';
                                }



                                stop_freq_json += '"run_plan": "' + old_run_plan_array[i] + '",';
                                stop_freq_json += '"run_plan_text": "' + old_run_plan_text_array[i] + '",';
                                stop_freq_json += '"service_id": "' + service_id_array[i] + '",';
                                stop_freq_json += '"service_text": "' + service_name_array[i] + '"';
                                stop_freq_json += '},'
                            }
                            stop_freq_json = stop_freq_json.substring(0, stop_freq_json.length - 1);
                            stop_freq_json += ']},'



                            old_stop_name = null;
                            old_address = null;
                            old_service_time = null;
                            old_stop_id = [];
                            old_closing_day = [];
                            old_opening_day = [];
                            service_id_array = [];
                            service_name_array = [];
                            old_customer_id_array = [];
                            old_customer_text_array = [];
                            old_run_plan_array = [];
                            old_run_plan_text_array = [];
                            old_freq_id = [];
                            old_freq = [];
                            freq = [];
                            old_stop_notes = '';
                            old_closing_day = [];
                            old_opening_day = [];
                            old_service_notes = [];


                            if (freq_mon == 'T') {
                                freq[freq.length] = 1
                            }

                            if (freq_tue == 'T') {
                                freq[freq.length] = 2
                            }

                            if (freq_wed == 'T') {
                                freq[freq.length] = 3
                            }

                            if (freq_thu == 'T') {
                                freq[freq.length] = 4
                            }

                            if (freq_fri == 'T') {
                                freq[freq.length] = 5
                            }

                            service_id_array[service_id_array.length] = service_id;
                            old_service_notes[old_service_notes.length] = stop_notes;
                            service_name_array[service_name_array.length] = service_text;
                            old_customer_id_array[old_customer_id_array.length] = customer_id;
                            old_customer_text_array[old_customer_text_array.length] = customer_id_text + ' ' + customer_name_text;
                            old_run_plan_array[old_run_plan_array.length] = freq_run_plan;
                            old_run_plan_text_array[old_run_plan_text_array.length] = freq_run_plan_text;
                            old_closing_day[old_closing_day.length] = closing_day;
                            old_opening_day[old_opening_day.length] = opening_day;
                        }
                    } else if (result == false && stop_count != 0) {
                        if (!isNullorEmpty(old_freq_id.length)) {
                            var freq_time_current_array = old_freq_time_current.split(':');

                            var min_array = convertSecondsToMinutes(old_stop_duration);

                            min_array[0] = min_array[0] + parseInt(freq_time_current_array[1]);

                            if (isNullorEmpty(old_ncl)) {
                                var bg_color = '#3a87ad';
                            } else {
                                var bg_color = '#009688';
                            }


                            var date = moment().day(day).date();
                            var month = moment().day(day).month();
                            var year = moment().day(day).year();

                            var date_of_week = date + '/' + (month + 1) + '/' + year;

                            stop_freq_json += '{"id": "' + old_stop_id + '",';
                            stop_freq_json += '"closing_days": "' + old_closing_day + '",';
                            stop_freq_json += '"opening_days": "' + old_opening_day + '",';
                            stop_freq_json += '"lat": "' + old_stop_lat + '",';
                            stop_freq_json += '"lon": "' + old_stop_lon + '",';
                            stop_freq_json += '"address": "' + old_address + '",';
                            if (isNullorEmpty(old_ncl)) {
                                for (var i = 0; i < service_id_array.length; i++) {
                                    if (date_of_week >= old_closing_day[i] && date_of_week < old_opening_day[i]) {
                                        stop_freq_json += '"title": "CLOSED - ' + old_stop_name + '",';
                                        stop_freq_json += '"color": "#ad3a3a",';
                                    } else {
                                        stop_freq_json += '"title": "' + old_stop_name + '",';
                                        stop_freq_json += '"color": "' + bg_color + '",';

                                    }
                                }
                            } else {
                                stop_freq_json += '"title": "' + old_stop_name + '",';
                                stop_freq_json += '"color": "' + bg_color + '",';
                            }

                            var start_time = moment().day(day).hours(freq_time_current_array[0]).minutes(freq_time_current_array[1]).seconds(0).format();
                            var end_time = moment().add({
                                seconds: min_array[1]
                            }).day(day).hours(freq_time_current_array[0]).minutes(min_array[0]).format();


                            stop_freq_json += '"start": "' + start_time + '",';
                            stop_freq_json += '"end": "' + end_time + '",';
                            stop_freq_json += '"description": "' + old_stop_notes + '",';
                            stop_freq_json += '"ncl": "' + old_ncl + '",';
                            stop_freq_json += '"freq_id": "' + old_freq_id + '",';
                            stop_freq_json += '"services": ['

                            for (var i = 0; i < service_id_array.length; i++) {
                                // nlapiLogExecution('DEBUG', 'customer', old_customer_text_array[i]);
                                // nlapiLogExecution('DEBUG', 'closing day', old_closing_day[i]);
                                stop_freq_json += '{';
                                stop_freq_json += '"customer_id": "' + old_customer_id_array[i] + '",';
                                stop_freq_json += '"customer_notes": "' + old_service_notes[i] + '",';
                                if (date_of_week >= old_closing_day[i] && date_of_week < old_opening_day[i]) {
                                    stop_freq_json += '"customer_text": "CLOSED - ' + old_customer_text_array[i] + '",';
                                } else {
                                    stop_freq_json += '"customer_text": "' + old_customer_text_array[i] + '",';
                                }



                                stop_freq_json += '"run_plan": "' + old_run_plan_array[i] + '",';
                                stop_freq_json += '"run_plan_text": "' + old_run_plan_text_array[i] + '",';
                                stop_freq_json += '"service_id": "' + service_id_array[i] + '",';
                                stop_freq_json += '"service_text": "' + service_name_array[i] + '"';
                                stop_freq_json += '},'
                            }
                            stop_freq_json = stop_freq_json.substring(0, stop_freq_json.length - 1);
                            stop_freq_json += ']},'



                            old_stop_name = null;
                            old_address = null;
                            old_service_time = null;
                            old_stop_id = [];
                            old_stop_lat;
                            old_stop_lon;
                            old_closing_day = [];
                            old_opening_day = [];
                            service_id_array = [];
                            service_name_array = [];
                            old_customer_id_array = [];
                            old_customer_text_array = [];
                            old_run_plan_array = [];
                            old_run_plan_text_array = [];
                            old_freq_id = [];
                            old_freq = [];
                            freq = [];
                            old_stop_notes = '';
                            old_closing_day = [];
                            old_opening_day = [];
                            old_service_notes = [];


                            if (freq_mon == 'T') {
                                freq[freq.length] = 1
                            }

                            if (freq_tue == 'T') {
                                freq[freq.length] = 2
                            }

                            if (freq_wed == 'T') {
                                freq[freq.length] = 3
                            }

                            if (freq_thu == 'T') {
                                freq[freq.length] = 4
                            }

                            if (freq_fri == 'T') {
                                freq[freq.length] = 5
                            }

                            service_id_array[service_id_array.length] = service_id;
                            old_service_notes[old_service_notes.length] = stop_notes;
                            service_name_array[service_name_array.length] = service_text;
                            old_customer_id_array[old_customer_id_array.length] = customer_id;
                            old_customer_text_array[old_customer_text_array.length] = customer_id_text + ' ' + customer_name_text;
                            old_run_plan_array[old_run_plan_array.length] = freq_run_plan;
                            old_run_plan_text_array[old_run_plan_text_array.length] = freq_run_plan_text;
                            old_closing_day[old_closing_day.length] = closing_day;
                            old_opening_day[old_opening_day.length] = opening_day;
                        }
                    } else {
                        service_id_array[service_id_array.length] = service_id;
                        old_service_notes[old_service_notes.length] = stop_notes;
                        service_name_array[service_name_array.length] = service_text;
                        old_customer_id_array[old_customer_id_array.length] = customer_id;
                        old_customer_text_array[old_customer_text_array.length] = customer_id_text + ' ' + customer_name_text;
                        old_run_plan_array[old_run_plan_array.length] = freq_run_plan;
                        old_run_plan_text_array[old_run_plan_text_array.length] = freq_run_plan_text;
                        old_closing_day[old_closing_day.length] = closing_day;
                        old_opening_day[old_opening_day.length] = opening_day;
                    }

                }



                old_stop_name = stop_name;
                old_service_time = freq_time_current;
                old_address = address;

                old_stop_id[old_stop_id.length] = stop_id;
                old_stop_lat = stop_lat;
                old_stop_lon = stop_lon;


                old_stop_duration = stop_duration;
                old_stop_notes += stop_notes;

                old_ncl = ncl;
                old_freq_id[old_freq_id.length] = freq_id;
                old_freq_mon = freq_mon;
                old_freq_tue = freq_tue;
                old_freq_wed = freq_wed;
                old_freq_thu = freq_thu;
                old_freq_fri = freq_fri;
                old_freq_adhoc = freq_adhoc;
                old_freq_time_current = freq_time_current;
                old_freq_time_start = freq_time_start;
                old_freq_time_end = freq_time_end;
                old_freq_run_plan = freq_run_plan;

                old_freq = freq;

                stop_count++;

                return true;
            });

            if (stop_count > 0) {
                var freq_time_current_array = old_freq_time_current.split(':');

                var min_array = convertSecondsToMinutes(old_stop_duration);

                min_array[0] = min_array[0] + parseInt(freq_time_current_array[1]);

                if (isNullorEmpty(old_ncl)) {
                    var bg_color = '#3a87ad';
                } else {
                    var bg_color = '#009688';
                }


                var date = moment().day(day).date();
                var month = moment().day(day).month();
                var year = moment().day(day).year();

                var date_of_week = date + '/' + (month + 1) + '/' + year;

                stop_freq_json += '{"id": "' + old_stop_id + '",';
                stop_freq_json += '"closing_days": "' + old_closing_day + '",';
                stop_freq_json += '"opening_days": "' + old_opening_day + '",';
                stop_freq_json += '"lat": "' + old_stop_lat + '",';
                stop_freq_json += '"lon": "' + old_stop_lon + '",';
                stop_freq_json += '"address": "' + old_address + '",';
                if (isNullorEmpty(old_ncl)) {
                    for (var i = 0; i < service_id_array.length; i++) {
                        if (date_of_week >= old_closing_day[i] && date_of_week < old_opening_day[i]) {
                            stop_freq_json += '"title": "CLOSED - ' + old_stop_name + '",';
                            stop_freq_json += '"color": "#ad3a3a",';
                        } else {
                            stop_freq_json += '"title": "' + old_stop_name + '",';
                            stop_freq_json += '"color": "' + bg_color + '",';

                        }
                    }
                } else {
                    stop_freq_json += '"title": "' + old_stop_name + '",';
                    stop_freq_json += '"color": "' + bg_color + '",';
                }

                var start_time = moment().day(day).hours(freq_time_current_array[0]).minutes(freq_time_current_array[1]).seconds(0).format();
                var end_time = moment().add({
                    seconds: min_array[1]
                }).day(day).hours(freq_time_current_array[0]).minutes(min_array[0]).format();


                stop_freq_json += '"start": "' + start_time + '",';
                stop_freq_json += '"end": "' + end_time + '",';
                stop_freq_json += '"description": "' + old_stop_notes + '",';
                stop_freq_json += '"ncl": "' + old_ncl + '",';
                stop_freq_json += '"freq_id": "' + old_freq_id + '",';
                stop_freq_json += '"services": ['

                for (var i = 0; i < service_id_array.length; i++) {
                    // nlapiLogExecution('DEBUG', 'customer', old_customer_text_array[i]);
                    // nlapiLogExecution('DEBUG', 'closing day', old_closing_day[i]);
                    stop_freq_json += '{';
                    stop_freq_json += '"customer_id": "' + old_customer_id_array[i] + '",';
                    stop_freq_json += '"customer_notes": "' + old_service_notes[i] + '",';
                    if (date_of_week >= old_closing_day[i] && date_of_week < old_opening_day[i]) {
                        stop_freq_json += '"customer_text": "CLOSED - ' + old_customer_text_array[i] + '",';
                    } else {
                        stop_freq_json += '"customer_text": "' + old_customer_text_array[i] + '",';
                    }



                    stop_freq_json += '"run_plan": "' + old_run_plan_array[i] + '",';
                    stop_freq_json += '"run_plan_text": "' + old_run_plan_text_array[i] + '",';
                    stop_freq_json += '"service_id": "' + service_id_array[i] + '",';
                    stop_freq_json += '"service_text": "' + service_name_array[i] + '"';
                    stop_freq_json += '},'
                }
                stop_freq_json = stop_freq_json.substring(0, stop_freq_json.length - 1);
                stop_freq_json += ']},';


                stop_freq_json = stop_freq_json.substring(0, stop_freq_json.length - 1);
            }


            stop_freq_json += ']}';

            console.log(stop_freq_json);

            var parsedStopFreq = JSON.parse(stop_freq_json);

            console.log(parsedStopFreq.data.length);

            var stops_number = parsedStopFreq.data.length;
            var stops_number_temp = 0;
            var waypoint_json = [];
            var origin = [];
            var destination = [];

            var markerArray = [];




            if (stops_number > 25) {
                var y_length = Math.ceil(stops_number / 25);
                console.log(y_length)
                var each_request_length = parseInt(stops_number / y_length);
                for (var y = 0; y < y_length; y++) {
                    // stops_number_temp = stops_number - 25;
                    // origin[y] = parsedStopFreq.data[parseInt(y_length * y)].address;
                    // destination[y] = parsedStopFreq.data[parseInt(each_request_length * (y + 1)) - 1].address;
                    waypoint_json[y] = '[';
                    for (var x = (parseInt(each_request_length * y)); x < (parseInt(each_request_length * (y + 1))); x++) {
                        if (!isNullorEmpty(parsedStopFreq.data[x].address)) {
                            waypoint_json[y] += '{"location": "' + parsedStopFreq.data[x].address + '",';
                            if (x == (parseInt(each_request_length * (y + 1)) - 1)) {
                                waypoint_json[y] += '"stopover": ' + true + '}';
                            } else {
                                waypoint_json[y] += '"stopover": ' + true + '},';
                            }
                        }

                    }
                    waypoint_json[y] += ']';
                }

            }


            // for (var x = 0; x < parsedStopFreq.data.length; x++) {
            //     if (!isNullorEmpty(parsedStopFreq.data[x].address)) {

            //         waypoint_json += '{"location": "' + parsedStopFreq.data[x].address + '",';
            //         if (x == (parsedStopFreq.data.length - 1)) {
            //             waypoint_json += '"stopover": ' + true + '}';
            //         } else {
            //             waypoint_json += '"stopover": ' + true + '},';
            //         }
            //     }

            // }

            // waypoint_json += ']';

            console.log(waypoint_json);

            // var parsedWayPoint = JSON.parse(waypoint_json);

            var directionsService = new google.maps.DirectionsService();
            var map = new google.maps.Map(document.getElementById('map'), {
                zoom: 4,
                center: {
                    lat: -27.833,
                    lng: 133.583
                }
            });
            var directionsDisplay = new google.maps.DirectionsRenderer({
                map: map
            });

            var stepDisplay = new google.maps.InfoWindow();

            // var map = new google.maps.Map(document.getElementById('map'), mapOptions);
            // directionsDisplay.setMap(map);

            directionsDisplay.setPanel(document.getElementById('directionsPanel'));


            calculateAndDisplayRoute(directionsDisplay, directionsService, waypoint_json, markerArray, stepDisplay, map);



        }
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

$(document).on('change', '.zee_dropdown', function(event) {
    var zee = $(this).val();

    var url = baseURL + "/app/site/hosting/scriptlet.nl?script=887&deploy=1";

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