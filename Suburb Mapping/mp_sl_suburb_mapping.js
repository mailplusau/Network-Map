/**
 * @NApiVersion 2.0
 * @NScriptType Suitelet
 * 
 * Module Description
 * 
 * NSVersion    Date                        Author         
 * 2.00         2021-09-20 09:33:08         Anesu
 *
 * Description: xxxxxxxx
 * 
 * @Last Modified by:   Anesu
 * @Last Modified time: 2021-09-20 09:33:08 
 * 
 */

define(['N/ui/serverWidget', 'N/email', 'N/runtime', 'N/search', 'N/record', 'N/http', 'N/log', 'N/redirect', 'N/task', 'N/format'],
function (ui, email, runtime, search, record, http, log, redirect, task, format) {
    var zee = 0;
    var role = 0;

    var baseURL = 'https://1048144.app.netsuite.com';
    if (runtime.EnvType == "SANDBOX") {
        baseURL = 'https://1048144-sb3.app.netsuite.com';
    }

    role = runtime.getCurrentUser().role;

    if (role == 1000) {
        zee = runtime.getCurrentUser().id;
    } else if (role == 3) { //Administrator
        zee = 6; //test
    } else if (role == 1032) { // System Support
        zee = 425904; //test-AR
    }

    function onRequest(context) {
        if (context.request.method === 'GET') {
            var is_params = false;
            type = context.request.parameters.type;

            var params_params = context.request.parameters
            if (!isNullorEmpty(params_params.custparam_params)) {
                var params = JSON.parse(context.request.parameters.custparam_params);
            }
            var zee_id = 0;
            var zee_name = '';
            zee_state = '';
            var selector = '';

            /**
             *  If Comming from 1.0 Page
             */
            var selection_params = context.request.parameters; // &zeename=Surry+Hills&zeeid=469&pagenum=0&zeestate=NSW
            if (!isNullorEmpty(selection_params.zeeid)) {
                zee_id = selection_params.zeeid;
                zee_name = selection_params.zeename;
                zee_state = selection_params.zeestate;
                if (selection_params.selector){
                    selector = selection_params.selector
                }
            }

            if (!isNullorEmpty(params)) {
                is_params = true;

                zee_id = parseInt(params.zeeid);
                zee_name = params.zeename;
                zee_state = params.zeestate;
                if (params.selector){
                    selector = params.selector;
                }
            }

            var form = ui.createForm({ title: ' ' });

            // Load jQuery
            var inlineHtml = '<script src="https://code.jquery.com/jquery-1.12.4.min.js" integrity="sha384-nvAa0+6Qg9clwYCGGPpDQLVpLNn0fRaROjHqs13t4Ggj3Ez50XnGQqc/r8MhnRDZ" crossorigin="anonymous"></script>';
            // Load Tooltip
            inlineHtml += '<script src="https://unpkg.com/@popperjs/core@2"></script>';

            // Load Bootstrap
            inlineHtml += '<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css" integrity="sha384-HSMxcRTRxnN+Bdg0JdbxYKrThecOKuH5zCYotlSAcp1+c8xmyTe9GYg1l9a69psu" crossorigin="anonymous">';
            inlineHtml += '<script src="https://stackpath.bootstrapcdn.com/bootstrap/3.4.1/js/bootstrap.min.js" integrity="sha384-aJ21OjlMXNL5UyIl/XNwTMqvzeRMZH2w8c5cRVpzpU8Y5bApTppSuUkhZXN0VxHd" crossorigin="anonymous"></script>';
            // Load DataTables
            // inlineHtml += '<link rel="stylesheet" type="text/css" href="//cdn.datatables.net/1.10.21/css/jquery.dataTables.min.css">';
            inlineHtml += '<link rel="stylesheet" type="text/css" href="//cdn.datatables.net/1.12.0/css/jquery.dataTables.min.css">';
            inlineHtml += '<script type="text/javascript" charset="utf8" src="//cdn.datatables.net/1.10.21/js/jquery.dataTables.min.js"></script>';
            inlineHtml += '<script type="text/javascript" charset="utf8" src="//cdn.datatables.net/rowgroup/1.1.3/js/dataTables.rowGroup.min.js"></script> '
            inlineHtml += '<script type="text/javascript" charset="utf8" src="//cdn.datatables.net/buttons/2.0.0/js/dataTables.buttons.min.js"></script> '
            inlineHtml += '<script type="text/javascript" charset="utf8" src="//cdnjs.cloudflare.com/ajax/libs/jszip/3.1.3/jszip.min.js"></script> '
            inlineHtml += '<script type="text/javascript" charset="utf8" src="//cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.53/pdfmake.min.js"></script> '
            inlineHtml += '<script type="text/javascript" charset="utf8" src="//cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.53/vfs_fonts.js"></script> '
            inlineHtml += '<script type="text/javascript" charset="utf8" src="//cdn.datatables.net/buttons/2.0.0/js/buttons.html5.min.js"></script> '
            inlineHtml += '<script type="text/javascript" charset="utf8" src="//cdn.datatables.net/buttons/2.0.0/js/buttons.print.min.js"></script> '

            // Load Netsuite stylesheet and script
            inlineHtml += '<link rel="stylesheet" href="https://1048144.app.netsuite.com/core/media/media.nl?id=2060796&c=1048144&h=9ee6accfd476c9cae718&_xt=.css"/>';
            inlineHtml += '<script src="https://1048144.app.netsuite.com/core/media/media.nl?id=2060797&c=1048144&h=ef2cda20731d146b5e98&_xt=.js"></script>';
            inlineHtml += '<link type="text/css" rel="stylesheet" href="https://1048144.app.netsuite.com/core/media/media.nl?id=2090583&c=1048144&h=a0ef6ac4e28f91203dfe&_xt=.css">';
            inlineHtml += '<style>.mandatory{color:red;}</style>';

            // Load Bootstrap-Select
            inlineHtml += '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-select@1.13.14/dist/css/bootstrap-select.min.css">';
            inlineHtml += '<script src="https://cdn.jsdelivr.net/npm/bootstrap-select@1.13.14/dist/js/bootstrap-select.min.js"></script>';

            // Semantic Select
            inlineHtml += '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.2.13/semantic.min.css">';
            inlineHtml += '<script src="https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.2.13/semantic.min.js"></script>';

            // Load Search In Dropdown
            // inlineHtml += '<link href="https://cdnjs.cloudflare.com/ajax/libs/select2/4.0.6-rc.0/css/select2.min.css" rel="stylesheet" />';
            // inlineHtml += '<script src="https://cdnjs.cloudflare.com/ajax/libs/select2/4.0.6-rc.0/js/select2.min.js"></script>';

            // New Website Color Schemes
            // Main Color: #379E8F
            // Background Color: #CFE0CE
            // Button Color: #FBEA51
            // Text Color: #103D39

            // inlineHtml += '<div class="a" style="width: 100%; background-color: #CFE0CE; padding: 20px; min-height: 100vh; height: 100%; ">'; // margin-top: -40px
            // // inlineHtml += '<h1 style="text-align: center; color: #103D39; display: inline-block; font-size: 22px; font-weight: bold; line-height: 33px; vertical-align: top; margin-bottom: 4px;">Consolidation Invoice</h1>';
            // inlineHtml += '<style>.nav > li.active > a, .nav > li.active > a:focus, .nav > li.active > a:hover { background-color: #379E8F; color: #fff }';
            // inlineHtml += '.nav > li > a, .nav > li > a:focus, .nav > li > a:hover { margin-left: 5px; margin-right: 5px; border: 2px solid #379E8F; color: #379E8F; }';
            // inlineHtml += '</style>';

            // Define alert window.
            inlineHtml += '<div class="container" style="margin-top:14px;" hidden><div id="alert" class="alert alert-danger fade in"></div></div>';

            // Click for Instructions
            inlineHtml += '<button type="button" class="btn btn-sm btn-info instruction_button" data-toggle="collapse" data-target="#demo" ">Click for Instructions</button><div id="demo" style="background-color: #cfeefc !important;border: 1px solid #417ed9;padding: 10px 10px 10px 20px;width:96%;position:absolute" class="collapse"><b><u>IMPORTANT INSTRUCTIONS:</u></b>';

            inlineHtml += '<ul>Welcome to Suburb Mapping. To Start, Select Franchisee. Once Selected, A list of suburbs will appear according to that Franchisees State Value. Select appropriate Primary and Secondary Driver Information and Save</ul>';
            inlineHtml += '<li>Table Data:<ul><li><b>Primary Table</b><ul><li> This Table Displays the list of Suburbs chosen by Franchisee in Suburb Selecitons Page. Please <a href="https://1048144.app.netsuite.com/app/site/hosting/scriptlet.nl?script=1065&deploy=1&compid=1048144&zee=' + zee_id + '&opsync=true">click here</a> to redirect.</li></ul></li> <li><b>Secondary Table</b><ul> Suburbs based on filter information. Please filter by Post Code or Suburb Name to view associated Information. </li></ul></li></ul></li>';
            // inlineHtml += '<ul><li><button type="button" class="btn-xs" disabled><span class="span_class glyphicon glyphicon-pencil"></span></button> - Click to open Notes Section for Selected Invoice. (Notes Section is seperate from User Notes)</li>';
            // inlineHtml += '<li><button type="button" class="btn-xs btn-secondary" disabled><span class="glyphicon glyphicon-eye-open"></span></button> - Click to Set Invoice has "Viewed" by a member of the Finance Team.</li>';
            // inlineHtml += '<li><button type="button" class="btn-xs btn-info" disabled><span class="glyphicon glyphicon-time"></span></button> - Click to view Snooze Timers</li><li><button type="button" class="timer-1day form=control btn-xs btn-info" disabled><span class="span_class">1 Day</span></button> - Click to select Snooze duration of invoice from Debt Collections Page.</li>';
            inlineHtml += '</li></ul></div>';

            // Define information window.
            inlineHtml += '<div class="container" hidden><p id="info" class="alert alert-info"></p></div>';
            inlineHtml += '<div style="margin-top: -40px"><br/>';

            // Buttons
            if (!isNullorEmpty(zee_id) || zee_id != 0) {
                inlineHtml += '<h1 class="title_header" style="font-size: 25px; font-weight: 700; color: #103D39; text-align: center">Suburb & Operator Mapping: ' + zee_name + ' </h1>';
            } else {
                inlineHtml += '<h1 class="title_header" style="font-size: 25px; font-weight: 700; color: #103D39; text-align: center">Suburb & Operator Mapping</h1>';
            }

            // inlineHtml += '<button style="margin-left: 10px; margin-right: 5px; background-color: #FBEA51; color: #103D39; font-weight: 700; border-color: transparent; border-width: 2px; border-radius: 15px; height: 30px" type="button" id="downloadCSV" onclick="">Export Complete CSV</button>';

            if (zee_id != 0 || !isNullorEmpty(zee_id)) {
                inlineHtml += '<button style="margin-left: 10px; margin-right: 5px; background-color: #FBEA51; color: #103D39; font-weight: 700; border-color: transparent; border-width: 2px; border-radius: 15px; height: 30px" type="button" id="first_sub_selection" onclick="">Add/Remove  - First Mile Suburb</button>';
                inlineHtml += '<button style="margin-left: 10px; margin-right: 5px; background-color: #FBEA51; color: #103D39; font-weight: 700; border-color: transparent; border-width: 2px; border-radius: 15px; height: 30px" type="button" id="last_sub_selection" onclick="">Add/Remove -  Last Mile Suburb</button>';
                inlineHtml += '<button style="margin-left: 10px; margin-right: 5px; background-color: #FBEA51; color: #103D39; font-weight: 700; border-color: transparent; border-width: 2px; border-radius: 15px; height: 30px" type="button" id="export_mapping">Export All CSV</button>';
                // inlineHtml += '<button style="margin-left: 10px; margin-right: 5px; background-color: #FBEA51; color: #103D39; font-weight: 700; border-color: transparent; border-width: 2px; border-radius: 15px; height: 30px" type="button" id="lodgement_selection" onclick="">Lodgement Location Selection</button>';
                
                // inlineHtml += '<button style="margin-left: 10px; margin-right: 5px; font-weight: 700; border-color: transparent; border-width: 2px; border-radius: 15px; height: 30px" type="button" id="toggle-columns" class="toggle-columns btn-success" >Show/Hide Columns</button>' //style="background-color: #379E8F;

                // Show/Hide Child Table.
                // inlineHtml += '<button style="margin-left: 10px; margin-right: 5px; background-color: #FBEA51; color: #103D39; font-weight: 700; border-color: transparent; border-width: 2px; border-radius: 15px; height: 30px" type="button" id="btn-show-all-children" class="btn-success" >Expand All</button>' //style="background-color: #379E8F;
                // inlineHtml += '<button style="margin-left: 10px; margin-right: 5px; background-color: #FBEA51; color: #103D39; font-weight: 700; border-color: transparent; border-width: 2px; border-radius: 15px; height: 30px" type="button" id="btn-hide-all-children" class="btn-success" >Collapse All</button>' //style="background-color: #379E8F;
            }

            inlineHtml += zeeDropdownSection(zee_id);
            if (zee_id != 0 || !isNullorEmpty(zee_id)) {
                inlineHtml += tabsSection();
                inlineHtml += updateSaveRecord();
            }

            inlineHtml += '</div></div>'

            form.addField({
                id: 'preview_table',
                label: 'inlinehtml',
                type: 'inlinehtml'
            }).updateLayoutType({
                layoutType: ui.FieldLayoutType.STARTROW
            }).defaultValue = inlineHtml;

            form.addField({
                id: 'custpage_suburb_mapping_zee_id',
                label: 'Zee ID',
                type: ui.FieldType.TEXT
            }).updateDisplayType({
                displayType: ui.FieldDisplayType.HIDDEN
            }).defaultValue = zee_id;

            form.addField({
                id: 'custpage_suburb_mapping_zee_name',
                label: 'Zee ID',
                type: ui.FieldType.TEXT
            }).updateDisplayType({
                displayType: ui.FieldDisplayType.HIDDEN
            }).defaultValue = zee_name;

            form.addField({
                id: 'custpage_suburb_mapping_zee_state',
                label: 'Zee ID',
                type: ui.FieldType.TEXT
            }).updateDisplayType({
                displayType: ui.FieldDisplayType.HIDDEN
            }).defaultValue = zee_state;
            
            form.addField({
                id: 'custpage_suburb_mapping_selector',
                label: 'Selector Option',
                type: ui.FieldType.TEXT
            }).updateDisplayType({
                displayType: ui.FieldDisplayType.HIDDEN
            }).defaultValue = selector;

            form.addSubmitButton({
                label: ' '
            });

            form.clientScriptFileId = 5925500; // 

            context.response.writePage(form);

        } else { }
    }

    /**
     * The table that will display the differents invoices linked to the franchisee and the time period.
     * @return  {String}    inlineQty
     */
    function dataTable2(selector) {
        var inlineQty = '<style>table#data_preview2_'+ selector +' {font-size: 12px;text-align: center;border: none; background-color: white;}.dataTables_wrapper {font-size: 14px;}table#data_preview2_'+ selector +' th{text-align: center;} .bolded{font-weight: bold;}</style>';

        inlineQty += '<h4 id="secondary_table_title" class="secondary_table_title_'+selector+' hide" style="font-size: 25px; font-weight: 700; color: #103D39; text-align: center">Suburb Selection | Add/Remove Suburbs</h4>';

        // Input Field
        inlineQty += '<div id="dataTable2filters_'+selector+'" class="form container col-md-9 hide" style="left: 12.5%;">' //margin-top: 20px;
        inlineQty += '<div class="row">'

        inlineQty += '<div class="col-xs-4">'
        inlineQty += '<div class="input-group">'
        inlineQty += '<span style="background-color: #379E8F; color: white;" class="input-group-addon">Post Code Filter</span>';
        inlineQty += '<input class="form-control" id="filter_postcode_'+selector+'" aria-describedby="filterPostCode" placeholder="Enter Post Code">';
        inlineQty += '</div></div>'

        inlineQty += '<div class="col-xs-5">'
        inlineQty += '<div class="input-group">'
        inlineQty += '<span style="background-color: #379E8F; color: white;" class="input-group-addon">Suburb Name Filter</span>';
        inlineQty += '<input class="form-control" id="filter_sub_name_'+selector+'" aria-describedby="filterSubName" placeholder="Enter Suburb Name">';
        inlineQty += '</div></div>'

        inlineQty += '<div class="col-xs-3">'
        inlineQty += '<input type="button" style="background-color: #FBEA51; color: #103D39; font-weight: 700; border-color: transparent; border-width: 2px; border-radius: 15px; height: 30px;" class="form-control add_filter" id="add_filter_'+selector+'" value="Add Suburb"></input>'
        inlineQty += '</div>'
        // inlineQty += '<div class="col-xs-2">'
        // inlineQty += '<input type="button" style="background-color: #FBEA51; color: #103D39; font-weight: 700; border-color: transparent; border-width: 2px; border-radius: 15px; height: 30px;" class="form-control remove_filter" id="remove_filter_'+selector+'" value="Remove Suburb"></input>'
        // inlineQty += '</div>'

        inlineQty += '</div>'
        inlineQty += '</div>'

        inlineQty += '<table id="data_preview2_'+ selector +'" class="table table-responsive table-striped tablesorter hide" style="width: 100%;">';
        inlineQty += '<thead style="color: white; background-color: #379E8F;">';
        inlineQty += '<tr class="text-center">';
        inlineQty += '</tr>';
        inlineQty += '</thead>';

        inlineQty += '<tbody id="result_data" class="result-data"></tbody>';
        // inlineQty += ''

        inlineQty += '</table>';

        return inlineQty;
    }

    function dataTable3(selector) {
        var inlineQty = '<style>table#data_preview3_'+ selector +' {font-size: 12px;text-align: center;border: none; background-color: white;}.dataTables_wrapper {font-size: 14px;}table#data_preview3_'+ selector +' th{text-align: center;} .bolded{font-weight: bold;}</style>';

        inlineQty += '<h4 id="secondary_table_title" class="secondary_table_title_'+selector+' hide" style="font-size: 25px; font-weight: 700; color: #103D39; text-align: center">Suburb Selection | Add/Remove Suburbs</h4>';

        // Input Field
        inlineQty += '<div id="dataTable2filters_'+selector+'" class="form container col-md-9 hide" style="left: 12.5%;">' //margin-top: 20px;
        inlineQty += '<div class="row">'

        inlineQty += '<div class="col-xs-4">'
        inlineQty += '<div class="input-group">'
        inlineQty += '<span style="background-color: #379E8F; color: white;" class="input-group-addon">Post Code Filter</span>';
        inlineQty += '<input class="form-control" id="filter_postcode_'+selector+'" aria-describedby="filterPostCode" placeholder="Enter Post Code">';
        inlineQty += '</div></div>'

        inlineQty += '<div class="col-xs-5">'
        inlineQty += '<div class="input-group">'
        inlineQty += '<span style="background-color: #379E8F; color: white;" class="input-group-addon">Suburb Name Filter</span>';
        inlineQty += '<input class="form-control" id="filter_sub_name_'+selector+'" aria-describedby="filterSubName" placeholder="Enter Suburb Name">';
        inlineQty += '</div></div>'

        inlineQty += '<div class="col-xs-3">'
        inlineQty += '<input type="button" style="background-color: #FBEA51; color: #103D39; font-weight: 700; border-color: transparent; border-width: 2px; border-radius: 15px; height: 30px;" class="form-control add_filter" id="add_filter_'+selector+'" value="Add Suburb"></input>'
        inlineQty += '</div>'
        // inlineQty += '<div class="col-xs-2">'
        // inlineQty += '<input type="button" style="background-color: #FBEA51; color: #103D39; font-weight: 700; border-color: transparent; border-width: 2px; border-radius: 15px; height: 30px;" class="form-control remove_filter" id="remove_filter_'+selector+'" value="Remove Suburb"></input>'
        // inlineQty += '</div>'

        inlineQty += '</div>'
        inlineQty += '</div>'

        inlineQty += '<table id="data_preview3_'+ selector +'" class="table table-responsive table-striped tablesorter hide" style="width: 100%;">';
        inlineQty += '<thead style="color: white; background-color: #379E8F;">';
        inlineQty += '<tr class="text-center">';
        inlineQty += '</tr>';
        inlineQty += '</thead>';

        inlineQty += '<tbody id="result_data" class="result-data"></tbody>';
        // inlineQty += ''

        inlineQty += '</table>';

        return inlineQty;
    }

    function zeeDropdownSection(zeeid) {
        var inlineQty = '<div class="form-group container zeeDropdown">';
        inlineQty += '<div class="row col-xs-6" style="left: 25%; margin-top: 20px;">'; //col-xs-6 d-flex justify-content-center

        inlineQty += '<div class="input-group">';
        inlineQty += '<span style="background-color: #379E8F; color: white;" class="input-group-addon">Franchisee</span>';
        inlineQty += '<select id="zee_filter_dropdown" class="form-control" required>';
        inlineQty += '<option></option>';
        var zeesSearch = search.load({ type: 'partner', id: 'customsearch_smc_franchisee' });
        zeesSearch.filters.push(search.createFilter({
            name: 'entityid',
            operator: search.Operator.DOESNOTSTARTWITH,
            values: 'Test'
        }))
        var zeesSearchResults = zeesSearch.run();
        log.audit({
            title: 'Suburb Mapping - JSON Stringify - zeesSearchResults',
            details: JSON.stringify(zeesSearchResults)
        })
        zeesSearchResults.each(function (zeesSearchResult) {
            var zee_id = zeesSearchResult.getValue({ name: 'internalid', summmary: search.Summary.GROUP });
            var zee_name = zeesSearchResult.getValue({ name: 'companyname', summmary: search.Summary.GROUP });
            var zee_state = zeesSearchResult.getText({ name: 'location' });

            if (zee_id == zeeid) {
                inlineQty += '<option value="' + zee_id + '" state="' + zee_state + '" selected>' + zee_name + '</option>';
            } else {
                inlineQty += '<option value="' + zee_id + '" state="' + zee_state + '">' + zee_name + '</option>';
            }
            return true;
        });
        inlineQty += '</select>';
        inlineQty += '</div>';

        inlineQty += '</div></div>';

        return inlineQty;
    }

    function updateSaveRecord(pageNum, pageLength) {
        // Save Edit
        var inlineQty = '<div class="form-group container save_record button_section" style="margin-top: 20px;">';
        inlineQty += '<div class="row">';

        inlineQty += '<div class="col-xs-4">';
        // if (pageNum != 0){
        inlineQty += '<input type="button" style="background-color: #FBEA51; color: #103D39; font-weight: 700; border-color: transparent; border-width: 2px; border-radius: 15px; height: 30px;" class="form-control previous_btn hide" id="previousPage" value="Previous Page"></input>';
        // }
        inlineQty += '</div>';

        inlineQty += '<div class="col-xs-4">';
        inlineQty += '<input type="button" style="background-color: #379E8F; color: white; font-weight: 700; border-color: transparent; border-width: 2px; border-radius: 15px; height: 30px;" class="form-control submit_btn hide" id="updateSaveRecord" value="Submit"></input>';
        inlineQty += '</div>';

        inlineQty += '<div class="col-xs-4">';
        // if (pageNum != pageLength){
        inlineQty += '<input type="button" style="background-color: #FBEA51;color: #103D39;  font-weight: 700; border-color: transparent; border-width: 2px; border-radius: 15px; height: 30px;" class="form-control next_btn hide" id="nextPage" value="Next Page"></input>';
        // }
        inlineQty += '</div>';

        inlineQty += '</div></div>';

        return inlineQty;
    }

    function tabsSection() {
        var inlineQty = '<div>';

        // Tabs headers
        inlineQty += '<style>.nav > li.active > a, .nav > li.active > a:focus, .nav > li.active > a:hover { background-color: #379E8F; color: #fff }';
        inlineQty += '.nav > li > a, .nav > li > a:focus, .nav > li > a:hover { margin-left: 5px; margin-right: 5px; border: 2px solid #379E8F; color: #379E8F; }';
        inlineQty += '</style>';

        inlineQty += '<div style="width: 95%; margin:auto; margin-bottom: 30px; margin-top: 30px;",><ul class="nav nav-pills nav-justified" style="margin:0%; ">';
        inlineQty += '<li role="presentation" class="active"><a data-toggle="tab" href="#mp_standard"><b>MP Standard</b></a></li>';
        inlineQty += '<li role="presentation" class=""><a data-toggle="tab" href="#mp_express"><b>MP Express</b></a></li>';
        inlineQty += '<li role="presentation" class=""><a data-toggle="tab" href="#s_au_express"><b>Sendle AU Express</b></a></li>';
        inlineQty += '</ul></div>';

        // Tabs content
        // MP Standard
        inlineQty += '<div class="tab-content">';
        inlineQty += '<div role="tabpanel" class="tab-pane active" id="mp_standard">';
        inlineQty += loadingSection();
        inlineQty += dataTable3('mp_standard');
        inlineQty += '</div>';

        // MP Express
        inlineQty += '<div role="tabpanel" class="tab-pane" id="mp_express">';
        inlineQty += loadingSection();
        inlineQty += dataTable2('mp_express');
        inlineQty += '</div>';

        // Sendle AU Express
        inlineQty += '<div role="tabpanel" class="tab-pane" id="s_au_express">';
        inlineQty += loadingSection();
        inlineQty += dataTable2('s_au_express');
        inlineQty += '</div>';

        inlineQty += '</div>'; //</div>

        return inlineQty;
    }

    // function mileSection() {
    //     var inlineQty = '<div>';

    //     // Tabs headers
    //     inlineQty += '<style>.nav > li.active > a, .nav > li.active > a:focus, .nav > li.active > a:hover { background-color: #379E8F; color: #fff }';
    //     inlineQty += '.nav > li > a, .nav > li > a:focus, .nav > li > a:hover { margin-left: 5px; margin-right: 5px; border: 2px solid #379E8F; color: #379E8F; }';
    //     inlineQty += '</style>';

    //     inlineQty += '<div style="width: 95%; margin:auto; margin-bottom: 30px; margin-top: 30px;",><ul class="nav nav-pills nav-justified" style="margin:0%; ">';
    //     inlineQty += '<li role="presentation" class="active"><a data-toggle="mile" href="#first_mile"><b>First Mile</b></a></li>';
    //     inlineQty += '<li role="presentation" class=""><a data-toggle="mile" href="#last_mile"><b>Last Mile</b></a></li>';
    //     inlineQty += '</ul></div>';

    //     // Tabs content
    //     // First Mile
    //     inlineQty += '<div class="tab-content">';
    //     inlineQty += '<div role="tabpanel" class="tab-pane tab-pane-mile active" id="first_mile">';
    //     inlineQty += loadingSection();
    //     inlineQty += dataTable('first_mile');
    //     inlineQty += '<br>';
    //     inlineQty += dataTable2('first_mile');
    //     inlineQty += '</div>';

    //     // Last Mile
    //     inlineQty += '<div role="tabpanel" class="tab-pane tab-pane-mile" id="last_mile">';
    //     inlineQty += loadingSection();
    //     inlineQty += dataTable('last_mile');
    //     inlineQty += '<br>';
    //     inlineQty += dataTable2('last_mile');
    //     inlineQty += '</div>';

    //     inlineQty += '</div>'; //</div>

    //     return inlineQty;
    // }

    /**
     * The header showing that the results are loading.
     * @returns {String} `inlineQty`
     */
    function loadingSection() {
        var inlineQty = '<div class="form-group container loading_section"></div>';
        inlineQty += '<style> .loading_section { border: 14px solid #f3f3f3; border-radius: 50%; border-top: 14px solid #379E8F; width: 90px; height: 90px; -webkit-animation: spin 2s linear infinite; /* Safari */ animation: spin 2s linear infinite;';
        inlineQty += 'left: 50%; }' //position: fixed; z-index: 1000; 
        /* Safari */
        inlineQty += '@-webkit-keyframes spin {0% { -webkit-transform: rotate(0deg); } 100% { -webkit-transform: rotate(360deg); } }';

        inlineQty += '@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }';
        inlineQty += '</style>';

        return inlineQty;
    }

    // function onclick_serviceChangePage(custid){
    //     $('#commRegSection').removeClass('hide');
    //     $('#tabSection').removeClass('hide');
    //     loadCustService(17029, custid);
    // }

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
        onRequest: onRequest
    }
});