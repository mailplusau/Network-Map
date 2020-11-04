var baseURL = 'https://1048144.app.netsuite.com';
if (nlapiGetContext().getEnvironment() == "SANDBOX") {
	baseURL = 'https://system.sandbox.netsuite.com';
}


//To show loader while the page is laoding
$(window).load(function() {
	// Animate loader off screen
	$(".se-pre-con").fadeOut("slow");;
});

var primaryHubbed;
var secondaryHubbed = [];


function pageInit() {

	var secondaryHubbedString = nlapiGetFieldValue('secondary_hubbed');

	if (!isNullorEmpty(secondaryHubbedString)) {
		secondaryHubbed = secondaryHubbedString.split(',');
	}

	AddStyle('https://1048144.app.netsuite.com/core/media/media.nl?id=1988776&c=1048144&h=58352d0b4544df20b40f&_xt=.css', 'head');

	//JQuery to sort table based on click of header. Attached library  
	jQuery(document).ready(function() {
		jQuery("#customer").bind('dynatable:init', function(e, dynatable) {
			dynatable.sorts.clear();
			//WS Edit: remove sort
			//dynatable.sorts.add('action', -1) // 1=ASCENDING, -1=DESCENDING
			dynatable.process();
			e.preventDefault();
		}).dynatable();

		jQuery('.edit_customer').closest("tr").addClass("dynatable-complete");
		jQuery('.review_customer').closest("tr").addClass("dynatable-incomplete");
	});
	$('#dynatable-query-search-customer').css("margin-top", "300")
	$('#dynatable-search-customer').css("margin-top", "300")
	$('#dynatable-per-page').css("margin-top", "300")
	$('#dynatable-per-page-customer').css("margin-top", "300")
	$('#dynatable-per-page-label').css("margin-top", "300")
	var main_table = document.getElementsByClassName("uir-outside-fields-table");
	var main_table2 = document.getElementsByClassName("uir-inline-tag");


	for (var i = 0; i < main_table.length; i++) {
		main_table[i].style.width = "50%";
	}

	for (var i = 0; i < main_table2.length; i++) {
		main_table2[i].style.position = "absolute";
		main_table2[i].style.left = "10%";
		main_table2[i].style.width = "80%";
		main_table2[i].style.top = "400px";
	}

}

//On selecting zee, reload the SMC - Summary page with selected Zee parameter
$(document).on("change", ".zee_dropdown", function(e) {

	var zee = $(this).val();

	var url = baseURL + "/app/site/hosting/scriptlet.nl?script=1074&deploy=1";

	url += "&zee=" + zee + "";

	window.location.href = url;
});

$("#customer").on("click", "input[type=radio]", function() {
	primaryHubbed = $(this).attr("data-nclInternalID");
	nlapiSetFieldValue('primary_hubbed', primaryHubbed)
});

function removeA(arr) {
    var what, a = arguments, L = a.length, ax;
    while (L > 1 && arr.length) {
        what = a[--L];
        while ((ax= arr.indexOf(what)) !== -1) {
            arr.splice(ax, 1);
        }
    }
    return arr;
}

$("#customer").on("change", "input[type=checkbox]", function() {
	console.log('secondaryHubbed ' + $(this).attr("data-nclInternalID"))
	console.log('Attribute ' + $(this).prop('checked'))

	if ($(this).prop('checked')) {
		console.log('inside checked')
		secondaryHubbed[secondaryHubbed.length] = $(this).attr("data-nclInternalID");
	} else {
		console.log('inside nochecked')
		secondaryHubbed = removeA(secondaryHubbed, $(this).attr("data-nclInternalID"));
	}


	console.log(secondaryHubbed)
});

function saveRecord() {
	var secondaryHubbedString = secondaryHubbed.toString();
	console.log(secondaryHubbedString)
	nlapiSetFieldValue('secondary_hubbed', secondaryHubbedString);

	return true;

}

function AddStyle(cssLink, pos) {
	var tag = document.getElementsByTagName(pos)[0];
	var addLink = document.createElement('link');
	addLink.setAttribute('type', 'text/css');
	addLink.setAttribute('rel', 'stylesheet');
	addLink.setAttribute('href', cssLink);
	tag.appendChild(addLink);
}