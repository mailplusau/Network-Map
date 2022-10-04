/**
 * 
 * @NApiVersion 2.0
 * @NScriptType ClientScript
 * 
 *  * NSVersion    Date                        Author         
 *  * 2.00         2021-09-20 09:33:08         Anesu
 * 
 * Description: Service Debtors Page
 *
 * @Last Modified by: Anesu Chakaingesu
 * @Last Modified time: 2022-07-05 09:33:08 
 * 
 */

define(['N/error', 'N/runtime', 'N/search', 'N/url', 'N/record', 'N/format', 'N/email', 'N/currentRecord'],
function (error, runtime, search, url, record, format, email, currentRecord) {
    var baseURL = 'https://1048144.app.netsuite.com';
    if (runtime.envType == "SANDBOX") {
        baseURL = 'https://1048144-sb3.app.netsuite.com';
    }
    var role = runtime.getCurrentUser().role;
    var user_id = runtime.getCurrentUser().id;

    var currRec = currentRecord.get();
    
    var ctx = runtime.getCurrentScript();
   
    var csvExport;

    var zeeSet = new Array;
    var selector = '';

    /**
     * On page initialisation
     */
    function pageInit() {
        // Background-Colors
        $("#NS_MENU_ID0-item0").css("background-color", "#CFE0CE");
        $("#NS_MENU_ID0-item0 a").css("background-color", "#CFE0CE");
        $("#body").css("background-color", "#CFE0CE");

        // $('#reset-all').removeClass('hide')
        $('#btn-show-all-children').removeClass('hide')
        $('#btn-hide-all-children').removeClass('hide')
        $('#btn-uncheck-all').removeClass('hide') 
        $('#btn-check-all').removeClass('hide') 
        $('#submit').removeClass('hide');

        // // Hide Netsuite Submit Button
        $('#submitter').css("background-color", "#CFE0CE");
        $('#submitter').hide();
        $('#tbl_submitter').hide();

        $('#csv_export').removeClass('hide');

        /**
         *  Load Data
         */ 
        if (currRec.getValue({ fieldId: 'custpage_export_mapping_method' }) == 'GET'){
            // Hide/UnHide Elements
            $('.loading_section').hide();
            console.log('GET')
            selector = currRec.getValue({ fieldId: 'custpage_export_mapping_selector' });
            zeeSet = JSON.parse(JSON.stringify(currRec.getValue({ fieldId: 'custpage_export_mapping_zee_set' })));
            if (zeeSet.length > 1){
                zeeSet = zeeSet.split("\u0005") // Remove NetSuite Random Space Thingo.
            }
            console.log(selector);
            /**
             *  GET
             */ 
            // loadSuburbs(zeeSet, selector)

            /**
             *  JQuery
             */           
            /* Zee Dropdown */
            // $(document).on('change', '#zee_filter_dropdown', function () {
            //     var zee_id_dropdown = $(this).val(); //.find('option:selected')
            //     // var zee_name_dropdown = $(this).find('option:selected').text();
            //     // var zee_state_dropdown = $(this).find('option:selected').attr('state');
            //     var params = {
            //         zee: zee_id_dropdown,
            //         selector: selector
            //     }
            //     params = JSON.stringify(params);
            //     var upload_url = baseURL + url.resolveScript({ deploymentId: 'customdeploy_sl_export_mapping', scriptId: 'customscript_sl_export_mapping' }) + '&custparam_params=' + params;
            //     window.location.href = upload_url;
            // });
            $(document).on('change', '#selector', function () {
                var selector_val = $(this).val();
                var params = {
                    zee: [""], // Deafult to TEST
                    selector: selector_val
                }
                params = JSON.stringify(params);
                window.location.href = baseURL + url.resolveScript({ deploymentId: 'customdeploy_sl_export_mapping', scriptId: 'customscript_sl_export_mapping' }) + '&custparam_params=' + params;
            });

            /* Suburb Mapping Page */
            $(document).on('click', '#suburb_mapping', function () {
                window.location.href = baseURL + url.resolveScript({ deploymentId: 'customdeploy_sl_suburb_mapping', scriptId: 'customscript_sl_suburb_mapping' });;
            });

            /* Semantic UI */
            const primary_default = $('#zee_filter_dropdown > option:selected').toArray().map(function (obj) { return obj.value });
            $('.ui.checkbox_primary').checkbox({
                onChecked: function () {
                    console.log('Select All')
                    const options = $('#zee_filter_dropdown > option').toArray().map(function (obj) { return obj.value });
                    if (options.length > 0) {
                        $('#zee_filter_dropdown').dropdown('set exactly', options);
                        $('#zee_filter_dropdown').val(options)
                    }
                    $('.ui.dropdown').dropdown();
                },
                onUnchecked: function () {
                    console.log('Unselect')
                    const options = $('#zee_filter_dropdown > option:selected').toArray().map(function (obj) { return obj.value });
                    if (options.length > 0) {
                        // $('#zee_filter_dropdown').dropdown('clear');
                        $('#zee_filter_dropdown').dropdown('set exactly', primary_default);
                    }
                    $('.ui.dropdown').dropdown();
                },
            });
            // Bulk Update Zee Dropdown
            $('select').selectpicker();
            $('.ui.dropdown').dropdown();

            //Submitter
            // CSV Export
            $('#csv_export').click(function(){
                zeeSet = ($('#zee_filter_dropdown > option:selected').toArray().map(function (obj) { return obj.value }));
                console.log('TRiggere: ' + zeeSet.length)
                if (zeeSet.length > 0) {
                    // Trigger Submit
                    $('#submitter').trigger('click');
                } else {
                    alert('WARNING: No Franchisees Selected');
                }
            });
                    
        } else if (currRec.getValue({ fieldId: 'custpage_export_mapping_method' }) == 'POST'){
            /**
             *  POST
             */ 
            console.log('POST')
            csvExport = setInterval(loadCSV, 5000);

            $(document).on('click', '.back', function () {
                window.location.href = baseURL + url.resolveScript({ deploymentId: 'customdeploy_sl_export_mapping', scriptId: 'customscript_sl_export_mapping' });
            });
        }
    }

    function loadSuburbs(zeeSet, selector){
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
        console.log(zeeSet);
        zeeSet.forEach(function(zee_id){
            var zeeSuburbsList = record.load({ type: 'partner', id: zee_id });
            var zee_name = zeeSuburbsList.getValue({ fieldId: 'companyname' });
            if (selector == 'mp_standard' || selector == 'mp_express') { // Get Network Matrix
                var JSON_suburb = zeeSuburbsList.getValue({ fieldId: 'custentity_network_matrix_json' });
                if (!isNullorEmpty(JSON_suburb)){
                    JSON_suburb = JSON.parse(JSON_suburb);
                    JSON_suburb.forEach(function(suburb){
                        suburb.zee_name = zee_name;
                        suburbJSON.push(suburb);
                    });
                }
            } else if (selector == 's_au_express') { // Get SendlePlus Mapping List
                var JSON_suburb = zeeSuburbsList.getValue({ fieldId: 'custentity_sendle_recovery_suburbs' });
                if (!isNullorEmpty(JSON_suburb)){
                    JSON_suburb = JSON.parse(JSON_suburb);
                    JSON_suburb.forEach(function(suburb){
                        suburb.zee_name = zee_name;
                        suburbJSON.push(suburb);
                    });
                }
            }
            return true;
        });
        console.log(suburbJSON)
        
        if (selector == 'mp_standard') { // Not MP Express or Sendle Express - Use Sendle Depot One.
            /** 
             * Primary Datatable: MP Standard
            */
            var dataMatchingSetSearch = search.load({ type: 'customrecord_dom_zones', id: 'customsearch_sendle_dom_zones_5' }); // Sendle Domestic Pickup Zones - All - customsearch_sendle_dom_zones
            var matchingSetLength = parseInt(dataMatchingSetSearch.runPaged().count);
            console.log('Count: ' + matchingSetLength);
            var main_index = 0;
            // for (var main_index = 0; main_index <= matchingSetLength; main_index += 1000) {
                dataMatchSet.push(dataMatchingSetSearch.run().getRange({ start: main_index, end: main_index + 999 })); // 9 | 999
            // }
            dataMatchSet[0].forEach(function(row_list) {
                var internalid = row_list.getValue({name: "internalid", label: "Internal ID"});
                var sub_name = row_list.getValue({
                    name: "custrecord_dom_zones_suburb_name",
                    sort: search.Sort.ASC,
                    label: "Suburb Name"
                })
                console.log('Prim Index: '+ index +' - Sub Name: ' + sub_name);
                var state = row_list.getValue({name: "custrecord_dom_sender_state", label: "State"});
                var opSet = suburbJSON.filter(function (el){ if (el.suburbs.includes(sub_name)) {return el }}) //&& el.state.includes(state)
                // console.log(opSet);
                var post_code = row_list.getValue({name: "custrecord_dom_zones_postcode", label: "Postcode"}) // 2000 etc
                var country_code = row_list.getValue({name: "custrecord_dom_zones_country_code", label: "Country Code"}) // AU
                var zone_id = row_list.getText({name: "custrecord_dom_zones_zone_id", label: "Zone ID"}) // AU-Sydney | AU-Adelaide etc
                var sender_zones = row_list.getValue({name: "custrecord_dom_zones_ns_zones", label: "Sender Zones"}) // SYD | MEL etc
                
                /**
                 *  Match with JSON Under FRanchisee
                 */
                if (!isNullorEmpty(opSet[0])){
                    if (!isNullorEmpty(opSet[0].primary_op)){
                        var prim_id = opSet[0].primary_op; //   - POPULATE THIS!!!!
                        var prim_obj = primOperatorSet.filter(function (el) { return el.id == prim_id });
                        var prim_name = prim_obj[0].values.name;
                    }
                    console.log(prim_name)
                    if (!isNullorEmpty(opSet[0].zee_name)){
                        var zee_name = opSet[0].zee_name;
                    }
                    console.log(zee_name)
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

                index++;

                return true;
            });
        } else { // MP Express and Sendle AU Express
            /** 
             * Primary Datatable: MP Express & AU Express
            */
            var dataMatchingSetSearch = search.load({ type: 'customrecord_sendleplus_mapping_list', id: 'customsearch_sendleplus_mapping_search' }); // Toll Suburbs List
            var matchingSetLength = parseInt(dataMatchingSetSearch.runPaged().count);
            console.log('Count: ' + matchingSetLength);
            var main_index = 0;
            // for (var main_index = 0; main_index < matchingSetLength; main_index += 1000) {
                dataMatchSet.push(dataMatchingSetSearch.run().getRange({ start: main_index, end: main_index + 999 })); // 9 | 999
            // }
            dataMatchSet[0].forEach(function (row_list) {
                var sub_name = row_list.getValue({ name: 'custrecord_sendleplus_sub_name' });
                console.log('Prim Index: '+ index +' - Sub Name: ' + sub_name);
                var state = row_list.getValue({ name: 'custrecord_sendleplus_state' });
                var opSet = suburbJSON.filter(function (el){ if (el.suburbs.includes(sub_name)) {return el }}) // && el.state.includes(state)
                console.log(opSet);

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
                        var prim_obj = primOperatorSet.filter(function (el) { return el.id == prim_id });
                        var prim_name = prim_obj[0].values.name;
                        var prim_email = prim_obj[0].values.email;
                        var prim_num = prim_obj[0].values.name;
                    } else {
                        var prim_id = '';
                        var prim_name = '';
                        var prim_email = '';
                        var prim_num = '';
                    }
                    console.log(prim_name)
                    if (!isNullorEmpty(opSet[0].zee_name)){
                        var zee_name = opSet[0].zee_name;
                    } else {
                        var zee_name = '';
                    }
                    console.log(zee_name)
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

                index++;  

                return true;
            });
        }
        saveCsv(csvSet, selector)
        
    }

    function loadCSV(){
        var csv;
        var csv_2

        var csvSearch = search.load({
            id: 'customsearch_export_mapping',
            type: 'customrecord_export_mapping'
        });
        var csvSearchResultLength = parseInt(csvSearch.runPaged().count);
        if (csvSearchResultLength > 0){
            csvSearch.run().each(function(res){
                csv_1 = res.getValue({ name: 'custrecord_export_mapping_csv'});
                csv_2 = res.getValue({ name: 'custrecord_export_mapping_csv_2'});

                csv = csv_1 + csv_2;
            });

            if (!isNullorEmpty(csv)){
                console.log('CSV Found. Clearing Interval')
                $('.loading_section').addClass('hide')
                $('.back').removeClass('hide')
                $('#title').text('Suburb Mapping: Export - CSV Downloaded')
                clearInterval(csvExport)
                downloadCsv(csv);
            }
   
        }
    }

    function saveRecord(context) {
        console.log('Submit Triggered:' + zeeSet + ' ' + selector)
        currRec.setValue({ fieldId: 'custpage_export_mapping_zee_set', value: zeeSet });
        currRec.setValue({ fieldId: 'custpage_export_mapping_selector', value: selector });

        return true;
    }

    /**
     * Load the string stored in the hidden field 'custpage_table_csv'.
     * Converts it to a CSV file.
     * Creates a hidden link to download the file and triggers the click of the link.
     */
    function downloadCsv(csv) {
        var a = document.createElement("a");
        document.body.appendChild(a);
        a.style = "display: none";
        var content_type = 'text/csv';
        var csvFile = new Blob([csv], {
            type: content_type
        });
        var url = window.URL.createObjectURL(csvFile);
        var filename = 'Suburb Mapping Export.csv';
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
    }

    

    function isNullorEmpty(strVal) {
        return (strVal == null || strVal == '' || strVal == 'null' || strVal == undefined || strVal == 'undefined' || strVal == '- None -');
    }

    return {
        pageInit: pageInit,
        saveRecord: saveRecord,

    };
});