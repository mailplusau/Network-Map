var ctx = nlapiGetContext();

var zee_array = [];
var role = ctx.getRole();

if (role == 1000) {
    //Franchisee
    zee_array = [ctx.getUser()];
} else if (role == 3) { //Administrator
    zee_array = []; //test
} else if (role == 1032) { // System Support
    zee_array = []; //test-AR
}

var zee_text_array = [];
//var day_array = [];
var day;
var before_time;
var after_time;
var run_array = [];
var run_text_array = [];
var op_array = [];
var op_text_array = [];
//var before_time_array = [];
//var after_time_array = [];
var optimize_array = [];

var color_array = ['blue', 'red', 'green', 'orange', 'black'];


function summary_page(request, response) {

    if (request.getMethod() === "GET") {
        //PARAMETERS
        var zee_string = request.getParameter('zee');
        if (!isNullorEmpty(zee_string)) {
            zee_array = zee_string.split(',');
        }



        var form = nlapiCreateForm('Franchisee Network');

        var inlineQty = '<meta name="viewport" content="width=device-width, initial-scale=1.0"><script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"><script src="//code.jquery.com/jquery-1.11.0.min.js"></script><script src="//api.tiles.mapbox.com/mapbox.js/plugins/leaflet-omnivore/v0.3.1/leaflet-omnivore.min.js"></script><link type="text/css" rel="stylesheet" href="https://cdn.datatables.net/1.10.13/css/jquery.dataTables.min.css"><link href="//netdna.bootstrapcdn.com/bootstrap/3.3.2/css/bootstrap.min.css" rel="stylesheet"><link href="https://1048144.app.netsuite.com/core/media/media.nl?id=1988776&c=1048144&h=58352d0b4544df20b40f&mv=j11m86u8&_xt=.css" rel="stylesheet"><script src="//netdna.bootstrapcdn.com/bootstrap/3.3.2/js/bootstrap.min.js"></script><script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyA92XGDo8rx11izPYT7z2L-YPMMJ6Ih1s0&callback=initMap&libraries=places"></script><script src="https://cdnjs.cloudflare.com/ajax/libs/OverlappingMarkerSpiderfier/1.0.3/oms.min.js"></script></script><link rel="stylesheet" href="https://unpkg.com/leaflet@1.2.0/dist/leaflet.css" /><script src="https://unpkg.com/leaflet@1.2.0/dist/leaflet.js"></script>';
        inlineQty += '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-select@1.13.14/dist/css/bootstrap-select.min.css"><script src="https://cdn.jsdelivr.net/npm/bootstrap-select@1.13.14/dist/js/bootstrap-select.min.js"></script>';
        inlineQty += '<style>.info {padding: 6px 8px;font: 14px/16px Arial, Helvetica, sans-serif;background: white;background: rgba(255,255,255,0.8);box-shadow: 0 0 15px rgba(0,0,0,0.2);border-radius: 5px;}.info h5 { margin: 0 0 5px;color: #777;}.table {border-radius: 5px;width: 50%;margin: 0px auto;float: none;} #loader {position: absolute;top: 0;bottom: 0;width: 100%;background-color: rgba(245, 245, 245, 0.7);z-index: 200; }#loader img {width: 66px;height: 66px;position: absolute;top: 50%;left: 50%;margin: -33px 0 0 -33px;}</style>';

        inlineQty += '<div id="myModal" class="modal fade bs-example-modal-sm" tabindex="-1" role="dialog" aria-labelledby="mySmallModalLabel" aria-hidden="true"><div class="modal-dialog modal-sm" role="document" style="width :max-content"><div class="modal-content" style="width :max-content; max-width: 900px"><div class="modal-header"><button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button><h4 class="modal-title panel panel-info" id="exampleModalLabel">Run Summary</h4><br> </div><div class="modal-body"></div><div class="modal-footer"><button type="button" class="btn btn-default" data-dismiss="modal">Close</button></div></div></div></div>';

        inlineQty += '<div class="se-pre-con"></div><button type="button" class="btn btn-sm btn-info instruction_button" data-toggle="collapse" data-target="#demo" style="margin-top: 10px;">Click for Instructions</button><div id="demo" style="background-color: #cfeefc !important;border: 1px solid #417ed9;padding: 10px 10px 10px 20px;width:96%;position:absolute" class="collapse"><b><u>IMPORTANT INSTRUCTIONS:</u></b>';
        
        inlineQty += '</ul></div>';

        inlineQty += '<div class="container" id="main_container" style="padding-top: 3%;"><div class="container row_parameters">';


        //SEARCH FOR AN ADDRESS
        inlineQty += '<div class="container row_address">'
        inlineQty += '<div class="form-group row">';
        inlineQty += '<div class="col-sm-12 heading1"><h4><span class="label label-default col-sm-12">SEARCH FOR A PLACE/TERRITORY</span></h4></div>';
        inlineQty += '</div>';

        inlineQty += '<div class="form-group row">';
        inlineQty += '<div class="col-xs-8"><div class="input-group"><span class="input-group-addon">TERRITORY NAME / STREET NO. & NAME</span><input id="address" class="form-control address" /></div></div>';

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
        inlineQty += '<div class="col-xs-4"><div class="input-group"><span class="input-group-addon">TERRITORY</span><input id="territory" readonly class="form-control territory" /></div></div>';
        inlineQty += '</div>';

        inlineQty += '</br>';

        inlineQty += '<div class="form-group row">';
        inlineQty += '<div class="col-xs-3"></div>';
        inlineQty += '<div class="col-xs-2"><input type="button" class="btn btn-warning" id="clearMarkers" value="CLEAR MARKERS" style="width: 100%;"/></div>';
        inlineQty += '<div class="col-xs-2"><input type="button" class="btn btn-primary" id="viewOnMap" value="VIEW ON MAP" style="width: 100%;"/></div>';
        if (role != 1000) {
            inlineQty += '<div class="col-xs-2"><input type="button" class="btn btn-danger" id="territoryMap" value="HIDE TERRITORY MAP" style="width: 100%;"/></div>';
        }
        inlineQty += '<div class="col-xs-2"><input type="button" class="btn btn-danger hide" id="runMarkers" value="HIDE RUN MARKERS" style="width: 100%;"/></div>';
        inlineQty += '</div>';
        inlineQty += '</div>';


        //MAP
        var directionsPanel_html = '';
        var print_section = '';
        if (zee_array.length == 1) { //show the directionsPanel only if one zee selected
            directionsPanel_html += '<div class="col-sm-6 hide" id="directionsPanel" style="height:500px; overflow:auto"></div>';
            print_section += '</br><div class="row print_section hide"><div class="col-xs-10"></div><div class="col-xs-2"><input type="button" class="btn btn-info" id="printDirections" value="PRINT DIRECTIONS" style="width: 100%;"/></div></div></div>';
        }
        inlineQty += '</br>';
        inlineQty += '<div class="container map_section hide"><div class="row">';
        inlineQty += '<div class="col-sm-12" id="map" style="height: 500px"><div id="loader"><img src="https://1048144.app.netsuite.com/core/media/media.nl?id=2089999&c=1048144&h=e0aef405c22b65dfe546" alt="loader" /></div></div>';
        inlineQty += '<div id="legend">';
        inlineQty += '<div class="hide legend_icons" style="background-color: rgb(255, 255, 255);box-shadow: rgba(0, 0, 0, 0.3) 0px 1px 4px -1px;border-radius: 2px;left: 0px;margin-left: 5px;padding: 3px;"><div><svg height="23" width="32"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="black" fill="#575756"/></svg><span style="font-family: sans-serif;">Non Customer Location</span></div><div><svg height="23" width="32"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="black" fill="#008675"/></svg><span style="font-family: sans-serif;">Customer Location</span></div>';
        for (i = 0; i < zee_array.length; i++) {
            inlineQty += '<div><svg height="15" width="32"><line x1="2" y1="10" x2="25" y2="10" style="stroke:' + color_array[i] + ';stroke-width:2" /></svg><span style="font-family: sans-serif;">' + zee_text_array[i] + '</span></div>';
        }
        inlineQty += '</div>';
        inlineQty += '<div style="background-color: rgb(255, 255, 255);box-shadow: rgba(0, 0, 0, 0.3) 0px 1px 4px -1px;border-radius: 2px;left: 0px;margin-left: 5px;padding: 3px;"><input class="form-control" type="textarea" placeholder="Territory" id="zee_territory"/></div>';
        inlineQty += '</div>';

        inlineQty += directionsPanel_html;
        inlineQty += '</div>';
        inlineQty += print_section;

        inlineQty += '</div>'; //close main container

//        form.addField('zee', 'text', 'zee').setDisplayType('hidden').setDefaultValue(zee_array.join(','));
//        form.addField('zee_text', 'text', 'zee').setDisplayType('hidden').setDefaultValue(zee_text_array.join(','));

        form.addField('preview_table', 'inlinehtml', '').setLayoutType('outsidebelow', 'startrow').setDefaultValue(inlineQty);
        form.setScript('customscript_cl_mapped_zee_territories');

        //form.addSubmitButton('Submit');
        nlapiLogExecution('DEBUG', 'zee_array', zee_array);
        nlapiLogExecution('DEBUG', 'zee_array.length', zee_array.length);

        if (role == 1000) { //Franchisee
            form.addButton('run_scheduler', 'Run Scheduler', 'onclick_runScheduler(' + zee_array[0] + ')');
            form.addButton('smc', 'Service Management Console', 'onclick_smc(' + zee_array[0] + ')');
        }

        response.writePage(form);
    } else {}

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

function isInArray(elem, array) {
    var boolean = false;
    for (i = 0; i < array.length; i++) {
        if (array[i] == elem) {
            boolean = true;
            break;
        }
    }
    return boolean
}