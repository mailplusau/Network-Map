var ctx = nlapiGetContext();

var zee;
var role = ctx.getRole();

if (role == 1000) {
    //Franchisee
    zee = ctx.getUser();
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

function locationIds(state) {
    switch (state) {
        case 'ACT':
            return 6;
        case 'NSW':
            return 1;
        case 'VIC':
            return 3;
        case 'QLD':
            return 2;
        case 'WA':
            return 7;
        case 'SA':
            return 4;
        case 'NT':
            return 8;
        case 'TAS':
            return 5;
    }
}

function sendleHubbedLocations(request, response) {

    if (request.getMethod() === "GET") {

        var form = nlapiCreateForm('My Sendle Hubbed Selections');

        var primary_hubbed = null;
        var secondary_hubbed = null;

        var inlinehtml2 = '<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"><script src="//code.jquery.com/jquery-1.11.0.min.js"></script><link type="text/css" rel="stylesheet" href="https://cdn.datatables.net/1.10.13/css/jquery.dataTables.min.css"><link href="//netdna.bootstrapcdn.com/bootstrap/3.3.2/css/bootstrap.min.css" rel="stylesheet"><script src="//netdna.bootstrapcdn.com/bootstrap/3.3.2/js/bootstrap.min.js"></script><link rel="stylesheet" href="https://1048144.app.netsuite.com/core/media/media.nl?id=2060796&c=1048144&h=9ee6accfd476c9cae718&_xt=.css"/><script src="https://1048144.app.netsuite.com/core/media/media.nl?id=2060797&c=1048144&h=ef2cda20731d146b5e98&_xt=.js"></script><link type="text/css" rel="stylesheet" href="https://1048144.app.netsuite.com/core/media/media.nl?id=2090583&c=1048144&h=a0ef6ac4e28f91203dfe&_xt=.css">';

        inlinehtml2 += '<div class="se-pre-con"></div><div id="demo" style="background-color: #cfeefc !important;border: 1px solid #417ed9;padding: 10px 10px 10px 20px;width:96%;position:absolute" class=""><b>Purpose</b></br>Find and nominate a HUBBED location that best suits your lodgement needs (closing times, distance) and select it as your PRIMARY location to lodge Sendle Recovery parcels.</br></br><b>How to use this page</b><br>Enter a suburb name or postcode you want to find a HUBBED lodgement site for in the Search Box. Once you find the best location that works for you, click the primary circle on the right of the row to make your selection.</br></br>You can then also select multiple SECONDARY locations that will be activated for you as back-up lodgement sites.  Whenever jobs are loaded into your onfleet app, the primary HUBBED location will be used to order jobs.</br></br><b>Tips & Tricks</b></br>Keep in mind that BP and Storage sites tend to be better lodgement sites (drop and go) as staff members in these sites are used to dealing with parcel volumes compared to newsagents and chemists sites.<br>Consider nominating a site nearer your home to make it more convenient for you to finish your run. </div>';


        // inlineHTML += '<div class="container" style="padding-top: 12%;"></div>';
        // 
        if (role != 1000) {

            inlinehtml2 += '<div class="col-xs-4 admin_section" style="margin-top:200px;width: 20%;left: 40%;position: absolute;"><b>Select Zee</b> <select class="form-control zee_dropdown" >';

            //WS Edit: Updated Search to SMC Franchisee (exc Old/Inactives)
            //Search: SMC - Franchisees
            var searched_zee = nlapiLoadSearch('partner', 'customsearch_smc_franchisee');

            var resultSet_zee = searched_zee.runSearch();

            var count_zee = 0;

            var zee_id;

            inlinehtml2 += '<option value=""></option>'

            resultSet_zee.forEachResult(function(searchResult_zee) {
                zee_id = searchResult_zee.getValue('internalid');
                // WS Edit: Updated entityid to companyname
                zee_name = searchResult_zee.getValue('companyname');

                if (request.getParameter('zee') == zee_id) {
                    inlinehtml2 += '<option value="' + zee_id + '" selected="selected">' + zee_name + '</option>';
                } else {
                    inlinehtml2 += '<option value="' + zee_id + '">' + zee_name + '</option>';
                }

                return true;
            });

            inlinehtml2 += '</select></div>';
        } else {
            inlinehtml2 += '<div class="col-xs-4 admin_section" style="margin-top:200px;width: 20%;left: 40%;position: absolute;"></div>';
        }

        if (!isNullorEmpty(request.getParameter('zee'))) {
            zee = request.getParameter('zee');
        }

        form.addField('custpage_html2', 'inlinehtml').setPadding(1).setLayoutType('outsideabove').setDefaultValue(inlinehtml2);


        if (!isNullorEmpty(zee)) {

            var param_zee = request.getParameter('zee');

            if (!isNullorEmpty(param_zee)) {
                zee = param_zee;
            }

            nlapiLogExecution('DEBUG', 'Zee', zee)

            var partner_record = nlapiLoadRecord('partner', parseInt(zee));

            var partner_state = partner_record.getFieldText('location');

            var partner_name = partner_record.getFieldValue('companyname');

            partner_state = stateNames(partner_state);
            partner_state_id = partner_record.getFieldValue('location');
            var primary_hubbed = partner_record.getFieldValue('custentity_sendle_hubbed_locations');
            var secondary_hubbed = partner_record.getFieldValues('custentity_sendle_hubbed_location_sec');

            nlapiLogExecution('DEBUG', 'primary_hubbed', primary_hubbed)
            nlapiLogExecution('DEBUG', 'secondary_hubbed', secondary_hubbed)

            var secondary_hubbed_string = null;

            if (!isNullorEmpty(secondary_hubbed)) {
                for (var x = 0; x < secondary_hubbed.length; x++) {
                    if (x == 0) {
                        secondary_hubbed_string = secondary_hubbed[x];
                    } else {
                        secondary_hubbed_string += ',' + secondary_hubbed[x];
                    }

                }
            }

            nlapiLogExecution('DEBUG', 'secondary_hubbed_string', secondary_hubbed_string)

            form.addField('zee', 'text', 'zee').setDisplayType('hidden').setDefaultValue(zee);
            form.addField('primary_hubbed', 'text', 'zee').setDisplayType('hidden').setDefaultValue(primary_hubbed);
            form.addField('secondary_hubbed', 'text', 'zee').setDisplayType('hidden').setDefaultValue(secondary_hubbed_string);
            form.addField('name', 'text', 'name').setDisplayType('hidden').setDefaultValue(partner_name);
            form.addField('partner_state', 'text', 'partner_state').setDisplayType('hidden').setDefaultValue(partner_state);
            form.addField('partner_state_id', 'text', 'partner_state_id').setDisplayType('hidden').setDefaultValue(partner_record.getFieldValue('location'));


            var inlineHTML = '';
            inlineHTML += '</br>';
            inlineHTML += '</br>';
            inlineHTML += '</br>';
            inlineHTML += '<br><br><style>table#customer {font-size:12px; font-weight:bold; border-color: #24385b;} </style><table border="0" cellpadding="15" id="customer" class="tablesorter table table-striped" cellspacing="0" style="width: 100%;"><thead style="color: white;background-color: #607799;"><tr><th  style="vertical-align: middle;text-align: center;" class="col-2"><b>NAME</b></th><th style="vertical-align: middle;text-align: center;"><b>ADDRESS 1</b></th><th style="vertical-align: middle;text-align: center;"><b>ADDRESS 2</b></th><th style="vertical-align: middle;text-align: center;"><b>SUBURB</b></th><th style="vertical-align: middle;text-align: center;"><b>STATE</b></th><th style="vertical-align: middle;text-align: center;"><b>POSTCODE</b></th><th style="vertical-align: middle;text-align: center;"><b>OPERATING HOURS<br> (MON)</b></th><th style="vertical-align: middle;text-align: center;"><b>OPERATING HOURS<br> (TUE)</b></th><th style="vertical-align: middle;text-align: center;"><b>OPERATING HOURS<br> (WED)</b></th><th style="vertical-align: middle;text-align: center;"><b>OPERATING HOURS<br> (THU)</b></th><th style="vertical-align: middle;text-align: center;"><b>OPERATING HOURS<br> (FRI)</b></th><th style="vertical-align: middle;text-align: center;"><b>PRIMARY</b></th><th style="vertical-align: middle;text-align: center;"><b>SECONDARY</b></th></tr></thead>';

            var sendleHubbedLocationsSearch = nlapiLoadSearch('customrecord_ap_lodgment_location', 'customsearch_ncl_sendle_hubbed_locations');

            var addFilterExpression = new nlobjSearchFilter('custrecord_ap_lodgement_site_state', null, 'anyof', partner_state_id);

            sendleHubbedLocationsSearch.addFilter(addFilterExpression);
            var resultSetSendleHubbedLocations = sendleHubbedLocationsSearch.runSearch();

            resultSetSendleHubbedLocations.forEachResult(function(searchResult) {
                var nclInternalID = searchResult.getValue("internalid");
                var nclName = searchResult.getValue("name");
                var nclAddress1 = searchResult.getValue("custrecord_ap_lodgement_addr1");
                var nclAddress2 = searchResult.getValue("custrecord_ap_lodgement_addr2");
                var nclSuburb = searchResult.getValue("custrecord_ap_lodgement_suburb");
                var nclState = searchResult.getText("custrecord_ap_lodgement_site_state");
                var nclPostcode = searchResult.getValue("custrecord_ap_lodgement_postcode");
                var nclOperatingHoursMon = searchResult.getValue("custrecord_ap_lodgement_hrs_mon");
                var nclOperatingHoursTue = searchResult.getValue("custrecord_ap_lodgement_hrs_tue");
                var nclOperatingHoursWed = searchResult.getValue("custrecord_ap_lodgement_hrs_wed");
                var nclOperatingHoursThu = searchResult.getValue("custrecord_ap_lodgement_hrs_thu");
                var nclOperatingHoursFri = searchResult.getValue("custrecord_ap_lodgement_hrs_fri");


                inlineHTML += '<tr class="dynatable-editable">';
                inlineHTML += '<td>' + nclName + '</td>';
                inlineHTML += '<td>' + nclAddress1 + '</td>';
                inlineHTML += '<td>' + nclAddress2 + '</td>';
                inlineHTML += '<td>' + nclSuburb + '</td>';
                inlineHTML += '<td>' + nclState + '</td>';
                inlineHTML += '<td>' + nclPostcode + '</td>';
                inlineHTML += '<td>' + nclOperatingHoursMon + '</td>';
                inlineHTML += '<td>' + nclOperatingHoursTue + '</td>';
                inlineHTML += '<td>' + nclOperatingHoursWed + '</td>';
                inlineHTML += '<td>' + nclOperatingHoursThu + '</td>';
                inlineHTML += '<td>' + nclOperatingHoursFri + '</td>';
                if (primary_hubbed == nclInternalID) {
                    inlineHTML += '<td style="vertical-align: middle;text-align: center;"><div class="custom-control custom-checkbox"><input type="radio" class="custom-control-input primary" id="" name="primary" data-nclInternalID="' + nclInternalID + '" checked/></div></td>';
                } else {
                    inlineHTML += '<td style="vertical-align: middle;text-align: center;"><div class="custom-control custom-checkbox"><input type="radio" class="custom-control-input primary" id="" name="primary" data-nclInternalID="' + nclInternalID + '"/></div></td>';
                }

                 var pos = -1;
                if(!isNullorEmpty(secondary_hubbed)) {
                    pos = secondary_hubbed.indexOf(nclInternalID);
                }

                if (pos != -1) {
                    inlineHTML += '<td style="vertical-align: middle;text-align: center;"><div class="custom-control custom-checkbox"><input type="checkbox" class="custom-control-input secondary" id="" name="secondary" data-nclInternalID="' + nclInternalID + '" checked/></div></td>';
                } else {
                    inlineHTML += '<td style="vertical-align: middle;text-align: center;"><div class="custom-control custom-checkbox"><input type="checkbox" class="custom-control-input secondary" id="" name="secondary" data-nclInternalID="' + nclInternalID + '"/></div></td>';
                }



                inlineHTML += '</tr>';


                return true;
            });


            inlineHTML += '</tbody></table>'

        }

        inlineHTML += '</div>'
        form.addField('preview_table', 'inlinehtml', '').setLayoutType('outsidebelow', 'startrow').setDefaultValue(inlineHTML);
        form.setScript('customscript_cl_sendle_hubbed_locations');

        form.addSubmitButton('Submit');

        response.writePage(form);
    } else {
        var zee2 = request.getParameter('zee');
        var primary_hubbed = request.getParameter('primary_hubbed');
        var secondary_hubbed = request.getParameter('secondary_hubbed');

        nlapiLogExecution('DEBUG', 'secondary_hubbed', secondary_hubbed)

        secondary_hubbed = secondary_hubbed.split(',');


        var partner_record = nlapiLoadRecord('partner', parseInt(zee2));

        partner_record.setFieldValue('custentity_sendle_hubbed_locations', primary_hubbed);
        partner_record.setFieldValues('custentity_sendle_hubbed_location_sec', secondary_hubbed);

        nlapiSubmitRecord(partner_record);

        var params = {};


        nlapiSetRedirectURL('SUITELET', 'customscript_sl_sendle_hubbed_locations', 'customdeploy_sl_sendle_hubbed_locations', null, params);



    }

}