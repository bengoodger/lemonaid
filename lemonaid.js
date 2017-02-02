var http = require('http');
var xml2js = require('xml2js');
var URL = require('url');

var g_rokuDevices = [];

function getRokuDevicesArrayScript() {
  var script = 'var g_rokuDevices = [';
  for (var i = 0; i < g_rokuDevices.length; ++i) {
    script += '\'' + g_rokuDevices[i] + '\'';
    if (i != (g_rokuDevices.length - 1))
      script += ',';
  }
  script += '];';
  return script;
}

function startServer() {
  var static = require('node-static');
   
  var file = new static.Server('./web');
  http.createServer(function (request, response) {
    console.log('request.url: ' + request.url);
    switch (request.url) {
    case '/roku_devices.js':
      response.end(getRokuDevicesArrayScript());
      break;
    default:
      request.addListener('end', function () {
        file.serve(request, response);
      }).resume();
      break;
    }
  }).listen(80);  
}

require('node-roku').find(function(err, deviceURLs) {
  if (!err) {
    for (var deviceURL in deviceURLs) {
      var durl = deviceURLs[deviceURL];
      var urlObj = URL.parse(durl);
      console.log('urlObj: ' + urlObj.href);
      var queryURL = URL.resolve(urlObj.href, '/query/apps');
      console.log('issuing request to: ' + queryURL);
      http.get(queryURL, function(response) {
        var data = '';
        response.on('data', function(chunk) {
          data += chunk;
        });
        response.on('end', function() {
          xml2js.parseString(data, function(err, result) {
            console.log('apps: ' + JSON.stringify(result));
          });
        });
        response.on('error', function(err) {
          console.log('received error: ' + err.message);
        });
      });
    }

    g_rokuDevices = deviceURLs;
    console.log('devices: ' + deviceURLs);
  }

  startServer();
});
