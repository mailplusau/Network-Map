/**
 * Module Description
 * 
 * NSVersion    Date                        Author         
 * 1.00         2020-11-19 06:14:47         Ankith
 *
 * Description:         
 * 
 * @Last Modified by:   ankit
 * @Last Modified time: 2020-11-30 10:59:46
 *
 */

function sendleInvoicing(request, response) {

	if (request.getMethod() === "GET") {

		var date_from = '';
		var date_to = '';

		// Load params
		var params = request.getParameter('custparam_params');
		nlapiLogExecution('DEBUG', 'params', params);
		if (!isNullorEmpty(params)) {
			is_params = 'T';
			params = JSON.parse(params);

			date_from = params.date_from;
			date_to = params.date_to;

			nlapiLogExecution('DEBUG', 'Param date_from', date_from);
			nlapiLogExecution('DEBUG', 'Param date_to', date_to);
		}

		var form = nlapiCreateForm('Sendle Tasks Export');

		var primary_hubbed = null;
		var secondary_hubbed = null;

		var inlineHTML2 = '';

				//Page refreshes every 5 mins
		var inlineHTML = '<meta http-equiv="Refresh" content="300">';

		//Page scripts and css imports
		inlineHTML += '<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"><script src="//code.jquery.com/jquery-1.11.0.min.js"></script><script src="//cdn.datatables.net/buttons/1.2.1/js/buttons.print.min.js"></script><link type="text/css" rel="stylesheet" href="https://cdn.datatables.net/1.10.13/css/jquery.dataTables.min.css"><link href="//netdna.bootstrapcdn.com/bootstrap/3.3.2/css/bootstrap.min.css" rel="stylesheet"><script src="//netdna.bootstrapcdn.com/bootstrap/3.3.2/js/bootstrap.min.js"></script><link rel="stylesheet" href="https://1048144.app.netsuite.com/core/media/media.nl?id=2060796&c=1048144&h=9ee6accfd476c9cae718&_xt=.css"/><script src="https://1048144.app.netsuite.com/core/media/media.nl?id=2060797&c=1048144&h=ef2cda20731d146b5e98&_xt=.js"></script><link type="text/css" rel="stylesheet" href="https://1048144.app.netsuite.com/core/media/media.nl?id=2090583&c=1048144&h=a0ef6ac4e28f91203dfe&_xt=.css">';

		inlineHTML += '<div class="se-pre-con"></div><div id="demo" style="background-color: #cfeefc !important;border: 1px solid #417ed9;padding: 10px 10px 10px 20px;width:96%;position:absolute" class=""></div>';

		inlineHTML += dateFilterSection();

		form.addField('custpage_html2', 'inlinehtml').setPadding(1).setLayoutType('outsideabove').setDefaultValue(inlineHTML);

		//Table Column Headers

		inlineHTML2 += '<br><br><table border="0" id="customer" class="display tablesorter table table-striped table-condensed" style="width: 100%;"><thead style="color: white;background-color: #607799;">';

		//Header Rows
		inlineHTML2 += '<tr><th style="text-align: center;vertical-align: middle;"><b>JOB DATE</b></th>';
		inlineHTML2 += '<th style="text-align: center;vertical-align: middle;"><b>ID</b></th>';
		inlineHTML2 += '<th style="text-align: center;vertical-align: middle;"><b>DRIVER</b></th>';
		inlineHTML2 += '<th style="text-align: center;vertical-align: middle;"><b>FRANCHISEE</b></th>';
		inlineHTML2 += '<th style="width: 200px !important;text-align: center;vertical-align: middle;"><b>BARCODES COLLECTED</b></th>';
		inlineHTML2 += '<th style="width: 200px !important;text-align: center;vertical-align: middle;"><b>TOTAL PICKUPS COUNT</b></th>';
		inlineHTML2 += '<th style="width: 200px !important;text-align: center;vertical-align: middle;"><b>ON DEMAND PICKUP (1-3 ITEMS)</b></th>';
		inlineHTML2 += '<th style="width: 200px !important;text-align: center;vertical-align: middle;"><b>ON DEMAND PICKUP RATE</b></th>';
		inlineHTML2 += '<th style="width: 200px !important;text-align: center;vertical-align: middle;"><b>ON DEMAND PICKUP ADDITIONAL (3+ ITEMS)</b></th>';
		inlineHTML2 += '<th style="width: 200px !important;text-align: center;vertical-align: middle;"><b>ON DEMAND PICKUP ADDITIONAL RATE</b></th>';
		inlineHTML2 += '<th style="width: 200px !important;text-align: center;vertical-align: middle;"><b>TOTAL ADDITIONAL ITEM</b></th>';
		inlineHTML2 += '<th style="width: 200px !important;text-align: center;vertical-align: middle;"><b>ON DEMAND PICKUP DISPATCH RATE</b></th>';
		inlineHTML2 += '<th style="width: 200px !important;text-align: center;vertical-align: middle;"><b>AMOUNT</b></th>';
		inlineHTML2 += '<th style="width: 200px !important;text-align: center;vertical-align: middle;"><b>TOTAL AMOUNT</b></th>';
		inlineHTML2 += '<th style="text-align: center;vertical-align: middle;"><b>STATUS</b></th></tr>';

		//Filter rows
		inlineHTML2 += '<tr class="search_row"><th style="text-align: center;vertical-align: middle;"><b>JOB DATE</b></th>';
				inlineHTML2 += '<th style="text-align: center;vertical-align: middle;"><b>ID</b></th>';
		inlineHTML2 += '<th style="text-align: center;vertical-align: middle;"><b>DRIVER</b></th>';
		inlineHTML2 += '<th style="text-align: center;vertical-align: middle;"><b>FRANCHISEE</b></th>';
		inlineHTML2 += '<th style="width: 200px !important;text-align: center;vertical-align: middle;"><b>BARCODES COLLECTED</b></th>';
		inlineHTML2 += '<th style="width: 200px !important;text-align: center;vertical-align: middle;"><b>TOTAL PICKUPS COUNT</b></th>';
		inlineHTML2 += '<th style="width: 200px !important;text-align: center;vertical-align: middle;"><b>ON DEMAND PICKUP (1-3 ITEMS)</b></th>';
		inlineHTML2 += '<th style="width: 200px !important;text-align: center;vertical-align: middle;"><b>ON DEMAND PICKUP RATE</b></th>';
		inlineHTML2 += '<th style="width: 200px !important;text-align: center;vertical-align: middle;"><b>ON DEMAND PICKUP ADDITIONAL (3+ ITEMS)</b></th>';
		inlineHTML2 += '<th style="width: 200px !important;text-align: center;vertical-align: middle;"><b>ON DEMAND PICKUP ADDITIONAL RATE</b></th>';
		inlineHTML2 += '<th style="width: 200px !important;text-align: center;vertical-align: middle;"><b>TOTAL ADDITIONAL ITEM</b></th>';
		inlineHTML2 += '<th style="width: 200px !important;text-align: center;vertical-align: middle;"><b>ON DEMAND PICKUP DISPATCH RATE</b></th>';
		inlineHTML2 += '<th style="width: 200px !important;text-align: center;vertical-align: middle;"><b>AMOUNT</b></th>';
		inlineHTML2 += '<th style="width: 200px !important;text-align: center;vertical-align: middle;"><b>TOTAL AMOUNT</b></th>';
		inlineHTML2 += '<th style="text-align: center;vertical-align: middle;"><b>STATUS</b></th></tr></thead>';
		inlineHTML2 += '<tfoot><tr><th></th><th></th><th></th><th></th><th></th><th></th><th></th><th></th><th></th><th></th><th></th><th></th><th></th><th></th><th></th></tr></tfoot>';
		inlineHTML2 += '</table><br/>';

		form.addField('preview_table', 'inlinehtml', '').setLayoutType('outsidebelow', 'startrow').setDefaultValue(inlineHTML2);

		form.addField('custpage_date_from', 'text', 'Date from').setDisplayType('hidden').setDefaultValue(date_from);
		form.addField('custpage_date_to', 'text', 'Date to').setDisplayType('hidden').setDefaultValue(date_to);
		form.addField('custpage_table_csv', 'text', 'Table CSV').setDisplayType('hidden');

		form.setScript('customscript_cl_sendle_invoicing');

		form.addSubmitButton('Submit');
		response.writePage(form);

	} else {

	}

	/**
	 * The date input fields to filter the invoices.
	 * Even if the parameters `date_from` and `date_to` are defined, they can't be initiated in the HTML code.
	 * They are initiated with jQuery in the `pageInit()` function.
	 * @return  {String} `inlineHTML`
	 */
	function dateFilterSection() {

		var inlineHTML = '<div class="form-group container date_filter_section" style="padding-top: 50px;">';
		inlineHTML += '<div class="row">';
		// Date from field
		inlineHTML += '<div class="col-xs-6 date_from">';
		inlineHTML += '<div class="input-group">';
		inlineHTML += '<span class="input-group-addon" id="date_from_text">DATE FROM</span>';
		inlineHTML += '<input id="date_from" class="form-control date_from" type="date"/>';
		inlineHTML += '</div></div>';

		inlineHTML += '<div class="col-xs-6 date_to">';
		inlineHTML += '<div class="input-group">';
		inlineHTML += '<span class="input-group-addon" id="date_to_text">DATE TO</span>';
		inlineHTML += '<input id="date_to" class="form-control date_to" type="date"/>';
		inlineHTML += '</div></div>';


		return inlineHTML;
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
			var date_netsuite = nlapiDateToString(date_utc);
		}
		return date_netsuite;
	}


}