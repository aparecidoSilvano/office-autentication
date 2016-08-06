/**
 * Created by silva on 05/08/2016.
 */
var http = require('http');
var url = require('./node_modules/url/url');

function start(route, handle) {
    function onRequest(request, response) {
        var pathName = url.parse(request.url).pathname;
        console.log("Request for " + pathName + " received.");

        route(handle, pathName, response, request);
    }

    var port = 8080;
    http.createServer(onRequest).listen(port);
    console.log("Server has started. Listening on port: " + port + "...");
}

// senha = whqXefnsdfcqvJSc4AZ4Vn8


exports.start = start;