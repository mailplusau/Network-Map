/**
 * 
 * @NApiVersion 2.0
 * @NScriptType ClientScript
 * 
 * Description: 
 * @Last Modified by: Anesu Chakaingesu
 * 
 */

define(['N/error', 'N/runtime', 'N/search', 'N/url', 'N/record', 'N/format', 'N/email', 'N/currentRecord'],
function (error, runtime, search, url, record, format, email, currentRecord) {
    var baseURL = 'https://1048144.app.netsuite.com';
    if (runtime.EnvType == "SANDBOX") {
        baseURL = 'https://1048144-sb3.app.netsuite.com';
    }
    var ctx = runtime.getCurrentScript();
    var currRec = currentRecord.get();

    var role = runtime.getCurrentUser().role;

    var dataSet2 = [];
    var dataSet3 = [];

    var dataMatchSet = [];

    var operatorSet = [];
    var primOperatorSet = [];

    var suburbSet = [];
    var suburbList = [];
    var suburbListState = [];

    var change = false;

    var zee_id = parseInt(currRec.getValue({ fieldId: 'custpage_suburb_mapping_zee_id' }));
    var zee_name = currRec.getValue({ fieldId: 'custpage_suburb_mapping_zee_name' });
    var zee_state = currRec.getValue({ fieldId: 'custpage_suburb_mapping_zee_state' });
    var zee_state_array = ['', 'NSW', 'QLD', 'VIC', 'SA', 'TAS', 'ACT', 'WA', 'NT'];
    var zee_state_postcode = ['', 2, 4, 3, 5, 7, 2, 6, 0]
    var zee_state_id = zee_state_array.indexOf(zee_state);
    var zee_postcode = zee_state_postcode[zee_state_id];
    // var zee_postcode_low = parseInt(zee_postcode + '000');
    // var zee_postcode_high = parseInt((zee_postcode+1) + '000');

    /** Update */
    var selector = currRec.getValue({ fieldId: 'custpage_suburb_mapping_selector' });

    /**
     * On page initialisation
     */
    function pageInit(scriptContext) {
        if (role == 1000) {
            $('.zeeDropdown').hide();
            if (isNullorEmpty(zee_id)){
                //Franchisee
                var zee = runtime.getCurrentUser().id;
                var zeeRecord = record.load({ type: 'partner', id: zee });
                var zee_name_dropdown = zeeRecord.getValue('entityid') // 
                var zee_state_dropdown = zeeRecord.getValue('billstate');
                var params = {
                    zeeid: zee,
                    zeename: zee_name_dropdown,
                    zeestate: zee_state_dropdown,
                }
                params = JSON.stringify(params);
                var upload_url = baseURL + url.resolveScript({ deploymentId: 'customdeploy_sl_suburb_mapping', scriptId: 'customscript_sl_suburb_mapping' }) + '&custparam_params=' + params;
                currRec.setValue({ fieldId: 'custpage_suburb_mapping_zee_id', value: zee });
                window.location.href = upload_url;
            }
        }

        // Background-Colors
        $("#NS_MENU_ID0-item0").css("background-color", "#CFE0CE");
        $("#NS_MENU_ID0-item0 a").css("background-color", "#CFE0CE");
        $("#body").css("background-color", "#CFE0CE");
        $("#tr_submitter").css("margin-left", "10px");

        // // Hide Netsuite Submit Button
        $('#submitter').css("background-color", "#CFE0CE");
        $('#submitter').hide();
        $('#tbl_submitter').hide();

        console.log('Zee ID: ' + zee_id);
        console.log('Zee Name: ' + zee_name);
        console.log('Zee State: ' + zee_state);
        console.log('Zee Post Code: ' + zee_postcode)

        $(document).on('change', '#zee_filter_dropdown', function () {
            var zee_id_dropdown = $(this).find('option:selected').val();
            var zee_name_dropdown = $(this).find('option:selected').text();
            var zee_state_dropdown = $(this).find('option:selected').attr('state');
            var params = {
                zeeid: zee_id_dropdown,
                zeename: zee_name_dropdown,
                zeestate: zee_state_dropdown,
            }
            params = JSON.stringify(params);
            var upload_url = baseURL + url.resolveScript({ deploymentId: 'customdeploy_sl_suburb_mapping', scriptId: 'customscript_sl_suburb_mapping' }) + '&custparam_params=' + params;
            currRec.setValue({ fieldId: 'custpage_suburb_mapping_zee_id', value: zee_id });
            window.location.href = upload_url;
        });

        var selector_type = ['mp_standard', 'mp_express', 's_au_express'];
        selector_type.forEach(function (main_selector) {
            var table2_id = '#data_preview2_' + main_selector;
            var table3_id = '#data_preview3_' + main_selector; // MP Standard

            console.log('Table ID: ' + main_selector);

            if (zee_id != 0 || zee_id != 0.0 || !isNullorEmpty(zee_id)) {
                $(table2_id).removeClass('hide');
                $(table3_id).removeClass('hide');

                /**
                 *  Primary Table: MP Express & Sendle AU Express Table (Original Secondary Datatable)
                 */
                var dataTable2 = $(table2_id).DataTable({
                    data: dataSet2,
                    pageLength: 100,
                    order: [
                        [14, 'desc'], [5, 'asc']
                    ],
                    columns: [
                        { title: 'Action',}, //0
                        { title: 'Internalid' }, //1
                        { title: 'Externalid' }, //2
                        { title: 'Suburb Code' }, //3
                        { title: 'Post Code' }, //4
                        { title: 'Suburb Name' }, //5
                        { title: 'State' }, //6

                        { title: 'Franchisee' }, // 7
                        { title: 'Primary Driver: Name' }, // 8

                        { title: 'Primary Driver: ID' }, // 9
                        { title: 'Primary Driver: Email' }, // 10
                        { title: 'Primary Driver: Phone No.' }, // 11

                        { title: 'Secondary Driver: List' }, // 12
                        { title: 'Secondary Driver: JSON' }, // 13
                        { title: 'Suburb In List?' } // 14
                    ],
                    columnDefs: [
                        {
                            targets: [2, 7, 14], 
                            visible: false,
                        },
                        {
                            targets: [13], //18 originally
                            width: '15px'
                        },
                    ],
                    autoWidth: false,
                });

                /**
                 *  Suburb Selection Datatable
                 */
                var dataTable3 = $(table3_id).DataTable({
                    data: dataSet3,
                    pageLength: 100,
                    // order: [ [20, 'desc'], [5, 'asc']],
                    columns: [
                        { title: 'Action' }, //0
                        { title: 'Internalid' }, //1
                        { title: 'Post Code' }, //2
                        { title: 'Suburb Name' }, //3
                        
                        { title: 'State' }, // 4

                        { title: 'Zone ID' }, //5

                        { title: 'Primary Driver: Name' }, //6
                        { title: 'Primary Driver: ID' }, //7
                        { title: 'Primary Driver: Email' }, //8
                        { title: 'Primary Driver: Phone No.' }, //9

                        { title: 'Secondary Driver: List' }, //10
                        { title: 'Secondary Driver: JSON' }, //11

                        { title: 'Suburb In List?' } // 12
                    ],
                    columnDefs: [
                        {
                            targets: [12], // Suburb In List?
                            visible: false,
                        },
                    ],
                    autoWidth: false,
                });

                loadDatatable(zee_id, zee_name, zee_state, main_selector, table2_id, table3_id); // Primary Datatable Loading

                /**
                 *  Remove Hides
                 */
                $('.loading_section').addClass('hide');
                $('.submit_btn').removeClass('hide');
                // UnHide Datatable Tags 
                $('#dataTable2filters_' + main_selector).removeClass('hide');
                $('.secondary_table_title_' + main_selector).removeClass('hide');

                // Load with All Child Cells Open
                dataTable2.page.len(-1).draw();//
                $('.ui.dropdown').dropdown();
                dataTable2.page.len(100).draw();//
            }
        })

        // Toggle Main Tab Selection
        $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
            // var target = $(e.target).attr("href") // activated tab
            // alert(target);
            var main_selector = $('div.tab-pane.active').attr('id');
            if (main_selector == 'mp_standard') {
                console.log('MP Standard')
                // $('.title_header').text('Suburb & Operator Mapping: MailPlus Standard');
                currRec.setValue({ fieldId: 'custpage_suburb_mapping_selector', value: 'mp_standard' })
            } else if (main_selector == 'mp_express') {
                console.log('Last Mile')
                // $('.title_header').text('Suburb & Operator Mapping: MailPlus Express');
                currRec.setValue({ fieldId: 'custpage_suburb_mapping_selector', value: 'mp_express' })
            } else if (main_selector == 's_au_express') {
                console.log('Sendle AU Express')
                // $('.title_header').text('Suburb & Operator Mapping: Sendle AU Express');
                currRec.setValue({ fieldId: 'custpage_suburb_mapping_selector', value: 's_au_express' })
            }
        });

        // Add Suburbs
        $(document).on('click', '.add_filter', function() {
            var main_selector = $('div.tab-pane.active').attr('id');
            if (main_selector == 'mp_standard'){
                var table3_id = '#data_preview3_' + main_selector;
            } else {
                var table3_id = '#data_preview2_' + main_selector;
            }

            var post_code = parseInt($('#filter_postcode_' + main_selector+'').val());
            if (!isNullorEmpty(post_code)) {post_code == 0}
            var sub_name = $('#filter_sub_name_' + main_selector+'').val();

            var suburbObject = [];

            if (main_selector == 'mp_standard'){
                var addSuburb = search.load({ type: 'customrecord_dom_zones', id: 'customsearch_sendle_dom_zones_5' }); //customsearch_sendle_dom_zones
                if (!isNullorEmpty(sub_name)){
                    addSuburb.filters.push(search.createFilter({
                        name: 'custrecord_dom_zones_suburb_name',
                        operator: search.Operator.IS,
                        values: sub_name
                    }));
                } else if (!isNullorEmpty(post_code) || post_code != NaN || post_code != 0){
                    addSuburb.filters.push(search.createFilter({
                        name: 'custrecord_dom_zones_postcode',
                        operator: search.Operator.IS,
                        values: post_code
                    }));
                }
                var addSuburbSetLength = parseInt(addSuburb.runPaged().count);
                if (addSuburbSetLength > 0) {
                    addSuburb.run().each(function(row_list){
                        var sub_name = row_list.getValue({
                            name: "custrecord_dom_zones_suburb_name",
                            sort: search.Sort.ASC,
                            label: "Suburb Name"
                        });

                        // If Suburb Is Already In List
                        var suburbInList = false;
                        var datatable = $(table3_id).DataTable();
                        datatable.rows().every(function(){
                            var index = this.data();
                            var list_sub_name = index[3]; // Suburb Name
                            if (list_sub_name == sub_name){
                                suburbInList = true;
                            }
                        });

                        if (suburbInList == false){
                            var internalid = row_list.getValue({name: "internalid", label: "Internal ID"})
                            var post_code = row_list.getValue({name: "custrecord_dom_zones_postcode", label: "Postcode"}) // 2000 etc
                            var country_code = row_list.getValue({name: "custrecord_dom_zones_country_code", label: "Country Code"}) // AU
                            var zone_id = row_list.getText({name: "custrecord_dom_zones_zone_id", label: "Zone ID"}) // AU-Sydney | AU-Adelaide etc
                            var state = row_list.getValue({name: "custrecord_dom_sender_state", label: "State"}) 
                            // var zones = row_list.getValue({name: "custrecord_dom_zones_ns_zones", label: "Sender Zones"}) // SYD | MEL etc
            
                            var display_prim_id = '';
                            var display_prim_email = '';
                            var display_prim_num = '';
                            var secondary_input_field = '';
                            var secondary_json = '';
                            /**
                             *  Primary Operator
                             */
                            var prim_email = ''; //row_list.getValue({ name: 'custrecord_sendleplus_prim_email' });
                            var prim_num = ''; //row_list.getValue({ name: 'custrecord_sendleplus_prim_phone_num' });
                            var prim_id = '';
                            var prim_input_field = '<select id="primary_filter" class="form-control primary_operator ui search dropdown">'; //select2 //selectpicker
                            var prim_index = 0;
            
                            if (!isNullorEmpty(prim_id)) {
                                prim_index = 1;
                            } else {
                                prim_index = 0;
                            }
                            primOperatorSet.forEach(function (operatorRecord) {
                                var new_op_id = operatorRecord.values.internalid[0].value;
                                var new_op_email = operatorRecord.values.custrecord_operator_email
                                var new_op_name = operatorRecord.values.name;
                                var new_op_num = operatorRecord.values.custrecord_operator_phone;
            
                                if (prim_index == 0){
                                    prim_input_field += '<option new_id="' + new_op_id + '" name="' + new_op_name + '" old_id="' + prim_id + '" email="' + new_op_email + '" phone="' + new_op_num + '" selected>' + new_op_name + '</option>';
            
                                    prim_id = new_op_id;
                                    prim_num = new_op_num;
                                    prim_email = new_op_email;
                                } else {
                                    prim_input_field += '<option new_id="' + new_op_id + '" name="' + new_op_name + '" old_id="' + prim_id + '" email="' + new_op_email + '" phone="' + new_op_num + '">' + new_op_name + '</option>';
                                }
                                
            
                                prim_index++;
                                return true;
                            });
                            display_prim_id = prim_id
                            display_prim_email = prim_email  
                            display_prim_num = prim_num;
                            prim_input_field += '</select>';
            
                            /**
                             *  Secondary Op:
                             */
                            var secondary_input_field = '<select id="secondary_operator" class="ui fluid search dropdown secondary_operator" json="" multiple="">'
            
                            operatorSet.forEach(function (secOperatorRes) {
                                var sec_op_id = secOperatorRes.values.internalid[0].value;
                                var sec_op_email = secOperatorRes.values.custrecord_operator_email;
                                var sec_op_name = secOperatorRes.values.name;
                                var sec_op_num = secOperatorRes.values.custrecord_operator_phone;
                                var sec_op_zee = secOperatorRes.values.custrecord_operator_franchisee[0].text;
            
                                secondary_input_field += '<option sec_id="' + sec_op_id + '" name="' + sec_op_name + '" email="' + sec_op_email + '" phone="' + sec_op_num + '" zee="' + sec_op_zee + '">' + sec_op_name + ' (' + sec_op_zee + ')</option>';
            
                                return true;
                            });
                            secondary_input_field += '</select>';
            
                            suburbObject.push([
                                '<button class="btn btn-danger btn-sm remove_suburb glyphicon glyphicon-trash" type="button" data-toggle="tooltip" data-placement="right" title="Delete"></button>',
                                internalid,
                                post_code, 
                                sub_name,
                                state,
                                zone_id,
                                prim_input_field, 
                                display_prim_id, 
                                display_prim_email, 
                                display_prim_num, 
                                secondary_input_field, 
                                '<p class="sec_json" id="sec_json" changed="false"></p>', //secondary_json 
                                'True'
                            ]);
                            
                            return true;
                        } else {
                            console.log('Suburb In List');
                            return true;
                        }
                    });
                } else {
                    alert('Invalid Suburb Name or Post Code')
                }
            } else {
                var addSuburb = search.load({ type: 'customrecord_sendleplus_mapping_list', id: 'customsearch_sendleplus_mapping_search' });
                if (!isNullorEmpty(sub_name)){
                    addSuburb.filters.push(search.createFilter({
                        name: 'custrecord_sendleplus_sub_name',
                        operator: search.Operator.IS,
                        values: sub_name
                    }));
                } else if (!isNullorEmpty(post_code) || post_code != NaN || post_code != 0){
                    addSuburb.filters.push(search.createFilter({
                        name: 'custrecord_sendleplus_postcode',
                        operator: search.Operator.EQUALTO,
                        values: post_code
                    }));
                }
                var addSuburbSetLength = parseInt(addSuburb.runPaged().count);
                if (addSuburbSetLength > 0) {
                    addSuburb.run().each(function(row_list){
                        var sub_name = row_list.getValue({ name: "custrecord_sendleplus_sub_name" });

                        // If Suburb Is Already In List
                        var suburbInList = false
                        var datatable = $(table3_id).DataTable();
                        datatable.rows().every(function(){
                            var index = this.data();
                            var list_sub_name = index[5]; // Suburb Name
                            if (list_sub_name == sub_name){
                                suburbInList = true;
                            }
                        });

                        if (suburbInList == false){
                            var prim_input_field = '';
                            var display_prim_id = '';
                            var display_prim_email = '';
                            var display_prim_num = '';
                            var secondary_input_field = '';
                            var secondary_json = '';

                            var internalid = row_list.getValue({name: "internalid", label: "Internal ID"})
                            var sub_code = row_list.getValue({ name: "custrecord_sendleplus_sub_code" })
                            var post_code = row_list.getValue({ name: "custrecord_sendleplus_postcode" }) // 2000 etc
                            var state = row_list.getValue({ name: "custrecord_sendleplus_state" })
            
                            /**
                             *  Primary Operator
                             */
                            var prim_email = ''; //row_list.getValue({ name: 'custrecord_sendleplus_prim_email' });
                            var prim_num = ''; //row_list.getValue({ name: 'custrecord_sendleplus_prim_phone_num' });
                            var prim_id = '';
                            var prim_input_field = '<select id="primary_filter" class="form-control primary_operator ui search dropdown">'; //select2 //selectpicker
                            var prim_index = 0;
            
                            if (!isNullorEmpty(prim_id)) {
                                prim_index = 1;
                            } else {
                                prim_index = 0;
                            }
                            primOperatorSet.forEach(function (operatorRecord) {
                                var new_op_id = operatorRecord.values.internalid[0].value;
                                var new_op_email = operatorRecord.values.custrecord_operator_email
                                var new_op_name = operatorRecord.values.name;
                                var new_op_num = operatorRecord.values.custrecord_operator_phone;
            
                                if (prim_index == 0){
                                    prim_input_field += '<option new_id="' + new_op_id + '" name="' + new_op_name + '" old_id="' + prim_id + '" email="' + new_op_email + '" phone="' + new_op_num + '" selected>' + new_op_name + '</option>';
            
                                    prim_id = new_op_id;
                                    prim_num = new_op_num;
                                    prim_email = new_op_email;
                                } else {
                                    prim_input_field += '<option new_id="' + new_op_id + '" name="' + new_op_name + '" old_id="' + prim_id + '" email="' + new_op_email + '" phone="' + new_op_num + '">' + new_op_name + '</option>';
                                }
                                
            
                                prim_index++;
                                return true;
                            });
                            display_prim_id = prim_id
                            display_prim_email = prim_email  
                            display_prim_num = prim_num;
                            prim_input_field += '</select>';
            
                            /**
                             *  Secondary Op:
                             */
                            var secondary_input_field = '<select id="secondary_operator" class="ui fluid search dropdown secondary_operator" json="" multiple="">'
            
                            operatorSet.forEach(function (secOperatorRes) {
                                var sec_op_id = secOperatorRes.values.internalid[0].value;
                                var sec_op_email = secOperatorRes.values.custrecord_operator_email;
                                var sec_op_name = secOperatorRes.values.name;
                                var sec_op_num = secOperatorRes.values.custrecord_operator_phone;
                                var sec_op_zee = secOperatorRes.values.custrecord_operator_franchisee[0].text;
            
                                secondary_input_field += '<option sec_id="' + sec_op_id + '" name="' + sec_op_name + '" email="' + sec_op_email + '" phone="' + sec_op_num + '" zee="' + sec_op_zee + '">' + sec_op_name + ' (' + sec_op_zee + ')</option>';
            
                                return true;
                            });
                            secondary_input_field += '</select>';
            
                            suburbObject.push([
                                '<button class="btn btn-danger btn-sm remove_suburb glyphicon glyphicon-trash" type="button" data-toggle="tooltip" data-placement="right" title="Delete"></button>', //0
                                internalid, //1
                                '',
                                sub_code, //2
                                post_code, //3 
                                sub_name, //4
                                state, //5
                                '<select class="ui search dropdown" disabled>'+zee_name+'</select>', //6
                                prim_input_field, //7 
                                display_prim_id, //8 
                                display_prim_email, //9 
                                display_prim_num, //10 
                                secondary_input_field, //11 
                                '<p class="sec_json" id="sec_json" changed="false"></p>', //12 //secondary_json 
                                'True' //13
                            ]);
                            
                            return true;
                        } else {
                            console.log('Suburb In List');
                            return true;
                        }
                    });
                } else {
                    alert('Invalid Suburb Name or Post Code')
                }
            }
            
            console.log('Update Datatable')
            var datatable3 = $(table3_id).DataTable();
            datatable3.rows.add(suburbObject);
            datatable3.draw();

            $('#filter_postcode_' + main_selector+'').val('')
            $('#filter_sub_name_' + main_selector+'').val('');

            // Update Secondary Driver UI
            datatable3.page.len(-1).draw();//
            $('.ui.dropdown').dropdown();
            datatable3.page.len(100).draw();//
        });
        //Remove Suburbs
        $(document).on('click', '.remove_suburb', function() {
            var main_selector = $('div.tab-pane.active').attr('id');
            if (main_selector == 'mp_standard'){
                var table3_id = '#data_preview3_' + main_selector;
            } else {
                var table3_id = '#data_preview2_' + main_selector;
            }
            var datatable3 = $(table3_id).DataTable();
            datatable3.row($(this).parent().parent()).remove().draw();
        });

        /**
         *  Select All Checkboxes
         */
        // Select All: Primary Driver
        const primary_default = $('#primary_filter > option:selected').toArray().map(function (obj) { return obj.value });
        $('.ui.checkbox_primary').checkbox({
            onChecked: function () {
                const options = $('#primary_filter > option:selected').toArray().map(function (obj) { return obj.value });
                if (options.length > 0) {
                    $('.primary_operator').dropdown('set exactly', options);
                }
            },
            onUnchecked: function () {
                const options = $('#primary_filter > option:selected').toArray().map(function (obj) { return obj.value });
                if (options.length > 0) {
                    // $('.primary_operator').dropdown('clear');
                    $('.primary_operator').dropdown('set exactly', primary_default);
                }
            },
        });
        // Select All: Secondary Driver
        const secondary_default = $('#secondary_operator > option:selected').toArray().map(function (obj) { return obj.value });
        $('.ui.checkbox_secondary').checkbox({
            onChecked: function () {
                const options = $('#secondary_operator > option:selected').toArray().map(function (obj) { return obj.value });
                if (options.length > 0) {
                    $('.secondary_operator').dropdown('set exactly', options);
                }
            },
            onUnchecked: function () {
                const options = $('#secondary_operator > option:selected').toArray().map(function (obj) { return obj.value });
                if (options.length > 0) {
                    $('.secondary_operator').dropdown('set exactly', secondary_default);
                }
            },
        });

        /**
         *  Secondary Driver: JQuery
         */
        $(document).on('change', '.secondary_operator', function () {
            var sec_obj = [];
            var rec_id = $(this).closest('tr').find('.internal_id').attr('id');
            var old_prim_id = $(this).closest('tr').find('.primary_operator option:selected').attr('old_id');
            var prim_id = $(this).closest('tr').find('.primary_operator option:selected').attr('new_id');

            var prim_name = $(this).closest('tr').find('.primary_operator option:selected').attr('name');
            var prim_email = $(this).closest('tr').find('.primary_operator option:selected').attr('email');
            var prim_num = $(this).closest('tr').find('.primary_operator option:selected').attr('phone');

            var sec_array = [];

            $('option:selected', this).each(function (index) {
                var id = $(this).attr('sec_id');
                if (prim_id == id) {
                    alert('This Secondary Operator has already been Selected under Primary Operator Selection');
                    // return false;
                } else {
                    var email = $(this).attr('email');
                    var phone_number = $(this).attr('phone_num');
                    var name = $(this).attr('name');
                    var zee = $(this).attr('zee')

                    console.log('Sec Details: Name: ' + name + ' Email: ' + email + ' ID: ' + id);
                    sec_obj.push({ name: name, id: id, email: email, phone: phone_number }); //, franchisee: zee 
                    sec_array.push(id);
                }
            });

            if (isNullorEmpty(prim_id) || prim_id == 0) {
                prim_id = 0;
                selection_zee_name = null;
            }

            var tr = $(this).closest('tr');
            row_json = tr.find('.sec_json');
            var sec_obj_length = row_json.length;
            row_json.html(JSON.stringify(sec_obj))

            var sec_html = '<p class="sec_json" id="sec_json" changed="false">'+JSON.stringify(sec_obj)+'</p>'

            var main_selector = $('div.tab-pane.active').attr('id');
            if (main_selector == 'mp_standard'){
                var table3_id = '#data_preview3_' + main_selector;
            } else {
                var table3_id = '#data_preview2_' + main_selector;
            }
            var datatable3 = $(table3_id).DataTable();
            var cell = datatable3.cell(tr.find('.sec_json').closest('td'));
            cell.data(sec_html).draw();

            change = true; // Secondary Driver Change True
        });

        /**
         *  Primary Driver: JQuery
         */
        $(document).on('change', '.primary_operator', function () {
            var rec_id = $(this).closest('tr').find('.internal_id').attr('id');
            var old_prim_id = $('option:selected', this).attr('old_id');
            var prim_id = 0;
            var prim_name = '';
            var prim_email = '';
            var prim_num = '';
            var sec_obj = $(this).closest('tr').find('.sec_json').text();
            if (!isNullorEmpty(sec_obj)) {
                sec_obj = JSON.parse(sec_obj);
            }
            console.log('Prim ID: ' + $(this).attr('new_id'))

            $('option:selected', this).each(function (index) {
                old_prim_id = $(this).attr('old_id');
                prim_id = $(this).attr('new_id');
                console.log('Prim ID 2 : ' + $(this).attr('new_id'))
                if (sec_obj) {
                    var sec_id = sec_obj.map(function (el) { return el.id }).indexOf(prim_id);
                } else {
                    var sec_id = -1
                }
                if (sec_id != -1) {
                    alert('This Primary Operator has already been Selected under Secondary Operator Selection');
                } else {
                    prim_name = $(this).attr('name');
                    prim_email = $(this).attr('email');
                    prim_num = $(this).attr('phone');
                    if (isNullorEmpty(prim_id)) {
                        prim_id = 0;
                        console.log('Sec Val: ' + sec_obj)
                        if (isNullorEmpty(sec_obj) && sec_obj.length == 0) {
                            selection_zee_name = null;
                            console.log('no longer in list')
                        }
                    } else {
                        console.log('is in list')
                    }
                }
            });

            var main_selector = $('div.tab-pane.active').attr('id');
            if (main_selector == 'mp_standard'){
                var table3_id = '#data_preview3_' + main_selector;
            } else {
                var table3_id = '#data_preview2_' + main_selector;
            }
            var datatable3 = $(table3_id).DataTable();
            var tr = $(this).closest('tr');
            datatable3.cell($(this).closest('td').next()).data(prim_id).draw();
            datatable3.cell($(this).closest('td').next().next()).data(prim_email).draw();
            datatable3.cell($(this).closest('td').next().next().next()).data(prim_num).draw();
        })

        /** REDIRECT */
        $('#updateSaveRecord').click(function () {
            var selector = $('div.tab-pane.active').attr('id');
            console.log('Selector at Submit: ' + selector)
            saveArray(selector);

            var params = {
                zeeid: zee_id,
                zeename: zee_name,
                zeestate: zee_state,
            }
            params = JSON.stringify(params);
            var upload_url = baseURL + url.resolveScript({ deploymentId: 'customdeploy_sl_suburb_mapping', scriptId: 'customscript_sl_suburb_mapping' }) + '&custparam_params=' + params;
            window.location.href = upload_url;
        });

        $('#first_sub_selection').click(function () {
            var upload_url = baseURL + url.resolveScript({ deploymentId: 'customdeploy_sl_sendle_recovery_network', scriptId: 'customscript_sl_sendle_recovery_network' }) + '&zee=' + zee_id + '&opsync=true';
            window.open(upload_url, '_blank');
        });
        $('#last_sub_selection').click(function () {
            var upload_url = baseURL + url.resolveScript({ deploymentId: 'customdeploy1', scriptId: 'customscript_sl_lastmile_suburb_select' }) + '&zee=' + zee_id + '&opsync=true';
            window.open(upload_url, '_blank');
        });3
        $('#lodgement_selection').click(function () {
            var upload_url = baseURL + url.resolveScript({ deploymentId: 'customdeploy1', scriptId: 'customscript_sl_lodge_location_select' }) + '&zee=' + zee_id;
            window.open(upload_url, '_blank');
        });

        $('#downloadCSV').click(function () {
            // var upload_url = 'https://1048144.app.netsuite.com/app/common/search/searchresults.nl?searchid=4081&saverun=T&whence=';
            var upload_url = 'https://1048144.app.netsuite.com/app/common/search/searchresults.nl?searchid=4756&saverun=T&whence=';
            window.open(upload_url, '_blank');
        });

        $(document).on('click', '#export_mapping', function () {
            var zee_id_dropdown = new Array();
            zee_id_dropdown.push($('#zee_filter_dropdown').find('option:selected').val());
            var selector = $('div.tab-pane.active').attr('id');
            var params = {
                zee: zee_id_dropdown,
                selector: selector,
            }
            params = JSON.stringify(params);
            var upload_url = baseURL + url.resolveScript({ deploymentId: 'customdeploy_sl_export_mapping', scriptId: 'customscript_sl_export_mapping' }) + '&custparam_params=' + params;
            window.location.href = upload_url;
        });

        // if (zee_id != 0) {
        //     $(document).ready(function () {
        //         var column = dataTable.column([19]);
        //         column.visible(false);
        //     });
        // }

        /**
         *  Click for Instructions Section Collapse
         */
        $('.collapse').on('shown.bs.collapse', function () {
            $(".title_header").css("padding-top", "75px");
            // $(".zeeDropdown").css("padding-top", "100px");
        })
        $('.collapse').on('hide.bs.collapse', function () {
            $(".title_header").css("padding-top", "0px");
            // $(".zeeDropdown").css("padding-top", "0px");
        });

        console.log('Remaining Usage: ' + ctx.getRemainingUsage())
    }

    /**
     * Load Datatable of Suburbs list from Toll Mapping Record and display Primary and Secondary Driver Information
     * Logic:
     *  Load Franchisee Allocated Suburbs List Filters by Current Zee{
     *      In Search. Passlist of Suburbs, Split
     *          For Each Suburb, Pass through as filter for mapping list Record from toll {
     *              For Each Element in Record that has matching suburb name to that assigned to that specific zee. {
     *                  Push data to Datatable.
     *              }
     *          }
     *      }
     * @param {Integer} zee_id 
     * @param {String} zee_name 
     * @param {String} zee_state 
     */
    function loadDatatable(zee_id, zee_name, zee_state, selector, table2_id, table3_id) { // Zee id = Waterloo 699991;
        console.log("Load Datatable")
        
        dataSet2 = [];
        dataSet3 = [];

        dataMatchSet = [];

        var index = 0;

        if (isNullorEmpty(operatorSet)) {
            var operatorSearch = search.load({ type: 'customrecord_operator', id: 'customsearch_sendleplus_op_list_2' });
            operatorSearch.filters.push(search.createFilter({
                name: 'location',
                join: 'custrecord_operator_franchisee',
                operator: search.Operator.ANYOF,
                values: zee_state_id // 1 = NSW, 2 = QLD, 3 = VIC, 4 = SA, 5 = TAS, 6 = ACT, 7 = WA
            }));
            var operatorResult = operatorSearch.run().getRange({ start: 0, end: 400 });
            // console.log('Operator Set: ' + JSON.stringify(operatorResult));
            operatorSet = JSON.parse(JSON.stringify(operatorResult));

            var primOperatorSearch = search.load({ type: 'customrecord_operator', id: 'customsearch_sendleplus_op_list' });
            primOperatorSearch.filters.push(search.createFilter({
                name: 'custrecord_operator_franchisee2',
                operator: search.Operator.ANYOF,
                values: zee_id
            }));
            var primOperatorResult = primOperatorSearch.run().getRange({ start: 0, end: 400 });
            // console.log('Prim Operator Set: ' + JSON.stringify(primOperatorResult));
            primOperatorSet = JSON.parse(JSON.stringify(primOperatorResult));
        }

        // TEST - VIC
        /* Rosebery
        Docklands
        Wyndham Vale
        Cremorne (Vic.)
        East Melbourne
        Melbourne
        South Yarra
        Southbank */

        // if (isNullorEmpty(suburbSet)) {
        var zeeSuburbsList = record.load({ type: 'partner', id: zee_id });
        // if (selector == 'mp_standard' || selector == 'mp_express') { // Get Network Matrix
        //     var suburbListString = zeeSuburbsList.getValue({ fieldId: 'custentity_network_matrix_main' });
        //     if (!isNullorEmpty(suburbListString)) {
        //         suburbList = [];
        //         suburbListState = [];
        //         if (suburbListString.includes(',')){
        //             suburbSet = suburbListString.split(","); // ['1', '2', 3', '4']
        //         } else if (suburbListString.includes('\r\n')) {
        //             suburbSet = suburbListString.split("\r\n"); // ['1' \n '2' \n '3' \n '4']
        //         } else {
        //             suburbSet = suburbListString.split("\n"); // ['1' \n '2' \n '3' \n '4']
        //         }
        //         console.log('Suburb List: Network Matrix ' + JSON.stringify(suburbSet));
        //         suburbSet.forEach(function (suburb) { // ZetLand (NSW)
        //             if (suburb.includes(' (')) {
        //                 suburbList.push(suburb.split(' (')[0]); // If String Contains (SA) etc, remove it. 
        //                 if (zee_state_array.indexOf((((suburb).split(' (')[1]).split(')')[0])) != -1){ // If Suburb Contains State Value "(SA)", Push Into Parallel Array or else, Default to Zee's State.
        //                     suburbListState.push(((suburb.split(' (')[1]).split(')')[0]).toUpperCase()) // If String Contains State, Add State into new Array.
        //                 } else {
        //                     suburbListState.push(zee_state);
        //                 }
        //             } else {
        //                 suburbList.push(suburb);
        //                 suburbListState.push(zee_state); // Default State to Being Same as Zee State.
                        
        //             }
        //         });
               
        //     }
        //     var JSON_suburb = zeeSuburbsList.getValue({ fieldId: 'custentity_network_matrix_json' });
        //     // console.log(JSON_suburb)
        //     JSON_suburb.forEach(function(res){
        //         suburbPostCode.push(res.post_code);
        //     });
        // } else if (selector == 's_au_express') { // Get SendlePlus Mapping List
        //     suburbList = [];
        //     suburbListState = [];
        //     var suburbListString = zeeSuburbsList.getValue({ fieldId: 'custentity_sendle_recovery_suburbs_main' });
        //     if (!isNullorEmpty(suburbListString)) {
        //         if (suburbListString.includes(',')){
        //             suburbSet = suburbListString.split(","); // ['1', '2', 3', '4']
        //         } else if (suburbListString.includes('\r\n')) {
        //             suburbSet = suburbListString.split("\r\n"); // ['1' \n '2' \n '3' \n '4']
        //         } else {
        //             suburbSet = suburbListString.split("\n"); // ['1' \n '2' \n '3' \n '4']
        //         }
        //         console.log('Suburb List: Sendle AU Express - ' + JSON.stringify(suburbSet));
        //         suburbSet.forEach(function (suburb) { // ZetLand (NSW)
        //             if (suburb.includes(' (')) {
        //                 suburbList.push(suburb.split(' (')[0]); // If String Contains (SA) etc, remove it. 
        //                 if (zee_state_array.indexOf((((suburb).split(' (')[1]).split(')')[0])) != -1){ 
        //                     suburbListState.push(((suburb.split(' (')[1]).split(')')[0]).toUpperCase()) // If String Contains State, Add State into new Array.
        //                 } else {
        //                     suburbListState.push(zee_state);
        //                 }
        //             } else {
        //                 suburbList.push(suburb);
        //                 suburbListState.push(zee_state); // Default State to Being Same as Zee State.
        //             }
        //         });
        //     }
        //     var JSON_suburb = zeeSuburbsList.getValue({ fieldId: 'custentity_sendle_recovery_suburbs' });
        //     // console.log(JSON_suburb)
        //     JSON_suburb.forEach(function(res){
        //         suburbPostCode.push(res.post_code);
        //     });
        // }
        // console.log(suburbList);
        // console.log(suburbListState);

        var suburbList = [];
        var suburbListState = [];
        var suburbListPostCode = [];
        if (selector == 'mp_standard' || selector == 'mp_express') { // Get Network Matrix // Not MP Express or Sendle Express - Use Sendle Depot One.
            var JSON_suburb = zeeSuburbsList.getValue({ fieldId: 'custentity_network_matrix_json' });
            if (!isNullorEmpty(JSON_suburb)){
                JSON_suburb = JSON.parse(JSON_suburb);
                if (isNullorEmpty(JSON_suburb[0].post_code)){
                    console.log('MailPlus: Through Main Matrix')
                    var suburbListString = zeeSuburbsList.getValue({ fieldId: 'custentity_network_matrix_main' });
                    if (!isNullorEmpty(suburbListString)) {
                        suburbList = [];
                        suburbListState = [];
                        if (suburbListString.includes(',')){
                            suburbSet = suburbListString.split(","); // ['1', '2', 3', '4']
                        } else if (suburbListString.includes('\r\n')) {
                            suburbSet = suburbListString.split("\r\n"); // ['1' \n '2' \n '3' \n '4']
                        } else {
                            suburbSet = suburbListString.split("\n"); // ['1' \n '2' \n '3' \n '4']
                        }
                        console.log('Suburb List: Network Matrix ' + JSON.stringify(suburbSet));
                        suburbSet.forEach(function (suburb) { // ZetLand (NSW)
                            if (suburb.includes(' (')) {
                                suburbList.push(suburb.split(' (')[0]); // If String Contains (SA) etc, remove it. 
                                if (zee_state_array.indexOf((((suburb).split(' (')[1]).split(')')[0])) != -1){ // If Suburb Contains State Value "(SA)", Push Into Parallel Array or else, Default to Zee's State.
                                    suburbListState.push(((suburb.split(' (')[1]).split(')')[0]).toUpperCase()) // If String Contains State, Add State into new Array.
                                } else {
                                    suburbListState.push(zee_state);
                                }
                            } else {
                                suburbList.push(suburb);
                                suburbListState.push(zee_state); // Default State to Being Same as Zee State.
                                
                            }
                        });
                        
                    }
                } else {
                    console.log('MailPlus: Through JSON')
                    JSON_suburb.forEach(function(suburb){
                        suburbList.push(suburb.suburbs);
                        suburbListState.push(suburb.state);
                        suburbListPostCode.push(suburb.post_code);
                    });
                }
                
            }
        } else if (selector == 's_au_express') { // Get SendlePlus Mapping List
            var JSON_suburb = zeeSuburbsList.getValue({ fieldId: 'custentity_sendle_recovery_suburbs' });
            if (!isNullorEmpty(JSON_suburb)){
                JSON_suburb = JSON.parse(JSON_suburb);
                if (isNullorEmpty(JSON_suburb[0].post_code)){
                    console.log('Sendle Express: Through Main Matrix')
                    var suburbListString = zeeSuburbsList.getValue({ fieldId: 'custentity_sendle_recovery_suburbs_main' });
                    if (!isNullorEmpty(suburbListString)) {
                        if (suburbListString.includes(',')){
                            suburbSet = suburbListString.split(","); // ['1', '2', 3', '4']
                        } else if (suburbListString.includes('\r\n')) {
                            suburbSet = suburbListString.split("\r\n"); // ['1' \n '2' \n '3' \n '4']
                        } else {
                            suburbSet = suburbListString.split("\n"); // ['1' \n '2' \n '3' \n '4']
                        }
                        console.log('Suburb List: Sendle AU Express - ' + JSON.stringify(suburbSet));
                        suburbSet.forEach(function (suburb) { // ZetLand (NSW)
                            if (suburb.includes(' (')) {
                                suburbList.push(suburb.split(' (')[0]); // If String Contains (SA) etc, remove it. 
                                if (zee_state_array.indexOf((((suburb).split(' (')[1]).split(')')[0])) != -1){ 
                                    suburbListState.push(((suburb.split(' (')[1]).split(')')[0]).toUpperCase()) // If String Contains State, Add State into new Array.
                                } else {
                                    suburbListState.push(zee_state);
                                }
                            } else {
                                suburbList.push(suburb);
                                suburbListState.push(zee_state); // Default State to Being Same as Zee State.
                            }
                        });
                    } 
                } else {
                    console.log('Sendle Express: Through JSON')
                    JSON_suburb.forEach(function(suburb){
                        suburbList.push(suburb.suburbs);
                        suburbListPostCode.push(suburb.post_code);
                        suburbListState.push(suburb.state);
                    });
                }  
            }
        }
        console.log(suburbList);
        console.log(suburbListState);
        console.log(suburbListPostCode);

        // @ FORMAT OF IF ELSE CONDITIONS @
        // if (selector == 'mp_standard') { // Not MP Express or Sendle Express - Use Sendle Depot One.
        // } else if (selector == 'mp_express'){
        // } else if (selector == 's_au_express') {
        // }

        if (suburbList.length > 0) {
            if (selector == 'mp_standard') { // Not MP Express or Sendle Express - Use Sendle Depot One.
                /** 
                 * Primary Datatable: MP Standard
                */
                var dataMatchingSetSearch = search.load({ type: 'customrecord_dom_zones', id: 'customsearch_sendle_dom_zones_5' }); // Sendle Domestic Pickup Zones - All - customsearch_sendle_dom_zones

                var matchingFilterExpression = [];
                matchingFilterExpression.push(['isinactive', search.Operator.IS, 'F']); // Is Active
                matchingFilterExpression.push('AND')
                if (suburbList.length > 0) {
                    var suburbExpression = [];
                    for (var i = 0; i < suburbList.length; i++) {
                        // Define Post Code Range using State.
                        // var zee_state_position = zee_state_array.indexOf(suburbListState[i]);
                        // var zee_postcode_val = zee_state_postcode[zee_state_position];

                        var surburbWithStateExpression = [];
                        surburbWithStateExpression.push(['custrecord_dom_zones_suburb_name', search.Operator.IS, suburbList[i]]);
                        surburbWithStateExpression.push('AND');
                        surburbWithStateExpression.push(['custrecord_dom_sender_state', search.Operator.IS, suburbListState[i]]);
                        if (!isNullorEmpty(suburbListPostCode[i])){
                            surburbWithStateExpression.push('AND');
                            surburbWithStateExpression.push(['custrecord_dom_zones_postcode', search.Operator.IS, suburbListPostCode[i]]);
                        }
                        suburbExpression.push(surburbWithStateExpression);

                        // suburbExpression.push(['custrecord_dom_zones_suburb_name', search.Operator.IS, suburbList[i]]); // Filter for Suburbs Containing the Name from Suburb List
                        suburbExpression.push('OR');
                    }
                    suburbExpression.pop(); // remove the last 'or'
                    matchingFilterExpression.push(suburbExpression);
                } else {
                    matchingFilterExpression.pop();
                }
                dataMatchingSetSearch.filterExpression = matchingFilterExpression;

                console.log('Filter Expression - ' + selector + ' : G ' + JSON.stringify(matchingFilterExpression));

                var matchingSetLength = parseInt(dataMatchingSetSearch.runPaged().count);

                console.log('Count: ' + matchingSetLength);

                for (var main_index = 0; main_index < matchingSetLength; main_index += 1000) {
                    dataMatchSet.push(dataMatchingSetSearch.run().getRange({ start: main_index, end: main_index + 999 }));
                }
                console.log('Suburb List: Network Matrix' + JSON.stringify(suburbList));
                console.log('Suburb List - Network Matrix Length: ' + suburbList.length);
                if (suburbList.length > 0 && matchingSetLength > 0) {
                    dataMatchSet[0].forEach(function (row_list) {
                        var internalid = row_list.getValue({name: "internalid", label: "Internal ID"});
                        var sub_name = row_list.getValue({
                        name: "custrecord_dom_zones_suburb_name",
                        sort: search.Sort.ASC,
                        label: "Suburb Name"
                        })
                        // var opJSON = JSON.parse(JSON_suburb);
                        var opSet = JSON_suburb.filter(function (el){ if (el.suburbs.includes(sub_name)) {return el }})
                        // var sub_name = opSet[0].suburbs;
                        
                        console.log('Prim Index - Sub Name: ' + sub_name);
                        var post_code = row_list.getValue({name: "custrecord_dom_zones_postcode", label: "Postcode"}) // 2000 etc
                        var country_code = row_list.getValue({name: "custrecord_dom_zones_country_code", label: "Country Code"}) // AU
                        var zone_id = row_list.getText({name: "custrecord_dom_zones_zone_id", label: "Zone ID"}) // AU-Sydney | AU-Adelaide etc
                        var zones = row_list.getValue({name: "custrecord_dom_zones_ns_zones", label: "Sender Zones"}) // SYD | MEL etc
                        var state = row_list.getValue({name: "custrecord_dom_sender_state", label: "State"}) 

                        // if (suburbList.indexOf(lowerCaseAllWordsExceptFirstLetters(sub_name.split(' (')[0])) != -1) { // If Suburb is in Suburb List /
                        var internalid = row_list.getValue({ name: 'internalid' }) // Netsuite ID for Record
                        var sub_code = ''; // row_list.getValue({ name: 'custrecord_sendleplus_sub_code' });
                        // sub_code = '<p class="internal_id" id="' + internalid + '">' + row_list.getValue({ name: 'custrecord_sendleplus_sub_code' }); + "</p>";

                        var prim_name = ''; //row_list.getValue({ name: 'custrecord_sendleplus_prim_name' });
                        
                        var prim_email = ''; //row_list.getValue({ name: 'custrecord_sendleplus_prim_email' });
                        var prim_num = ''; //row_list.getValue({ name: 'custrecord_sendleplus_prim_phone_num' });
                        var prim_input_field = '<select id="primary_filter" class="form-control primary_operator ui search dropdown">'; //select2 //selectpicker

                        var display_prim_id = '';
                        var display_prim_email = '';
                        var display_prim_num = '';
                        var display_prim_name = '';

                        var secondary_json = '<p class="sec_json" id="sec_json" changed="false">';

                        var sorting = 'True';

                        /**
                         *  Primary Operator
                         */
                        if (!isNullorEmpty(opSet[0])){
                            if (!isNullorEmpty(opSet[0].primary_op)){
                                var prim_id = opSet[0].primary_op; //   - POPULATE THIS!!!!
                            } else {
                                var prim_id = ''; //   - POPULATE THIS!!!!
                            }
                        }   
                        
                        var old_prim_id = prim_id;
                        
                        if (!isNullorEmpty(prim_id)) { //|| prim_id == 0  - POPULATE THIS!!!!
                            prim_index = 1;
                        } else {
                            prim_index = 0;
                        }
                        prim_input_field += '<option>- None -</option>';

                        primOperatorSet.forEach(function (operatorRecord) {
                            var new_op_id = operatorRecord.values.internalid[0].value;
                            var new_op_email = operatorRecord.values.custrecord_operator_email
                            var new_op_name = operatorRecord.values.name;
                            var new_op_num = operatorRecord.values.custrecord_operator_phone;

                            if (prim_index == 0) {
                                prim_input_field += '<option new_id="' + new_op_id + '" name="' + new_op_name + '" old_id="' + prim_id + '" email="' + new_op_email + '" phone="' + new_op_num + '" selected>' + new_op_name + '</option>';

                                display_prim_id = new_op_id;
                                display_prim_email = new_op_email;
                                display_prim_num = new_op_num
                                display_prim_name = new_op_name;

                                prim_id = new_op_id;
                                prim_email = new_op_email;
                                prim_num = new_op_num
                                prim_name = new_op_name;
                            } else if (prim_id == new_op_id) {
                                prim_input_field += '<option new_id="' + new_op_id + '" name="' + new_op_name + '" old_id="' + prim_id + '" email="' + new_op_email + '" phone="' + new_op_num + '" selected>' + new_op_name + '</option>';

                                display_prim_id = new_op_id;
                                display_prim_email = new_op_email;
                                display_prim_num = new_op_num
                                display_prim_name = new_op_name;

                                prim_index++;
                            } else {
                                prim_input_field += '<option new_id="' + new_op_id + '" name="' + new_op_name + '" old_id="' + prim_id + '" email="' + new_op_email + '" phone="' + new_op_num + '">' + new_op_name + '</option>';
                            }

                            prim_index++;
                            return true;
                        });
                        prim_input_field += '</select>';
                        if (index == 0) {
                            prim_input_field += '<div class="ui toggle checkbox checkbox_primary"><input type="checkbox" id="selectall"><label>Fill all</label></div>';
                        }

                        /**
                         *  Secondary Op:
                         */
                        if (!isNullorEmpty(opSet)){
                            if (!isNullorEmpty(opSet[0].secondary_op)){
                                console.log(opSet[0].secondary_op);
                                var sec_json = opSet[0].secondary_op; // row_list.getValue({ name: 'custrecord_sendleplus_sec_json' })  - POPULATE THIS!!!!
                            } else {
                                var sec_json = ''; //   - POPULATE THIS!!!!
                            }
                        }
                        if (!isNullorEmpty(sec_json)) {
                            var sec_obj = sec_json; //sec_json //JSON.parse(sec_json); 
                            var sec_obj_val = JSON.stringify(sec_json);
                            secondary_json += sec_obj_val;
                        }
                        secondary_json += '</p>';
                        // var secondary_input_field = '';
                        var secondary_input_field = '<select id="secondary_operator" class="ui fluid search dropdown secondary_operator" json="" multiple="">'

                        operatorSet.forEach(function (secOperatorRes) {
                            var sec_op_id = secOperatorRes.values.internalid[0].value;
                            var sec_op_email = secOperatorRes.values.custrecord_operator_email;
                            var sec_op_name = secOperatorRes.values.name;
                            var sec_op_num = secOperatorRes.values.custrecord_operator_phone;
                            var sec_op_zee = secOperatorRes.values.custrecord_operator_franchisee[0].text;

                            if (!isNullorEmpty(sec_obj)) {
                                var sec_obj_res = sec_obj.filter(function (el) { return el.id == sec_op_id })
                            } else {
                                var sec_obj_res = '';
                            }

                            if (!isNullorEmpty(sec_obj_res)) {
                                secondary_input_field += '<option sec_id="' + sec_op_id + '" name="' + sec_op_name + '" email="' + sec_op_email + '" phone="' + sec_op_num + '" zee="' + sec_op_zee + '" selected>' + sec_op_name + ' (' + sec_op_zee + ')</option>';
                            } else {
                                secondary_input_field += '<option sec_id="' + sec_op_id + '" name="' + sec_op_name + '" email="' + sec_op_email + '" phone="' + sec_op_num + '" zee="' + sec_op_zee + '">' + sec_op_name + ' (' + sec_op_zee + ')</option>';
                            }
                            return true;
                        });
                        secondary_input_field += '</select>';
                        if (index == 0) {
                            secondary_input_field += '<div class="ui toggle checkbox checkbox_secondary"><input type="checkbox" id="selectall"><label>Fill all</label></div>'
                        }

                        index++;

                        dataSet3.push([
                            '<button class="btn btn-danger btn-sm remove_suburb glyphicon glyphicon-trash" type="button" data-toggle="tooltip" data-placement="right" title="Delete"></button>', //
                            internalid,
                            post_code, 
                            sub_name,
                            state,
                            zone_id,
                            prim_input_field, 
                            display_prim_id, 
                            display_prim_email, 
                            display_prim_num, 
                            secondary_input_field, 
                            secondary_json, 
                            sorting, // 12  Suburb in List
                        ])

                        return true;
                    });
                }
            } else { // MP Express and Sendle AU Express
                /** 
                 * Primary Datatable: MP Express & AU Express
             */
                var dataMatchingSetSearch = search.load({ type: 'customrecord_sendleplus_mapping_list', id: 'customsearch_sendleplus_mapping_search' }); // Toll Suburbs List

                var matchingFilterExpression = [];
                matchingFilterExpression.push(['isinactive', search.Operator.IS, 'F']); // Is Active
                matchingFilterExpression.push('AND')
                if (suburbList.length > 0) {
                    var suburbExpression = [];
                    for (var i = 0; i < suburbList.length; i++) {
                        var surburbWithStateExpression = [];
                        surburbWithStateExpression.push(['custrecord_sendleplus_sub_name', search.Operator.IS, suburbList[i]]);
                        surburbWithStateExpression.push('AND');
                        surburbWithStateExpression.push(['custrecord_sendleplus_state', search.Operator.IS, suburbListState[i]]);
                        if (!isNullorEmpty(suburbListPostCode[i])){
                            surburbWithStateExpression.push('AND');
                            surburbWithStateExpression.push(['custrecord_sendleplus_postcode', search.Operator.IS, suburbListPostCode[i]]);
                        }
                        suburbExpression.push(surburbWithStateExpression);

                        // suburbExpression.push(['custrecord_sendleplus_sub_name', search.Operator.IS, suburbList[i]]); // STARTSWITH - Filter for Suburbs Containing the Name from Suburb List
                        suburbExpression.push('OR');
                    }
                    suburbExpression.pop(); // remove the last 'or'
                    matchingFilterExpression.push(suburbExpression);
                } else {
                    matchingFilterExpression.pop();
                }

                dataMatchingSetSearch.filterExpression = matchingFilterExpression;

                console.log('Filter Expression - ' + selector + ' : G ' + JSON.stringify(matchingFilterExpression));

                var matchingSetLength = parseInt(dataMatchingSetSearch.runPaged().count);

                console.log('Count: ' + matchingSetLength);

                for (var main_index = 0; main_index < matchingSetLength; main_index += 1000) {
                    dataMatchSet.push(dataMatchingSetSearch.run().getRange({ start: main_index, end: main_index + 999 }));
                }
                console.log('Suburb List: ' + JSON.stringify(suburbList));
                console.log('Suburb List Length: ' + suburbList.length);
                if (suburbList.length > 0 && matchingSetLength > 0) {
                    dataMatchSet[0].forEach(function (row_list) {
                        // dataMatchingSetSearch.run().getRange({ start: 0, end: 999 }).forEach(function (row_list) {
                        // var opJSON = JSON.parse(JSON_suburb);
                        var opSet = JSON_suburb.filter(function (el){ if (el.suburbs.includes(sub_name)) {return el }})
                        console.log('Prim Index: ' + index);
                        var sub_name = row_list.getValue({ name: 'custrecord_sendleplus_sub_name' });

                        // if (suburbList.indexOf(lowerCaseAllWordsExceptFirstLetters(sub_name.split(' (')[0])) != -1) { // If Suburb is in Suburb List /
                        var externalid = row_list.getValue({ name: 'externalid' }); // Toll - mappiung id
                        var internalid = row_list.getValue({ name: 'internalid' }) // Netsuite ID for Record
                        var sub_code = row_list.getValue({ name: 'custrecord_sendleplus_sub_code' });
                        sub_code = '<p class="internal_id" id="' + internalid + '">' + row_list.getValue({ name: 'custrecord_sendleplus_sub_code' }); + "</p>";
                        var post_code = row_list.getValue({ name: 'custrecord_sendleplus_postcode' });

                        var state = row_list.getValue({ name: 'custrecord_sendleplus_state' });

                        var prim_name = row_list.getValue({ name: 'custrecord_sendleplus_prim_name' });
                        // var prim_id = row_list.getValue({ name: 'custrecord_sendleplus_prim_id' });
                        if (!isNullorEmpty(opSet)){
                            if (!isNullorEmpty(opSet[0].primary_op)){
                                var prim_id = opSet[0].primary_op; //   - POPULATE THIS!!!!
                            } else {
                                var prim_id = ''; //   - POPULATE THIS!!!!
                            }
                        }
                        // console.log('Prim Id: ' + prim_id)
                        var old_prim_id = prim_id;

                        var prim_email = row_list.getValue({ name: 'custrecord_sendleplus_prim_email' });
                        var prim_num = row_list.getValue({ name: 'custrecord_sendleplus_prim_phone_num' });
                        var prim_input_field = '<select id="primary_filter" class="form-control primary_operator ui search dropdown">'; //select2 //selectpicker

                        var display_prim_id = '';
                        var display_prim_email = '';
                        var display_prim_num = '';
                        var display_prim_name = '';

                        var secondary_json = '<p class="sec_json" id="sec_json" changed="false">';

                        var sorting = 'True';

                        var zee_dropdown = '';

                        /**
                         *  Primary Operator
                         */
                        if (!isNullorEmpty(prim_id)) { //|| prim_id == 0
                            prim_index = 1;
                        } else {
                            prim_index = 0;
                        }
                        prim_input_field += '<option>- None -</option>';

                        primOperatorSet.forEach(function (operatorRecord) {
                            var new_op_id = operatorRecord.values.internalid[0].value;
                            var new_op_email = operatorRecord.values.custrecord_operator_email
                            var new_op_name = operatorRecord.values.name;
                            var new_op_num = operatorRecord.values.custrecord_operator_phone;

                            if (prim_index == 0) {
                                prim_input_field += '<option new_id="' + new_op_id + '" name="' + new_op_name + '" old_id="' + prim_id + '" email="' + new_op_email + '" phone="' + new_op_num + '" selected>' + new_op_name + '</option>';

                                display_prim_id = new_op_id;
                                display_prim_email = new_op_email;
                                display_prim_num = new_op_num
                                display_prim_name = new_op_name;

                                prim_id = new_op_id;
                                prim_email = new_op_email;
                                prim_num = new_op_num
                                prim_name = new_op_name;
                            } else if (prim_id == new_op_id) {
                                prim_input_field += '<option new_id="' + new_op_id + '" name="' + new_op_name + '" old_id="' + prim_id + '" email="' + new_op_email + '" phone="' + new_op_num + '" selected>' + new_op_name + '</option>';

                                display_prim_id = new_op_id;
                                display_prim_email = new_op_email;
                                display_prim_num = new_op_num
                                display_prim_name = new_op_name;

                                prim_index++;
                            } else {
                                prim_input_field += '<option new_id="' + new_op_id + '" name="' + new_op_name + '" old_id="' + prim_id + '" email="' + new_op_email + '" phone="' + new_op_num + '">' + new_op_name + '</option>';
                            }

                            prim_index++;
                            return true;
                        });

                        prim_input_field += '</select>';
                        if (index == 0) {
                            prim_input_field += '<div class="ui toggle checkbox checkbox_primary"><input type="checkbox" id="selectall"><label>Fill all</label></div>';
                        }

                        /**
                         *  Secondary Op:
                         */
                        // var sec_json = row_list.getValue({ name: 'custrecord_sendleplus_sec_json' })
                        if (!isNullorEmpty(opSet)){
                            if (!isNullorEmpty(opSet[0].secondary_op)){
                                console.log(opSet[0].secondary_op);
                                var sec_json = opSet[0].secondary_op; // row_list.getValue({ name: 'custrecord_sendleplus_sec_json' })  - POPULATE THIS!!!!
                            } else {
                                var sec_json = ''; //   - POPULATE THIS!!!!
                            }
                        }
                        if (!isNullorEmpty(sec_json)) {
                            var sec_obj = sec_json; //sec_json //JSON.parse(sec_json); 
                            var sec_obj_val = JSON.stringify(sec_json);
                            secondary_json += sec_obj_val;
                        }
                        secondary_json += '</p>';
                        // var secondary_input_field = '';
                        var secondary_input_field = '<select id="secondary_operator" class="ui fluid search dropdown secondary_operator" json="" multiple="">'

                        operatorSet.forEach(function (secOperatorRes) {
                            var sec_op_id = secOperatorRes.values.internalid[0].value;
                            var sec_op_email = secOperatorRes.values.custrecord_operator_email;
                            var sec_op_name = secOperatorRes.values.name;
                            var sec_op_num = secOperatorRes.values.custrecord_operator_phone;
                            var sec_op_zee = secOperatorRes.values.custrecord_operator_franchisee[0].text;

                            if (!isNullorEmpty(sec_obj)) {
                                var sec_obj_res = sec_obj.filter(function (el) { return el.id == sec_op_id })
                            } else {
                                var sec_obj_res = '';
                            }

                            if (!isNullorEmpty(sec_obj_res)) {
                                secondary_input_field += '<option sec_id="' + sec_op_id + '" name="' + sec_op_name + '" email="' + sec_op_email + '" phone="' + sec_op_num + '" zee="' + sec_op_zee + '" selected>' + sec_op_name + ' (' + sec_op_zee + ')</option>';
                            } else {
                                secondary_input_field += '<option sec_id="' + sec_op_id + '" name="' + sec_op_name + '" email="' + sec_op_email + '" phone="' + sec_op_num + '" zee="' + sec_op_zee + '">' + sec_op_name + ' (' + sec_op_zee + ')</option>';
                            }
                            return true;
                        });
                        secondary_input_field += '</select>';
                        if (index == 0) {
                            secondary_input_field += '<div class="ui toggle checkbox checkbox_secondary"><input type="checkbox" id="selectall"><label>Fill all</label></div>'
                        }

                        index++;

                        dataSet2.push(['<button class="btn btn-danger btn-sm remove_suburb glyphicon glyphicon-trash" type="button" data-toggle="tooltip" data-placement="right" title="Delete"></button>', internalid, externalid, sub_code, post_code, sub_name, state, zee_dropdown, prim_input_field, display_prim_id, display_prim_email, display_prim_num, secondary_input_field, secondary_json, sorting])                
                        
                        return true;
                    });
                }
            }
        }
        var datatable2 = $(table2_id).DataTable();
        datatable2.clear();
        datatable2.rows.add(dataSet2);
        datatable2.draw();

        var datatable3 = $(table3_id).DataTable();
        datatable3.clear();
        datatable3.rows.add(dataSet3);
        datatable3.draw();

        // if (suburbList.length > 0) {
            // $('.ui.dropdown').dropdown();
        // }
        // console.log(ctx.getRemainingUsage());
    }

    function createChild(row) {
        // This is the table we'll convert into a DataTable
        var table = $('<table class="display" width="50%"/>');
        var childSet = [];

        childSet.push(['CP Parcels - TOLL Dep', '<select id="courier_select" class="courier_select ui dropdown selection"><option></option><option selected>Sydney Airport</option><option>Wolli Creek</option></select>'],
        ['CP Parcels - Consol Hub', '<select id="courier_select" class="courier_select ui dropdown selection"><option></option><option>Sydney Airport</option><option selected>Wolli Creek</option></select>'],
        ['Toll Parcels - TOLL Dep', '<select id="courier_select" class="courier_select ui dropdown selection"><option></option><option>Sydney Airport</option><option>Wolli Creek</option></select>'],
        ['Toll Parcels - Consol Hub', '<select id="courier_select" class="courier_select ui dropdown selection"><option></option><option>Sydney Airport</option><option>Wolli Creek</option></select>'])

        // Display it the child row
        row.child(table).show();

        // Initialise as a DataTable
        var usersTable = table.DataTable({
            "bPaginate": false,
            "bLengthChange": false,
            "bFilter": false,
            "bInfo": false,
            "bAutoWidth": false,
            data: childSet,
            columns: [
                { title: 'Courier' }, //0
                { title: 'Option' }, //1
            ],
        });
    }

    function destroyChild(row) {
        row.child.hide();
    }

    function saveArray(selector) {
        console.log('Save Function: Initialise');
        if (selector == 'mp_standard'){
            console.log('Initialise: MP Standard')
            var datatable3 = $('#data_preview3_mp_standard').DataTable();
            var tableDataSet = datatable3.data().toArray();

            var JSON_save = [];
            var MAIN_save = '';
            // JSON Details - Evenutally needs to be stored
            tableDataSet.forEach(function(tableData) {
                var suburb_name = tableData[3]; // Suburb Name,
                var post_code = tableData[2]; // Postcode,
                // Creating New State for Suburb Name
                // var state_position = zee_state_postcode.indexOf(parseInt(post_code.split('')[0]))
                // var state = zee_state_array[state_position];
                var state = tableData[4]; // State

                var prim_op_id = tableData[7]; // Primary Operator ID,
                var secondary_op_json = tableData[11]; // Secondary Operator ID
                secondary_op_json = (secondary_op_json.split('<')[1]).split('>')[1];
                if (!isNullorEmpty(secondary_op_json)){
                    secondary_op_json = JSON.parse(secondary_op_json);
                }
                var next_day = null;

                JSON_save.push({"suburbs": suburb_name, post_code: post_code, state: state, "primary_op" : prim_op_id, secondary_op: secondary_op_json, "next_day" : next_day});
                MAIN_save += (suburb_name + ' (' + state + ') '+ '\n'); //MAIN_save += (suburb_name + '\n'); //
            });
            console.log(JSON_save);
            console.log(MAIN_save)
            
            var zeeRecord = record.load({ type: 'partner', id: zee_id });
            zeeRecord.setValue({ fieldId: 'custentity_network_matrix_json', value: JSON.stringify(JSON_save) })
            zeeRecord.setValue({ fieldId: 'custentity_network_matrix_main', value: MAIN_save })
            zeeRecord.save();
        } else if (selector == 'mp_express'){
            console.log('Initialise: MP Express');
            var datatable2 = $('#data_preview2_mp_express').DataTable();
            var tableDataSet = datatable2.data().toArray();

            var JSON_save = [];
            var MAIN_save = '';
            // JSON Details - Evenutally needs to be stored
            tableDataSet.forEach(function(tableData) {
                var suburb_name = tableData[5]; // Suburb Name,
                var post_code = tableData[4]; // Postcode,
                var state = tableData[6]; // State,
                var prim_op_id = tableData[9]; // Primary Operator ID,
                var secondary_op_json = tableData[12]; // Secondary Operator ID
                secondary_op_json = (secondary_op_json.split('<')[1]).split('>')[1];
                if (!isNullorEmpty(secondary_op_json)){
                    secondary_op_json = JSON.parse(secondary_op_json);
                }
                var next_day = null;

                JSON_save.push({"suburbs": suburb_name, post_code: post_code, state: state, "primary_op" : prim_op_id, secondary_op: secondary_op_json, "next_day" : next_day});
                MAIN_save += (suburb_name + ' (' + state + ') '+ '\n'); //MAIN_save += (suburb_name + '\n'); //
            });
            console.log(JSON_save);
            console.log(MAIN_save)
            
            var zeeRecord = record.load({ type: 'partner', id: zee_id });
            zeeRecord.setValue({ fieldId: 'custentity_network_matrix_json', value: JSON.stringify(JSON_save) })
            zeeRecord.setValue({ fieldId: 'custentity_network_matrix_main', value: MAIN_save })
            zeeRecord.save();
        } else if (selector == 's_au_express'){
            console.log('Initialise: MP Express');
            var datatable2 = $('#data_preview2_s_au_express').DataTable();
            var tableDataSet = datatable2.data().toArray();
            console.log(tableDataSet);

            var JSON_save = [];
            var MAIN_save = '';
            // JSON Details - Evenutally needs to be stored
            tableDataSet.forEach(function(tableData) {
                var suburb_name = tableData[5]; // Suburb Name,
                var post_code = tableData[4]; // Postcode,
                var state = tableData[6]; // State,
                var prim_op_id = tableData[9]; // Primary Operator ID,
                var secondary_op_json = tableData[12]; // Secondary Operator ID
                secondary_op_json = (secondary_op_json.split('<')[1]).split('>')[1];
                if (!isNullorEmpty(secondary_op_json)){
                    secondary_op_json = JSON.parse(secondary_op_json);
                }
                console.log(secondary_op_json)
                var next_day = null;

                JSON_save.push({"suburbs": suburb_name, post_code: post_code, state: state, "primary_op" : prim_op_id, secondary_op: secondary_op_json, "next_day" : next_day});
                MAIN_save += (suburb_name + ' (' + state + ') '+ '\n');
            });
            console.log(JSON_save);
            console.log(MAIN_save);
            
            var zeeRecord = record.load({ type: 'partner', id: zee_id });
            zeeRecord.setValue({ fieldId: 'custentity_sendle_recovery_suburbs', value: JSON.stringify(JSON_save) })
            zeeRecord.setValue({ fieldId: 'custentity_sendle_recovery_suburbs_main', value: MAIN_save })
            zeeRecord.save();
        }
        console.log('Save Array: Finalised');
    }

    function saveRecord(context) {
        // save(context);
        return true;
    }

    function lowerCaseAllWordsExceptFirstLetters(string) {
        return string.replace(/\S*/g, function (word) {
            return word.charAt(0) + word.slice(1).toLowerCase();
        });
    }

    function isNullorEmpty(strVal) {
        return (strVal == null || strVal == '' || strVal == 'null' || strVal == undefined || strVal == 'undefined' || strVal == '- None -');
    }

    return {
        pageInit: pageInit,
        saveRecord: saveRecord
    };
});