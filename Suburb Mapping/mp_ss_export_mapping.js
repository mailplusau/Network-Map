/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 * 
 * Module Description: 
 * 
 * @Last Modified by:   Anesu Chakaingesu
 * 
 */

define(['N/ui/serverWidget', 'N/email', 'N/runtime', 'N/search', 'N/record', 'N/http', 'N/log', 'N/redirect', 'N/task', 'N/format', 'N/currentRecord'],
function(ui, email, runtime, search, record, http, log, redirect, task, format, currentRecord) {
    var zee = 0;
    var role = 0;

    var baseURL = 'https://1048144.app.netsuite.com';
    if (runtime.EnvType == "SANDBOX") {
        baseURL = 'https://1048144-sb3.app.netsuite.com';
    }

    var currRec = currentRecord.get();
    var ctx = runtime.getCurrentScript();

    function main() {
        deletePrevious();

        var main_index = parseInt(ctx.getParameter({ name: 'custscript_ss_export_mapping_selector' }));
        if (isNullorEmpty(main_index) || isNaN(main_index)){
            var main_index = 0;
        }
        var selector = ctx.getParameter({ name: 'custscript_ss_export_mapping_selector' });
        var zeeSet = new Array();
        var zeeSet = JSON.parse(JSON.stringify(ctx.getParameter({ name: 'custscript_ss_export_mapping_zee_set' })));
        // TEST
        // var zeeSet = ["6"]
        // var selector = "s_au_express"
        if (zeeSet.length > 1){
            zeeSet = zeeSet.split("\u0005") // Remove NetSuite Random Space Thingo.
        }
        
        loadSuburbs(zeeSet,selector, main_index);
    }

    function loadSuburbs(zeeSet, selector, main_index){
        log.debug({
            title: 'Loaded Params',
            details: zeeSet + ' ' + selector + ' ' + main_index
        })

        var dataMatchSet = []; // Search Results Object
        var index = 0;

        var csvSet = []; // CSV Export Array List

        var primOperatorSet = []; // Primary Operator Search Results

        // Suburb List Object
        var suburbJSON = [];
        // var suburbSet = [];
        // var suburbList = [];
        // var suburbListState = [];

        // Load List of Primary Operators
        var primOperatorSearch = search.load({ type: 'customrecord_operator', id: 'customsearch_sendleplus_op_list' });
        var primOperatorResult = primOperatorSearch.run().getRange({ start: 0, end: 999 });
        primOperatorSet = JSON.parse(JSON.stringify(primOperatorResult));

        // Load Network/SendlePlus Matrix
        zeeSet.forEach(function(zee_id){
            var zeeSuburbsList = record.load({ type: 'partner', id: zee_id });
            var zee_name = zeeSuburbsList.getValue({ fieldId: 'companyname' });
            var zee_state = zeeSuburbsList.getValue({ fieldId: 'billstate'})
            if (selector == 'mp_standard' || selector == 'mp_express') { // Get Network Matrix
                var JSON_suburb = zeeSuburbsList.getValue({ fieldId: 'custentity_network_matrix_json' });
                if (!isNullorEmpty(JSON_suburb)){
                    JSON_suburb = JSON.parse(JSON_suburb);
                    JSON_suburb.forEach(function(suburb){
                        suburb.suburbs = suburb.suburbs.split(' (')[0];
                        suburb.zee_name = zee_name;
                        suburb.zee_state = zee_state;
                        suburbJSON.push(suburb);
                    });
                }
            } else if (selector == 's_au_express') { // Get SendlePlus Mapping List
                var JSON_suburb = zeeSuburbsList.getValue({ fieldId: 'custentity_sendle_recovery_suburbs' });
                if (!isNullorEmpty(JSON_suburb)){
                    JSON_suburb = JSON.parse(JSON_suburb);
                    JSON_suburb.forEach(function(suburb){
                        var suburb_name = suburb.suburbs.split(' (')[0]
                        suburb.suburbs = suburb_name.toUpperCase();
                        suburb.zee_name = zee_name;
                        suburb.zee_state = zee_state;
                        suburbJSON.push(suburb);
                    });
                }
            }
            return true;
        });
        log.debug({
            title: 'JSON Suburb',
            details: suburbJSON
        })
        
        if (selector == 'mp_standard') { // Not MP Express or Sendle Express - Use Sendle Depot One.
            /** 
             * Primary Datatable: MP Standard
            */
            var dataMatchingSetSearch = search.load({ type: 'customrecord_dom_zones', id: 'customsearch_sendle_dom_zones_5' }); // Sendle Domestic Pickup Zones - All - customsearch_sendle_dom_zones
            var matchingSetLength = parseInt(dataMatchingSetSearch.runPaged().count);
            log.debug({
                title: 'Result Length',
                details: matchingSetLength
            })
            // var main_index = 0;
            for (var data_main_index = main_index; data_main_index < matchingSetLength-1; data_main_index += 1000) {
                dataMatchSet.push(dataMatchingSetSearch.run().getRange({ start: data_main_index, end: data_main_index + 999 })); // 9 | 999
                log.debug({
                    title: "TOTAL LENGHT OF DATA SET",
                    details: (dataMatchSet.length)
                }) 
            }
            for (var data_match_index = 0; data_match_index <= dataMatchSet.length-1; data_match_index++){
                dataMatchSet[data_match_index].forEach(function(row_list) {
                    // var usageLimit = ctx.getRemainingUsage();
                    // if (usageLimit < 50 || main_index == 999) {
                    //     params = {
                    //         custscript_ss_export_mapping_main_index: (main_index + index) - 1,
                    //         custscript_ss_export_mapping_zee_set: zeeSet,
                    //         custscript_ss_export_mapping_selector: selector,
                    //     };
                    //     var reschedule = task.create({
                    //         taskType: task.TaskType.SCHEDULED_SCRIPT,
                    //         scriptId: 'customscript_ss_export_mapping',
                    //         deploymentId: 'customdeploy_ss_export_mapping',
                    //         params: params
                    //     });
                    //     var reschedule_id = reschedule.submit();
                    //     log.debug({
                    //         title: 'Attempting: Rescheduling Script',
                    //         details: reschedule
                    //     });
                    //     return false;

                    // } else {
                        var internalid = row_list.getValue({name: "internalid", label: "Internal ID"});
                        var sub_name = row_list.getValue({
                            name: "custrecord_dom_zones_suburb_name",
                            sort: search.Sort.ASC,
                            label: "Suburb Name"
                        })
                        var state = row_list.getValue({name: "custrecord_dom_sender_state", label: "State"});
                        var opSet = suburbJSON.filter(function (el){ if ((el.suburbs == sub_name) && (el.state == state)) {return el }}) //&& el.state.includes(state)

                        var post_code = row_list.getValue({name: "custrecord_dom_zones_postcode", label: "Postcode"}) // 2000 etc
                        var country_code = row_list.getValue({name: "custrecord_dom_zones_country_code", label: "Country Code"}) // AU
                        var zone_id = row_list.getText({name: "custrecord_dom_zones_zone_id", label: "Zone ID"}) // AU-Sydney | AU-Adelaide etc
                        var sender_zones = row_list.getValue({name: "custrecord_dom_zones_ns_zones", label: "Sender Zones"}) // SYD | MEL etc
                        
                        /**
                         *  Match with JSON Under FRanchisee
                         */
                        if (!isNullorEmpty(opSet[0])){
                            if (!isNullorEmpty(opSet[0].primary_op)){
                                var prim_id = opSet[0].primary_op; //   - POPULATE THIS!!!
                                if (typeof prim_id == 'object'){
                                    log.debug({
                                        title: 'Primary ID | OBJECT | ' + prim_id,
                                        details: prim_id.length
                                    })
                                    var prim_obj = primOperatorSet.filter(function(el) { if (prim_id.indexOf(el.id) != -1) { return el } });
                                    prim_obj.forEach(function(prim, index){
                                        log.debug({
                                            title: 'index',
                                            details: prim_name
                                        })
                                        if (index > 0){
                                            prim_name += ('| ' + prim.values.name);
                                        } else {
                                            prim_name = prim.values.name;
                                        }
                                    });
                                } else {
                                    var prim_obj = primOperatorSet.filter(function (el) { return el.id == prim_id });
                                    var prim_name = prim_obj[0].values.name;
                                }
                            }
                            if (!isNullorEmpty(opSet[0].zee_name)){
                                var zee_name = opSet[0].zee_name;
                            }
                        } else {
                            var prim_id = '';
                            var prim_name = '';
                            var zee_name = '';
                        }
                        csvSet.push([
                            internalid, //"Internalid", 
                            sub_name, //"Suburb Name", 
                            post_code, //"Post Code", 
                            country_code, //"Country Code", 
                            zone_id, //"Zone ID", 
                            sender_zones, //"Sender Zones", 
                            state, //"State", 
                            zee_name, //"Franchisee", 
                            prim_name, //"Primary Driver" 
                        ]);                    

                        main_index++;

                        return true;
                    // }
                });
            }
        } else { // MP Express and Sendle AU Express
            /** 
             * Primary Datatable: MP Express & AU Express
            */
            var dataMatchingSetSearch = search.load({ type: 'customrecord_sendleplus_mapping_list', id: 'customsearch_sendleplus_mapping_search' }); // Toll Suburbs List
            var matchingSetLength = parseInt(dataMatchingSetSearch.runPaged().count);
            // var main_index = 0;
            for (var data_main_index = main_index; data_main_index <  matchingSetLength-1; data_main_index += 1000) {
                dataMatchSet.push(dataMatchingSetSearch.run().getRange({ start: data_main_index, end: data_main_index + 999 })); // 9 | 999   
                log.debug({
                    title: "TOTAL LENGHT OF DATA SET",
                    details: (dataMatchSet.length)
                }) 
            }
            for (var data_match_index = 0; data_match_index <= dataMatchSet.length-1; data_match_index++){
                dataMatchSet[data_match_index].forEach(function(row_list) {
                    // if (usageLimit < 100 || main_index == 999) {
                    //     params = {
                    //         custscript_ss_export_mapping_main_index: (main_index + index) - 1,
                    //         custscript_ss_export_mapping_zee_set: zeeSet,
                    //         custscript_ss_export_mapping_selector: selector,
                    //     };
                    //     var reschedule = task.create({
                    //         taskType: task.TaskType.SCHEDULED_SCRIPT,
                    //         scriptId: 'customscript_ss_export_mapping',
                    //         deploymentId: 'customdeploy_ss_export_mapping',
                    //         params: params
                    //     });
                    //     var reschedule_id = reschedule.submit();
                    //     log.debug({
                    //         title: 'Attempting: Rescheduling Script',
                    //         details: reschedule
                    //     });
                    //     return false;

                    // } else {
                        var sub_name = row_list.getValue({ name: 'custrecord_sendleplus_sub_name' });
                        var state = row_list.getValue({ name: 'custrecord_sendleplus_state' });
                        var opSet = suburbJSON.filter(function (el){ if ((el.suburbs == sub_name) && (el.zee_state == state)) {return el }}) // Include State
                        if (sub_name == 'ABERFOYLE PARK'){
                            log.debug({
                                title: 'opSet',
                                details: opSet
                            });
                            log.debug({
                                title: 'Data',
                                details: sub_name + ' ' + state
                            })
                        }
                        

                        var internalid = row_list.getValue({ name: 'internalid' }) // Netsuite ID for Record
                        var externalid = row_list.getValue({ name: 'externalid' }); // Toll - mappiung id
                        var sub_code = row_list.getValue({ name: 'custrecord_sendleplus_sub_code' });
                        var post_code = row_list.getValue({ name: 'custrecord_sendleplus_postcode' });
                        
                        var sa3_code = row_list.getValue({ name: 'custrecord_sendleplus_sa3_code' });
                        var sa3_name = row_list.getValue({ name: 'custrecord_sendleplus_sa3_name' });
                        var sa4_code = row_list.getValue({ name: 'custrecord_sendleplus_sa4_code' });
                        var sa4_name = row_list.getValue({ name: 'custrecord_sendleplus_sa4_name' });

                        /**
                         *  Match with JSON Under FRanchisee
                         */
                        if (!isNullorEmpty(opSet[0])){
                            if (!isNullorEmpty(opSet[0].primary_op)){
                                var prim_id = opSet[0].primary_op; //   - POPULATE THIS!!!!
                                // var prim_obj = primOperatorSet.filter(function (el) { return el.id == prim_id });
                                // var prim_name = prim_obj[0].values.name;
                                // var prim_email = prim_obj[0].values.email;
                                // var prim_num = prim_obj[0].values.name;
                                if (typeof prim_id == 'object'){
                                    log.debug({
                                        title: 'Primary ID | OBJECT | ' + prim_id,
                                        details: prim_id.length
                                    })
                                    var prim_obj = primOperatorSet.filter(function(el) { if (prim_id.indexOf(el.id) != -1) { return el } });
                                    prim_obj.forEach(function(prim, index){
                                        log.debug({
                                            title: 'index',
                                            details: prim_name
                                        })
                                        if (index > 0){
                                            prim_name += ('| ' + prim.values.name);
                                            prim_email += ('| ' + prim.values.email);
                                        } else {
                                            prim_name = prim.values.name;
                                            prim_email = prim.values.email;
                                        }
                                    });
                                } else {
                                    var prim_obj = primOperatorSet.filter(function (el) { return el.id == prim_id });
                                    var prim_name = prim_obj[0].values.name;
                                    var prim_email = prim_obj[0].values.email;
                                }
                            } else {
                                var prim_id = '';
                                var prim_name = '';
                                var prim_email = '';
                                // var prim_num = '';
                            }
                            if (!isNullorEmpty(opSet[0].zee_name)){
                                var zee_name = opSet[0].zee_name;
                            } else {
                                var zee_name = '';
                            }
                        }
                        csvSet.push([
                            internalid, //"Internalid", 
                            externalid, //"External", 
                            sub_code, //"Suburb Code", 
                            post_code, //"Post Code", 
                            sub_name, //"Suburb Name", 
                            state, //"State", 
                            sa3_code,//"SA3_CODE",  
                            sa3_name, //"SA3_NAME", 
                            sa4_code, // SA4_CODE
                            sa4_name, //"SA4_NAME", 
                            zee_name, //"Franchisee", 
                            prim_name, //"Primary Drive Name", 
                            prim_id, //"Primary Driver ID", 
                            prim_email, //"Primary Driver Email"
                        ])

                        main_index++;
                        return true;
                    // }  
                });
            }
        }

        log.debug({
            title: 'csvSet',
            details: csvSet
        })
        log.debug({
            title: 'selector',
            details: selector
        })
        saveCsv(csvSet, selector)
        
    }

     /**
     * Create the CSV and store it in the hidden field 'custpage_table_csv' as a string.
     * @param {Array} csvSet The `csvSet` created in `loadDatatable()`.
     */
    function saveCsv(savedCSVSet, selector) {
        if (savedCSVSet.length > 0) {
            if (selector == 'mp_standard'){
                var headers = ["Internalid", "Suburb Name", "Post Code", "Country Code", 'Zone ID', 'Sender Zones', 'State', 'Franchisee', 'Primary Driver']
            } else {
                var headers = ["Internalid", "External", "Suburb Code", "Post Code", 'Suburb Name', 'State', 'SA3_CODE', 'SA3_NAME', 'SA4_CODE', 'SA4_NAME', 'Franchisee', "Primary Drive Name", "Primary Driver ID", "Primary Driver Email"]
            }
            // headers = headers.join(';'); // .join(', ')
            var csv = headers + "\n";
            savedCSVSet.forEach(function(row) {
                // row = row.join(';');
                csv += row;
                csv += "\n";
            });

            log.debug({
                title: 'csv',
                details: csv
            })
            saveToRecord(csv, selector);

        }
        
        return true;
    }

    function saveToRecord(csv, selector){

        log.debug({
            title: 'Save New Record',
            details: csv
        })
        var newRec = record.create({
            type: 'customrecord_export_mapping',
            isDynamic: true,
        });
        newRec.setValue({ fieldId: 'name', value: 'Suburb Mapping Export' });
        
        if (selector != 'mp_standard'){
            var csv_char_half = (csv.length/2);
            var csvSubString = csv.substring(0, csv_char_half);
            var csvSubString2 = csv.substring(csv_char_half);
            // var csvSubString3 = csv.substring(csv_char_half);

            newRec.setValue({ fieldId: 'custrecord_export_mapping_csv', value: csvSubString });
            newRec.setValue({ fieldId: 'custrecord_export_mapping_csv_2', value: csvSubString2 });
            // newRec.setValue({ fieldId: 'custrecord_export_mapping_csv_3', value: csvSubString3 });
        } else {
            newRec.setValue({ fieldId: 'custrecord_export_mapping_csv', value: csv });
        }
        newRec.save();
    }

    function deletePrevious(){
        var del_index = 0;
        var sea = search.load({
            id: 'customsearch_export_mapping',
            type: 'customrecord_export_mapping'
        });
        sea.run().each(function(res){
            record.delete({
                type: 'customrecord_export_mapping',
                id: res.getValue({ name: 'internalid' })
            });
            log.debug({
                title: 'Removed',
                details: 'Removed'
            });
            del_index++;

            return true;
        });
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
            // var date_netsuite = nlapiDateToString(date_utc);
            var date_netsuite = format.format({
                value: date_utc,
                type: format.Type.DATE
            });
        }
        return date_netsuite;
    }

    function isNullorEmpty(strVal) {
        return (strVal == null || strVal == '' || strVal == 'null' || strVal == undefined || strVal == 'undefined' || strVal == '- None -');
    }

    return {
        execute: main
    }
});