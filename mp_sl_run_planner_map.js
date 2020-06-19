var ctx = nlapiGetContext();

var zee = 0;
var role = ctx.getRole();

if (role == 1000) {
    //Franchisee
    zee = ctx.getUser();
} else if (role == 3) { //Administrator
    zee = 0; //test
} else if (role == 1032) { // System Support
    zee = 0; //test-AR
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
        //PARAMETERS
        var day = request.getParameter('day');
        if (isNullorEmpty(day)) {
            day = getDay();
            if (day == 0 || day == 6) {
                day = 1; //Monday
            }
        }
        var op = request.getParameter('op');
        if (isNullorEmpty(op)) {
            op = 0;
        }
        var run = request.getParameter('run');
        if (isNullorEmpty(run)) {
            run = 0;
        } else if (run != 0) {
            run_record = nlapiLoadRecord('customrecord_run_plan', parseInt(run));
            op = run_record.getFieldValue('custrecord_run_operator');
        }

        var before_time = request.getParameter('before');
        var after_time = request.getParameter('after');
        var optimize = request.getParameter('optimize');
        if (isNullorEmpty(optimize)) {
            optimize = false;
        }

        nlapiLogExecution('DEBUG', 'day', day);
        nlapiLogExecution('DEBUG', 'op', op);
        nlapiLogExecution('DEBUG', 'run', run);
        nlapiLogExecution('DEBUG', 'before_time', before_time);
        nlapiLogExecution('DEBUG', 'after_time', after_time);
        nlapiLogExecution('DEBUG', 'optimize', optimize);

        var form = nlapiCreateForm('Your Franchise Service Network');

        var inlineQty = '<meta name="viewport" content="width=device-width, initial-scale=1.0"><script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"><script src="//code.jquery.com/jquery-1.11.0.min.js"></script><script src="//api.tiles.mapbox.com/mapbox.js/plugins/leaflet-omnivore/v0.3.1/leaflet-omnivore.min.js"></script><link type="text/css" rel="stylesheet" href="https://cdn.datatables.net/1.10.13/css/jquery.dataTables.min.css"><link href="//netdna.bootstrapcdn.com/bootstrap/3.3.2/css/bootstrap.min.css" rel="stylesheet"><link href="https://1048144.app.netsuite.com/core/media/media.nl?id=1988776&c=1048144&h=58352d0b4544df20b40f&mv=j11m86u8&_xt=.css" rel="stylesheet"><script src="//netdna.bootstrapcdn.com/bootstrap/3.3.2/js/bootstrap.min.js"></script><script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyA92XGDo8rx11izPYT7z2L-YPMMJ6Ih1s0&callback=initMap&libraries=places"></script><script src="https://cdnjs.cloudflare.com/ajax/libs/OverlappingMarkerSpiderfier/1.0.3/oms.min.js"></script></script><link rel="stylesheet" href="https://unpkg.com/leaflet@1.2.0/dist/leaflet.css" /><script src="https://unpkg.com/leaflet@1.2.0/dist/leaflet.js"></script><style>.info {padding: 6px 8px;font: 14px/16px Arial, Helvetica, sans-serif;background: white;background: rgba(255,255,255,0.8);box-shadow: 0 0 15px rgba(0,0,0,0.2);border-radius: 5px;}.info h5 { margin: 0 0 5px;color: #777;}.table {border-radius: 5px;width: 50%;margin: 0px auto;float: none;} #loader {position: absolute;top: 0;bottom: 0;width: 100%;background-color: rgba(245, 245, 245, 0.7);z-index: 200; }#loader img {width: 66px;height: 66px;position: absolute;top: 50%;left: 50%;margin: -33px 0 0 -33px;}</style>';

        inlineQty += '<div id="myModal" class="modal fade bs-example-modal-sm" tabindex="-1" role="dialog" aria-labelledby="mySmallModalLabel" aria-hidden="true"><div class="modal-dialog modal-sm" role="document" style="width :max-content"><div class="modal-content" style="width :max-content; max-width: 900px"><div class="modal-header"><button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button><h4 class="modal-title panel panel-info" id="exampleModalLabel">Run Summary</h4><br> </div><div class="modal-body"></div><div class="modal-footer"><button type="button" class="btn btn-default" data-dismiss="modal">Close</button></div></div></div></div>';

        inlineQty += '<div class="se-pre-con"></div><button type="button" class="btn btn-sm btn-info instruction_button" data-toggle="collapse" data-target="#demo">Click for Instructions</button><div id="demo" style="background-color: #cfeefc !important;border: 1px solid #417ed9;padding: 10px 10px 10px 20px;width:96%;position:absolute" class="collapse"><b><u>IMPORTANT INSTRUCTIONS:</u></b>';
        inlineQty += '<ul><li><input type="button" class="btn btn-xs btn-success" id="apply" value="APPLY" disabled/> - <ul><li>Click to apply the details : day, run, time.</li></ul></li>';
        inlineQty += '</ul></div>';

        inlineQty += '<div class="container" id="main_container" style="padding-top: 3%;"><div class="container row_parameters">';
        //SELECT FRANCHISEE
        if (role != 1000) {
            inlineQty += '<div class="form-group row"><div class="col-sm-3"><div class="input-group"><span class="input-group-addon">SELECT ZEE</span><select class="form-control zee_dropdown">';

            var searched_zee = nlapiLoadSearch('partner', 'customsearch_job_inv_process_zee');
            var resultSet_zee = searched_zee.runSearch();
            var count_zee = 0;

            inlineQty += '<option value="' + 0 + '"></option>'

            resultSet_zee.forEachResult(function(searchResult_zee) {

                zeeid = searchResult_zee.getValue('internalid');
                zee_name = searchResult_zee.getValue('entityid');

                if (request.getParameter('zee') == zeeid) {
                    inlineQty += '<option value="' + zeeid + '" selected="selected">' + zee_name + '</option>';
                    zee = zeeid;
                    var zee_text = zee_name;
                    form.addField('zee_text', 'text', 'zee').setDisplayType('hidden').setDefaultValue(zee_text);
                } else {
                    inlineQty += '<option value="' + zeeid + '">' + zee_name + '</option>';
                }
                return true;
            });

            inlineQty += '</select></div></div>';
            inlineQty += '</div>';
            //zee = request.getParameter('zee');
        }


        if (zee != 0) {
            inlineQty += '<div class="form-group row">';
            inlineQty += '<div class="col-sm-12 heading1"><h4><span class="label label-default col-sm-12">RUN DETAILS</span></h4></div>';
            inlineQty += '</div>';
            inlineQty += '<div class="form-group row">';
            //SELECT DAY - today by default
            var day_array = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

            inlineQty += '<div class="col-sm-4"><div class="input-group"><span class="input-group-addon">SELECT DAY</span><select class="form-control day_dropdown" >';
            for (i = 1; i < 6; i++) { //from Monday to Friday
                if (i == day) {
                    inlineQty += '<option value="' + i + '" selected="selected">' + day_array[i] + '</option>';
                    var day_text = day_array[i];
                } else {
                    inlineQty += '<option value="' + i + '">' + day_array[i] + '</option>';
                }
            }
            inlineQty += '</select></div></div>';

            //SELECT TIME
            if (!isNullorEmpty(before_time)) {
                before_time = convertTo24Hour(before_time);
            }
            if (!isNullorEmpty(after_time)) {
                after_time = convertTo24Hour(after_time);
            }

            inlineQty += '<div class="col-sm-4"><div class="input-group"><span class="input-group-addon">BEFORE</span><input id="before_time" class="form-control before_time" type="time" value="' + before_time + '"/>';
            inlineQty += '</div></div>';
            inlineQty += '<div class="col-sm-4"><div class="input-group"><span class="input-group-addon">AFTER</span><input id="after_time" class="form-control after_time" type="time" value="' + after_time + '"/>';
            inlineQty += '</div></div>';

            inlineQty += '</div>';

            inlineQty += '<div class="form-group row">';
            //SELECT OPERATOR
            inlineQty += '<div class="col-sm-4"><div class="input-group"><span class="input-group-addon">SELECT OPERATOR</span><select class="form-control op_dropdown" >';
            var operatorSearch = nlapiLoadSearch('customrecord_operator', 'customsearch_rta_operator_load');
            var newFilters = new Array();
            newFilters[newFilters.length] = new nlobjSearchFilter('custrecord_operator_franchisee', null, 'anyof', zee);
            operatorSearch.addFilters(newFilters);
            var operatorSet = operatorSearch.runSearch();
            inlineQty += '<option value="' + 0 + '">ALL</option>'
            operatorSet.forEachResult(function(operatorResult) {
                var operator_id = operatorResult.getValue("internalid", null, "GROUP");
                var operator_name = operatorResult.getValue("name", null, "GROUP");
                if (op == operator_id) {
                    inlineQty += '<option value="' + operator_id + '" selected="selected">' + operator_name + '</option>';
                    var op_text = operator_name;
                    form.addField('op_text', 'text', 'zee').setDisplayType('hidden').setDefaultValue(op_text);
                } else {
                    inlineQty += '<option value="' + operator_id + '">' + operator_name + '</option>';
                }
                return true;
            });
            inlineQty += '</select></div></div>';

            //SELECT RUN
            inlineQty += '<div class="col-sm-4"><div class="input-group"><span class="input-group-addon">SELECT RUN</span><select class="form-control run_dropdown" >';
            var runPlanSearch = nlapiLoadSearch('customrecord_run_plan', 'customsearch_app_run_plan_active');
            var newFilters_runPlan = new Array();
            newFilters_runPlan[newFilters_runPlan.length] = new nlobjSearchFilter('custrecord_run_franchisee', null, 'anyof', zee);
            /*            if (op != 0) {
                            newFilters_runPlan[newFilters_runPlan.length] = new nlobjSearchFilter('custrecord_run_operator', null, 'is', op);
                        }*/
            runPlanSearch.addFilters(newFilters_runPlan);
            var resultSet_runPlan = runPlanSearch.runSearch();

            inlineQty += '<option id="no_run" value="no_run" data-op=""></option>';
            inlineQty += '<option id="0" value="' + 0 + '" data-op="">ALL</option>';
            resultSet_runPlan.forEachResult(function(searchResult_runPlan) {
                runinternalid = searchResult_runPlan.getValue('internalid');
                runname = searchResult_runPlan.getValue('name');
                run_op = searchResult_runPlan.getValue('custrecord_run_operator');
                if (run == runinternalid) {
                    inlineQty += '<option id="' + runinternalid + '" value="' + runinternalid + '" selected="selected" data-op="' + run_op + '">' + runname + '</option>';
                    var run_text = runname;
                    form.addField('run_text', 'text', 'zee').setDisplayType('hidden').setDefaultValue(run_text);
                } else {
                    inlineQty += '<option id="' + runinternalid + '" value="' + runinternalid + '" data-op="' + run_op + '">' + runname + '</option>';
                }
                return true;
            });
            inlineQty += '</select></div></div>';

            //OPTIMIZE RUN
            if (optimize == 'true') {
                inlineQty += '<div class="col-sm-4"><div class="input-group"><input type="text" readonly value="Run Optmised" class="form-control input-group-addon"/> <span class="input-group-addon"><input type="checkbox" id="optimize" checked/></span></div></div>';
            } else {
                inlineQty += '<div class="col-sm-4"><div class="input-group"><input type="text" readonly value="Run Optimised" class="form-control input-group-addon"/> <span class="input-group-addon"><input type="checkbox" id="optimize"/></span></div></div>';
            }
            inlineQty += '</div>';

            //APPLY BUTTON
            inlineQty += '<div class="form-group row">';
            inlineQty += '<div class="col-xs-5"></div>';
            inlineQty += '<div class="col-sm-2"><input type="button" class="btn btn-success" id="apply" value="APPLY" style="width: 100%;"/></div>';
            inlineQty += '</div>';


        }

        form.addField('zee', 'text', 'zee').setDisplayType('hidden').setDefaultValue(zee);
        form.addField('day', 'text', 'zee').setDisplayType('hidden').setDefaultValue(parseInt(day));
        form.addField('day_text', 'text', 'zee').setDisplayType('hidden').setDefaultValue(day_text);
        form.addField('op', 'text', 'zee').setDisplayType('hidden').setDefaultValue(parseInt(op));
        form.addField('run', 'text', 'zee').setDisplayType('hidden').setDefaultValue(parseInt(run));
        form.addField('beforetime', 'text', 'zee').setDisplayType('hidden').setDefaultValue(before_time);
        form.addField('aftertime', 'text', 'zee').setDisplayType('hidden').setDefaultValue(after_time);
        nlapiLogExecution('DEBUG', 'optimize', optimize);
        form.addField('optimisation', 'text', 'zee').setDisplayType('hidden').setDefaultValue(optimize);

        inlineQty += '</br>';
        inlineQty += '<div class="row_time hide">'
        inlineQty += '<div class="form-group row">';
        inlineQty += '<div class="col-xs-3 firststop"><div class="input-group"><span class="input-group-addon">START</span><input id="firststop" class="form-control" readonly/></div></div>';
        inlineQty += '<div class="col-xs-3 laststop"><div class="input-group"><span class="input-group-addon">END</span><input id="laststop" class="form-control" readonly/></div></div>';
        inlineQty += '<div class="col-xs-4 travelling_time"><div class="input-group"><span class="input-group-addon">TRAVELLING TIME</span><input id="travelling_time" class="form-control" readonly/></div></div>';
        inlineQty += '<div class="col-xs-2 run_summary"><button type="button" class="form-control btn-xs btn-secondary run_summary" data-toggle="modal" data-target="#myModal"><span class="glyphicon glyphicon-eye-open"></span></button></div></div>';
        inlineQty += '</div></div>';

        //inlineQty += '</div>';

        //RUN NOT SCHEDULED
        inlineQty += '<div class="container run_not_scheduled hide">'
        inlineQty += '<h3 style="text-align: center;">This run is not scheduled. Please use the <a href=' + nlapiResolveURL('SUITELET','customscript_sl_full_calendar','customdeploy_sl_full_calender') +'&zee=' + zee +'>Run Scheduler</a> to set it up.</h3>';
        inlineQty += '</div>';
        //OPERATOR NOT ASSIGNED TO ANY RUN
        inlineQty += '<div class="container op_not_assigned hide">'
        inlineQty += '<h3 style="text-align: center;">This operator is not assigned to any run. Please use the <a href=' + nlapiResolveURL('SUITELET','customscript_sl_full_calendar','customdeploy_sl_full_calender') +'&zee=' + zee +'>Run Scheduler</a> to set it up.</h3>';
        inlineQty += '</div>';


        //SEARCH FOR AN ADDRESS
        inlineQty += '<div class="container row_address hide">'
        inlineQty += '<div class="form-group row">';
        inlineQty += '<div class="col-sm-12 heading1"><h4><span class="label label-default col-sm-12">SEARCH FOR A PLACE</span></h4></div>';
        inlineQty += '</div>';

        inlineQty += '<div class="form-group row">';
        inlineQty += '<div class="col-xs-8"><div class="input-group"><span class="input-group-addon">STREET NO. & NAME</span><input id="address" class="form-control address" /></div></div>';

        inlineQty += '</div>';

        inlineQty += '<div class="form-group row">';
        inlineQty += '<div class="col-xs-3"><div class="input-group"><span class="input-group-addon">CITY</span><input id="city" readonly class="form-control city" /></div></div>';
        inlineQty += '<div class="col-xs-3"><div class="input-group"><span class="input-group-addon">STATE</span><input id="state" readonly class="form-control state" /></div></div>';
        inlineQty += '<div class="col-xs-2 post_code_section"><div class="input-group"><span class="input-group-addon">POSTCODE</span><input id="postcode" readonly class="form-control postcode" /></div></div>';
        inlineQty += '</div>';

        inlineQty += '<div class="form-group row">';
        inlineQty += '<div class="col-xs-3"><div class="input-group"><span class="input-group-addon">LAT</span><input id="lat" readonly class="form-control lat" /></div></div>';
        inlineQty += '<div class="col-xs-3"><div class="input-group"><span class="input-group-addon">LNG</span><input id="lng" readonly class="form-control lng" /></div></div>';
        inlineQty += '</div>';

        inlineQty += '<div class="form-group row">';
        inlineQty += '<div class="col-xs-4"></div>';
        inlineQty += '<div class="col-xs-2"><input type="button" class="btn btn-primary" id="viewOnMap" value="VIEW ON MAP" style="width: 100%;"/></div>';
        inlineQty += '<div class="col-xs-2"><input type="button" class="btn btn-warning" id="clearMarkers" value="CLEAR MARKERS" style="width: 100%;"/></div>';
        inlineQty += '</div>';
        inlineQty += '</div>';


        //MAP
        inlineQty += '</br>';
        inlineQty += '<div class="container map_section hide"><div class="row">';
        inlineQty += '<div class="col-sm-8" id="map" style="height: 500px"><div id="loader"><img src="https://1048144.app.netsuite.com/core/media/media.nl?id=2089999&c=1048144&h=e0aef405c22b65dfe546" alt="loader" /></div></div>';
        inlineQty += '<div class="hide" id="legend" style="background-color: rgb(255, 255, 255);box-shadow: rgba(0, 0, 0, 0.3) 0px 1px 4px -1px;border-radius: 2px;z-index: 0;position: absolute;bottom: 26px;left: 0px;margin-left: 5px;padding: 3px;"><div><svg height="23" width="32"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="black" fill="#575756"/></svg><span style="font-family: sans-serif;">Non Customer Location</span></div><div><svg height="23" width="32"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="black" fill="#008675"/></svg><span style="font-family: sans-serif;">Customer Location</span></div></div>';
        inlineQty += '<div class="col-sm-4" id="directionsPanel" style="height:500px; overflow:auto"></div>';
        inlineQty += '</div>';

        inlineQty += '</br>';
        inlineQty += '<div class="row print_section hide">';
        inlineQty += '<div class="col-xs-10"></div>';
        inlineQty += '<div class="col-xs-2"><input type="button" class="btn btn-info" id="printDirections" value="PRINT DIRECTIONS" style="width: 100%;"/></div>';
        inlineQty += '</div>';
        inlineQty += '</div>';

        inlineQty += '</br>';
        inlineQty += '</br>';



        inlineQty += '</div>'; //close main container


        form.addField('preview_table', 'inlinehtml', '').setLayoutType('outsidebelow', 'startrow').setDefaultValue(inlineQty);
        form.setScript('customscript_cl_run_planner_map');

        //form.addSubmitButton('Submit');

        response.writePage(form);
    } else {
        /*        var zee2 = request.getParameter('zee');
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
                }*/


    }

}

function getDay() {
    var date = new Date();
    if (date.getHours() > 6) {
        date = nlapiAddDays(date, 1);
    }
    var day = date.getDay();

    return day;
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