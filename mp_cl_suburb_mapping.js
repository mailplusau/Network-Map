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
     // var role = runtime.getCurrentUser().role;

     var ctx = runtime.getCurrentScript();
     var currRec = currentRecord.get();

     var dataSet = [];
     var dataSet2 = [];
     var dataSet3 = [];

     var baseDataSet2 = [];
     var dataMatchSet = [];

     var operatorSet = [];
     var primOperatorSet = [];

     var suburbSet = [];
     var suburbList = [];

     var toSaveSet = [];

     var change = false;

     var mile = ''; // F = First, L = Last

     var zee_id = parseInt(currRec.getValue({ fieldId: 'custpage_sendleplus_operator_zee_id' }));
     var zee_name = currRec.getValue({ fieldId: 'custpage_sendleplus_operator_zee_name' });
     var zee_state = currRec.getValue({ fieldId: 'custpage_sendleplus_operator_zee_state' });
     var zee_state_array = ['', 'NSW', 'QLD', 'VIC', 'SA', 'TAS', 'ACT', 'WA', 'NT'];
     var zee_state_postcode = ['', 2, 4, 3, 5, 7, 2, 6, 0]
     var zee_state_id = zee_state_array.indexOf(zee_state);
     var zee_postcode = zee_state_postcode[zee_state_id];
     var page_index = 0;

     /** Update */
     var selector = currRec.getValue({ fieldId: 'custpage_sendleplus_operator_selector' });

     /**
      * On page initialisation
      */
     function pageInit(scriptContext) {
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
             // currRec.setValue({ fieldId: 'custpage_sendleplus_operator_zee_id', value: zee_id_dropdown });
             // currRec.setValue({ fieldId: 'custpage_sendleplus_operator_zee_name', value: zee_name_dropdown });
             // currRec.setValue({ fieldId: 'custpage_sendleplus_operator_zee_state', value: zee_state_dropdown });
             var params = {
                 zeeid: zee_id_dropdown,
                 zeename: zee_name_dropdown,
                 zeestate: zee_state_dropdown,
                 // pagenum: 0
             }
             params = JSON.stringify(params);
             var upload_url = baseURL + url.resolveScript({ deploymentId: 'customdeploy_sl_sendleplus_operator', scriptId: 'customscript_sl_sendleplus_operator' }) + '&custparam_params=' + params;
             currRec.setValue({ fieldId: 'custpage_sendleplus_operator_zee_id', value: zee_id });
             window.location.href = upload_url;
         });

         $(document).on('change', '#zee_filter_dropdown', function () {
             var zee_id_dropdown = $(this).find('option:selected').val();
             var zee_name_dropdown = $(this).find('option:selected').text();
             var zee_state_dropdown = $(this).find('option:selected').attr('state');
             // currRec.setValue({ fieldId: 'custpage_sendleplus_operator_zee_id', value: zee_id_dropdown });
             // currRec.setValue({ fieldId: 'custpage_sendleplus_operator_zee_name', value: zee_name_dropdown });
             // currRec.setValue({ fieldId: 'custpage_sendleplus_operator_zee_state', value: zee_state_dropdown });
             var params = {
                 zeeid: zee_id_dropdown,
                 zeename: zee_name_dropdown,
                 zeestate: zee_state_dropdown,
                 // pagenum: 0
             }
             params = JSON.stringify(params);
             var upload_url = baseURL + url.resolveScript({ deploymentId: 'customdeploy_sl_sendleplus_operator', scriptId: 'customscript_sl_sendleplus_operator' }) + '&custparam_params=' + params;
             currRec.setValue({ fieldId: 'custpage_sendleplus_operator_zee_id', value: zee_id });
             window.location.href = upload_url;
         });

         var selector_type = ['mp_standard', 'mp_express', 'first_mile', 'last_mile']; //'s_au_express', 
         // var selector_type = ['first_mile', 'last_mile'];
         selector_type.forEach(function (mile_selector) {
             var table_id = '#data_preview_' + mile_selector;
             var table2_id = '#data_preview2_' + mile_selector;
             var table3_id = '#data_preview3_' + mile_selector;

             console.log('Table ID: ' + table_id)

             if (zee_id != 0 || zee_id != 0.0 || !isNullorEmpty(zee_id)) {
                 $(table_id).removeClass('hide');
                 $(table2_id).removeClass('hide');
                 $(table3_id).removeClass('hide');
                 /**
                  *  Primary Datable
                  */
                 var dataTable = $(table_id).DataTable({
                     data: dataSet,
                     pageLength: 1000,
                     order: [
                         [19, 'desc'], [4, 'asc']
                     ],
                     columns: [
                         {
                             title: 'Expand',
                             className: 'dt-control',
                             orderable: false,
                             data: null,
                             defaultContent: '',
                         }, // Overall Number 0
                         { title: 'Internalid' }, // 0
                         { title: 'Externalid' }, // 1
                         { title: 'Suburb Code' }, // 2
                         { title: 'Post Code' }, // 3
                         { title: 'Suburb Name' }, // 4
                         { title: 'State' }, // 5
                         { title: 'SA3_CODE' }, // 6
                         { title: 'SA3_NAME' }, // 7
                         { title: 'SA4_CODE' }, // 8
                         { title: 'SA4_NAME' }, // 9 
                         { title: 'AU-Express Lodgement' }, // 10 
                         { title: 'Australia Post Filter' }, // 11
                         { title: 'Franchisee' }, // 12
                         { title: 'Primary Driver: Name' }, // 13

                         { title: 'Primary Driver: ID' }, // 14
                         { title: 'Primary Driver: Email' }, // 15
                         { title: 'Primary Driver: Phone No.' }, // 16

                         { title: 'Secondary Driver: List' }, // 17
                         { title: 'Secondary Driver: JSON' }, // 18
                         { title: 'Suburb In List?' } //19
                     ],
                     columnDefs: [
                         {
                             // targets: [1, 6, 7, 8, 9, 10, 11, 19], //16
                             targets: [1, 2, 7, 8, 9, 10, 11, 12, 20], //
                             visible: false,
                         },
                         {
                             targets: [18], //16 originally
                             width: '15px'
                         },
                     ],
                     // autoWidth: false,
                     // responsive: true,
                 });

                 /**
                  *  Secondary Datatable
                  */
                 var dataTable2 = $(table2_id).DataTable({
                     data: dataSet2,
                     pageLength: 100,
                     order: [
                         [20, 'desc'], [5, 'asc']
                     ],
                     columns: [
                         {
                             title: 'Expand',
                             className: 'dt-control',
                             orderable: false,
                             data: null,
                             defaultContent: '',
                         }, //0
                         { title: 'Internalid' }, //1
                         { title: 'Externalid' }, //2
                         { title: 'Suburb Code' }, //3
                         { title: 'Post Code' }, //4
                         { title: 'Suburb Name' }, //5
                         { title: 'State' }, //6

                         { title: 'SA3_CODE' }, //7
                         { title: 'SA3_NAME' }, //8
                         { title: 'SA4_CODE' }, //9
                         { title: 'SA4_NAME' }, //10
                         { title: 'AU-Express Lodgement' }, //11
                         { title: 'Australia Post Filter' }, //12

                         { title: 'Franchisee' }, //13
                         { title: 'Primary Driver: Name' }, //14

                         { title: 'Primary Driver: ID' }, //15
                         { title: 'Primary Driver: Email' }, //16
                         { title: 'Primary Driver: Phone No.' }, //17

                         { title: 'Secondary Driver: List' }, //18
                         { title: 'Secondary Driver: JSON' }, //19
                         { title: 'Suburb In List?' } //20
                     ],
                     columnDefs: [
                         {
                             targets: [1, 2, 7, 8, 9, 10, 11, 12, 20], //
                             visible: false,
                         },
                         {
                             targets: [19], //18 originally
                             width: '15px'
                         },
                         // {
                         //     targets: 17,
                         //     render: function (data, type, row, meta) {
                         //         var $select = $('<select id="secondary_operator" class="ui fluid search dropdown secondary_operator" json="" multiple=""></select>'); //selectpicker
                         //         //<div class="ui toggle checkbox"><input type="checkbox" id="selectall"><label>Select all</label></div>
                         //         $select.append(data);
                         //         return $select[0].outerHTML;
                         //     }
                         // },
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
                         { title: 'Zone ID' }, //4

                         { title: 'Primary Driver: Name' }, //5
                         { title: 'Primary Driver: ID' }, //6
                         { title: 'Primary Driver: Email' }, //7
                         { title: 'Primary Driver: Phone No.' }, //8

                         { title: 'Secondary Driver: List' }, //9
                         { title: 'Secondary Driver: JSON' }, //10

                         { title: 'Suburb In List?' } // 11
                     ],
                     columnDefs: [
                         {
                             targets: [11], // Suburb In List?
                             visible: false,
                         },
                     ],
                     autoWidth: false,
                 });

                 loadDatatable(zee_id, zee_name, zee_state, mile_selector, table_id, table2_id, table3_id); // Primary Datatable Loading

                 /**
                  *  Pre-Datatable Load
                  */
                 $('.loading_section').addClass('hide');
                 //Submitter
                 $('.submit_btn').removeClass('hide');

                 // Secondary DataTable Filter Div
                 $('#dataTable2filters_' + mile_selector).removeClass('hide');

                 //Table Titles
                 $('.secondary_table_title_' + mile_selector).removeClass('hide');
                 $('.primary_table_title_' + mile_selector).removeClass('hide')

                 /**
                  *  Child Table Info
                  */
                 // Load with All Child Cells Open
                 dataTable.rows().every(function() {
                     // this.child(format(this.data())).show();
                     this.child(createChild(this));
                     this.child.hide(); // Hide Child Tables on Open
                 });
                 // Load with All Child Cells Open
                 dataTable2.rows().every(function() {
                     // this.child(format(this.data())).show();
                     this.child(createChild(this));
                     this.child.hide(); // Hide Child Tables on Open
                 });
                 // Add event listener for opening and closing child table details on button.
                 $(table_id+' tbody').on('click', 'td.dt-control', function() {
                     var tr = $(this).closest('tr');
                     var row = dataTable.row(tr);

                     if (row.child.isShown()) {
                         // This row is already open - close it
                         destroyChild(row);
                         tr.removeClass('shown');
                         tr.removeClass('parent');
                     } else {
                         // Open this row
                         row.child.show();
                         tr.addClass('shown');
                         tr.addClass('parent');
                     }
                 });
                 $(table2_id+' tbody').on('click', 'td.dt-control', function() {
                     var tr = $(this).closest('tr');
                     var row = dataTable2.row(tr);

                     if (row.child.isShown()) {
                         // This row is already open - close it
                         destroyChild(row);
                         tr.removeClass('shown');
                         tr.removeClass('parent');
                     } else {
                         // Open this row
                         row.child.show();
                         tr.addClass('shown');
                         tr.addClass('parent');
                     }
                 });
                 // Handle click on "Expand All" button
                 $('#btn-show-all-children').on('click', function() {
                     // Enumerate all rows
                     dataTable.rows().every(function() {
                         // If row has details collapsed
                         if (!this.child.isShown()) {
                             // Open this row
                             this.child.show();
                             $(this.node()).addClass('shown');
                         }
                     });
                     dataTable2.rows().every(function() {
                         // If row has details collapsed
                         if (!this.child.isShown()) {
                             // Open this row
                             this.child.show();
                             $(this.node()).addClass('shown');
                         }
                     });
                 });
                 // Handle click on "Collapse All" button
                 $('#btn-hide-all-children').on('click', function() {
                     // Enumerate all rows
                     dataTable.rows().every(function() {
                         // If row has details expanded
                         if (this.child.isShown()) {
                             // Collapse row details
                             this.child.hide();
                             $(this.node()).removeClass('shown');
                         }
                     });
                     dataTable2.rows().every(function() {
                         // If row has details expanded
                         if (this.child.isShown()) {
                             // Collapse row details
                             this.child.hide();
                             $(this.node()).removeClass('shown');
                         }
                     });
                 });
             }
         })

         // MP Ticket Column
         $(document).on('click', '.toggle-columns', function (e) {
             e.preventDefault();

             var mile_selector = $('div.tab-pane.active').attr('id');
             var table_id = '#data_preview_' + mile_selector;
             var table2_id = '#data_preview2_' + mile_selector;
             var datatable = $(table_id).DataTable();
             var datatable2 = $(table2_id).DataTable();

             // Get the column API object
             var column = datatable.column([15]); // ID
             var column2 = datatable.column([16]); // Email
             var column3 = datatable.column([17]); // Phone no.
             var column4 = datatable2.column([15]); // SA4 Name
             var column5 = datatable2.column([16]); // AU Express Lodgement
             var column6 = datatable2.column([17]); // AusPost Filter

             // Toggle the visibility
             column.visible(!column.visible());
             column2.visible(!column2.visible());
             column3.visible(!column3.visible());
             column4.visible(!column4.visible());
             column5.visible(!column5.visible());
             column6.visible(!column6.visible());

             if (column.visible() == true) {
                 $(this).addClass('btn-danger');
                 $(this).removeClass('btn-success');
             } else {
                 $(this).removeClass('btn-danger');
                 $(this).addClass('btn-success');
             }
         });

         // Toggle Main Tab Selection
         $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
             // var target = $(e.target).attr("href") // activated tab
             // alert(target);
             var main_selector = $('div.tab-pane.active').attr('id');
             console.log('Changed Tab - ' + main_selector);
             selector = main_selector;
             toSaveSet = [];
             if (main_selector == 'mp_standard') {
                 console.log('MP Standard')
                 // $('.title_header').text('Suburb & Operator Mapping: MailPlus Standard');
                 currRec.setValue({ fieldId: 'custpage_sendleplus_operator_selector', value: 'mp_standard' })
             } else if (main_selector == 'mp_express') {
                 console.log('Last Mile')
                 // $('.title_header').text('Suburb & Operator Mapping: MailPlus Express');
                 currRec.setValue({ fieldId: 'custpage_sendleplus_operator_selector', value: 'mp_express' })
             } else if (main_selector == 's_au_express') {
                 console.log('Sendle AU Express')
                 // $('.title_header').text('Suburb & Operator Mapping: Sendle AU Express');
                 currRec.setValue({ fieldId: 'custpage_sendleplus_operator_selector', value: 's_au_express' })
             }
             console.log('Current Tab Selection - ' + currRec.getValue({ fieldId: 'custpage_sendleplus_operator_selector'}));
         });
         // Toggle Mile Selection
         $('a[data-toggle="mile"]').on('shown.bs.tab', function (e) {
             // var target = $(e.target).attr("href") // activated tab
             // alert(target);
             var mile_section_selector = $('div.tab-pane-mile.active').attr('id');
             console.log('Changed Mile - ' + mile_section_selector);
             if (mile_section_selector == 'first_mile') {
                 console.log('First Mile')
                 // $('.title_header').text('Suburb & Operator Mapping: First Mile - ' + zee_name + '');
             } else {
                 console.log('Last Mile')
                 // $('.title_header').text('Suburb & Operator Mapping: Last Mile - ' + zee_name + '');
             }
         });

         //Secondary Table Filters
         $(document).on('click', '.search_filter', function () {
             var mile_section_selector = $('div.tab-pane-mile.active').attr('id');

             var table_id = '#data_preview_' + mile_section_selector;
             var table2_id = '#data_preview2_' + mile_section_selector;

             var post_code = parseInt($('#filter_postcode').val());
             var sub_name = $('#filter_sub_name_' + mile_section_selector).val();

             if (!isNullorEmpty(post_code) || !isNullorEmpty(sub_name)) {
                 loadNextDatatable(zee_state, post_code, sub_name, mile_section_selector, table2_id); // Secondary Datatable.
             } else {
                 alert('Please Enter Valid Filters');
             }
         });
         $(document).on('click', '.clear_filter', function () {
             var mile_section_selector = $('div.tab-pane-mile.active').attr('id');

             // var table_id = '#data_preview_' + mile_section_selector;
             var table2_id = '#data_preview2_' + mile_section_selector;

             var datatable2 = $(table2_id).DataTable();
             datatable2.clear();
             dataSet2 = baseDataSet2;
             datatable2.draw();
         });

         // Add Suburbs
         $(document).on('click', '.add_filter', function() {
             var mile_selector = $('div.tab-pane.active').attr('id');
             var table3_id = '#data_preview3_' + mile_selector;

             var post_code = parseInt($('#filter_postcode_' + mile_selector+'').val());
             if (!isNullorEmpty(post_code)) {post_code == 0}
             var sub_name = $('#filter_sub_name_' + mile_selector+'').val();

             console.log('Clicked: ' + sub_name + ' ' + post_code)

             var suburbObject = [];

             var addSuburb = search.load({ type: 'customrecord_dom_zones', id: 'customsearch_sendle_dom_zones' });
             if (!isNullorEmpty(sub_name)){
                 console.log('Inside Sub Name: ' + sub_name)
                 addSuburb.filters.push(search.createFilter({
                     name: 'custrecord_dom_zones_suburb_name',
                     operator: search.Operator.IS,
                     values: sub_name
                 }));
             } else if (!isNullorEmpty(post_code) || post_code != NaN || post_code != 0){
                 console.log('Inside Post Code: ' + post_code)
                 addSuburb.filters.push(search.createFilter({
                     name: 'custrecord_dom_zones_postcode',
                     operator: search.Operator.IS,
                     values: post_code
                 }));
             }
             addSuburb.run().each(function(row_list){
                 var prim_input_field = '';
                 var display_prim_id = '';
                 var display_prim_email = '';
                 var display_prim_num = '';
                 var secondary_input_field = '';
                 var secondary_json = '';

                 var internalid = row_list.getValue({name: "internalid", label: "Internal ID"})
                 console.log(internalid);
                 var sub_name = row_list.getValue({
                     name: "custrecord_dom_zones_suburb_name",
                     sort: search.Sort.ASC,
                     label: "Suburb Name"
                 })
                 var post_code = row_list.getValue({name: "custrecord_dom_zones_postcode", label: "Postcode"}) // 2000 etc
                 var country_code = row_list.getValue({name: "custrecord_dom_zones_country_code", label: "Country Code"}) // AU
                 var zone_id = row_list.getText({name: "custrecord_dom_zones_zone_id", label: "Zone ID"}) // AU-Sydney | AU-Adelaide etc
                 // var zones = row_list.getValue({name: "custrecord_dom_zones_ns_zones", label: "Sender Zones"}) // SYD | MEL etc

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
             });

             console.log('Update Datatable')
             var datatable3 = $(table3_id).DataTable();
             datatable3.rows.add(suburbObject);
             datatable3.draw();

             $('.ui.dropdown').dropdown();
         });
         //Remove Suburbs
         $(document).on('click', '.remove_suburb', function() {
             // console.log(this);
             var mile_selector = $('div.tab-pane.active').attr('id');
             var table3_id = '#data_preview3_' + mile_selector;
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
             var selection_zee_name = $(this).closest('tr').find('.sendleplus_zee').attr('name'); // Get Zee from Saved Zee in Record
             if (isNullorEmpty(selection_zee_name)) { // If Zee has not be set.
                 selection_zee_name = $(this).closest('tr').find('.sendleplus_zee').attr('old'); // Set Zee from Zee Name
             }

             var sec_array = [];
             var selected_mile;
             if (!isNullorEmpty(selection_zee_name)) {
                 var mile_selector = $('div.tab-pane.active').attr('id');
                 if (mile_selector == 'first_mile') {
                     selected_mile = 'First'
                 } else {
                     selected_mile = 'Last'
                 }
             }

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
                     sec_obj.push({ name: name, id: id, email: email, phone: phone_number, franchisee: zee });
                     sec_array.push(id);
                 }
             });

             if (isNullorEmpty(prim_id) || prim_id == 0) {
                 prim_id = 0;
                 // if (isNullorEmpty(sec_obj) && sec_obj.length == 0) {
                 selection_zee_name = null;
                 selected_mile = null;
                 //     // $(this).closest('tr').find('.sendleplus_zee').text('').change();
                 //     $(this).closest('tr').find('.sendleplus_zee').val(0).change();
                 //     console.log('no longer in list')
                 //     console.log('no longer in list secondary')
                 // };
             }

             var tr = $(this).closest('tr');
             row_json = tr.find('.sec_json');
             var sec_obj_length = row_json.length;
             console.log('Sec Obj Orginial Length: ' + sec_obj_length)
             // row_json.attr('changed', 'true')
             row_json.html(JSON.stringify(sec_obj))
             // $(this).attr('json', JSON.stringify(sec_obj));

             var sec_html = '<p class="sec_json" id="sec_json" changed="false">'+JSON.stringify(sec_obj)+'</p>'
             console.log(sec_html);

             var mile_selector = $('div.tab-pane.active').attr('id');
             var table3_id = '#data_preview3_' + mile_selector;
             var datatable3 = $(table3_id).DataTable();
             var cell = datatable3.cell(tr.find('.sec_json').closest('td'));
             cell.data(sec_html).draw();


             change = true; // Secondary Driver Change True

             // console.log('Sec JSON array: ' + sec_array);
             // if (sec_obj_length == sec_obj.length){
             //     console.log('Sec JSON: ' + JSON.stringify(sec_array.map(function (el){ return el})));
             //     console.log('Row JSON: ' + row_json.map(function (el) { return el.id }));
             //     if (row_json.map(function (el) { return el.id }) == sec_array.map(function (el){ return el}))
             //         change = false;
             // }

             var indexOfFilter = toSaveSet.map(function (el) { return el.id }).indexOf(rec_id);               
             if (indexOfFilter != -1) {
                 toSaveSet.splice(indexOfFilter, 1);
             }
             toSaveSet.push({ id: rec_id, prim_name: prim_name, old_prim_id: old_prim_id, prim_id: prim_id, prim_email: prim_email, prim_num: prim_num, secondary_json: sec_obj, zee_name: selection_zee_name, change: change, mile: selected_mile });
             console.log(toSaveSet);
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
             var selection_zee_name = $(this).closest('tr').find('.sendleplus_zee').attr('name'); // Get Zee from Saved Zee in Record
             if (isNullorEmpty(selection_zee_name)) { // If Zee has not be set.
                 selection_zee_name = $(this).closest('tr').find('.sendleplus_zee').attr('old'); // Set Zee from Zee Name
             }
             var sec_obj = $(this).closest('tr').find('.sec_json').text();
             if (!isNullorEmpty(sec_obj)) {
                 sec_obj = JSON.parse(sec_obj);
             }
             console.log('Prim ID: ' + $(this).attr('new_id'))

             var selected_mile;
             var mile_selector = $('div.tab-pane.active').attr('id');
             if (mile_selector == 'first_mile') {
                 selected_mile = 'First'
             } else {
                 selected_mile = 'Last'
             }

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
                     // return;
                 } else {
                     prim_name = $(this).attr('name');
                     prim_email = $(this).attr('email');
                     prim_num = $(this).attr('phone');
                     // console.log('Prim Details: Name: ' + prim_name + ' Email: ' + prim_email + ' ID: ' + prim_id);
                     if (isNullorEmpty(prim_id)) {
                         prim_id = 0;
                         console.log('Sec Val: ' + sec_obj)
                         if (isNullorEmpty(sec_obj) && sec_obj.length == 0) {
                             selection_zee_name = null;
                             selected_mile = null;
                             //     // $(this).closest('tr').find('.sendleplus_zee').text('').change();
                             //     $(this).closest('tr').find('.sendleplus_zee').val(0).change();
                             console.log('no longer in list')
                         }
                     } else {
                         // $(this).closest('tr').find('.sendleplus_zee').text(zee_name).change();
                         // $(this).closest('tr').find('.sendleplus_zee').val(1).change();
                         console.log('is in list')
                     }
                 }
             });

             // var selected_mile = toSaveSet.map(function (el) { if (el.id == rec_id) { return el.mile.value } });
             // console.log('Selected Mile: ' + selected_mile);

             var mile_selector = $('div.tab-pane.active').attr('id');
             var table3_id = '#data_preview3_' + mile_selector;
             var datatable3 = $(table3_id).DataTable();
             var tr = $(this).closest('tr');
             datatable3.cell($(this).closest('td').next()).data(prim_id).draw();
             datatable3.cell($(this).closest('td').next().next()).data(prim_email).draw();
             datatable3.cell($(this).closest('td').next().next().next()).data(prim_num).draw();

             var indexOfFilter = toSaveSet.map(function (el) { return el.id }).indexOf(rec_id);
             if (indexOfFilter != -1) {
                 toSaveSet.splice(indexOfFilter, 1);
             }
             // if (old_prim_id != prim_id) {
             toSaveSet.push({ id: rec_id, prim_name: prim_name, old_prim_id: old_prim_id, prim_id: prim_id, prim_email: prim_email, prim_num: prim_num, secondary_json: sec_obj, zee_name: selection_zee_name, change: change, mile: selected_mile });
             // }
             console.log(toSaveSet);
         })

         /**
          *  Franchisee : JQuery
          */
         $(document).on('change', '.zee_dropdown', function () {
             var sec_obj = [];
             var tr = $(this).closest('tr');
             var prim_op = tr.find('.primary_operator option:selected');

             var rec_id = tr.find('.internal_id').attr('id');

             var old_prim_id = prim_op.attr('old_id');
             var prim_id = prim_op.attr('new_id');
             var prim_name = prim_op.attr('name');
             var prim_email = prim_op.attr('email');
             var prim_num = prim_op.attr('phone');
             var sec_obj = tr.find('.sec_json').text();
             if (!isNullorEmpty(sec_obj)) {
                 sec_obj = JSON.parse(sec_obj);
             }

             var selection_zee_name = '';

             var zee_sec_table = $(this).attr('sec_table');
             // if (zee_sec_table == 'true'){
             var mile_selector = $('div.tab-pane.active').attr('id');
             if (mile_selector == 'first_mile') {
                 mile = 'First'
             } else {
                 mile = 'Last'
             }
             // }
             var selection_change = change;
             console.log('Secondary Table Dropdown? : ' + zee_sec_table);
             console.log('Mile: ' + mile)

             $('option:selected', this).each(function (index) {
                 // console.log('Prim Details: Name: ' + prim_name + ' Email: ' + prim_email + ' ID: ' + prim_id);
                 // var saved_zee = $(this).attr('name');
                 var current_zee = $(this).text();
                 if (current_zee == '- None -') { current_zee = null; }
                 console.log('Current Zee: ' + current_zee)
                 selection_zee_name = current_zee;
                 console.log('Sec Val: ' + sec_obj)

                 selection_change = true;

                 if (isNullorEmpty(current_zee)) {
                     prim_id = 0;
                     prim_name = '';
                     prim_email = '';
                     prim_num = '';

                     sec_obj = [];

                     $(this).find('.primary_operator').val(0);
                     $(this).find('.secondary_operator').val(0);

                     selection_change = false;
                 }
             });

             var indexOfFilter = toSaveSet.map(function (el) { return el.id }).indexOf(rec_id);
             if (indexOfFilter != -1) {
                 toSaveSet.splice(indexOfFilter, 1);
             }
             // if (old_prim_id != prim_id) {
             toSaveSet.push({ id: rec_id, prim_name: prim_name, old_prim_id: old_prim_id, prim_id: prim_id, prim_email: prim_email, prim_num: prim_num, secondary_json: sec_obj, zee_name: selection_zee_name, change: selection_change, mile: mile });
             // }
             console.log(toSaveSet);
         })

         $('#updateSaveRecord').click(function () {
             var selector = $('div.tab-pane.active').attr('id');
             saveArray(toSaveSet, selector);

             var params = {
                 zeeid: zee_id,
                 zeename: zee_name,
                 zeestate: zee_state,
             }
             params = JSON.stringify(params);
             var upload_url = baseURL + url.resolveScript({ deploymentId: 'customdeploy_sl_sendleplus_operator', scriptId: 'customscript_sl_sendleplus_operator' }) + '&custparam_params=' + params;
             // window.location.href = upload_url;
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
     function loadDatatable(zee_id, zee_name, zee_state, selector, table_id, table2_id, table3_id) { // Zee id = Waterloo 699991;
         console.log("Load Datatable")
         console.log('Selector: ' + selector);
         console.log('table_ids: ' + table_id + " " + table2_id)
         
         dataSet = [];
         dataSet2 = [];
         dataMatchSet = [];

         var mile = '';
         if (selector == 'first_mile' || selector == 'last_mile') {
             if (selector == 'first_mile'){
                 mile = 'First'
             } else {
                 mile = 'Last'
             }
         }

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

         // if (isNullorEmpty(suburbSet)) {
         var zeeSuburbsList = record.load({ type: 'partner', id: zee_id });
         if (selector == 'mp_standard' || selector == 'mp_express') {
             var suburbListString = zeeSuburbsList.getValue({ fieldId: 'custentity_network_matrix_main' });
             if (!isNullorEmpty(suburbListString)) {
                 suburbList = [];
                 suburbSet = suburbListString.split("\n"); // ['1', '2'. 3', '4']
                 console.log('Suburb List: Network Matrix ' + JSON.stringify(suburbSet));
                 suburbSet.forEach(function (suburb) { // ZetLand (NSW)
                     if (suburb.includes(' (')) {
                         suburbList.push(suburb.split(' (')[0]); // If String Contains (SA) etc, remove it. 
                     } else {
                         suburbList.push(suburb);
                     }
                 });
             }
             var JSON_suburb = zeeSuburbsList.getValue({ fieldId: 'custentity_network_matrix_json' });
             console.log(JSON_suburb)
         } else { // if (selector == 's_au_express') 
             if (selector == 'first_mile' && selector != 'last_mile') {
                 suburbList = [];
                 var suburbListString = zeeSuburbsList.getValue({ fieldId: 'custentity_sendle_recovery_suburbs_main' });
                 if (!isNullorEmpty(suburbListString)) {
                     suburbSet = suburbListString.split(','); // ['1', '2'. 3', '4']
                     console.log('Suburb List: First Mile - ' + JSON.stringify(suburbSet));
                     suburbSet.forEach(function (suburb) { // ZetLand (NSW)
                         if (suburb.includes(' (')) {
                             suburbList.push(suburb.split(' (')[0]); // If String Contains (SA) etc, remove it. 
                         } else {
                             suburbList.push(suburb);
                         }
                     });
                 }
             } else {
                 var suburbListString = zeeSuburbsList.getValue({ fieldId: 'custentity_lastmile_suburb' });
                 if (!isNullorEmpty(suburbListString)) {
                     suburbList = [];
                     suburbSet = suburbListString.split(','); // ['1', '2'. 3', '4']
                     console.log('Suburb List: Last Mile - ' + JSON.stringify(suburbSet));
                     suburbSet.forEach(function (suburb) { // ZetLand (NSW)
                         if (suburb.includes(' (')) {
                             suburbList.push(suburb.split(' (')[0]); // If String Contains (SA) etc, remove it. 
                         } else {
                             suburbList.push(suburb);
                         }
                     });
                 } else {
                     suburbList = [];
                     console.log('Suburb List: Last Mile is EMPTY');
                 }
             }
             var JSON_suburb = zeeSuburbsList.getValue({ fieldId: 'custentity_sendle_recovery_suburbs' });
             console.log(JSON_suburb)
         }
         console.log(suburbList);

         // if (selector == 'mp_standard') { // Not MP Express or Sendle Express - Use Sendle Depot One.
         // } else if (selector == 'mp_express'){
         // } else if (selector == 's_au_express') {
         // }

         if (suburbList.length > 0) {
             if (selector == 'mp_standard') { // Not MP Express or Sendle Express - Use Sendle Depot One.
                 /** 
                  * Primary Datatable: MP Standard
                 */
                 var dataMatchingSetSearch = search.load({ type: 'customrecord_dom_zones', id: 'customsearch_sendle_dom_zones' }); // Sendle Domestic Pickup Zones - All 

                 var matchingFilterExpression = [];
                 matchingFilterExpression.push(['isinactive', search.Operator.IS, 'F']); // Is Active
                 matchingFilterExpression.push('AND')
                 if (suburbList.length > 0) {
                     var suburbExpression = [];
                     for (var i = 0; i < suburbList.length; i++) {
                         suburbExpression.push(['custrecord_dom_zones_suburb_name', search.Operator.STARTSWITH, suburbList[i]]); // Filter for Suburbs Containing the Name from Suburb List
                         suburbExpression.push('OR');
                     }
                     suburbExpression.pop(); // remove the last 'or'
                     matchingFilterExpression.push(suburbExpression);
                 } else {
                     matchingFilterExpression.pop();
                 }
                 matchingFilterExpression.push('AND')
                 matchingFilterExpression.push(['custrecord_dom_zones_postcode', search.Operator.STARTSWITH, zee_postcode]);
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
                         var internalid = row_list.getValue({name: "internalid", label: "Internal ID"});
                         var sub_name = row_list.getValue({
                            name: "custrecord_dom_zones_suburb_name",
                            sort: search.Sort.ASC,
                            label: "Suburb Name"
                         })
                         var opJSON = JSON.parse(JSON_suburb);
                         var opSet = opJSON.filter(function (el){ if (el.suburbs.includes(sub_name)) {return el }})
                         // var sub_name = opSet[0].suburbs;
                         // console.log(opSet[0].suburbs);
                         
                         console.log('Prim Index - Sub Name: ' + sub_name);
                         var post_code = row_list.getValue({name: "custrecord_dom_zones_postcode", label: "Postcode"}) // 2000 etc
                         var country_code = row_list.getValue({name: "custrecord_dom_zones_country_code", label: "Country Code"}) // AU
                         var zone_id = row_list.getText({name: "custrecord_dom_zones_zone_id", label: "Zone ID"}) // AU-Sydney | AU-Adelaide etc
                         var zones = row_list.getValue({name: "custrecord_dom_zones_ns_zones", label: "Sender Zones"}) // SYD | MEL etc

                         // if (suburbList.indexOf(lowerCaseAllWordsExceptFirstLetters(sub_name.split(' (')[0])) != -1) { // If Suburb is in Suburb List /
                         var internalid = row_list.getValue({ name: 'internalid' }) // Netsuite ID for Record
                         var sub_code = ''; // row_list.getValue({ name: 'custrecord_sendleplus_sub_code' });
                         // sub_code = '<p class="internal_id" id="' + internalid + '">' + row_list.getValue({ name: 'custrecord_sendleplus_sub_code' }); + "</p>";

                         var sendleplus_zee = ''; // row_list.getValue({ name: 'custrecord_sendleplus_zee' });

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
                         // console.log(opSet[0].primary_op);
                         if (!isNullorEmpty(opSet[0].primary_op)){
                             var prim_id = opSet[0].primary_op; //   - POPULATE THIS!!!!
                         } else {
                             var prim_id = ''; //   - POPULATE THIS!!!!
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
                         console.log(opSet[0].secondary_op);
                         if (!isNullorEmpty(opSet[0].secondary_op)){
                             var sec_json = opSet[0].secondary_op; // row_list.getValue({ name: 'custrecord_sendleplus_sec_json' })  - POPULATE THIS!!!!
                         } else {
                             var sec_json = ''; //   - POPULATE THIS!!!!
                         }
                         if (!isNullorEmpty(sec_json)) {
                             var sec_obj = JSON.parse(sec_json);
                             var sec_obj_val = sec_json;
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
                             '<button class="btn btn-danger btn-sm remove_suburb glyphicon glyphicon-trash" type="button" data-toggle="tooltip" data-placement="right" title="Delete"></button>', //<button class="btn btn-success btn-sm add_class glyphicon glyphicon-plus" data-serviceid="' + $(this).closest('tr').find('.service_name').val() + '" type="button" data-toggle="tooltip" data-placement="right" title="Add New Service"></button>
                             internalid, 
                             // sub_code,
                             post_code, 
                             sub_name,
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
             } else {
                 /** 
                  * Primary Datatable: MP Express & AU Express
                 */
                 var dataMatchingSetSearch = search.load({ type: 'customrecord_sendleplus_mapping_list', id: 'customsearch_sendleplus_mapping_search' }); // Toll Suburbs List

                 var primTableFilterExpression = [];

                 var matchingFilterExpression = [];
                 matchingFilterExpression.push(['isinactive', search.Operator.IS, 'F']); // Is Active
                 matchingFilterExpression.push('AND')
                 matchingFilterExpression.push(['custrecord_sendleplus_state', search.Operator.IS, zee_state]); // Filter for State
                 matchingFilterExpression.push('AND')
                 if (suburbList.length > 0) {
                     var suburbExpression = [];
                     for (var i = 0; i < suburbList.length; i++) {
                         suburbExpression.push(['custrecord_sendleplus_sub_name', search.Operator.STARTSWITH, suburbList[i]]); // Filter for Suburbs Containing the Name from Suburb List
                         suburbExpression.push('OR');
                     }
                     suburbExpression.pop(); // remove the last 'or'
                     matchingFilterExpression.push(suburbExpression);
                 } else {
                     matchingFilterExpression.pop();
                 }
                 matchingFilterExpression.push('AND');
                 matchingFilterExpression.push(['custrecord_sendleplus_zee', search.Operator.ISEMPTY, ''])

                 primTableFilterExpression.push(matchingFilterExpression);
                 // matchingFilterExpression.push('AND')
                 primTableFilterExpression.push('OR')

                 var zeeExpression = []; // Filtering for List of Suburbs with Same Zee 
                 zeeExpression.push(['isinactive', search.Operator.IS, 'F']);
                 zeeExpression.push('AND')
                 zeeExpression.push(['custrecord_sendleplus_state', search.Operator.IS, zee_state]); // Filter for State
                 zeeExpression.push('AND');
                 // zeeInnerExpression = [];
                 // zeeInnerExpression.push(['custrecord_sendleplus_zee', search.Operator.ISEMPTY, '']); // Filter for Suburbs with Empty Zee
                 // zeeInnerExpression.push('OR')
                 zeeExpression.push(['custrecord_sendleplus_zee', search.Operator.IS, zee_name]); // Filter for Suburbs with Zee Name the same.
                 // zeeExpression.push(zeeInnerExpression);
                 if (selector == 'first_mile' || selector == 'last_mile') {
                     zeeExpression.push('AND');
                     var mileExpression = [];
                     mileExpression.push(['custrecord_sendleplus_mile', search.Operator.IS, mile]);
                     mileExpression.push('OR')
                     mileExpression.push(['custrecord_sendleplus_mile', search.Operator.IS, '']);
                     zeeExpression.push(mileExpression);
                 }

                 primTableFilterExpression.push(zeeExpression)
                 primTableFilterExpression.push('OR')

                 var stateExpression = []; // Filtering for Suburbs Outside of State By for Zee
                 stateExpression.push(['isinactive', search.Operator.IS, 'F']);
                 stateExpression.push('AND')
                 stateExpression.push(['custrecord_sendleplus_state', search.Operator.ISNOT, zee_state]); // Filter for State
                 stateExpression.push('AND');
                 stateExpression.push(['custrecord_sendleplus_zee', search.Operator.IS, zee_name]); // Filter for Suburbs with Zee Name the same.

                 primTableFilterExpression.push(stateExpression);

                 dataMatchingSetSearch.filterExpression = primTableFilterExpression;

                 console.log('Filter Expression - ' + selector + ' : G ' + JSON.stringify(primTableFilterExpression));

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
                         var opJSON = JSON.parse(JSON_suburb);
                         var opSet = opJSON.filter(function (el){ if (el.suburbs.includes(sub_name)) {return el }})
 
                         console.log('Prim Index: ' + index);
                         var sub_name = row_list.getValue({ name: 'custrecord_sendleplus_sub_name' });

                         // if (suburbList.indexOf(lowerCaseAllWordsExceptFirstLetters(sub_name.split(' (')[0])) != -1) { // If Suburb is in Suburb List /
                         var externalid = row_list.getValue({ name: 'externalid' }); // Toll - mappiung id
                         var internalid = row_list.getValue({ name: 'internalid' }) // Netsuite ID for Record
                         var sub_code = row_list.getValue({ name: 'custrecord_sendleplus_sub_code' });
                         sub_code = '<p class="internal_id" id="' + internalid + '">' + row_list.getValue({ name: 'custrecord_sendleplus_sub_code' }); + "</p>";
                         var post_code = row_list.getValue({ name: 'custrecord_sendleplus_postcode' });

                         var state = row_list.getValue({ name: 'custrecord_sendleplus_state' });
                         var sa3_code = row_list.getValue({ name: 'custrecord_sendleplus_sa3_code' });
                         var sa3_name = row_list.getValue({ name: 'custrecord_sendleplus_sa3_name' });
                         var sa4_code = row_list.getValue({ name: 'custrecord_sendleplus_sa4_code' });
                         var sa4_name = row_list.getValue({ name: 'custrecord_sendleplus_sa4_name' });
                         var au_post = row_list.getValue({ name: 'custrecord_sendleplus_au_express' });
                         var au_filter = row_list.getValue({ name: 'custrecord_sendleplus_auspost_filter' });
                         var sendleplus_zee = row_list.getValue({ name: 'custrecord_sendleplus_zee' });
                         // console.log('SendlePlus Zee + Zee: ' + sendleplus_zee + ' ' + zee_name);
                         var mile_option = row_list.getValue({ name: 'custrecord_sendleplus_mile' });
                         console.log('Mile Op: ' + mile_option + " Zee: " + sendleplus_zee);
                         var autofill_mile = false;
                         if (!isNullorEmpty(sendleplus_zee) && isNullorEmpty(mile_option) && zee_name == sendleplus_zee) {
                             console.log('SendlePlus Zee is Selected and Is Same as Assigned Zee.')
                             autofill_mile = true;
                         }

                         var prim_name = row_list.getValue({ name: 'custrecord_sendleplus_prim_name' });
                         var prim_id = row_list.getValue({ name: 'custrecord_sendleplus_prim_id' });
                         if (!isNullorEmpty(opSet)){
                             if (!isNullorEmpty(opSet[0].primary_op)){
                                 var prim_id = opSet[0].primary_op; //   - POPULATE THIS!!!!
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

                         var zee_dropdown = '<select id="zee_filter" class="form-control zee_dropdown ui dropdown">';
                         zee_dropdown += '<option>- None -</option>';
                         if (!isNullorEmpty(sendleplus_zee)) { // if Zee Has been Set
                             zee_dropdown += '<option class="sendleplus_zee" name="' + sendleplus_zee + '" old="' + zee_name + '" selected>' + sendleplus_zee + '</option>';
                             if (sendleplus_zee != zee_name) {
                                 zee_dropdown += '<option class="sendleplus_zee" name="' + sendleplus_zee + '" old="' + zee_name + '">' + zee_name + '</option>';
                             }
                         } else {
                             if (prim_id != 0) {
                                 zee_dropdown += '<option class="sendleplus_zee" name="' + sendleplus_zee + '" old="' + zee_name + '" selected>' + zee_name + '</option>';
                             } else {
                                 zee_dropdown += '<option class="sendleplus_zee" name="' + sendleplus_zee + '" old="' + zee_name + '">' + zee_name + '</option>';
                             }
                         }
                         zee_dropdown += '</select>'

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

                         if (sendleplus_zee != zee_name && !isNullorEmpty(sendleplus_zee)) { // If Zee displayed is a different zee to
                             // } else {
                             /**
                              *  Primary Operator
                              */
                             prim_input_field = '<select id="primary_filter" class="form-control primary_operator ui search dropdown" disabled>';
                             var specOpSet = $.map(operatorSet, function (el, key) { if (el.values.custrecord_operator_franchisee[0].text == sendleplus_zee) return el; });
                             specOpSet.forEach(function (operatorRecord) {
                                 var spec_op_id = operatorRecord.values.internalid[0].value;
                                 var spec_op_email = operatorRecord.values.custrecord_operator_email
                                 var spec_op_name = operatorRecord.values.name;
                                 var spec_op_num = operatorRecord.values.custrecord_operator_phone;

                                 if (prim_id == spec_op_id) {
                                     prim_input_field += '<option new_id="' + spec_op_id + '" name="' + spec_op_name + '" old_id="' + prim_id + '" email="' + spec_op_email + '" phone="' + spec_op_num + '" selected>' + spec_op_name + '</option>';

                                     prim_id = spec_op_id;
                                     prim_email = spec_op_email;
                                     prim_num = spec_op_num

                                     display_prim_id = spec_op_id;
                                     display_prim_email = spec_op_email;
                                     display_prim_num = spec_op_num
                                 }

                                 return true;
                             });
                         }

                         prim_input_field += '</select>';
                         if (index == 0) {
                             prim_input_field += '<div class="ui toggle checkbox checkbox_primary"><input type="checkbox" id="selectall"><label>Fill all</label></div>';
                         }

                         /**
                          *  Secondary Op:
                          */
                         var sec_json = row_list.getValue({ name: 'custrecord_sendleplus_sec_json' })
                         if (!isNullorEmpty(sec_json)) {
                             var sec_obj = JSON.parse(sec_json);
                             var sec_obj_val = sec_json;
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

                         // if (old_prim_id != prim_id) {
                         // if (prim_id != 0){
                         if (autofill_mile == true) {
                             toSaveSet.push({ id: internalid, prim_name: prim_name, old_prim_id: old_prim_id, prim_id: prim_id, prim_email: prim_email, prim_num: prim_num, secondary_json: sec_obj, zee_name: zee_name, change: true, mile: mile });
                         }
                         // toSaveSet.push({ id: internalid, prim_name: prim_name, old_prim_id: old_prim_id, prim_id: prim_id, prim_email: prim_email, prim_num: prim_num, secondary_json: sec_obj, zee_name: zee_name });
                         // toSaveSet.push({ id: internalid, prim_name: null, old_prim_id: null, prim_id: null, prim_email: null, prim_num: null, secondary_json: null, zee_name: null });
                         // }
                         // if (selector == 's_au_express' && selector != 'mp_express'){
                             dataSet.push(['', internalid, externalid, sub_code, post_code, sub_name, state, sa3_code, sa3_name, sa4_code, sa4_name, au_post, au_filter, zee_dropdown, prim_input_field, display_prim_id, display_prim_email, display_prim_num, secondary_input_field, secondary_json, sorting])
                         // } else { 
                         //     dataSet2.push(['', internalid, externalid, sub_code, post_code, sub_name, state, sa3_code, sa3_name, sa4_code, sa4_name, au_post, au_filter, zee_dropdown, prim_input_field, display_prim_id, display_prim_email, display_prim_num, secondary_input_field, secondary_json, sorting])
                         // }                    
                         
                         return true;
                     });

                     /**
                      *  Secondary Datatable
                      */
                     var dataSetSearch = search.load({ type: 'customrecord_sendleplus_mapping_list', id: 'customsearch_sendleplus_mapping_search' });
                     var restFilterExpression = [];
                     restFilterExpression.push(['isinactive', search.Operator.IS, 'F']);
                     restFilterExpression.push('AND')
                     restFilterExpression.push(['custrecord_sendleplus_state', search.Operator.IS, zee_state], 'AND'); // Filter for Zee State
                     if (primOperatorSet.length > 0) {
                         var primFilterExpression = [];
                         for (var x = 0; x < primOperatorSet.length; x++) {
                             // console.log('Prim Op"s Ids: ' + primOperatorSet[x].values.internalid[0].value);
                             primFilterExpression.push(['custrecord_sendleplus_prim_id', search.Operator.IS, primOperatorSet[x].values.internalid[0].value]); // Filter for Suburbs with Matching Primary Operators from Operator List
                             primFilterExpression.push('OR');
                         }
                         primFilterExpression.pop();
                         restFilterExpression.push(primFilterExpression)
                     }
                     restFilterExpression.push('AND')
                     restFilterExpression.push(['custrecord_sendleplus_zee', search.Operator.ISNOT, zee_name]);
                     dataSetSearch.filterExpression = restFilterExpression;
                     var dataSearchSet = dataSetSearch.run().getRange({ start: 0, end: 999 });
                     if (!isNullorEmpty(dataSearchSet)) {
                         dataSearchSet.forEach(function (row_list) {
                             console.log('Secondary Index: ' + index);
                             var sub_name = row_list.getValue({ name: 'custrecord_sendleplus_sub_name' });
                             if (sub_name.includes('DC')) {
                                 sub_name.replace(' DC', '');
                             } else if (sub_name.includes('BC')) {
                                 sub_name.replace(' BC', '');
                             }
                             /**
                              *  If Suburb is in the list
                              */
                             if (!isNullorEmpty(suburbList.filter(function (o) {
                                 return o.toUpperCase().includes((sub_name.split(' ')[0]).toUpperCase())
                             }))) {
                                 // if (suburbList.indexOf(lowerCaseAllWordsExceptFirstLetters(sub_name)) != -1) { // If Suburb is in Suburb List
                                 return true; // console.log('Suburb IN List: ' + sub_name);
                             } else {
                                 var externalid = row_list.getValue({ name: 'externalid' }); // Toll - mappiung id
                                 var internalid = row_list.getValue({ name: 'internalid' }) // Netsuite ID for Record
                                 var sub_code = row_list.getValue({ name: 'custrecord_sendleplus_sub_code' });
                                 sub_code = '<p class="internal_id" id="' + internalid + '">' + row_list.getValue({ name: 'custrecord_sendleplus_sub_code' }); + "</p>";
                                 var post_code = row_list.getValue({ name: 'custrecord_sendleplus_postcode' });

                                 var state = row_list.getValue({ name: 'custrecord_sendleplus_state' });
                                 var sa3_code = row_list.getValue({ name: 'custrecord_sendleplus_sa3_code' });
                                 var sa3_name = row_list.getValue({ name: 'custrecord_sendleplus_sa3_name' });
                                 var sa4_code = row_list.getValue({ name: 'custrecord_sendleplus_sa4_code' });
                                 var sa4_name = row_list.getValue({ name: 'custrecord_sendleplus_sa4_name' });
                                 var au_post = row_list.getValue({ name: 'custrecord_sendleplus_au_express' });
                                 var au_filter = row_list.getValue({ name: 'custrecord_sendleplus_auspost_filter' });
                                 var sendleplus_zee = row_list.getValue({ name: 'custrecord_sendleplus_zee' });

                                 var prim_id = row_list.getValue({ name: 'custrecord_sendleplus_prim_id' });
                                 var prim_email = row_list.getValue({ name: 'custrecord_sendleplus_prim_email' });
                                 var prim_num = row_list.getValue({ name: 'custrecord_sendleplus_prim_phone_num' });
                                 var prim_input_field = '<select id="primary_filter" class="form-control primary_operator ui search dropdown">'; //select2 //selectpicker

                                 var display_prim_id = '';
                                 var display_prim_email = '';
                                 var display_prim_num = '';
                                 var display_prim_name = '';

                                 var secondary_json = '<p class="sec_json" id="sec_json" changed="false">';
                                 var sorting = 0;

                                 var zee_dropdown = '<select id="zee_filter" class="form-control zee_dropdown secondary_table ui dropdown" sec_table="true">';
                                 zee_dropdown += '<option>- None -</option>';
                                 if (!isNullorEmpty(sendleplus_zee)) { // if Zee Has been Set
                                     zee_dropdown += '<option class="sendleplus_zee" name="' + sendleplus_zee + '" old="' + zee_name + '" selected>' + sendleplus_zee + '</option>';
                                     if (sendleplus_zee != zee_name) {
                                         zee_dropdown += '<option class="sendleplus_zee" name="' + sendleplus_zee + '" old="' + zee_name + '">' + zee_name + '</option>';
                                     }
                                 } else {
                                     if (prim_id != 0) {
                                         zee_dropdown += '<option class="sendleplus_zee" name="' + sendleplus_zee + '" old="' + zee_name + '" selected>' + zee_name + '</option>';
                                     } else {
                                         zee_dropdown += '<option class="sendleplus_zee" name="' + sendleplus_zee + '" old="' + zee_name + '">' + zee_name + '</option>';
                                     }
                                 }
                                 zee_dropdown += '</select>'

                                 prim_input_field += '<option>- None -</option>';

                                 /**
                                  *  Primary Operator
                                  */
                                 if (!isNullorEmpty(prim_id)) {
                                     prim_index = 1;
                                 } else {
                                     prim_index = 0;
                                 }

                                 if (!isNullorEmpty(sendleplus_zee)) {
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
                                         }
                                         else {
                                             prim_input_field += '<option new_id="' + new_op_id + '" name="' + new_op_name + '" old_id="' + prim_id + '" email="' + new_op_email + '" phone="' + new_op_num + '">' + new_op_name + '</option>';
                                         }

                                         prim_index++;
                                         return true;
                                     });

                                 } else {
                                     /**
                                      *  Primary Operator
                                      */
                                     prim_input_field = '<select id="primary_filter" class="form-control primary_operator" disabled>';
                                     var specOpSet = $.map(operatorSet, function (el, key) { if (el.values.custrecord_operator_franchisee[0].text == sendleplus_zee) return el; });
                                     specOpSet.forEach(function (operatorRecord) {
                                         var spec_op_id = operatorRecord.values.internalid[0].value;
                                         var spec_op_email = operatorRecord.values.custrecord_operator_email
                                         var spec_op_name = operatorRecord.values.name;
                                         var spec_op_num = operatorRecord.values.custrecord_operator_phone;

                                         if (prim_id == spec_op_id) {
                                             prim_input_field += '<option new_id="' + spec_op_id + '" name="' + spec_op_name + '" old_id="' + prim_id + '" email="' + spec_op_email + '" phone="' + spec_op_num + '" selected>' + spec_op_name + '</option>';

                                             prim_id = spec_op_id;
                                             prim_email = spec_op_email;
                                             prim_num = spec_op_num

                                             display_prim_id = spec_op_id;
                                             display_prim_email = spec_op_email;
                                             display_prim_num = spec_op_num
                                         }

                                         return true;
                                     });
                                 }

                                 sorting = ''
                                 prim_input_field += '</select>';

                                 /**
                                  *  Secondary Op:
                                  */
                                 var sec_json = row_list.getValue({ name: 'custrecord_sendleplus_sec_json' })
                                 if (!isNullorEmpty(sec_json)) {
                                     var sec_obj = JSON.parse(sec_json);
                                     var sec_obj_val = sec_json;
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

                                     if (!isNullorEmpty(sec_obj) && sec_obj.length > 0) {
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

                                 dataSet2.push(['', internalid, externalid, sub_code, post_code, sub_name, state, sa3_code, sa3_name, sa4_code, sa4_name, au_post, au_filter, zee_dropdown, prim_input_field, display_prim_id, display_prim_email, display_prim_num, secondary_input_field, secondary_json, sorting])

                                 index++;

                                 return true;
                             }
                         });
                     }
                 }
             }
         }
         // Next Button to Save as well
         var datatable = $(table_id).DataTable();
         datatable.clear();
         datatable.rows.add(dataSet);
         datatable.draw();

         var datatable2 = $(table2_id).DataTable();
         datatable2.clear();
         datatable2.rows.add(dataSet2);
         baseDataSet2 = dataSet2
         datatable2.draw();

         var datatable3 = $(table3_id).DataTable();
         datatable3.clear();
         datatable3.rows.add(dataSet3);
         datatable3.draw();

         if (suburbList.length > 0) {
             $('.ui.dropdown').dropdown();
         }
         // console.log(ctx.getRemainingUsage());
     }

     function loadNextDatatable(zee_state, post_code, sub_name, mile_selector, table2_id) {

         var dataInSet = $.map(dataSet2, function (el, key) { return el[0]; });
         console.log('Data Array: ' + dataInSet);
         console.log('Params: ' + post_code + ' | ' + sub_name);
         // dataSet2 = [];

         var restFilterExpression = [];
         restFilterExpression.push(['isinactive', search.Operator.IS, 'F']);
         restFilterExpression.push('AND')
         if (!isNullorEmpty(sub_name)) {
             restFilterExpression.push(['custrecord_sendleplus_sub_name', search.Operator.STARTSWITH, sub_name], 'AND'); //
         }
         if (!isNullorEmpty(post_code) && post_code != 0 && !isNaN(post_code)) {
             restFilterExpression.push(['custrecord_sendleplus_postcode', search.Operator.EQUALTO, post_code], 'AND'); //
         }
         restFilterExpression.push(['custrecord_sendleplus_state', search.Operator.IS, zee_state], 'AND'); //
         for (var x = 0; x < dataInSet.length; x++) {
             restFilterExpression.push(['internalid', search.Operator.NONEOF, dataInSet[x]])
             restFilterExpression.push('AND');
         }
         if (suburbList.length > 0) {
             var suburbNotExpression = [];
             for (var i = 0; i < suburbList.length; i++) {
                 suburbNotExpression.push(['custrecord_sendleplus_sub_name', search.Operator.DOESNOTCONTAIN, suburbList[i]]);
                 suburbNotExpression.push('OR');
             }
             suburbNotExpression.pop(); // remove the last 'or'
             restFilterExpression.push(suburbNotExpression);
         } else {
             restFilterExpression.pop();
         }
         restFilterExpression.push('AND');
         var mileExpression = [];
         mileExpression.push(['custrecord_sendleplus_mile', search.Operator.ISNOT, mile]);
         mileExpression.push('OR')
         mileExpression.push(['custrecord_sendleplus_mile', search.Operator.IS, '']);
         restFilterExpression.push(mileExpression);// Remove Suburbs Already Selected Under First or Last Mile

         console.log('Filter: ' + restFilterExpression);

         var dataSetSearch = search.load({ type: 'customrecord_sendleplus_mapping_list', id: 'customsearch_sendleplus_mapping_search' });
         dataSetSearch.filterExpression = restFilterExpression;

         var dataLength = dataSetSearch.runPaged().count;

         if (dataLength > 0) {

             var dataSearchSet = [];
             var main_index = 0;
             for (var main_index = 0; main_index < 10000; main_index += 1000) {
                 dataSearchSet.push(dataSetSearch.run().getRange({ start: main_index, end: main_index + 999 }));
             }
             // dataSetSearch.run().getRange({ start: parseInt(page_index + '000'), end: parseInt(page_index + '999') }).forEach(function (row_list) {
             var index = 0;
             dataSearchSet[0].forEach(function (row_list) {
                 console.log('Index: ' + index);
                 var sub_name = row_list.getValue({ name: 'custrecord_sendleplus_sub_name' });
                 if (sub_name.includes('DC')) {
                     sub_name.replace(' DC', '');
                 } else if (sub_name.includes('BC')) {
                     sub_name.replace(' BC', '');
                 }
                 /**
                  *  If Suburb is in the list
                  */
                 if (!isNullorEmpty(suburbList.filter(function (o) {
                     return o.toUpperCase().includes((sub_name.split(' ')[0]).toUpperCase())
                 }))) {
                     // if (suburbList.indexOf(lowerCaseAllWordsExceptFirstLetters(sub_name)) != -1) { // If Suburb is in Suburb List
                     return true; // console.log('Suburb IN List: ' + sub_name);
                 } else {
                     var externalid = row_list.getValue({ name: 'externalid' }); // Toll - mappiung id
                     var internalid = row_list.getValue({ name: 'internalid' }) // Netsuite ID for Record
                     var sub_code = row_list.getValue({ name: 'custrecord_sendleplus_sub_code' });
                     sub_code = '<p class="internal_id" id="' + internalid + '">' + row_list.getValue({ name: 'custrecord_sendleplus_sub_code' }); + "</p>";
                     var post_code = row_list.getValue({ name: 'custrecord_sendleplus_postcode' });

                     var state = row_list.getValue({ name: 'custrecord_sendleplus_state' });
                     var sa3_code = row_list.getValue({ name: 'custrecord_sendleplus_sa3_code' });
                     var sa3_name = row_list.getValue({ name: 'custrecord_sendleplus_sa3_name' });
                     var sa4_code = row_list.getValue({ name: 'custrecord_sendleplus_sa4_code' });
                     var sa4_name = row_list.getValue({ name: 'custrecord_sendleplus_sa4_name' });
                     var au_post = row_list.getValue({ name: 'custrecord_sendleplus_au_express' });
                     var au_filter = row_list.getValue({ name: 'custrecord_sendleplus_auspost_filter' });
                     var sendleplus_zee = row_list.getValue({ name: 'custrecord_sendleplus_zee' });
                     console.log('sendleplus_zee: ' + sendleplus_zee)

                     var prim_id = row_list.getValue({ name: 'custrecord_sendleplus_prim_id' });
                     var prim_email = row_list.getValue({ name: 'custrecord_sendleplus_prim_email' });
                     var prim_num = row_list.getValue({ name: 'custrecord_sendleplus_prim_phone_num' });
                     var prim_input_field = '<select id="primary_filter" class="form-control primary_operator ui search dropdown">'; //select2 //selectpicker

                     /**
                      *  Displaying Primary Op Information In Table.
                      */
                     var display_prim_id = '';
                     var display_prim_email = '';
                     var display_prim_num = '';
                     var display_prim_name = '';

                     var secondary_json = '<p class="sec_json" id="sec_json" changed="false">';
                     var sorting = 0;

                     var zee_dropdown = '<select id="zee_filter" class="form-control zee_dropdown secondary_table ui dropdown" sec_table="true">';
                     zee_dropdown += '<option>- None -</option>';
                     if (!isNullorEmpty(sendleplus_zee)) { // if Zee Has been Set
                         zee_dropdown += '<option class="sendleplus_zee" name="' + sendleplus_zee + '" old="' + zee_name + '" selected>' + sendleplus_zee + '</option>';
                         if (sendleplus_zee != zee_name) {
                             zee_dropdown += '<option class="sendleplus_zee" name="' + sendleplus_zee + '" old="' + zee_name + '">' + zee_name + '</option>';
                         }
                     } else {
                         if (prim_id != 0) {
                             zee_dropdown += '<option class="sendleplus_zee" name="' + sendleplus_zee + '" old="' + zee_name + '" selected>' + zee_name + '</option>';
                         } else {
                             zee_dropdown += '<option class="sendleplus_zee" name="' + sendleplus_zee + '" old="' + zee_name + '">' + zee_name + '</option>';
                         }
                     }
                     zee_dropdown += '</select>'

                     prim_input_field += '<option>- None -</option>';

                     /**
                      *  Primary Operator
                      */
                     if (isNullorEmpty(sendleplus_zee)) { // If Zee Hasn't Been Prefilled
                         console.log('Zee has not been prefilled');
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

                             // console.log('Prim ID: ' + prim_id + ' ' + 'New ID' + new_op_id);
                             // console.log(prim_id == new_op_id ? true : false);

                             // if (prim_index == 0) {
                             //     prim_input_field += '<option new_id="' + new_op_id + '" name="' + new_op_name + '" old_id="' + prim_id + '" email="' + new_op_email + '" phone="' + new_op_num + '" selected>' + new_op_name + '</option>';
                             //     display_prim_id = new_op_id;
                             //     display_prim_email = new_op_email;
                             //     display_prim_num = new_op_num
                             //     display_prim_name = new_op_name;
                             //     prim_id = new_op_id;
                             //     prim_email = new_op_email;
                             //     prim_num = new_op_num
                             //     prim_name = new_op_name;
                             // } else 
                             if (prim_id == new_op_id) {
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
                     } else {
                         /**
                          *  Primary Operator
                          */
                         prim_input_field = '<select id="primary_filter" class="form-control primary_operator" disabled>';
                         var specOpSet = $.map(operatorSet, function (el, key) { if (el.values.custrecord_operator_franchisee[0].text == sendleplus_zee) return el; });
                         specOpSet.forEach(function (operatorRecord) {
                             var spec_op_id = operatorRecord.values.internalid[0].value;
                             var spec_op_email = operatorRecord.values.custrecord_operator_email
                             var spec_op_name = operatorRecord.values.name;
                             var spec_op_num = operatorRecord.values.custrecord_operator_phone;

                             if (prim_id == spec_op_id) {
                                 prim_input_field += '<option new_id="' + spec_op_id + '" name="' + spec_op_name + '" old_id="' + prim_id + '" email="' + spec_op_email + '" phone="' + spec_op_num + '" selected>' + spec_op_name + '</option>';

                                 prim_id = spec_op_id;
                                 prim_email = spec_op_email;
                                 prim_num = spec_op_num

                                 display_prim_id = spec_op_id;
                                 display_prim_email = spec_op_email;
                                 display_prim_num = spec_op_num
                             }

                             return true;
                         });
                     }
                     sorting = ''
                     // }
                     prim_input_field += '</select>';

                     /**
                      *  Secondary Op:
                      */
                     var sec_json = row_list.getValue({ name: 'custrecord_sendleplus_sec_json' })
                     if (!isNullorEmpty(sec_json)) {
                         var sec_obj = JSON.parse(sec_json);
                         var sec_obj_val = sec_json;
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

                         if (!isNullorEmpty(sec_obj) && sec_obj.length > 0) {
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

                     dataSet2.push(['', internalid, externalid, sub_code, post_code, sub_name, state, sa3_code, sa3_name, sa4_code, sa4_name, au_post, au_filter, zee_dropdown, prim_input_field, display_prim_id, display_prim_email, display_prim_num, secondary_input_field, secondary_json, sorting])

                     index++;

                     return true;
                 }
             });
         } else {
             alert('Incorrect Post Code Or Suburb Name')
         }
         // var mile_selector = $('div.tab-pane.active').attr('id');
         // var table2_id = '#data_preview2_' + mile_selector;

         var datatable2 = $(table2_id).DataTable();
         datatable2.clear();
         datatable2.rows.add(dataSet2);
         datatable2.draw();

         $('.ui.dropdown').dropdown();
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

     function saveArray(toSaveSet, selector) {
         console.log('Save Function: Initialise');
         // console.log('Array: ' + JSON.stringify(toSaveSet));
         if (selector == 'mp_standard'){
             console.log('Initialise: MP Standard')
             var datatable3 = $('#data_preview3_mp_standard').DataTable();
             var tableDataSet = datatable3.data().toArray();
             // console.log(tableDataSet);

             var JSON_save = [];
             // JSON Details - Evenutally needs to be stored
             tableDataSet.forEach(function(tableData) {
                 var suburb_name = tableData[3]; // Suburb Name,
                 var post_code = tableData[1]; // Postcode,
                 var state = zee_state; // State,
                 var prim_op_id = tableData[6]; // Primary Operator ID,
                 // var prim_op_id = $(this).find('.primary_operator option:selected').attr('new_id'); //.closest('tr')
                 var secondary_op_json = tableData[10]; // Secondary Operator ID
                 secondary_op_json = (secondary_op_json.split('<')[1]).split('>')[1];
                 // var secondary_op_json = $(this).closest('tr').find('.sec_json').text();
                 var next_day = null;

                 JSON_save.push({"suburbs": suburb_name, post_code: post_code, state: state, "primary_op" : prim_op_id, secondary_op: secondary_op_json, "next_day" : next_day});
             });
             console.log(JSON_save);
              
             var zeeRecord = record.load({ type: 'partner', id: zee_id });
             zeeRecord.setValue({ fieldId: 'custentity_network_matrix_json', value: JSON_save })
             zeeRecord.save();
         } else if (selector == 'mp_express'){
             console.log('Initialise: MP Express');
             var datatable3 = $('#data_preview3_mp_express').DataTable();
             var tableDataSet = datatable3.data().toArray();
             console.log(tableDataSet);

             var JSON_save = [];
             // JSON Details - Evenutally needs to be stored
             tableDataSet.forEach(function(tableData) {
                 var suburb_name = tableData[3]; // Suburb Name,
                 var post_code = tableData[1]; // Postcode,
                 var state = zee_state; // State,
                 var prim_op_id = tableData[6]; // Primary Operator ID,
                 // var prim_op_id = $(this).find('.primary_operator option:selected').attr('new_id'); //.closest('tr')
                 var secondary_op_json = tableData[10]; // Secondary Operator ID
                 secondary_op_json = (secondary_op_json.split('<')[1]).split('>')[1];
                 // var secondary_op_json = $(this).closest('tr').find('.sec_json').text();
                 var next_day = null;

                 JSON_save.push({"suburbs": suburb_name, post_code: post_code, state: state, "primary_op" : prim_op_id, secondary_op: secondary_op_json, "next_day" : next_day});
             });
             console.log(JSON_save);
              
             var zeeRecord = record.load({ type: 'partner', id: zee_id });
             zeeRecord.setValue({ fieldId: 'custentity_network_matrix_json', value: JSON_save })
             zeeRecord.save();
         } else if (selector == 's_au_express'){
             console.log('Initialise: Sendle AU Express - Save Array ');
             toSaveSet.forEach(function (saveSet) {
                 // console.log('Save Data:') // console.log(saveSet)
                 var rec_id = saveSet.id;
                 console.log('Rec ID: ' + rec_id);
 
                 var po_id = saveSet.prim_id;
                 // if (isNullorEmpty(po_id)) {
                 //     po_id = null;
                 // }
                 var old_po_id = saveSet.old_prim_id;
                 if (isNullorEmpty(old_po_id)) {
                     old_po_id = null;
                 }
                 var po_email = saveSet.prim_email;
                 if (isNullorEmpty(po_email)) {
                     po_email = null;
                 }
                 var po_num = saveSet.prim_num;
                 if (isNullorEmpty(po_num)) {
                     po_num = null;
                 }
                 var po_name = saveSet.prim_name;
                 if (isNullorEmpty(po_name)) {
                     po_name = null;
                 }
                 var so_json = saveSet.secondary_json;
                 if (isNullorEmpty(so_json)) {
                     so_json = [];
                 }
                 var selection_zee_name = saveSet.zee_name;
                 if (isNullorEmpty(selection_zee_name)) {
                     selection_zee_name = null;
                 }
 
                 var change = saveSet.change;
 
                 var mile_option = saveSet.mile;
                 console.log('Mile: ' + mile_option);
 
                 var mappingListRecord = record.load({ type: 'customrecord_sendleplus_mapping_list', id: rec_id });
                 if (old_po_id != po_id || change == true || po_id == 0) { // Primary Op is Different
                     // if (!isNullorEmpty(po_id)) {
                     mappingListRecord.setValue({ fieldId: 'custrecord_sendleplus_prim_id', value: po_id });
                     // console.log('Prim Id: ' + po_id);
                     // }
                     mappingListRecord.setValue({ fieldId: 'custrecord_sendleplus_prim_email', value: po_email })
                     mappingListRecord.setValue({ fieldId: 'custrecord_sendleplus_prim_name', value: po_name });
                     mappingListRecord.setValue({ fieldId: 'custrecord_sendleplus_prim_phone_num', value: po_num });
                     // if (!isNullorEmpty(so_json)) {
                     mappingListRecord.setValue({ fieldId: 'custrecord_sendleplus_sec_json', value: JSON.stringify(so_json) });
                     // console.log('Sec JSON: ' + so_json);
                     // }
                     // if (!isNullorEmpty(zee_name)) {
                     if (selection_zee_name != zee_name && !isNullorEmpty(selection_zee_name)) {
                         po_id = 0;
                         old_po_id = null;
                         po_email = null;
                         po_num = null;
                         po_name = null;
                         so_json = [];
                     }
                     mappingListRecord.setValue({ fieldId: 'custrecord_sendleplus_zee', value: selection_zee_name });
                     // }
                     // if (!isNullorEmpty(mile_option)){
                     mappingListRecord.setValue({ fieldId: 'custrecord_sendleplus_mile', value: mile_option });
                     // }
 
                 }
                 mappingListRecord.save();
 
                 return true;
             });
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