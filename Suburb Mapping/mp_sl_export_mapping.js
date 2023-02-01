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
function(ui, email, runtime, search, record, http, log, redirect, task, format) {
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
            var is_params = 'T';
            type = context.request.parameters.type;

            var params_params = context.request.parameters
            if (!isNullorEmpty(params_params.custparam_params)) {
                var params = JSON.parse(context.request.parameters.custparam_params);
            }
            log.debug({
                title: 'Parameters',
                details: params
            })
            var zeeSet = [];
            var selector = '';

            if (!isNullorEmpty(params)) {
                is_params = true;

                zeeSet = JSON.parse(JSON.stringify(params.zee));
                selector = params.selector;
            }

            switch (selector) {
                case 'mp_standard': var selector_type = 'MP Standard'
                    break;
                case 'mp_express': var selector_type = 'MP Express'
                    break;
                case 's_au_express': var selector_type = 'Sendle AU Express'
                    break;
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

            // Define information window.
            inlineHtml += '<div class="container" hidden><p id="info" class="alert alert-info"></p></div>';

            inlineHtml += '<div style="margin-top: -40px"><br/>';

            // Buttons
            inlineHtml += '<button style="margin-left: 10px; margin-right: 5px; background-color: #FBEA51; color: #103D39; font-weight: 700; border-color: transparent; border-width: 2px; border-radius: 15px; height: 30px" type="button" id="suburb_mapping" onclick="">Suburb Mapping Page</button>';
            inlineHtml += '<h1 style="font-size: 25px; font-weight: 700; color: #103D39; text-align: center">Suburb Mapping: Export - '+selector_type+'</h1>';

            // Click for Instructions
            // inlineHtml += '<button type="button" class="btn btn-sm btn-info instruction_button" data-toggle="collapse" data-target="#demo" style="background-color: #FBEA51; color: #103D39;">Click for Instructions</button><div id="demo" style="background-color: #cfeefc !important;border: 1px solid #417ed9;padding: 10px 10px 10px 20px;width:96%;position:absolute" class="collapse"><b><u>IMPORTANT INSTRUCTIONS:</u></b>';
            // inlineHtml += '<ul><li><input type="button" class="btn-xs" style="background-color: #fff; color: black;" disabled value="Submit Search" /> - <ul><li>Click "Submit Search" to load Datatable using current parameters</li></ul></li>'
            // inlineHtml += '<li>Functionalities available on the Debt Collections Table:<ul><li><b>Sort</b><ul><li>Click on column headers to sort collections invoices according to the values in the columns. This is default to "Days Overdue".</li><li>Hold "Shift" and click another column to sort according to multiple columns.</li></ul></li><li><b>Search</b><ul><li>You can search for specific Customer or Invoice by typing into the "Search" field</li></ul></li></ul></li>';
            // inlineHtml += '<li>Table Filters:<ul><li><b>Matching MAAP Allocation</b><ul><li><button type="button" class="btn-xs btn-success " disabled><span class="glyphicon glyphicon-plus"></span></button> - Click to apply MAAP Allocation filters search filters on table. ONLY click once. </li><li><button type="button" class="btn-xs btn-danger " disabled><span class="glyphicon glyphicon-minus"></span></button> - Click to remove MAAP Allocation search filter from table. This is set default to "Days Overdue".</li></ul></li> <li><b>MP Ticket Column</b><ul><button type="button" class="btn-xs btn-success" disabled><span class="glyphicon glyphicon-plus"></span></button> - Click to apply MAAP Allocation filters search filters on table. ONLY click once. </li></ul></li></ul></li><li>Clickable Actions Available Per Invoice in DataTable:</li>';
            // inlineHtml += '<ul><li><button type="button" class="btn-xs" disabled><span class="span_class glyphicon glyphicon-pencil"></span></button> - Click to open Notes Section for Selected Invoice. (Notes Section is seperate from User Notes)</li>';
            // inlineHtml += '<li><button type="button" class="btn-xs btn-secondary" disabled><span class="glyphicon glyphicon-eye-open"></span></button> - Click to Set Invoice has "Viewed" by a member of the Finance Team.</li>';
            // inlineHtml += '<li><button type="button" class="btn-xs btn-info" disabled><span class="glyphicon glyphicon-time"></span></button> - Click to view Snooze Timers</li><li><button type="button" class="timer-1day form=control btn-xs btn-info" disabled><span class="span_class">1 Day</span></button> - Click to select Snooze duration of invoice from Debt Collections Page.</li>';
            // inlineHtml += '</li></ul></div>';

            // Load InlineHTML
            if (!isNullorEmpty(selector)){
                inlineHtml += selectorSection(selector);
                inlineHtml += zeeDropdownSection(zeeSet);
                if (!isNullorEmpty(zeeSet)){
                    inlineHtml += dataTable();
                }
                inlineHtml += csvExport();
            } else {
                inlineHtml += selectorSection();
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
                id: 'custpage_export_mapping_selector',
                label: 'Selector',
                type: ui.FieldType.TEXT
            }).updateDisplayType({
                displayType: ui.FieldDisplayType.HIDDEN
            }).defaultValue = selector;
            form.addField({
                id: 'custpage_export_mapping_zee_set',
                label: 'Zee Set',
                type: ui.FieldType.TEXT
            }).updateDisplayType({
                displayType: ui.FieldDisplayType.HIDDEN
            }).defaultValue = zeeSet;
            form.addField({
                id: 'custpage_table_csv',
                label: 'CSV Export',
                type: ui.FieldType.TEXT
            }).updateDisplayType({
                displayType: ui.FieldDisplayType.HIDDEN
            });
            form.addField({
                id: 'custpage_export_mapping_method',
                label: 'Method',
                type: ui.FieldType.TEXT
            }).updateDisplayType({
                displayType: ui.FieldDisplayType.HIDDEN
            }).defaultValue = 'GET';

            form.addSubmitButton({
                label: ' '
            });

            form.clientScriptFileId = 5959382; // PROD: 5959382 | SANDBOX: 

            context.response.writePage(form);
        } else {
            var params = context.request.parameters;

            var zeeSet = params.custpage_export_mapping_zee_set;
            var selector = params.custpage_export_mapping_selector

            // CALL SCHEDULED SCRIPT
            var params = {
                custscript_ss_export_mapping_zee_set: zeeSet,
                custscript_ss_export_mapping_selector: selector,
            }
            var scriptTask = task.create({
                taskType: task.TaskType.SCHEDULED_SCRIPT,
                scriptId: 'customscript_ss_export_mapping',
                deploymentId: 'customdeploy_ss_export_mapping',
                params: params
            });
            var ss_id = scriptTask.submit();
            var myTaskStatus = task.checkStatus({
                taskId: ss_id
            });
            log.debug({
                title: 'Task Status',
                details: myTaskStatus
            });

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

            // Define information window.
            inlineHtml += '<div class="container" hidden><p id="info" class="alert alert-info"></p></div>';

            inlineHtml += '<div style="margin-top: -40px"><br/>';

            inlineHtml += '<h1 id="title" style="font-size: 25px; font-weight: 700; color: #103D39; text-align: center">Suburb Mapping: Export - Downloading CSV</h1>';

            inlineHtml += loadingSection();

            inlineHtml += goBack();

            inlineHtml += '</div></div>'

            form.addField({
                id: 'preview_table',
                label: 'inlinehtml',
                type: 'inlinehtml'
            }).updateLayoutType({
                layoutType: ui.FieldLayoutType.STARTROW
            }).defaultValue = inlineHtml;
            form.addField({
                id: 'custpage_export_mapping_method',
                label: 'Method',
                type: ui.FieldType.TEXT
            }).updateDisplayType({
                displayType: ui.FieldDisplayType.HIDDEN
            }).defaultValue = 'POST';
            form.addField({
                id: 'custpage_table_csv',
                label: 'CSV Export',
                type: ui.FieldType.TEXT
            }).updateDisplayType({
                displayType: ui.FieldDisplayType.HIDDEN
            });

            form.addSubmitButton({
                label: ' '
            });

            // redirect.toSuitelet({
            //     scriptId: 'customscript_sl_suburb_mapping',
            //     deploymentId: 'customdeploy_sl_suburb_mapping',
            //     isExternal: null,
            // });
            form.clientScriptFileId = 5959382; // PROD: 5959382 | SANDBOX: 

            context.response.writePage(form);
        }
    }

    /**
     * The table that will display the differents invoices linked to the franchisee and the time period.
     * @return  {String}    inlineQty
     */
    function dataTable() {
        var inlineQty = '<style>table#debt_preview {font-size: 12px;text-align: center;border: none;}.dataTables_wrapper {font-size: 14px;}table#debt_preview th{text-align: center;} .bolded{font-weight: bold;}</style>';
        inlineQty += '<table id="debt_preview" class="table table-responsive table-striped customer tablesorter hide" style="width: 100%;">';
        inlineQty += '<thead style="color: white; background-color: #379E8F;">';
        inlineQty += '<tr class="text-center">';
        inlineQty += '</tr>';
        inlineQty += '</thead>';

        inlineQty += '<tbody id="result_debt" class="result-debt"></tbody>';

        inlineQty += '</table>';
        return inlineQty;
    }

    function zeeDropdownSection(zeeid) {
        var inlineQty = '<div class="form-group container zeeDropdown">';
        inlineQty += '<div class="row col-xs-6" style="left: 25%; margin-top: 20px;">'; //col-xs-6 d-flex justify-content-center

        inlineQty += '<div class="input-group">';
        inlineQty += '<span style="background-color: #379E8F; color: white;" class="input-group-addon">Franchisee</span>';
        inlineQty += '<select id="zee_filter_dropdown" class="zee_dropdown ui fluid search dropdown" multiple="">';
        // inlineQty += '<option></option>';
        var zeesSearch = search.load({ type: 'partner', id: 'customsearch_smc_franchisee' });
        zeesSearch.filters.push(search.createFilter({
            name: 'entityid',
            operator: search.Operator.DOESNOTSTARTWITH,
            values: 'Test'
        }))
        var zeesSearchResults = zeesSearch.run();
        // log.audit({
        //     title: 'Export Mapping - JSON Stringify - zeesSearchResults',
        //     details: JSON.stringify(zeesSearchResults)
        // })
        zeesSearchResults.each(function (zeesSearchResult) {
            var zee_id = zeesSearchResult.getValue({ name: 'internalid', summmary: search.Summary.GROUP });
            var zee_name = zeesSearchResult.getValue({ name: 'companyname', summmary: search.Summary.GROUP });
            var zee_state = zeesSearchResult.getText({ name: 'location' });

            if (zeeid.indexOf(zee_id) != -1) {
                inlineQty += '<option value="' + zee_id + '" state="' + zee_state + '" selected>' + zee_name + '</option>';
            } else {
                inlineQty += '<option value="' + zee_id + '" state="' + zee_state + '">' + zee_name + '</option>';
            }
            return true;
        });
        inlineQty += '</select>';
        inlineQty += '</div>';

        inlineQty += '<div id="dtBox"></div>'
        inlineQty += '<div class="ui toggle checkbox checkbox_primary">'
        inlineQty += '<input type="checkbox" id="selectall">'
        inlineQty += '<label>Select all</label>'
        inlineQty += '</div>'

        inlineQty += '</div></div>';

        return inlineQty;
    }

    function selectorSection(selector){
        var inlineQty = '<div class="form-group container selector">';
        inlineQty += '<div class="row col-xs-6" style="left: 25%; margin-top: 20px;">';
        
        //Selector
        inlineQty += '<div class="input-group">';
        inlineQty += '<span style="background-color: #379E8F; color: white;" class="input-group-addon" id="selector_text">Selector Type</span>';
        inlineQty += '<select id="selector" class="form-control">';
        inlineQty += '<option value="">- Undefined -</option>';
        var selector_type = [
            { name: "MP Standard", id: "mp_standard" },
            { name: "MP Express", id: "mp_express" },
            { name: "Sendle AU Express", id: "s_au_express" },
        ]
        for (var i = 0; i < selector_type.length; i++){
            if (selector == selector_type[i].id){
                inlineQty += '<option value="'+selector_type[i].id+'" selected>'+selector_type[i].name+'</option>';
            } else {
                inlineQty += '<option value="'+selector_type[i].id+'">'+selector_type[i].name+'</option>';
            }
        }

        inlineQty += '</select>';
        inlineQty += '</div>'

        inlineQty += '</div></div>';

        return inlineQty;
    }

    function csvExport() {
        // Save Edit
        var inlineQty = '<div class="container">'; //style="margin-top: 20px;"
        inlineQty += '<div class="row justify-content-center">';

        inlineQty += '<div class="col-xs-4"></div>';
        inlineQty += '<div class="col-4">';
        // inlineQty += '<input type="button" style="background-color: #379E8F; color: white; font-weight: 700; border-color: transparent; border-width: 2px; border-radius: 15px; height: 30px;"  id="submit" value=""></input>';
        inlineQty += '<button style="background-color: #379E8F; color: white; font-weight: 700; border-color: transparent; border-width: 2px; border-radius: 15px; height: 30px" type="button" id="csv_export" class="col-xs-4 csv_export">CSV Export</button>';
        inlineQty += '</div>';
        inlineQty += '<div class="col-xs-4"></div>';

        inlineQty += '</div></div>';

        return inlineQty;
    }

    /**
     * The header showing that the results are loading.
     * @returns {String} `inlineQty`
     */
    // function loadingSection() {
    //     var inlineQty = '<div id="loading_section" class="form-group container loading_section" style="text-align:center">';
    //     inlineQty += '<div class="row">';
    //     inlineQty += '<div class="col-xs-12 loading_div color--primary-1 page-header-text" style="margin-bottom: 20px; text-align: center; color: #379e8f; font-size: 20px">';
    //     inlineQty += '<h1>Loading CSV ...</h1>';
    //     inlineQty += '</div></div></div>';

    //     return inlineQty;
    // }
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

    function goBack() {
        // Save Edit
        var inlineQty = '<div class="container back hide">'; //style="margin-top: 20px;"
        inlineQty += '<div class="row justify-content-center">';

        inlineQty += '<h1 style="text-align: center">CSV has been downloaded. Click back to return to main page...</h1>';

        inlineQty += '<div class="col-xs-4"></div>';
        inlineQty += '<div class="col-4">';
        inlineQty += '<button style="background-color: #FBEA51; color: #103D39; font-weight: 700; border-color: transparent; border-width: 2px; border-radius: 15px; height: 30px" type="button" id="back" class="col-xs-4">Go Back</button>';
        inlineQty += '</div>';
        inlineQty += '<div class="col-xs-4"></div>';

        inlineQty += '</div></div>';

        return inlineQty;
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
        onRequest: onRequest
    }
});